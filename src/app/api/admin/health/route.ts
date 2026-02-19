import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';

export async function GET() {
  try {
    const startTime = Date.now();

    // Test database connection and measure response time
    const supabase = createClient();
    const dbStart = Date.now();

    // Get database metrics
    const [
      { error: dbError },
      { count: userCount },
      { count: equipmentCount },
      { count: bookingCount },
    ] = await Promise.all([
      supabase.from('user_profiles').select('id').limit(1),
      supabase.from('user_profiles').select('*', { count: 'exact', head: true }),
      supabase.from('equipment').select('*', { count: 'exact', head: true }),
      supabase.from('bookings').select('*', { count: 'exact', head: true }),
    ]);

    const dbResponseTime = Date.now() - dbStart;

    // Calculate API response time
    const apiResponseTime = Date.now() - startTime;

    // Calculate database load based on record counts and response time
    const totalRecords = (userCount || 0) + (equipmentCount || 0) + (bookingCount || 0);
    const dbLoad = Math.min(
      Math.round((totalRecords / 10000) * 100) + (dbResponseTime > 100 ? 20 : 0),
      100
    );

    // Calculate storage usage (mock - based on record counts)
    const storageUsage = Math.min(Math.round((totalRecords / 5000) * 100), 100);

    // Calculate server load (based on response times)
    const serverLoad =
      apiResponseTime > 200 ? 80 : apiResponseTime > 100 ? 50 : apiResponseTime > 50 ? 25 : 12;

    // Determine overall status
    const isHealthy = !dbError && apiResponseTime < 1000 && dbResponseTime < 500;
    const status = isHealthy ? 'operational' : 'degraded';

    // Calculate uptime (mock - 99.9%)
    const uptime = 99.9;

    // Log health metrics to database
    try {
      await supabase.rpc('log_system_health', {
        p_metric_name: 'api_response_time',
        p_metric_value: apiResponseTime,
        p_metadata: { timestamp: new Date().toISOString() },
      });

      await supabase.rpc('log_system_health', {
        p_metric_name: 'database_load',
        p_metric_value: dbLoad,
        p_metadata: { total_records: totalRecords },
      });
    } catch (logError) {
      console.error('Failed to log health metrics:', logError);
    }

    return NextResponse.json({
      status,
      timestamp: new Date().toISOString(),
      metrics: {
        apiResponseTime,
        dbResponseTime,
        serverLoad,
        dbLoad,
        storageUsage,
        uptime,
        totalRecords,
      },
      checks: {
        database: !dbError,
        api: apiResponseTime < 1000,
      },
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        metrics: {
          apiResponseTime: 0,
          dbResponseTime: 0,
          serverLoad: 0,
          dbLoad: 0,
          storageUsage: 0,
          uptime: 0,
          totalRecords: 0,
        },
        checks: {
          database: false,
          api: false,
        },
        error: 'Health check failed',
      },
      { status: 500 }
    );
  }
}
