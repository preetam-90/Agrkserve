import { createAdminClient } from '@/lib/supabase/admin';
import { generateEmbedding } from '@/lib/services/embedding-service';
import { scrubPII } from './pii-scrubber';

const MAX_SUMMARY_CHARS = 4_000;

export interface ConversationContext {
  conversationId: string;
  rollingSummary: string;
  messageCount: number;
}

export async function fetchConversationContext(
  conversationId: string
): Promise<ConversationContext> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from('ai_chat_context')
      .select('rolling_summary, message_count')
      .eq('conversation_id', conversationId)
      .maybeSingle();

    if (error || !data) {
      return { conversationId, rollingSummary: '', messageCount: 0 };
    }

    return {
      conversationId,
      rollingSummary: data.rolling_summary ?? '',
      messageCount: data.message_count ?? 0,
    };
  } catch {
    return { conversationId, rollingSummary: '', messageCount: 0 };
  }
}

export async function upsertConversationContext(
  conversationId: string,
  userId: string | undefined,
  userMessage: string,
  assistantResponse: string
): Promise<void> {
  try {
    const { scrubbed: cleanUser } = scrubPII(userMessage);
    const { scrubbed: cleanAssistant } = scrubPII(assistantResponse);

    const existing = await fetchConversationContext(conversationId);
    const appended =
      existing.rollingSummary +
      `\nUser: ${cleanUser.slice(0, 500)}\nAssistant: ${cleanAssistant.slice(0, 500)}`;

    const newSummary =
      appended.length > MAX_SUMMARY_CHARS ? appended.slice(-MAX_SUMMARY_CHARS) : appended;

    let embeddingVec: number[] | null = null;
    try {
      const result = await generateEmbedding(newSummary.slice(0, 512));
      if (result.success) embeddingVec = result.embedding;
    } catch {
      // embedding failure is non-fatal
    }

    const upsertPayload: Record<string, unknown> = {
      conversation_id: conversationId,
      user_id: userId ?? null,
      rolling_summary: newSummary,
      message_count: (existing.messageCount ?? 0) + 1,
      last_updated: new Date().toISOString(),
    };
    if (embeddingVec) upsertPayload.embedding = embeddingVec;

    const admin = createAdminClient();
    const { error } = await admin
      .from('ai_chat_context')
      .upsert(upsertPayload, { onConflict: 'conversation_id' });

    if (error) {
      console.error('[conversation-memory] upsert failed:', error.message);
    }
  } catch (err) {
    console.error('[conversation-memory] upsertConversationContext failed:', err);
  }
}

export function formatConversationMemory(ctx: ConversationContext): string {
  if (!ctx.rollingSummary.trim()) return '';
  return `=== CONVERSATION MEMORY (last ${ctx.messageCount} turns) ===\n${ctx.rollingSummary.trim()}\n=== END MEMORY ===`;
}
