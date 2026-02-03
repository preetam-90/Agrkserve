import type {
  KlipyMedia,
  KlipyMediaType,
  KlipySearchResponse,
  KlipyCategory,
  KlipyAutocompleteResult,
  KlipyRecentItem,
  KlipySharePayload,
  KlipyApiItem,
} from '@/lib/types/klipy';

const KLIPY_API_KEY = process.env.NEXT_PUBLIC_KLIPY_API_KEY || '';
const BASE_URL = `https://api.klipy.com/api/v1/${KLIPY_API_KEY}`;

// Local storage keys for caching
const RECENT_ITEMS_KEY = 'klipy_recent_items';
const RECENT_ITEMS_MAX = 20;

/**
 * Normalize KLIPY API response to our internal format
 * Returns null if item has no valid media (to be filtered out)
 */
function normalizeKlipyItem(item: KlipyApiItem, type: KlipyMediaType): KlipyMedia | null {
  // Get primary media (prefer md, then hd, sm, xs)
  const primaryMedia = item.file.md || item.file.hd || item.file.sm || item.file.xs;

  // Require gif format for all media types
  if (!primaryMedia?.gif) {
    console.warn('Skipping item without valid media:', item.slug);
    return null;
  }

  return {
    id: item.slug,
    slug: item.slug,
    title: item.title || 'Untitled',
    type,
    blur_preview: '',
    media_url: primaryMedia.gif.url,
    width: primaryMedia.gif.width,
    height: primaryMedia.gif.height,
    tags: item.tags,
    category: item.category,
    sizes: {
      xs: item.file.xs?.gif
        ? {
            url: item.file.xs.gif.url,
            width: item.file.xs.gif.width,
            height: item.file.xs.gif.height,
          }
        : undefined,
      sm: item.file.sm?.gif
        ? {
            url: item.file.sm.gif.url,
            width: item.file.sm.gif.width,
            height: item.file.sm.gif.height,
          }
        : undefined,
      md: item.file.md?.gif
        ? {
            url: item.file.md.gif.url,
            width: item.file.md.gif.width,
            height: item.file.md.gif.height,
          }
        : undefined,
      hd: item.file.hd?.gif
        ? {
            url: item.file.hd.gif.url,
            width: item.file.hd.gif.width,
            height: item.file.hd.gif.height,
          }
        : undefined,
    },
  };
}

/**
 * KLIPY Service for managing GIFs, Memes, Stickers, and Clips
 * Optimized for agricultural themes and low connectivity environments
 */
