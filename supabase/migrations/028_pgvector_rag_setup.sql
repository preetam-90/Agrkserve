-- Migration: pgvector RAG Setup
-- Description: Sets up pgvector extension and tables for RAG (Retrieval-Augmented Generation)
-- Created: 2026-02-18

-- ============================================================================
-- 1. Enable pgvector extension
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================================
-- 2. Create knowledge_embeddings table
-- Stores vector embeddings for various content types for similarity search
-- ============================================================================
CREATE TABLE knowledge_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_type TEXT NOT NULL CHECK (source_type IN ('equipment', 'user', 'labour', 'review', 'booking')),
    source_id UUID NOT NULL,
    content TEXT NOT NULL,
    embedding vector(768),  -- 768 dimensions for Cloudflare bge-base-en-v1.5
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create composite index for source lookups
CREATE INDEX idx_knowledge_embeddings_source ON knowledge_embeddings(source_type, source_id);

-- ============================================================================
-- 3. Create HNSW index for fast cosine similarity search
-- HNSW (Hierarchical Navigable Small World) is efficient for approximate
-- nearest neighbor search with high-dimensional vectors
-- ============================================================================
CREATE INDEX idx_knowledge_embeddings_embedding ON knowledge_embeddings 
    USING hnsw (embedding vector_cosine_ops);

-- ============================================================================
-- 4. Create match_knowledge function for similarity search
-- Performs cosine similarity search and returns matching records
-- ============================================================================
CREATE OR REPLACE FUNCTION match_knowledge(
    query_embedding vector(768),
    match_threshold float DEFAULT 0.7,
    match_count int DEFAULT 5
)
RETURNS TABLE (
    id UUID,
    source_type TEXT,
    source_id UUID,
    content TEXT,
    metadata JSONB,
    similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        ke.id,
        ke.source_type,
        ke.source_id,
        ke.content,
        ke.metadata,
        1 - (ke.embedding <=> query_embedding) AS similarity
    FROM knowledge_embeddings ke
    WHERE 1 - (ke.embedding <=> query_embedding) > match_threshold
    ORDER BY ke.embedding <=> query_embedding ASC
    LIMIT match_count;
END;
$$;

-- ============================================================================
-- 5. Create embedding_queue table
-- Tracks items that need re-embedding (for background processing)
-- ============================================================================
CREATE TABLE embedding_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_type TEXT NOT NULL,
    source_id UUID NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('insert', 'update', 'delete')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    processed BOOLEAN DEFAULT FALSE
);

-- Index for querying unprocessed items
CREATE INDEX idx_embedding_queue_unprocessed ON embedding_queue(processed) 
    WHERE processed = FALSE;

-- ============================================================================
-- 6. Enable RLS and add service role policies
-- ============================================================================

-- Enable RLS on knowledge_embeddings
ALTER TABLE knowledge_embeddings ENABLE ROW LEVEL SECURITY;

-- Service role has full access to knowledge_embeddings
CREATE POLICY "Service role full access on knowledge_embeddings"
    ON knowledge_embeddings
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Enable RLS on embedding_queue
ALTER TABLE embedding_queue ENABLE ROW LEVEL SECURITY;

-- Service role has full access to embedding_queue
CREATE POLICY "Service role full access on embedding_queue"
    ON embedding_queue
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ============================================================================
-- 7. Add UNIQUE constraint on (source_type, source_id)
-- Required for upsert operations in knowledge-service.ts which uses
-- onConflict: 'source_type,source_id'
-- ============================================================================
ALTER TABLE knowledge_embeddings
    ADD CONSTRAINT uq_knowledge_embeddings_source UNIQUE (source_type, source_id);

-- ============================================================================
-- 8. Create search_knowledge_embeddings function
-- Extended similarity search with optional source type filtering.
-- Used by knowledge-service.ts via supabase.rpc('search_knowledge_embeddings', ...)
-- ============================================================================
CREATE OR REPLACE FUNCTION search_knowledge_embeddings(
    query_embedding vector(768),
    match_threshold float DEFAULT 0.7,
    match_count int DEFAULT 5,
    filter_source_types text[] DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    source_type TEXT,
    source_id UUID,
    content TEXT,
    metadata JSONB,
    similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        ke.id,
        ke.source_type,
        ke.source_id,
        ke.content,
        ke.metadata,
        1 - (ke.embedding <=> query_embedding) AS similarity
    FROM knowledge_embeddings ke
    WHERE 1 - (ke.embedding <=> query_embedding) > match_threshold
      AND (filter_source_types IS NULL OR ke.source_type = ANY(filter_source_types))
    ORDER BY ke.embedding <=> query_embedding ASC
    LIMIT match_count;
END;
$$;

-- ============================================================================
-- 9. Grant service_role access to platform tables
-- The service_role needs explicit table-level GRANT to access tables.
-- (RLS bypass is separate from table permissions)
-- ============================================================================
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;