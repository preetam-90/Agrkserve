-- Migration: Platform Knowledge Base
-- Description: Creates structured knowledge tables for platform identity, founder info,
--              legal documents, FAQs, and policies. Enables RAG-based AI responses
--              with authoritative, non-hallucinated platform facts.
-- Created: 2026-02-21

-- ============================================================================
-- 1. Create platform_knowledge table
-- Stores structured facts as JSONB keyed by category.
-- Used for direct SQL lookups (no embedding needed for structured facts).
-- ============================================================================
CREATE TABLE platform_knowledge (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL CHECK (category IN (
        'platform_info',      -- Platform name, type, country, target users, business model
        'founder',            -- Founder name, role, background, origin
        'mission',            -- Mission and vision statements
        'legal',              -- Privacy policy, terms, disclaimers
        'faq',                -- Frequently asked questions
        'policy',             -- Platform rules and policies
        'metadata'            -- Versioning, last updated, etc.
    )),
    key TEXT NOT NULL,        -- Specific item key within category (e.g., 'privacy_policy', 'founder_name')
    data JSONB NOT NULL,      -- The actual content as JSONB
    description TEXT,         -- Human-readable description of this knowledge entry
    is_active BOOLEAN DEFAULT TRUE,
    version TEXT DEFAULT '1.0.0',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure one entry per category+key combination
    CONSTRAINT uq_platform_knowledge_category_key UNIQUE (category, key)
);

-- Index for category-based queries
CREATE INDEX idx_platform_knowledge_category ON platform_knowledge(category);
CREATE INDEX idx_platform_knowledge_active ON platform_knowledge(is_active) WHERE is_active = TRUE;

-- ============================================================================
-- 2. Create platform_documents table
-- Stores longer documents (legal docs, detailed policies) as chunks with embeddings.
-- Used for RAG-based retrieval when user asks about specific policy details.
-- ============================================================================
CREATE TABLE platform_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_type TEXT NOT NULL CHECK (document_type IN (
        'privacy_policy',
        'terms_of_service',
        'terms_and_conditions',
        'legal_disclaimer',
        'platform_rules',
        'faq_detailed',
        'policy_detailed',
        'about_platform',
        'founder_story'
    )),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    chunk_index INT DEFAULT 0,      -- For multi-chunk documents
    embedding vector(768),          -- 768 dimensions for Cloudflare bge-base-en-v1.5
    metadata JSONB DEFAULT '{}',
    version TEXT DEFAULT '1.0.0',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for document type queries
CREATE INDEX idx_platform_documents_type ON platform_documents(document_type);
CREATE INDEX idx_platform_documents_active ON platform_documents(is_active) WHERE is_active = TRUE;

-- HNSW index for vector similarity search
CREATE INDEX idx_platform_documents_embedding ON platform_documents 
    USING hnsw (embedding vector_cosine_ops);

-- ============================================================================
-- 3. Add 'platform_document' source type to knowledge_embeddings
-- This allows platform documents to also be indexed in the main knowledge pool
-- ============================================================================
ALTER TABLE knowledge_embeddings 
    DROP CONSTRAINT IF EXISTS knowledge_embeddings_source_type_check;

ALTER TABLE knowledge_embeddings 
    ADD CONSTRAINT knowledge_embeddings_source_type_check 
    CHECK (source_type IN ('equipment', 'user', 'labour', 'review', 'booking', 'platform_document'));

-- ============================================================================
-- 4. Create search_platform_knowledge function
-- Retrieves structured facts by category and/or key.
-- ============================================================================
CREATE OR REPLACE FUNCTION search_platform_knowledge(
    p_category TEXT DEFAULT NULL,
    p_key TEXT DEFAULT NULL,
    p_active_only BOOLEAN DEFAULT TRUE
)
RETURNS TABLE (
    id UUID,
    category TEXT,
    key TEXT,
    data JSONB,
    description TEXT,
    version TEXT,
    updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pk.id,
        pk.category,
        pk.key,
        pk.data,
        pk.description,
        pk.version,
        pk.updated_at
    FROM platform_knowledge pk
    WHERE 
        (p_category IS NULL OR pk.category = p_category)
        AND (p_key IS NULL OR pk.key = p_key)
        AND (NOT p_active_only OR pk.is_active = TRUE)
    ORDER BY pk.category, pk.key;
END;
$$;

-- ============================================================================
-- 5. Create search_platform_documents function
-- Performs vector similarity search on platform documents.
-- ============================================================================
CREATE OR REPLACE FUNCTION search_platform_documents(
    query_embedding vector(768),
    match_threshold float DEFAULT 0.7,
    match_count int DEFAULT 5,
    filter_document_types text[] DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    document_type TEXT,
    title TEXT,
    content TEXT,
    chunk_index INT,
    metadata JSONB,
    similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        pd.id,
        pd.document_type,
        pd.title,
        pd.content,
        pd.chunk_index,
        pd.metadata,
        1 - (pd.embedding <=> query_embedding) AS similarity
    FROM platform_documents pd
    WHERE 
        pd.is_active = TRUE
        AND 1 - (pd.embedding <=> query_embedding) > match_threshold
        AND (filter_document_types IS NULL OR pd.document_type = ANY(filter_document_types))
    ORDER BY pd.embedding <=> query_embedding ASC
    LIMIT match_count;
END;
$$;

-- ============================================================================
-- 6. Create get_all_platform_facts function
-- Returns all structured facts as a single JSONB object for AI context injection.
-- This is the primary function used by the AI to answer platform questions.
-- ============================================================================
CREATE OR REPLACE FUNCTION get_all_platform_facts(p_active_only BOOLEAN DEFAULT TRUE)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    result JSONB := '{}';
    category_data JSONB;
    category_name TEXT;
BEGIN
    -- Iterate through each category and aggregate
    FOR category_name IN 
        SELECT DISTINCT category FROM platform_knowledge 
        WHERE (NOT p_active_only OR is_active = TRUE)
        ORDER BY category
    LOOP
        SELECT jsonb_object_agg(pk.key, pk.data)
        INTO category_data
        FROM platform_knowledge pk
        WHERE pk.category = category_name
          AND (NOT p_active_only OR pk.is_active = TRUE);
        
        result := result || jsonb_build_object(category_name, COALESCE(category_data, '{}'));
    END LOOP;
    
    RETURN result;
END;
$$;

-- ============================================================================
-- 7. Enable RLS
-- ============================================================================
ALTER TABLE platform_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_documents ENABLE ROW LEVEL SECURITY;

-- Service role has full access
CREATE POLICY "Service role full access on platform_knowledge"
    ON platform_knowledge
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Service role full access on platform_documents"
    ON platform_documents
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Public can read active platform knowledge (for AI context)
CREATE POLICY "Public read active platform_knowledge"
    ON platform_knowledge
    FOR SELECT
    TO public
    USING (is_active = TRUE);

-- Admins can manage platform knowledge
CREATE POLICY "Admins manage platform_knowledge"
    ON platform_knowledge
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role = 'admin'
            AND ur.is_active = TRUE
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role = 'admin'
            AND ur.is_active = TRUE
        )
    );

