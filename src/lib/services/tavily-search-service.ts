/**
 * Tavily Web Search Service
 *
 * Provides web search capabilities for the AgriServe AI chatbot using the Tavily API.
 * Features:
 * - Agriculture-specific intent detection to avoid unnecessary API calls
 * - Supabase-backed result caching (TTL-based)
 * - In-memory rate limiting to stay within free-tier limits
 * - Input sanitization to prevent injection attacks
 * - Graceful error handling
 */

import { createAdminClient } from '@/lib/supabase/admin';
import crypto from 'crypto';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TavilySearchResult {
  title: string;
  url: string;
  content: string;
  score?: number;
  published_date?: string;
}

interface TavilyAPIResponse {
  query: string;
  answer?: string;
  results: TavilySearchResult[];
}

interface WebSearchResult {
  title: string;
  url: string;
  snippet: string;
  score: number;
  publishedDate?: string;
}

interface WebSearchResponse {
  results: WebSearchResult[];
  query: string;
  answer?: string;
  fromCache: boolean;
  searchedAt: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TAVILY_API_URL = 'https://api.tavily.com/search';
const CACHE_TTL_PRICE_MS = 60 * 60 * 1000; // 1 hour for price/market queries
const CACHE_TTL_GENERAL_MS = 24 * 60 * 60 * 1000; // 24 hours for general info
const MAX_RESULTS = 8;
const DISPLAY_RESULTS = 5;
const RATE_LIMIT_MAX = 20; // requests per window
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute

// ─── Rate Limiter ─────────────────────────────────────────────────────────────

const rateLimiter = {
  timestamps: [] as number[],

  isAllowed(): boolean {
    const now = Date.now();
    this.timestamps = this.timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
    if (this.timestamps.length >= RATE_LIMIT_MAX) {
      console.warn('Tavily rate limit reached. Skipping search.');
      return false;
    }
    this.timestamps.push(now);
    return true;
  },
};

// ─── Intent Detection ─────────────────────────────────────────────────────────
// Patterns that indicate a query needs live web data (NOT platform data)

const WEB_SEARCH_TRIGGERS: RegExp[] = [
  // Price & market queries
  /\b(price|cost|rate|keemat|bhav|msp|minimum\s+support\s+price|market\s+price|current\s+price|today[''s]?\s+price)\b/i,
  /\b(how\s+much\s+(does|is|do|cost)|kitna|kya\s+rate)\b/i,
  /\b(2024|2025|2026)\s*(price|rate|model|launch|release)\b/i,

  // News & current events
  /\b(news|latest\s+news|update|announcement|khabar|samachar)\b/i,
  /\b(new\s+(model|launch|release|equipment|tractor|machine)|newly\s+launched)\b/i,
  /\b(recently\s+(launched|released|announced)|just\s+(launched|released))\b/i,

  // Government schemes & subsidies
  /\b(government\s+scheme|yojana|subsidy|anudan|pm\s*kisan|kcc|kisan\s+credit|nabard|krishi)\b/i,
  /\b(loan|mudra|agri\s+loan|agriculture\s+loan|farm\s+loan)\b/i,

  // Weather & forecast
  /\b(weather|forecast|baarish|monsoon|barsat|rain|drought|flood|temperature|imd|met)\b/i,

  // Commodity & mandi prices
  /\b(mandi\s*(price|rate|bhav)|wholesale\s+price|retail\s+price)\b/i,
  /\b(wheat|rice|paddy|cotton|sugarcane|soybean|soya|maize|onion|potato|tomato|garlic)\s*(price|rate|msp|bhav)\b/i,
  /\b(commodity|agri\s+commodity|agri\s+market|agri\s+news)\b/i,

  // Brand / manufacturer info (price/features/reviews)
  /\b(mahindra|john\s*deere|sonalika|new\s+holland|kubota|eicher|swaraj|indo\s+farm|preet|ace)\b.*\b(price|model|feature|review|launch|spec)\b/i,

  // Location-specific external queries (market rates in specific states)
  /\b(in\s+(bihar|punjab|gujarat|maharashtra|karnataka|rajasthan|up|haryana|mp|odisha|assam|kerala|tn))\s+(price|rate|mandi|market)\b/i,

  // Comparison / recommendation queries against external sources
  /\b(best\s+(tractor|harvester|sprayer|drone|equipment)\s+(to\s+buy|under|for|in))\b/i,
  /\b(compare\s+(tractor|harvester|equipment)|vs\.?\s+(tractor|harvester))\b/i,
];

// Patterns that are PLATFORM-SPECIFIC — do NOT trigger web search
const PLATFORM_PATTERNS: RegExp[] = [
  /\b(my|mine)\s+(booking|equipment|profile|review|listing|rental)\b/i,
  /\b(list|show|count|how\s+many|total|all)\s+(equipment|labour|user|booking|review|machine)\b/i,
  /\b(available\s+(equipment|labour|machine|tractor))\b/i,
  /\b(platform\s+(stat|statistic|summary|overview|data)|dashboard\s+stat|overall\s+stat)\b/i,
  /\b(pending|confirmed|in.?progress|completed|cancelled)\s+booking\b/i,
  /\b(analytics|admin\s+insight|business\s+insight)\b/i,
  /\b(review\s+for|rating\s+for|feedback\s+for)\s+\w/i,
];

/**
 * Detect whether a user message requires a live web search.
 * Returns true if the message matches agriculture/market web-search triggers
 * and does NOT match platform-specific intent patterns.
 */
export function detectWebSearchIntent(message: string): boolean {
  if (!message || message.trim().length < 5) return false;

  // Platform-specific queries should NEVER trigger web search
  for (const pattern of PLATFORM_PATTERNS) {
    if (pattern.test(message)) return false;
  }

  // Check for web search triggers
  for (const pattern of WEB_SEARCH_TRIGGERS) {
    if (pattern.test(message)) return true;
  }

  return false;
}

// ─── Input Sanitization ───────────────────────────────────────────────────────

/**
 * Sanitize user query to prevent injection attacks and API abuse.
 */
function sanitizeQuery(query: string): string {
  return query
    .replace(/<[^>]*>/g, '') // Strip HTML tags
    .replace(/[<>{}|\\^`]/g, '') // Remove potentially dangerous chars
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
    .slice(0, 500); // Limit length to 500 chars
}

// ─── Caching ──────────────────────────────────────────────────────────────────

function hashQuery(query: string): string {
  return crypto.createHash('sha256').update(query.toLowerCase().trim()).digest('hex').slice(0, 32);
}

function isPriceQuery(query: string): boolean {
  return /\b(price|cost|rate|bhav|msp|mandi)\b/i.test(query);
}

async function getCachedResult(queryHash: string): Promise<WebSearchResponse | null> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('web_search_cache')
      .select('results, answer, original_query, created_at')
      .eq('query_hash', queryHash)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error || !data) return null;

    // Increment hit count (non-critical)
    void supabase
      .from('web_search_cache')
      .update({ hit_count: supabase.rpc('increment_hit_count' as never) })
      .eq('query_hash', queryHash);

    return {
      results: data.results as WebSearchResult[],
      answer: data.answer || undefined,
      query: data.original_query,
      fromCache: true,
      searchedAt: data.created_at,
    };
  } catch {
    return null;
  }
}

async function cacheResult(
  queryHash: string,
  query: string,
  response: WebSearchResponse
): Promise<void> {
  try {
    const supabase = createAdminClient();
    const ttlMs = isPriceQuery(query) ? CACHE_TTL_PRICE_MS : CACHE_TTL_GENERAL_MS;
    const expiresAt = new Date(Date.now() + ttlMs).toISOString();

    await supabase.from('web_search_cache').upsert(
      {
        query_hash: queryHash,
        original_query: query,
        results: response.results,
        answer: response.answer || null,
        result_count: response.results.length,
        expires_at: expiresAt,
        hit_count: 0,
      },
      { onConflict: 'query_hash' }
    );
  } catch (err) {
    console.warn('Tavily cache failed to store result:', err);
  }
}

// ─── Tavily API Call ──────────────────────────────────────────────────────────

async function callTavilyAPI(query: string): Promise<TavilyAPIResponse> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) throw new Error('TAVILY_API_KEY is not configured');

  try {
    const response = await fetch(TAVILY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        query,
        max_results: MAX_RESULTS,
        search_depth: 'basic',
        include_answer: true,
        include_domains: [],
        exclude_domains: [],
        language: 'en',
        topic: 'general',
      }),
      signal: AbortSignal.timeout(10000), // 10s timeout
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      if (response.status === 429) throw new Error('Tavily rate limit exceeded');
      if (response.status === 401) throw new Error('Invalid Tavily API key');
      throw new Error(`Tavily API error ${response.status}: ${errorText}`);
    }

    return response.json() as Promise<TavilyAPIResponse>;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Tavily search request timed out (10s)');
    }
    throw error;
  }
}

// ─── Main Search Function ─────────────────────────────────────────────────────

/**
 * Perform a web search using the Tavily API with caching and rate limiting.
 *
 * @param rawQuery - The user's message (will be sanitized)
 * @returns WebSearchResponse with top results, or null on failure
 */
export async function performWebSearch(rawQuery: string): Promise<WebSearchResponse | null> {
  // 1. Sanitize input
  const query = sanitizeQuery(rawQuery);
  if (!query) return null;

  // 2. Check rate limit
  if (!rateLimiter.isAllowed()) {
    console.warn('Tavily rate limit exceeded, skipping search for:', query.slice(0, 50));
    return null;
  }

  // 3. Check cache
  const queryHash = hashQuery(query);
  const cached = await getCachedResult(queryHash);
  if (cached) {
    console.info('Tavily cache hit for query hash:', queryHash.slice(0, 8));
    return cached;
  }

  // 4. Call Tavily API
  try {
    console.info('Tavily fetching search results for:', query.slice(0, 80));
    const apiResponse = await callTavilyAPI(query);

    const results: WebSearchResult[] = (apiResponse.results || [])
      .slice(0, DISPLAY_RESULTS)
      .map((r) => ({
        title: r.title || 'Untitled',
        url: r.url,
        snippet: r.content?.slice(0, 300) || '',
        score: r.score ?? 0,
        publishedDate: r.published_date,
      }))
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

    const webSearchResponse: WebSearchResponse = {
      results,
      query: apiResponse.query || query,
      answer: apiResponse.answer || undefined,
      fromCache: false,
      searchedAt: new Date().toISOString(),
    };

    // 5. Cache the result (non-blocking)
    cacheResult(queryHash, query, webSearchResponse).catch(() => {});

    return webSearchResponse;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Tavily search failed:', message);

    // Non-fatal: return null so the chatbot continues without web context
    return null;
  }
}

// ─── Formatter ────────────────────────────────────────────────────────────────

/**
 * Format Tavily search results into a string suitable for injection
 * into the AI system prompt as context.
 */
export function formatWebSearchContext(response: WebSearchResponse): string {
  if (!response || response.results.length === 0) return '';

  const lines: string[] = [
    '=== WEB SEARCH RESULTS (Live via Tavily) ===',
    `Query: "${response.query}"`,
    `Source: ${response.fromCache ? 'Cached' : 'Live web'} | Fetched: ${new Date(response.searchedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`,
    '',
  ];

  if (response.answer) {
    lines.push('## Quick Answer');
    lines.push(response.answer);
    lines.push('');
  }

  lines.push('## Top Web Results');
  lines.push('');

  response.results.forEach((result, idx) => {
    lines.push(`### ${idx + 1}. ${result.title}`);
    lines.push(`🔗 Source: ${result.url}`);
    if (result.publishedDate) {
      lines.push(`📅 Published: ${result.publishedDate}`);
    }
    lines.push(`📄 ${result.snippet}`);
    lines.push('');
  });

  lines.push('---');
  lines.push(
    '⚠️ IMPORTANT: When citing these results in your response, always include the clickable source URLs as markdown links [Title](URL). Present the top 3-5 results to the user in a clean, readable format.'
  );

  return lines.join('\n');
}
