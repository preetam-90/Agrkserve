-- Migration: Web Search Cache
-- Description: Creates a cache table for Tavily web search results to avoid repeated API calls
-- and stay within free-tier rate limits.
-- Created: 2026-02-18

-- ============================================================================
-- 1. Create web_search_cache table
-- ============================================================================
CREATE TABLE IF NOT EXISTS web_search_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Normalized SHA-256 hash of the lowercased, trimmed query
    query_hash TEXT NOT NULL,

    -- Original user query (for debugging / analytics)
    original_query TEXT NOT NULL,

    -- Serialized array of WebSearchResult objects
    results JSONB NOT NULL DEFAULT '[]',

    -- Optional direct answer from Tavily
    answer TEXT,

    -- Number of results stored
    result_count INTEGER DEFAULT 0,

    -- Cache lifecycle
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,

    -- Usage analytics
    hit_count INTEGER DEFAULT 0
);

-- ============================================================================
-- 2. Indexes
-- ============================================================================

-- Primary lookup: by query hash (unique to prevent duplicates)
CREATE UNIQUE INDEX idx_web_search_cache_query_hash
    ON web_search_cache(query_hash);

-- Efficient expiry cleanup
CREATE INDEX idx_web_search_cache_expires_at
    ON web_search_cache(expires_at);

-- ============================================================================
-- 3. Row Level Security
-- ============================================================================

ALTER TABLE web_search_cache ENABLE ROW LEVEL SECURITY;

-- Only the service role (server-side code) can read/write the cache
CREATE POLICY "Service role full access on web_search_cache"
    ON web_search_cache
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ============================================================================
-- 4. Grant service_role access
-- ============================================================================

GRANT ALL ON web_search_cache TO service_role;

-- ============================================================================
-- 5. Cleanup function
-- Removes expired cache entries. Can be called manually or via a cron job.
-- ============================================================================

CREATE OR REPLACE FUNCTION cleanup_expired_web_search_cache()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM web_search_cache
    WHERE expires_at < NOW();

    GET DIAGNOSTICS deleted_count = ROW_COUNT;

    RETURN deleted_count;
END;
$$;

GRANT EXECUTE ON FUNCTION cleanup_expired_web_search_cache() TO service_role;

-- ============================================================================
-- 6. Comment
-- ============================================================================

COMMENT ON TABLE web_search_cache IS
    'Cache for Tavily web search results. TTL: 1 hour for price/market queries, 24 hours for general. Run cleanup_expired_web_search_cache() periodically.';

COMMENT ON COLUMN web_search_cache.query_hash IS
    'SHA-256 hash (first 32 chars) of the normalized query, used as cache key';

COMMENT ON COLUMN web_search_cache.expires_at IS
    'Cache expiry time. Entries older than this are stale and should be ignored / cleaned up.';

COMMENT ON COLUMN web_search_cache.hit_count IS
    'Number of times this cached entry was served (analytics only).';