-- Public can read active platform documents
CREATE POLICY "Public read active platform_documents"
    ON platform_documents
    FOR SELECT
    TO public
    USING (is_active = TRUE);

-- Admins can manage platform documents
CREATE POLICY "Admins manage platform_documents"
    ON platform_documents
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role = 'admin'
            AND ur.is_active = TRUE
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role = 'admin'
            AND ur.is_active = TRUE
        )
    );

-- ============================================================================
-- 8. Grant permissions
-- ============================================================================
GRANT ALL ON platform_knowledge TO service_role;
GRANT ALL ON platform_documents TO service_role;
GRANT SELECT ON platform_knowledge TO authenticated;
GRANT SELECT ON platform_documents TO authenticated;
GRANT SELECT ON platform_knowledge TO anon;
GRANT SELECT ON platform_documents TO anon;

-- ============================================================================
-- 9. Create updated_at trigger
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_platform_knowledge_updated_at
    BEFORE UPDATE ON platform_knowledge
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_platform_documents_updated_at
    BEFORE UPDATE ON platform_documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 10. Create audit log for platform knowledge changes
-- ============================================================================
CREATE TABLE platform_knowledge_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_data JSONB,
    new_data JSONB,
    changed_by UUID REFERENCES auth.users(id),
    changed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_platform_knowledge_audit_record ON platform_knowledge_audit(table_name, record_id);
CREATE INDEX idx_platform_knowledge_audit_changed_at ON platform_knowledge_audit(changed_at DESC);

-- Audit trigger for platform_knowledge
CREATE OR REPLACE FUNCTION audit_platform_knowledge_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO platform_knowledge_audit (table_name, record_id, action, new_data, changed_by)
        VALUES (TG_TABLE_NAME, NEW.id, 'INSERT', to_jsonb(NEW), auth.uid());
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO platform_knowledge_audit (table_name, record_id, action, old_data, new_data, changed_by)
        VALUES (TG_TABLE_NAME, NEW.id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW), auth.uid());
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO platform_knowledge_audit (table_name, record_id, action, old_data, changed_by)
        VALUES (TG_TABLE_NAME, OLD.id, 'DELETE', to_jsonb(OLD), auth.uid());
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER platform_knowledge_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON platform_knowledge
    FOR EACH ROW
    EXECUTE FUNCTION audit_platform_knowledge_changes();

-- Audit trigger for platform_documents
CREATE OR REPLACE FUNCTION audit_platform_documents_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO platform_knowledge_audit (table_name, record_id, action, new_data, changed_by)
        VALUES (TG_TABLE_NAME, NEW.id, 'INSERT', to_jsonb(NEW), auth.uid());
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO platform_knowledge_audit (table_name, record_id, action, old_data, new_data, changed_by)
        VALUES (TG_TABLE_NAME, NEW.id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW), auth.uid());
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO platform_knowledge_audit (table_name, record_id, action, old_data, changed_by)
        VALUES (TG_TABLE_NAME, OLD.id, 'DELETE', to_jsonb(OLD), auth.uid());
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER platform_documents_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON platform_documents
    FOR EACH ROW
    EXECUTE FUNCTION audit_platform_documents_changes();

-- ============================================================================
-- 11. Grant access to audit table
-- ============================================================================
GRANT ALL ON platform_knowledge_audit TO service_role;
GRANT SELECT ON platform_knowledge_audit TO authenticated;

ALTER TABLE platform_knowledge_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on platform_knowledge_audit"
    ON platform_knowledge_audit
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Admins read platform_knowledge_audit"
    ON platform_knowledge_audit
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role = 'admin'
            AND ur.is_active = TRUE
        )
    );
