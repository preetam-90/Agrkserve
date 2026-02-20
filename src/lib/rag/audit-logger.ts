import { createAdminClient } from '@/lib/supabase/admin';
import type { AIRequestContext } from './rbac';

export interface AuditEvent {
  actorId?: string;
  actorRole?: string;
  action: 'pii_query' | 'sql_query' | 'vector_query' | 'pii_denied';
  resource: string;
  targetId?: string;
  dataScope?: Record<string, unknown>;
  ipAddress?: string;
  requestId?: string;
}

export async function logAuditEvent(event: AuditEvent): Promise<void> {
  try {
    const admin = createAdminClient();
    await admin.from('audit_logs').insert({
      actor_id: event.actorId ?? null,
      actor_role: event.actorRole ?? null,
      action: event.action,
      entity_type: 'ai_rag',
      entity_id: event.targetId ?? '00000000-0000-0000-0000-000000000000',
      resource: event.resource,
      target_id: event.targetId ?? null,
      data_scope: event.dataScope ?? {},
      ip_address: event.ipAddress ?? null,
      request_id: event.requestId ?? null,
      details: { resource: event.resource, scope: event.dataScope ?? {} },
    });
  } catch (err) {
    console.error('[audit-logger] Failed to write audit event:', err);
  }
}

export async function logPIIAccess(
  ctx: AIRequestContext,
  resource: string,
  targetId: string,
  fields: string[]
): Promise<void> {
  await logAuditEvent({
    actorId: ctx.userId,
    actorRole: ctx.activeRole,
    action: 'pii_query',
    resource,
    targetId,
    dataScope: { fields },
    ipAddress: ctx.ipAddress,
    requestId: ctx.requestId,
  });
}

export async function logPIIDenied(
  ctx: AIRequestContext,
  resource: string,
  targetId: string
): Promise<void> {
  await logAuditEvent({
    actorId: ctx.userId,
    actorRole: ctx.activeRole,
    action: 'pii_denied',
    resource,
    targetId,
    ipAddress: ctx.ipAddress,
    requestId: ctx.requestId,
  });
}
