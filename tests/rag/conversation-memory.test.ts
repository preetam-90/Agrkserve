import { describe, it, expect } from 'bun:test';
import {
  formatConversationMemory,
  type ConversationContext,
} from '../../src/lib/rag/conversation-memory';

describe('formatConversationMemory', () => {
  it('returns empty string for empty summary', () => {
    const ctx: ConversationContext = {
      conversationId: 'c1',
      rollingSummary: '',
      messageCount: 0,
    };
    expect(formatConversationMemory(ctx)).toBe('');
  });

  it('returns empty string for whitespace-only summary', () => {
    const ctx: ConversationContext = {
      conversationId: 'c2',
      rollingSummary: '   ',
      messageCount: 5,
    };
    expect(formatConversationMemory(ctx)).toBe('');
  });

  it('formats non-empty context with turn count header', () => {
    const ctx: ConversationContext = {
      conversationId: 'c3',
      rollingSummary: 'User: hello\nAssistant: hi',
      messageCount: 2,
    };
    const result = formatConversationMemory(ctx);
    expect(result).toContain('CONVERSATION MEMORY');
    expect(result).toContain('2 turns');
    expect(result).toContain('User: hello');
  });

  it('includes END MEMORY marker', () => {
    const ctx: ConversationContext = {
      conversationId: 'c4',
      rollingSummary: 'some content',
      messageCount: 1,
    };
    const result = formatConversationMemory(ctx);
    expect(result).toContain('=== END MEMORY ===');
  });

  it('trims leading/trailing whitespace from summary', () => {
    const ctx: ConversationContext = {
      conversationId: 'c5',
      rollingSummary: '  trimmed content  ',
      messageCount: 1,
    };
    const result = formatConversationMemory(ctx);
    expect(result).toContain('trimmed content');
    expect(result).not.toContain('  trimmed');
  });
});
