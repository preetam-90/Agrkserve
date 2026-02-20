import { canAccessPII, type AIRequestContext, type RBACDecision } from './rbac';
import { logPIIAccess, logPIIDenied } from './audit-logger';

export interface PIIField {
  field: string;
  value: unknown;
  isSensitive: boolean;
}

const SENSITIVE_FIELDS = new Set([
  'phone',
  'phone_number',
  'email',
  'location',
  'latitude',
  'longitude',
  'gps',
  'coordinates',
]);

export function maskValue(value: string, type: 'phone' | 'email' | 'location'): string {
  if (type === 'phone') {
    if (value.length < 5) return '***';
    return value.slice(0, value.length - 5) + 'XXXXX';
  }
  if (type === 'email') {
    const [local, domain] = value.split('@');
    if (!domain) return '***@***.***';
    return `${local[0]}***@${domain}`;
  }
  return '[Location Hidden]';
}

function maskType(field: string): 'phone' | 'email' | 'location' {
  if (field.includes('phone')) return 'phone';
  if (field.includes('email')) return 'email';
  return 'location';
}

export interface PIIPolicyResult {
  sanitized: Record<string, unknown>;
  maskedFields: string[];
  auditRequired: boolean;
}

export function applyPIIPolicy(
  data: Record<string, unknown>,
  ctx: AIRequestContext,
  targetUserId?: string
): PIIPolicyResult {
  const decision: RBACDecision = canAccessPII(ctx, targetUserId);
  const sanitized: Record<string, unknown> = {};
  const maskedFields: string[] = [];

  for (const [key, value] of Object.entries(data)) {
    if (!SENSITIVE_FIELDS.has(key)) {
      sanitized[key] = value;
      continue;
    }

    if (decision.allowed) {
      sanitized[key] = value;
    } else {
      maskedFields.push(key);
      sanitized[key] = typeof value === 'string' ? maskValue(value, maskType(key)) : '[Hidden]';
    }
  }

  const auditRequired =
    SENSITIVE_FIELDS.size > 0 && Object.keys(data).some((k) => SENSITIVE_FIELDS.has(k));

  if (auditRequired && targetUserId) {
    const accessedFields = Object.keys(data).filter((k) => SENSITIVE_FIELDS.has(k));
    if (decision.allowed) {
      logPIIAccess(ctx, 'user_profiles', targetUserId, accessedFields);
    } else {
      logPIIDenied(ctx, 'user_profiles', targetUserId);
    }
  }

  return { sanitized, maskedFields, auditRequired };
}
