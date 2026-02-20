import { processQueue } from '@/lib/rag/embedding-queue';

export const runtime = 'nodejs';

export async function GET(request: Request): Promise<Response> {
  const authHeader = request.headers.get('Authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { processed, failed } = await processQueue(50);

  return new Response(JSON.stringify({ processed, failed, timestamp: new Date().toISOString() }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
