const FALLBACK_SITE_URL = 'https://agrirental.vercel.app';

function normalizeSiteUrl(url: string) {
  return url.replace(/\/+$/, '');
}

// Centralized base URL resolution for metadata + JSON-LD.
// Prefer NEXT_PUBLIC_SITE_URL, then Vercel-provided VERCEL_URL, then fallback.
export function getSiteUrl() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return normalizeSiteUrl(explicit);

  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) return normalizeSiteUrl(`https://${vercelUrl}`);

  return FALLBACK_SITE_URL;
}
