'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  X,
  Search,
  Loader2,
  TrendingUp,
  Clock,
  Smile,
  Image as ImageIcon,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { KlipyMedia } from '@/lib/types/klipy';
import { klipyService } from '@/lib/services/klipy-service';
import { KlipyMediaGrid } from './klipy-media-grid';
import { useAuthStore } from '@/lib/store';
import EmojiPicker, { Theme } from 'emoji-picker-react';

interface UnifiedMediaPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectEmoji: (emoji: string) => void;
  onSelectKlipy: (media: KlipyMedia) => void;
}

type TabId = 'emoji' | 'gif' | 'sticker';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'emoji', label: 'Emojis', icon: <Smile className="h-4 w-4" /> },
  { id: 'gif', label: 'GIFs', icon: <ImageIcon className="h-4 w-4" /> },
  { id: 'sticker', label: 'Stickers', icon: <Sparkles className="h-4 w-4" /> },
];

type ViewMode = 'trending' | 'recent' | 'search';

export function UnifiedMediaPicker({
  isOpen,
  onClose,
  onSelectEmoji,
  onSelectKlipy,
}: UnifiedMediaPickerProps) {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabId>('emoji');
  const [viewMode, setViewMode] = useState<ViewMode>('trending');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [items, setItems] = useState<KlipyMedia[]>([]);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load Klipy content for GIFs/Stickers tabs
  const loadKlipyContent = useCallback(
    async (loadMore: boolean = false) => {
      // Prevent concurrent loading
      if (loading || activeTab === 'emoji') return;

      setLoading(true);
      try {
        const currentPage = loadMore ? page : 1;
        const limit = 20;

        let newData: KlipyMedia[] = [];

        if (viewMode === 'trending') {
          newData = await klipyService.getTrending(activeTab, limit * currentPage);
        } else if (viewMode === 'recent') {
          const customerId = user?.id || 'guest';
          newData = await klipyService.getRecent(customerId, activeTab);
        } else if (viewMode === 'search' && debouncedQuery.trim()) {
          const response = await klipyService.search(debouncedQuery, activeTab, currentPage, limit);
          newData = response.data;
        }

        if (loadMore) {
          setItems((prev) => [...prev, ...newData.slice(prev.length)]);
        } else {
          setItems(newData);
          setPage(1);
        }

        setHasMore(newData.length >= limit * currentPage);
      } catch (error) {
        console.error('Failed to load media:', error);
        if (!loadMore) setItems([]);
      } finally {
        setLoading(false);
      }
    },
    // Remove 'loading' from dependencies to prevent flickering loops
     
    [activeTab, viewMode, debouncedQuery, user?.id, page]
  );

  // Load content when tab, view mode, or debounced query changes
  // Use a ref to prevent duplicate calls
  const lastLoadKey = useRef('');

  useEffect(() => {
    if (isOpen && activeTab !== 'emoji') {
      const loadKey = `${activeTab}-${viewMode}-${debouncedQuery}`;
      // Only load if the key has changed
      if (lastLoadKey.current !== loadKey) {
        lastLoadKey.current = loadKey;
        loadKlipyContent(false);
      }
    }
  }, [isOpen, activeTab, viewMode, debouncedQuery, loadKlipyContent]);

  // Load suggestions for Klipy tabs
  useEffect(() => {
    if (isOpen && activeTab !== 'emoji') {
      const agriSuggestions = klipyService.getAgricultureSuggestions(activeTab);
      setSuggestions(agriSuggestions);
    }
  }, [isOpen, activeTab]);

  // Infinite scroll handler with debounce
  const isLoadingMore = useRef(false);

  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container || loading || isLoadingMore.current || !hasMore || activeTab === 'emoji') return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const scrolledPercentage = (scrollTop + clientHeight) / scrollHeight;

    if (scrolledPercentage > 0.8) {
      isLoadingMore.current = true;
      setPage((prev) => prev + 1);
      loadKlipyContent(true).finally(() => {
        isLoadingMore.current = false;
      });
    }
  }, [loading, hasMore, loadKlipyContent, activeTab]);

  // Handle search
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setPage(1);
    if (query.trim()) {
      setViewMode('search');
    } else {
      setViewMode('trending');
    }
  }, []);

  // Handle Klipy media selection
  const handleKlipySelect = (media: KlipyMedia) => {
    klipyService.addToLocalRecent(media);
    onSelectKlipy(media);
    onClose();
  };

  // Handle emoji selection
  const handleEmojiClick = (emojiData: { emoji: string }) => {
    onSelectEmoji(emojiData.emoji);
    onClose();
  };

  // Handle tab change
  const handleTabChange = (tabId: TabId) => {
    setActiveTab(tabId);
    setSearchQuery('');
    setViewMode('trending');
    setItems([]);
  };

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Picker Container */}
      <div
        ref={pickerRef}
        className="bg-[#0f0f0f]/98 fixed inset-x-0 bottom-0 z-50 flex max-h-[70vh] flex-col rounded-t-3xl border-t border-[#262626] backdrop-blur-xl md:inset-x-auto md:bottom-20 md:right-4 md:w-[400px] md:rounded-3xl md:border md:border-[#262626]"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#262626] px-4 py-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-white">Media & Emojis</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-[#262626] px-4 py-2">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all',
                activeTab === tab.id
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              )}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Search Bar - Only for GIFs and Stickers */}
        {activeTab !== 'emoji' && (
          <div className="border-b border-[#262626] p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder={`Search ${activeTab}s... (e.g., "tractor", "harvest")`}
                className="w-full rounded-xl border border-[#333333] bg-[#1a1a1a] py-2.5 pl-10 pr-4 text-sm text-white transition-all placeholder:text-gray-500 focus:border-blue-500/50 focus:bg-[#1f1f1f] focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* View Mode Toggles */}
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => {
                  setViewMode('trending');
                  setSearchQuery('');
                }}
                disabled={viewMode === 'search' && searchQuery.trim().length > 0}
                className={cn(
                  'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all',
                  viewMode === 'trending'
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'bg-[#1a1a1a] text-gray-400 hover:bg-white/5 hover:text-white',
                  viewMode === 'search' &&
                    searchQuery.trim().length > 0 &&
                    'cursor-not-allowed opacity-50'
                )}
              >
                <TrendingUp className="h-3.5 w-3.5" />
                Trending
              </button>
              <button
                onClick={() => setViewMode('recent')}
                disabled={viewMode === 'search' && searchQuery.trim().length > 0}
                className={cn(
                  'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all',
                  viewMode === 'recent'
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'bg-[#1a1a1a] text-gray-400 hover:bg-white/5 hover:text-white',
                  viewMode === 'search' &&
                    searchQuery.trim().length > 0 &&
                    'cursor-not-allowed opacity-50'
                )}
              >
                <Clock className="h-3.5 w-3.5" />
                Recent
              </button>
            </div>

            {/* Suggestions */}
            {!searchQuery && suggestions.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {suggestions.slice(0, 6).map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => handleSearch(suggestion)}
                    className="rounded-full border border-[#333333] bg-[#1a1a1a] px-3 py-1 text-xs text-gray-400 transition-all hover:border-blue-500/50 hover:bg-blue-500/10 hover:text-blue-400"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div ref={scrollContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto">
          {activeTab === 'emoji' ? (
            <div className="p-2">
              <EmojiPicker
                onEmojiClick={handleEmojiClick}
                theme={Theme.DARK}
                width="100%"
                height={350}
                lazyLoadEmojis={true}
              />
            </div>
          ) : (
            <div className="p-4">
              <KlipyMediaGrid
                key={`${activeTab}-${viewMode}`}
                items={items}
                onSelect={handleKlipySelect}
                loading={loading && items.length === 0}
              />

              {/* Load More Indicator */}
              {loading && items.length > 0 && (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                </div>
              )}

              {/* No More Items */}
              {!loading && !hasMore && items.length > 0 && (
                <div className="py-4 text-center text-xs text-gray-500">
                  That&apos;s all for now! 🎉
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[#262626] px-4 py-2 text-center">
          <p className="text-[10px] text-gray-600">
            {activeTab === 'emoji'
              ? 'Unicode Emojis'
              : 'Powered by KLIPY • Optimized for agricultural themes'}
          </p>
        </div>
      </div>
    </>
  );
}
