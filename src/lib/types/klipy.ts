// KLIPY API Types - Updated to match actual API response

export type KlipyMediaType = 'gif' | 'sticker';

// Raw API response structure from KLIPY
export interface KlipyApiItem {
  slug: string;
  title?: string;
  file: {
    xs?: { gif: { url: string; width: number; height: number } };
    sm?: { gif: { url: string; width: number; height: number } };
    md?: { gif: { url: string; width: number; height: number } };
    hd?: { gif: { url: string; width: number; height: number } };
  };
  tags?: string[];
  category?: string;
}

// Normalized format for app use
export interface KlipyMedia {
  id: string;
  slug: string;
  title: string;
  type: KlipyMediaType;
  blur_preview: string; // Base64 encoded blur preview
  media_url: string;
  thumbnail_url?: string;
  width: number;
  height: number;
  size_bytes?: number;
  duration_seconds?: number; // For clips/videos
  tags?: string[];
  category?: string;
  // Resolution variants
  sizes?: {
    xs?: MediaSize;
    sm?: MediaSize;
    md?: MediaSize;
    hd?: MediaSize;
  };
}

export interface MediaSize {
  url: string;
  width: number;
  height: number;
  size_bytes?: number;
}

export interface KlipySearchResponse {
  data: KlipyMedia[];
  pagination?: {
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
  };
}

export interface KlipyCategory {
  id: string;
  name: string;
  slug: string;
  type: KlipyMediaType;
  thumbnail?: string;
  count?: number;
}

export interface KlipyAutocompleteResult {
  query: string;
  suggestions: string[];
}

export interface KlipyRecentItem extends KlipyMedia {
  last_used_at: string;
  usage_count: number;
}

export interface KlipySharePayload {
  slug: string;
  customer_id: string;
  platform?: string;
}
