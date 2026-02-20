-- Migration 034: Add AI-specific columns to existing audit_logs table
-- The audit_logs table already exists (004_audit_logs.sql).
-- We add columns needed by the RAG audit logger without breaking existing usage.

ALTER TABLE public.audit_logs
  ADD COLUMN IF NOT EXISTS actor_id      UUID,
  ADD COLUMN IF NOT EXISTS actor_role    TEXT,
  ADD COLUMN IF NOT EXISTS resource      TEXT,
  ADD COLUMN IF NOT EXISTS target_id     UUID,
  ADD COLUMN IF NOT EXISTS data_scope    JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS ip_address    TEXT,
  ADD COLUMN IF NOT EXISTS request_id   TEXT;

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor
  ON public.audit_logs(actor_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_action_new
  ON public.audit_logs(action, created_at DESC);

-- Drop the broken insert policy from 021 that requires auth.uid() (service role has no uid)
DROP POLICY IF EXISTS "Authenticated users can insert audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Service role can insert audit logs" ON public.audit_logs;

-- Service role can always insert (used by admin client / fire-and-forget logger)
CREATE POLICY "Service role can insert audit logs"
  ON public.audit_logs FOR INSERT TO service_role
  WITH CHECK (true);

COMMENT ON COLUMN public.audit_logs.actor_id    IS 'User making the AI request';
COMMENT ON COLUMN public.audit_logs.actor_role  IS 'Active role at time of query';
COMMENT ON COLUMN public.audit_logs.resource    IS 'e.g. user_profiles.phone';
COMMENT ON COLUMN public.audit_logs.target_id   IS 'Record being accessed';
COMMENT ON COLUMN public.audit_logs.data_scope  IS 'Which fields were accessed (never actual values)';
COMMENT ON COLUMN public.audit_logs.ip_address  IS 'Request origin IP';
COMMENT ON COLUMN public.audit_logs.request_id  IS 'Correlation ID for request tracing';
