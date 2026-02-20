import { generateEmbedding } from '@/lib/services/embedding-service';
import { upsertEmbedding, type KnowledgeEntry } from '@/lib/services/knowledge-service';
import { scrubPII } from '@/lib/rag/pii-scrubber';

const MAX_QUEUE_SIZE = 500;

interface QueueItem {
  sourceType: KnowledgeEntry['source_type'];
  sourceId: string;
  content: string;
  metadata: Record<string, unknown>;
}

const queue: QueueItem[] = [];

export function enqueueEmbedding(
  sourceType: KnowledgeEntry['source_type'],
  sourceId: string,
  content: string,
  metadata: Record<string, unknown> = {}
): void {
  if (queue.length >= MAX_QUEUE_SIZE) return;
  queue.push({ sourceType, sourceId, content, metadata });
}

export async function processQueue(limit = 50): Promise<{ processed: number; failed: number }> {
  const batch = queue.splice(0, limit);
  let processed = 0;
  let failed = 0;

  await Promise.all(
    batch.map(async (item) => {
      try {
        const clean = scrubPII(item.content).scrubbed;
        const result = await generateEmbedding(clean);
        if (!result.success || result.embedding.length === 0) {
          failed++;
          return;
        }
        await upsertEmbedding(
          {
            source_type: item.sourceType,
            source_id: item.sourceId,
            content: clean,
            metadata: item.metadata,
          },
          result.embedding
        );
        processed++;
      } catch {
        failed++;
      }
    })
  );

  return { processed, failed };
}

export function queueSize(): number {
  return queue.length;
}