export const klipyService = {
  /**
   * Search for media items by query and type
   */
  async search(
    query: string,
    type: KlipyMediaType,
    page: number = 1,
    perPage: number = 20
  ): Promise<KlipySearchResponse> {
    try {
      // Validate API key
      if (!KLIPY_API_KEY) {
        console.warn('KLIPY API key not configured, using mock data');
        return { data: this.filterMockData(query, type, perPage) };
      }

      // Convert type to plural (gif -> gifs, meme -> memes, etc)
      const pluralType = `${type}s`;

      const params = new URLSearchParams({
        q: query,
        page: page.toString(),
        per_page: perPage.toString(),
      });

      const response = await fetch(`${BASE_URL}/${pluralType}/search?${params}`);

      if (!response.ok) {
        console.warn(`KLIPY API error: ${response.status}`);
        return { data: this.filterMockData(query, type, perPage) };
      }

      const json = await response.json();
      if (!json.result) {
        console.warn('KLIPY API returned no results, using mock data');
        return { data: this.filterMockData(query, type, perPage) };
      }

      // KLIPY returns json.data.data (nested), normalize items
      const rawItems = json.data?.data || [];
      const normalized = rawItems.map((item: KlipyApiItem) => normalizeKlipyItem(item, type));
      return { data: normalized };
    } catch (error) {
      console.error('KLIPY search error:', error);
      return { data: this.filterMockData(query, type, perPage) };
    }
  },

  /**
   * Get categories for a specific media type
   */
  async getCategories(type: KlipyMediaType): Promise<KlipyCategory[]> {
    try {
      if (!KLIPY_API_KEY) return [];

      const pluralType = `${type}s`;
      const response = await fetch(`${BASE_URL}/${pluralType}/categories?locale=en_US`);

      if (!response.ok) {
        throw new Error(`KLIPY API error: ${response.status}`);
      }

      const json = await response.json();
      return json.data?.categories || [];
    } catch (error) {
      console.error('KLIPY categories error:', error);
      return [];
    }
  },

  /**
   * Get trending items for a specific type
   */
  async getTrending(type: KlipyMediaType, limit: number = 20): Promise<KlipyMedia[]> {
    try {
      // Validate API key
      if (!KLIPY_API_KEY) {
        return this.getMockTrendingData(type, limit);
      }

      const pluralType = `${type}s`;
      const params = new URLSearchParams({
        page: '1',
        per_page: limit.toString(),
      });

      const response = await fetch(`${BASE_URL}/${pluralType}/trending?${params}`);

      if (!response.ok) {
        console.warn(`KLIPY API error: ${response.status}`);
        // Fallback to mock data if API is not configured
        return this.getMockTrendingData(type, limit);
      }

      const json = await response.json();
      if (!json.result) {
        console.warn('KLIPY API returned no results, using mock data');
        return this.getMockTrendingData(type, limit);
      }

      // KLIPY returns json.data.data (nested), normalize items
      const rawItems: KlipyApiItem[] = json.data?.data || [];
      const normalized: KlipyMedia[] = rawItems
        .map((item) => normalizeKlipyItem(item, type))
        .filter((item): item is KlipyMedia => item !== null);
      return normalized;
    } catch (error) {
      console.error('KLIPY trending error:', error);
      // Fallback to mock data
      return this.getMockTrendingData(type, limit);
    }
  },

  /**
   * Autocomplete suggestions for search queries
   */
  async autocomplete(query: string, type: KlipyMediaType): Promise<string[]> {
    try {
      if (query.length < 2 || !KLIPY_API_KEY) return [];

      const pluralType = `${type}s`;
      const params = new URLSearchParams({
        q: query,
        locale: 'en_US',
      });

      const response = await fetch(`${BASE_URL}/${pluralType}/search_suggestions?${params}`);

      if (!response.ok) {
        throw new Error(`KLIPY API error: ${response.status}`);
      }

      const json = await response.json();
      return json.data || [];
    } catch (error) {
      console.error('KLIPY autocomplete error:', error);
      return [];
    }
  },

  /**
   * Get recent items for a specific user
   */
  async getRecent(customerId: string, type: KlipyMediaType): Promise<KlipyRecentItem[]> {
    try {
      if (!KLIPY_API_KEY) return this.getLocalRecent(type);

      const pluralType = `${type}s`;
      const response = await fetch(`${BASE_URL}/${pluralType}/recent/${customerId}?locale=en_US`);

      if (!response.ok) {
        // Fallback to local storage if API fails
        return this.getLocalRecent(type);
      }

      const json = await response.json();
      return json.data?.data || this.getLocalRecent(type);
    } catch (error) {
      console.error('KLIPY recent error:', error);
      // Fallback to local storage
      return this.getLocalRecent(type);
    }
  },

  /**
   * Track media share (important for API metrics and trending)
   */
  async share(payload: KlipySharePayload): Promise<boolean> {
    try {
      if (!KLIPY_API_KEY) return false;

      // Determine the type from the payload (you may need to pass it)
      const pluralType = 'gifs'; // Default, ideally pass type in payload
      const response = await fetch(`${BASE_URL}/${pluralType}/share/${payload.slug}`, {
        method: 'POST',
      });

      if (!response.ok) {
        console.warn('KLIPY share tracking failed:', response.status);
        return false;
      }

      return true;
    } catch (error) {
      console.error('KLIPY share error:', error);
      return false;
    }
  },

  /**
   * Add item to local recent items cache
   */
  addToLocalRecent(media: KlipyMedia): void {
    if (typeof window === 'undefined') return;

    try {
      const key = `${RECENT_ITEMS_KEY}_${media.type}`;
      const stored = localStorage.getItem(key);
      let recent: KlipyRecentItem[] = [];
      if (stored) {
        try {
          recent = JSON.parse(stored);
        } catch (parseError) {
          console.warn('Failed to parse recent items, clearing corrupted data:', parseError);
          localStorage.removeItem(key);
        }
      }

      // Check if item already exists
      const existingIndex = recent.findIndex((item) => item.slug === media.slug);

      const recentItem: KlipyRecentItem = {
        ...media,
        last_used_at: new Date().toISOString(),
        usage_count: existingIndex >= 0 ? recent[existingIndex].usage_count + 1 : 1,
      };

      if (existingIndex >= 0) {
        // Update existing item
        recent[existingIndex] = recentItem;
      } else {
        // Add new item to the beginning
        recent.unshift(recentItem);
      }

      // Sort by last_used_at and limit to max items
      recent = recent
        .sort((a, b) => new Date(b.last_used_at).getTime() - new Date(a.last_used_at).getTime())
        .slice(0, RECENT_ITEMS_MAX);

      localStorage.setItem(key, JSON.stringify(recent));
    } catch (error) {
      console.error('Error saving to local recent:', error);
    }
  },

  /**
   * Get local recent items
   */
  getLocalRecent(type: KlipyMediaType): KlipyRecentItem[] {
    if (typeof window === 'undefined') return [];

    try {
      const key = `${RECENT_ITEMS_KEY}_${type}`;
      const stored = localStorage.getItem(key);
      if (!stored || stored.trim() === '') return [];
      return JSON.parse(stored);
    } catch (error) {
      console.error('Error reading local recent:', error);
      // Clear corrupted data
      try {
        localStorage.removeItem(`${RECENT_ITEMS_KEY}_${type}`);
      } catch {
        // Ignore cleanup errors
      }
      return [];
    }
  },

  /**
   * Clear local recent items
   */
  clearLocalRecent(type?: KlipyMediaType): void {
    if (typeof window === 'undefined') return;

    try {
      if (type) {
        const key = `${RECENT_ITEMS_KEY}_${type}`;
        localStorage.removeItem(key);
      } else {
        // Clear all types
        const types: KlipyMediaType[] = ['gif', 'sticker'];
        types.forEach((t) => {
          const key = `${RECENT_ITEMS_KEY}_${t}`;
          localStorage.removeItem(key);
        });
      }
    } catch (error) {
      console.error('Error clearing local recent:', error);
    }
  },

  /**
   * Get agricultural-themed suggestions for initial display
   */
  getAgricultureSuggestions(type: KlipyMediaType): string[] {
    const suggestions: Record<KlipyMediaType, string[]> = {
      gif: [
        'tractor',
        'harvest',
        'plowing',
        'success',
        'deal',
        'on my way',
        'thumbs up',
        'celebration',
        'farming',
        'crop',
      ],
      sticker: [
        'tractor sticker',
        'check mark',
        'deal done',
        'confirmed',
        'arriving',
        'thank you',
        'thumbs up',
        'farming',
      ],
    };

    return suggestions[type] || [];
  },

  /**
   * Get optimal size URL for current context
   * Use smaller sizes for preview, HD for full view
   */
  getOptimalSize(media: KlipyMedia, context: 'preview' | 'full' = 'preview'): string {
    if (!media.sizes) return media.media_url;

    if (context === 'preview') {
      // Use smaller size for chat preview to save bandwidth
      return media.sizes.sm?.url || media.sizes.xs?.url || media.media_url;
    } else {
      // Use HD for full view
      return media.sizes.hd?.url || media.sizes.md?.url || media.media_url;
    }
  },

  /**
   * Get mock/placeholder data for development and API fallback
   * This provides working UI while the actual KLIPY API is being configured
   */
  getMockTrendingData(type: KlipyMediaType, limit: number = 20): KlipyMedia[] {
    const mockData: Record<KlipyMediaType, KlipyMedia[]> = {
      gif: [
        {
          id: 'mock-gif-1',
          slug: 'tractor-driving',
          title: 'Tractor Driving',
          type: 'gif',
          blur_preview: '',
          media_url: 'https://media.giphy.com/media/3o7TKSjRrfIPjeiVyM/giphy.gif',
          width: 480,
          height: 270,
        },
        {
          id: 'mock-gif-2',
          slug: 'thumbs-up',
          title: 'Thumbs Up',
          type: 'gif',
          blur_preview: '',
          media_url: 'https://media.giphy.com/media/111ebonMs90YLu/giphy.gif',
          width: 480,
          height: 270,
        },
        {
          id: 'mock-gif-3',
          slug: 'deal',
          title: 'Deal',
          type: 'gif',
          blur_preview: '',
          media_url: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif',
          width: 480,
          height: 270,
        },
        {
          id: 'mock-gif-4',
          slug: 'harvest-time',
          title: 'Harvest Time',
          type: 'gif',
          blur_preview: '',
          media_url: 'https://media.giphy.com/media/26BROrSHlmyzzHf3i/giphy.gif',
          width: 480,
          height: 270,
        },
        {
          id: 'mock-gif-5',
          slug: 'success',
          title: 'Success',
          type: 'gif',
          blur_preview: '',
          media_url: 'https://media.giphy.com/media/a0h7sAqON67nO/giphy.gif',
          width: 480,
          height: 270,
        },
        {
          id: 'mock-gif-6',
          slug: 'on-my-way',
          title: 'On My Way',
          type: 'gif',
          blur_preview: '',
          media_url: 'https://media.giphy.com/media/l4FGni1RBAR2OWsGk/giphy.gif',
          width: 480,
          height: 270,
        },
        {
          id: 'mock-gif-7',
          slug: 'celebration',
          title: 'Celebration',
          type: 'gif',
          blur_preview: '',
          media_url: 'https://media.giphy.com/media/g9582DNuQppxC/giphy.gif',
          width: 480,
          height: 270,
        },
        {
          id: 'mock-gif-8',
          slug: 'thinking',
          title: 'Thinking',
          type: 'gif',
          blur_preview: '',
          media_url: 'https://media.giphy.com/media/3o7btPCcdNniyf0ArS/giphy.gif',
          width: 480,
          height: 270,
        },
      ],
      sticker: [
        {
          id: 'mock-sticker-1',
          slug: 'check-mark',
          title: 'Check Mark',
          type: 'sticker',
          blur_preview: '',
          media_url:
            'https://cdn.pixabay.com/photo/2016/03/31/14/37/check-mark-1292787_960_720.png',
          width: 200,
          height: 200,
        },
        {
          id: 'mock-sticker-2',
          slug: 'thumbs-up-sticker',
          title: 'Thumbs Up',
          type: 'sticker',
          blur_preview: '',
          media_url: 'https://cdn.pixabay.com/photo/2017/06/10/07/18/thumbs-up-2389691_960_720.png',
          width: 200,
          height: 200,
        },
        {
          id: 'mock-sticker-3',
          slug: 'star',
          title: 'Star',
          type: 'sticker',
          blur_preview: '',
          media_url: 'https://cdn.pixabay.com/photo/2016/12/18/13/45/star-1915690_960_720.png',
          width: 200,
          height: 200,
        },
        {
          id: 'mock-sticker-4',
          slug: 'heart',
          title: 'Heart',
          type: 'sticker',
          blur_preview: '',
          media_url: 'https://cdn.pixabay.com/photo/2016/03/31/19/24/heart-1294863_960_720.png',
          width: 200,
          height: 200,
        },
        {
          id: 'mock-sticker-5',
          slug: 'smile',
          title: 'Smile',
          type: 'sticker',
          blur_preview: '',
          media_url: 'https://cdn.pixabay.com/photo/2017/01/31/16/59/smiley-2023365_960_720.png',
          width: 200,
          height: 200,
        },
      ],
    };

    const items = mockData[type] || [];
    return items.slice(0, Math.min(limit, items.length));
  },

  /**
   * Filter mock data based on search query
   */
  filterMockData(query: string, type: KlipyMediaType, limit: number = 20): KlipyMedia[] {
    const allItems = this.getMockTrendingData(type, 100); // Get all items

    if (!query || query.trim().length === 0) {
      return allItems.slice(0, limit);
    }

    const lowerQuery = query.toLowerCase().trim();
    const filtered = allItems.filter((item) => {
      const matchesTitle = item.title.toLowerCase().includes(lowerQuery);
      const matchesSlug = item.slug.toLowerCase().includes(lowerQuery);
      const matchesTags =
        item.tags && item.tags.some((tag) => tag.toLowerCase().includes(lowerQuery));

      return matchesTitle || matchesSlug || matchesTags;
    });

    return filtered.slice(0, limit);
  },
};
