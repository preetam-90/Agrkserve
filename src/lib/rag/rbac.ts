export type AIRole = 'guest' | 'farmer' | 'provider' | 'labour' | 'admin';

const KNOWN_ROLES = new Set<AIRole>(['guest', 'farmer', 'provider', 'labour', 'admin']);

export interface AIRequestContext {
  userId?: string;
  roles: AIRole[];
  activeRole: AIRole;
  isAuthenticated: boolean;
  requestId: string;
  ipAddress?: string;
}

export interface RBACDecision {
  allowed: boolean;
  reason: string;
  maskedFields?: string[];
}

function deny(reason: string, maskedFields?: string[]): RBACDecision {
  return { allowed: false, reason, maskedFields };
}

function allow(reason: string, maskedFields?: string[]): RBACDecision {
  return { allowed: true, reason, maskedFields };
}

function isKnownRole(role: string): role is AIRole {
  return KNOWN_ROLES.has(role as AIRole);
}

export function canAccessPII(ctx: AIRequestContext, targetUserId?: string): RBACDecision {
  if (!isKnownRole(ctx.activeRole)) {
    return deny('Unknown role — access denied');
  }
  if (!ctx.isAuthenticated) {
    return deny('Unauthenticated — PII access denied', ['phone', 'email', 'location']);
  }
  if (!ctx.userId) {
    return deny('Missing userId on authenticated context');
  }
  if (ctx.activeRole === 'admin') {
    return allow('Admin full PII access');
  }
  if (targetUserId && ctx.userId === targetUserId) {
    return allow('Own PII access');
  }
  if (targetUserId && ctx.userId !== targetUserId) {
    return deny('Cross-user PII access denied', ['phone', 'email', 'location']);
  }
  return deny('Insufficient context to grant PII access');
}

export function canAccessPayments(ctx: AIRequestContext, targetUserId?: string): RBACDecision {
  if (!isKnownRole(ctx.activeRole)) {
    return deny('Unknown role — access denied');
  }
  if (!ctx.isAuthenticated || !ctx.userId) {
    return deny('Unauthenticated — payment access denied');
  }
  if (ctx.activeRole === 'admin') {
    return allow('Admin full payment access');
  }
  if (targetUserId && ctx.userId === targetUserId) {
    return allow('Own payment access');
  }
  return deny('Cross-user payment access denied');
}

export function canAccessAdminData(ctx: AIRequestContext): RBACDecision {
  if (!isKnownRole(ctx.activeRole)) {
    return deny('Unknown role — access denied');
  }
  if (ctx.activeRole === 'admin') {
    return allow('Admin data access');
  }
  return deny('Non-admin cannot access admin data');
}

const TABLE_RULES: Record<string, (ctx: AIRequestContext) => RBACDecision> = {
  user_profiles: (ctx) => {
    if (!ctx.isAuthenticated) return deny('Must be authenticated to query user_profiles');
    return allow('Authenticated user may query user_profiles (PII fields enforced separately)');
  },
  equipment: () => allow('Equipment is public'),
  labour_profiles: () => allow('Labour profiles are public'),
  reviews: () => allow('Reviews are public'),
  bookings: (ctx) => {
    if (!ctx.isAuthenticated || !ctx.userId) return deny('Must be authenticated to query bookings');
    return allow('Authenticated user may query own bookings');
  },
  payments: (ctx) => {
    if (!ctx.isAuthenticated || !ctx.userId) return deny('Must be authenticated to query payments');
    return allow('Authenticated user may query own payments');
  },
  earnings: (ctx) => {
    if (!ctx.isAuthenticated || !ctx.userId) return deny('Must be authenticated to query earnings');
    return allow('Authenticated user may query own earnings');
  },
  notifications: (ctx) => {
    if (!ctx.isAuthenticated || !ctx.userId)
      return deny('Must be authenticated to query notifications');
    return allow('Authenticated user may query own notifications');
  },
  audit_logs: (ctx) => canAccessAdminData(ctx),
};

export function canQueryTable(ctx: AIRequestContext, table: string): RBACDecision {
  if (!isKnownRole(ctx.activeRole)) {
    return deny(`Unknown role — table access denied: ${table}`);
  }
  const rule = TABLE_RULES[table];
  if (!rule) {
    return deny(`Unknown table — access denied: ${table}`);
  }
  return rule(ctx);
}
