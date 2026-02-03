-- Migration: Create media_audit_logs table for Cloudinary Media Control System
-- This table tracks all admin actions on Cloudinary media assets

-- Create the media_audit_logs table
CREATE TABLE IF NOT EXISTS media_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    admin_email TEXT,
    admin_role TEXT NOT NULL CHECK (admin_role IN ('super_admin', 'moderator', 'support_admin')),
    action TEXT NOT NULL CHECK (action IN (
        'view', 'delete', 'bulk_delete', 'rename', 'replace', 
        'flag', 'unflag', 'disable', 'enable', 'add_moderation_note', 'view_analytics'
    )),
    public_id TEXT NOT NULL,
    asset_type TEXT NOT NULL CHECK (asset_type IN ('image', 'video', 'raw')),
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_media_audit_logs_admin_id ON media_audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_media_audit_logs_public_id ON media_audit_logs(public_id);
CREATE INDEX IF NOT EXISTS idx_media_audit_logs_action ON media_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_media_audit_logs_created_at ON media_audit_logs(created_at DESC);

-- Create a composite index for filtering by admin and date
CREATE INDEX IF NOT EXISTS idx_media_audit_logs_admin_created 
    ON media_audit_logs(admin_id, created_at DESC);

-- Enable Row Level Security
ALTER TABLE media_audit_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs" ON media_audit_logs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('super_admin', 'moderator', 'support_admin')
            AND is_active = true
        )
    );

-- Only super_admins can delete audit logs (for data retention)
CREATE POLICY "Super admins can delete audit logs" ON media_audit_logs
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'super_admin'
            AND is_active = true
        )
    );

-- System can insert audit logs (via service role)
CREATE POLICY "System can insert audit logs" ON media_audit_logs
    FOR INSERT
    WITH CHECK (true);

-- Add comments for documentation
COMMENT ON TABLE media_audit_logs IS 'Audit trail for all Cloudinary media management actions by admins';
COMMENT ON COLUMN media_audit_logs.admin_id IS 'ID of the admin who performed the action';
COMMENT ON COLUMN media_audit_logs.admin_role IS 'Role of the admin at the time of action';
COMMENT ON COLUMN media_audit_logs.action IS 'Type of action performed';
COMMENT ON COLUMN media_audit_logs.public_id IS 'Cloudinary public_id of the affected asset';
COMMENT ON COLUMN media_audit_logs.details IS 'Additional JSON data about the action';
COMMENT ON COLUMN media_audit_logs.ip_address IS 'IP address of the admin (if available)';
COMMENT ON COLUMN media_audit_logs.user_agent IS 'User agent string of the admin';

-- Create a function to clean up old audit logs (data retention)
CREATE OR REPLACE FUNCTION cleanup_old_media_audit_logs(retention_days INTEGER DEFAULT 90)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM media_audit_logs
    WHERE created_at < NOW() - INTERVAL '1 day' * retention_days;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$;

COMMENT ON FUNCTION cleanup_old_media_audit_logs IS 'Removes audit logs older than the specified retention period';
