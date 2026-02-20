-- Migration 033: ai_chat_context table for rolling conversation memory
-- Part of enterprise RAG upgrade (Phase A)

CREATE TABLE IF NOT EXISTS ai_chat_context (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id  TEXT NOT NULL,
  user_id          UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rolling_summary  TEXT NOT NULL DEFAULT '',
  embedding        vector(768),
  message_count    INT DEFAULT 0,
  last_updated     TIMESTAMPTZ DEFAULT NOW(),
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_ai_chat_context_conv
  ON ai_chat_context(conversation_id);

CREATE INDEX IF NOT EXISTS idx_ai_chat_context_user
  ON ai_chat_context(user_id);

CREATE INDEX IF NOT EXISTS idx_ai_chat_context_embedding
  ON ai_chat_context USING hnsw (embedding vector_cosine_ops);

ALTER TABLE ai_chat_context ENABLE ROW LEVEL SECURITY;

-- Users can only read/write their own context
CREATE POLICY "Users can manage own chat context"
  ON ai_chat_context FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Service role full access (used by admin client)
CREATE POLICY "Service role full access on ai_chat_context"
  ON ai_chat_context FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);
