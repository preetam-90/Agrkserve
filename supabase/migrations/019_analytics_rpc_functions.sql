-- Analytics RPC Functions for Admin Dashboard
-- Drop existing functions first to allow return type changes

DROP FUNCTION IF EXISTS get_platform_analytics();
DROP FUNCTION IF EXISTS get_revenue_stats(TEXT);

-- Function to get platform analytics
CREATE OR REPLACE FUNCTION get_platform_analytics()
RETURNS JSONB AS $$
DECLARE
  result JSONB;
  disputes_count INTEGER;
BEGIN
  -- Check if disputes table exists, if not set to 0
  BEGIN
    SELECT COUNT(*) INTO disputes_count FROM disputes WHERE status = 'open';
  EXCEPTION WHEN undefined_table THEN
    disputes_count := 0;
  END;

  SELECT jsonb_build_object(
    'total_users', (SELECT COUNT(*) FROM user_profiles),
    'total_farmers', (SELECT COUNT(DISTINCT user_id) FROM user_roles WHERE role = 'farmer' AND is_active = true),
    'total_providers', (SELECT COUNT(DISTINCT user_id) FROM user_roles WHERE role = 'provider' AND is_active = true),
    'total_equipment', (SELECT COUNT(*) FROM equipment WHERE is_available = true),
    'total_bookings', (SELECT COUNT(*) FROM bookings),
    'completed_bookings', (SELECT COUNT(*) FROM bookings WHERE status = 'completed'),
    'total_revenue', (SELECT COALESCE(SUM(total_amount), 0) FROM bookings WHERE status = 'completed'),
    'total_labour', (SELECT COUNT(DISTINCT user_id) FROM user_roles WHERE role = 'labour' AND is_active = true),
    'active_disputes', disputes_count,
    'date', NOW()
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get revenue statistics by period
CREATE OR REPLACE FUNCTION get_revenue_stats(p_period TEXT)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
  labels TEXT[];
  values NUMERIC[];
  total_revenue NUMERIC;
BEGIN
  IF p_period = 'week' THEN
    -- Last 7 days
    SELECT 
      array_agg(day_label ORDER BY day_date),
      array_agg(COALESCE(revenue, 0) ORDER BY day_date),
      COALESCE(SUM(revenue), 0)
    INTO labels, values, total_revenue
    FROM (
      SELECT 
        TO_CHAR(d.day_date, 'Dy') as day_label,
        d.day_date,
        SUM(b.total_amount) as revenue
      FROM generate_series(
        CURRENT_DATE - INTERVAL '6 days',
        CURRENT_DATE,
        '1 day'::interval
      ) AS d(day_date)
      LEFT JOIN bookings b ON DATE(b.created_at) = d.day_date AND b.status = 'completed'
      GROUP BY d.day_date
      ORDER BY d.day_date
    ) daily_stats;
    
  ELSIF p_period = 'month' THEN
    -- Last 4 weeks
    SELECT 
      array_agg(week_label ORDER BY week_start),
      array_agg(COALESCE(revenue, 0) ORDER BY week_start),
      COALESCE(SUM(revenue), 0)
    INTO labels, values, total_revenue
    FROM (
      SELECT 
        'Week ' || (4 - ROW_NUMBER() OVER (ORDER BY week_start DESC) + 1) as week_label,
        week_start,
        SUM(b.total_amount) as revenue
      FROM generate_series(
        DATE_TRUNC('week', CURRENT_DATE - INTERVAL '3 weeks'),
        DATE_TRUNC('week', CURRENT_DATE),
        '1 week'::interval
      ) AS w(week_start)
      LEFT JOIN bookings b ON DATE_TRUNC('week', b.created_at) = w.week_start AND b.status = 'completed'
      GROUP BY w.week_start
      ORDER BY w.week_start
    ) weekly_stats;
    
  ELSIF p_period = 'year' THEN
    -- Last 12 months
    SELECT 
      array_agg(month_label ORDER BY month_start),
      array_agg(COALESCE(revenue, 0) ORDER BY month_start),
      COALESCE(SUM(revenue), 0)
    INTO labels, values, total_revenue
    FROM (
      SELECT 
        TO_CHAR(m.month_start, 'Mon') as month_label,
        m.month_start,
        SUM(b.total_amount) as revenue
      FROM generate_series(
        DATE_TRUNC('month', CURRENT_DATE - INTERVAL '11 months'),
        DATE_TRUNC('month', CURRENT_DATE),
        '1 month'::interval
      ) AS m(month_start)
      LEFT JOIN bookings b ON DATE_TRUNC('month', b.created_at) = m.month_start AND b.status = 'completed'
      GROUP BY m.month_start
      ORDER BY m.month_start
    ) monthly_stats;
    
  ELSE
    -- Default to month
    RETURN get_revenue_stats('month');
  END IF;
  
  SELECT jsonb_build_object(
    'labels', labels,
    'values', values,
    'total', total_revenue
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_platform_analytics() TO authenticated;
GRANT EXECUTE ON FUNCTION get_revenue_stats(TEXT) TO authenticated;
