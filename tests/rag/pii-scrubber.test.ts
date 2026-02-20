import { describe, it, expect } from 'bun:test';
import { scrubPII } from '../../src/lib/rag/pii-scrubber';

describe('scrubPII', () => {
  it('scrubs email addresses', () => {
    const { scrubbed, detected } = scrubPII('Contact test@example.com for details');
    expect(scrubbed).not.toContain('test@example.com');
    expect(scrubbed).toContain('[EMAIL]');
    expect(detected).toContain('email');
  });

  it('scrubs Indian mobile numbers', () => {
    const { scrubbed, detected } = scrubPII('Call me at 9876543210');
    expect(scrubbed).not.toContain('9876543210');
    expect(scrubbed).toContain('[PHONE]');
    expect(detected).toContain('phone');
  });

  it('scrubs Aadhaar numbers (spaced)', () => {
    const { scrubbed, detected } = scrubPII('Aadhaar: 1234 5678 9012');
    expect(scrubbed).not.toContain('1234 5678 9012');
    expect(scrubbed).toContain('[ID]');
    expect(detected).toContain('aadhaar');
  });

  it('scrubs PAN card numbers', () => {
    const { scrubbed, detected } = scrubPII('PAN is ABCDE1234F');
    expect(scrubbed).not.toContain('ABCDE1234F');
    expect(scrubbed).toContain('[PAN]');
    expect(detected).toContain('pan');
  });

  it('scrubs Indian pincodes', () => {
    const { scrubbed, detected } = scrubPII('Pincode 110001');
    expect(scrubbed).not.toContain('110001');
    expect(scrubbed).toContain('[PIN]');
    expect(detected).toContain('pincode');
  });

  it('detected array contains the correct type names', () => {
    const { detected } = scrubPII('Email: hi@test.com Phone: 9123456789');
    expect(detected).toContain('email');
    expect(detected).toContain('phone');
  });

  it('does not alter clean text', () => {
    const clean = 'The tractor is available for rent at ₹500 per day';
    const { scrubbed, detected } = scrubPII(clean);
    expect(scrubbed).toBe(clean);
    expect(detected).toHaveLength(0);
  });

  it('handles empty string without throwing', () => {
    const { scrubbed, detected } = scrubPII('');
    expect(scrubbed).toBe('');
    expect(detected).toHaveLength(0);
  });
});
