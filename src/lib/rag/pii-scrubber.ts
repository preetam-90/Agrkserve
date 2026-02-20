const PII_PATTERNS = [
  { name: 'email', regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, mask: '[EMAIL]' },
  { name: 'phone', regex: /(\+91[\-\s]?)?[6-9]\d{9}/g, mask: '[PHONE]' },
  {
    name: 'phone_intl',
    regex: /\+\d{1,3}[\s-]?\(?\d{1,4}\)?[\s-]?\d{1,4}[\s-]?\d{1,9}/g,
    mask: '[PHONE]',
  },
  { name: 'pincode', regex: /\b[1-9][0-9]{5}\b/g, mask: '[PIN]' },
  { name: 'aadhaar', regex: /\b\d{4}\s?\d{4}\s?\d{4}\b/g, mask: '[ID]' },
  { name: 'pan', regex: /\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b/g, mask: '[PAN]' },
] as const;

export interface ScrubResult {
  scrubbed: string;
  detected: string[];
}

export function scrubPII(text: string): ScrubResult {
  try {
    let scrubbed = text;
    const detected: string[] = [];

    for (const pattern of PII_PATTERNS) {
      const freshRegex = new RegExp(pattern.regex.source, pattern.regex.flags);
      if (freshRegex.test(scrubbed)) {
        detected.push(pattern.name);
        const replaceRegex = new RegExp(pattern.regex.source, pattern.regex.flags);
        scrubbed = scrubbed.replace(replaceRegex, pattern.mask);
      }
    }

    return { scrubbed, detected };
  } catch (err) {
    console.warn('[pii-scrubber] Failed to scrub text, using original:', err);
    return { scrubbed: text, detected: [] };
  }
}
