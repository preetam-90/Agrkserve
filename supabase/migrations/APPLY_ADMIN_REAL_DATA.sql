-- ============================================
-- Admin Dashboard Real Data Migration
-- ============================================
-- Run this in your Supabase SQL Editor
-- This adds system health monitoring functions

-- Function to get database statistics
CREATE OR REPLACE FUNCTION get_database_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'database_size', pg_database_size(current_database()),
    'table_count', (SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public'),
    'total_rows', (
      SELECT sum(n_live_tup) 
      FROM pg_stat_user_tables
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get connection count
CREATE OR REPLACE FUNCTION get_connection_count()
RETURNS INTEGER AS $$
DECLARE
  conn_count INTEGER;
BEGIN
  SELECT count(*) INTO conn_count
  FROM pg_stat_activity
  WHERE datname = current_database();
  
  RETURN conn_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_database_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION get_connection_count() TO authenticated;

-- Add comments for documentation
COMMENT ON FUNCTION get_database_stats() IS 'Returns database size, table count, and total rows';
COMMENT ON FUNCTION get_connection_count() IS 'Returns current number of database connections';

-- Verify functions were created
SELECT 'System health functions created successfully!' as status;
