const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || '';
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN || '';

const EMBEDDING_MODEL = '@cf/baai/bge-base-en-v1.5';
const EMBEDDING_DIMENSIONS = 768;
const API_TIMEOUT_MS = 30000;
const MAX_RETRIES = 2;
const BATCH_SIZE = 100;
const BASE_BACKOFF_MS = 1000;

interface EmbeddingResponse {
  result: {
    shape: number[];
    data: number[][];
  };
  success: boolean;
  errors: Array<{ message: string }>;
}

interface EmbeddingResult {
  embedding: number[];
  success: boolean;
  error?: string;
}

function getApiUrl(): string {
  return `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/ai/run/${EMBEDDING_MODEL}`;
}

function validateCredentials(): { valid: boolean; error?: string } {
  if (!CLOUDFLARE_ACCOUNT_ID) {
    return { valid: false, error: 'CLOUDFLARE_ACCOUNT_ID is not configured' };
  }
  if (!CLOUDFLARE_API_TOKEN) {
    return { valid: false, error: 'CLOUDFLARE_API_TOKEN is not configured' };
  }
  return { valid: true };
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function callEmbeddingApi(
  text: string | string[],
  retryCount: number = 0
): Promise<EmbeddingResponse> {
  const url = getApiUrl();

  const response = await fetchWithTimeout(
    url,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
      },
      body: JSON.stringify({ text }),
    },
    API_TIMEOUT_MS
  );

  if (!response.ok) {
    const errorText = await response.text();
    const errorMessage = `API request failed with status ${response.status}: ${errorText}`;

    if (retryCount < MAX_RETRIES && (response.status >= 500 || response.status === 429)) {
      const backoffMs = BASE_BACKOFF_MS * Math.pow(2, retryCount);
      await sleep(backoffMs);
      return callEmbeddingApi(text, retryCount + 1);
    }

    throw new Error(errorMessage);
  }

  return response.json();
}

function chunkText(text: string, maxLength: number = 3000): string[] {
  if (text.length <= maxLength) {
    return [text];
  }

  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    let end = start + maxLength;

    if (end < text.length) {
      const lastPeriod = text.lastIndexOf('.', end);
      const lastNewline = text.lastIndexOf('\n', end);
      const breakPoint = Math.max(lastPeriod, lastNewline);

      if (breakPoint > start) {
        end = breakPoint + 1;
      }
    } else {
      end = text.length;
    }

    chunks.push(text.slice(start, end).trim());
    start = end;
  }

  return chunks.filter((chunk) => chunk.length > 0);
}

export async function generateEmbedding(text: string): Promise<EmbeddingResult> {
  const validation = validateCredentials();
  if (!validation.valid) {
    return {
      embedding: [],
      success: false,
      error: validation.error,
    };
  }

  if (!text || text.trim().length === 0) {
    return {
      embedding: [],
      success: false,
      error: 'Text cannot be empty',
    };
  }

  try {
    const response = await callEmbeddingApi(text.trim());

    if (!response.success) {
      const errorMsg = response.errors?.map((e) => e.message).join(', ') || 'Unknown API error';
      return {
        embedding: [],
        success: false,
        error: errorMsg,
      };
    }

    if (!response.result?.data?.[0]) {
      return {
        embedding: [],
        success: false,
        error: 'No embedding returned from API',
      };
    }

    return {
      embedding: response.result.data[0],
      success: true,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      embedding: [],
      success: false,
      error: errorMessage,
    };
  }
}

export async function generateEmbeddings(texts: string[]): Promise<EmbeddingResult[]> {
  const validation = validateCredentials();
  if (!validation.valid) {
    return texts.map(() => ({
      embedding: [],
      success: false,
      error: validation.error,
    }));
  }

  if (!texts || texts.length === 0) {
    return [];
  }

  const results: EmbeddingResult[] = new Array(texts.length).fill(null).map(() => ({
    embedding: [],
    success: false,
    error: 'Not processed',
  }));

  const batches: { indices: number[]; texts: string[] }[] = [];

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batchIndices: number[] = [];
    const batchTexts: string[] = [];

    for (let j = i; j < Math.min(i + BATCH_SIZE, texts.length); j++) {
      if (texts[j] && texts[j].trim().length > 0) {
        batchIndices.push(j);
        batchTexts.push(texts[j].trim());
      }
    }

    if (batchTexts.length > 0) {
      batches.push({ indices: batchIndices, texts: batchTexts });
    }
  }

  for (const batch of batches) {
    try {
      const response = await callEmbeddingApi(batch.texts);

      if (!response.success) {
        const errorMsg = response.errors?.map((e) => e.message).join(', ') || 'Unknown API error';
        batch.indices.forEach((idx) => {
          results[idx] = {
            embedding: [],
            success: false,
            error: errorMsg,
          };
        });
        continue;
      }

      if (!response.result?.data) {
        batch.indices.forEach((idx) => {
          results[idx] = {
            embedding: [],
            success: false,
            error: 'No embeddings returned from API',
          };
        });
        continue;
      }

      batch.indices.forEach((idx, i) => {
        if (response.result.data[i]) {
          results[idx] = {
            embedding: response.result.data[i],
            success: true,
          };
        } else {
          results[idx] = {
            embedding: [],
            success: false,
            error: 'Missing embedding in batch response',
          };
        }
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      batch.indices.forEach((idx) => {
        results[idx] = {
          embedding: [],
          success: false,
          error: errorMessage,
        };
      });
    }
  }

  return results;
}

export { EMBEDDING_DIMENSIONS, EMBEDDING_MODEL };
