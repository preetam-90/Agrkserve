import { describe, it, expect } from 'bun:test';
import {
  canAccessPII,
  canQueryTable,
  canAccessAdminData,
  type AIRequestContext,
} from '../../src/lib/rag/rbac';

function makeCtx(overrides: Partial<AIRequestContext> = {}): AIRequestContext {
  return {
    userId: undefined,
    roles: [],
    activeRole: 'guest',
    isAuthenticated: false,
    requestId: 'test-req',
    ...overrides,
  };
}

describe('canAccessPII', () => {
  it('denies unauthenticated requests', () => {
    const result = canAccessPII(makeCtx());
    expect(result.allowed).toBe(false);
  });

  it('allows admin full PII access', () => {
    const result = canAccessPII(
      makeCtx({ userId: 'admin-1', activeRole: 'admin', isAuthenticated: true, roles: ['admin'] })
    );
    expect(result.allowed).toBe(true);
  });

  it('allows own PII access', () => {
    const ctx = makeCtx({ userId: 'user-1', activeRole: 'farmer', isAuthenticated: true });
    const result = canAccessPII(ctx, 'user-1');
    expect(result.allowed).toBe(true);
  });

  it('denies cross-user PII access', () => {
    const ctx = makeCtx({ userId: 'user-1', activeRole: 'farmer', isAuthenticated: true });
    const result = canAccessPII(ctx, 'user-2');
    expect(result.allowed).toBe(false);
  });
});

describe('canQueryTable', () => {
  it('denies access to unknown table', () => {
    const result = canQueryTable(makeCtx(), 'totally_unknown_table');
    expect(result.allowed).toBe(false);
  });

  it('allows guest to query equipment (public table)', () => {
    const result = canQueryTable(makeCtx(), 'equipment');
    expect(result.allowed).toBe(true);
  });

  it('denies unauthenticated access to bookings', () => {
    const result = canQueryTable(makeCtx(), 'bookings');
    expect(result.allowed).toBe(false);
  });

  it('allows authenticated user to query bookings', () => {
    const ctx = makeCtx({ userId: 'user-1', activeRole: 'farmer', isAuthenticated: true });
    const result = canQueryTable(ctx, 'bookings');
    expect(result.allowed).toBe(true);
  });
});

describe('canAccessAdminData', () => {
  it('denies non-admin role', () => {
    const result = canAccessAdminData(
      makeCtx({ userId: 'user-1', activeRole: 'farmer', isAuthenticated: true })
    );
    expect(result.allowed).toBe(false);
  });

  it('denies guest role', () => {
    const result = canAccessAdminData(makeCtx());
    expect(result.allowed).toBe(false);
  });

  it('allows admin role', () => {
    const result = canAccessAdminData(
      makeCtx({ userId: 'admin-1', activeRole: 'admin', isAuthenticated: true })
    );
    expect(result.allowed).toBe(true);
  });
});

describe('RBAC fails closed', () => {
  it('denies access for an unknown role', () => {
    const ctx = makeCtx({
      userId: 'user-1',
      activeRole: 'superuser' as never,
      isAuthenticated: true,
    });
    const result = canQueryTable(ctx, 'equipment');
    expect(result.allowed).toBe(false);
  });
});
