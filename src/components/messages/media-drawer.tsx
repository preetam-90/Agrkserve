'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { X, Search, Loader2, TrendingUp, Clock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { KlipyMedia } from '@/lib/types/klipy';
import { klipyService } from '@/lib/services/klipy-service';
import { KlipyMediaGrid } from './klipy-media-grid';
import { useAuthStore } from '@/lib/store';

interface MediaDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (media: KlipyMedia) => void;
}

type TabId = 'gif' | 'sticker';

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'gif', label: 'GIFs', icon: '🎬' },
  { id: 'sticker', label: 'Stickers', icon: '✨' },
];

type ViewMode = 'trending' | 'recent' | 'search';

function MediaDrawer({ isOpen, onClose, onSelect }: MediaDrawerProps) {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabId>('gif');
  const [viewMode, setViewMode] = useState<ViewMode>('trending');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [items, setItems] = useState<KlipyMedia[]>([]);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load content based on view mode
  const loadContent = useCallback(
    async (loadMore: boolean = false) => {
      if (loading) return;

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

        // Reduce console noise
        // console.log(`media drawer: setting items. Count: ${newData.length}`, newData.map(i => i.title));

        if (loadMore) {
          setItems((prev) => [...prev, ...newData.slice(prev.length)]);
        } else {
          setItems(newData);
          setPage(1);
        }

        // Check if there's more data
        setHasMore(newData.length >= limit * currentPage);
      } catch (error) {
        console.error('Failed to load media:', error);
        if (!loadMore) setItems([]);
      } finally {
        setLoading(false);
      }
    },
     
    [activeTab, viewMode, debouncedQuery, user?.id, page]
  );

  // Load content when tab, view mode, or debounced query changes
  useEffect(() => {
    if (isOpen) {
      loadContent(false);
    }
     
  }, [isOpen, activeTab, viewMode, debouncedQuery]);

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container || loading || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const scrolledPercentage = (scrollTop + clientHeight) / scrollHeight;

    // Load more when scrolled 80% of the way
    if (scrolledPercentage > 0.8) {
      setPage((prev) => prev + 1);
      loadContent(true);
    }
  }, [loading, hasMore, loadContent]);

  // Load agricultural suggestions on mount
  useEffect(() => {
    if (isOpen) {
      const agriSuggestions = klipyService.getAgricultureSuggestions(activeTab);
      setSuggestions(agriSuggestions);
    }
  }, [isOpen, activeTab]);

  // Handle search with debouncing
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setPage(1); // Reset page when searching
    if (query.trim()) {
      setViewMode('search');
    } else {
      setViewMode('trending');
    }
  }, []);

  // Handle media selection
  const handleSelect = (media: KlipyMedia) => {
    // Add to local recent
    klipyService.addToLocalRecent(media);
    onSelect(media);
    onClose();
  };

  // Handle tab change
  const handleTabChange = (tabId: TabId) => {
    setActiveTab(tabId);
    setSearchQuery('');
    setViewMode('trending');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="bg-[#0f0f0f]/98 fixed inset-x-0 bottom-0 z-50 flex max-h-[80vh] flex-col rounded-t-3xl border-t border-[#262626] backdrop-blur-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#262626] px-4 py-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-white">Media Library</h3>
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
              <span className="text-lg">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Search Bar */}
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
                setSearchQuery(''); // Clear search when switching to trending
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

        {/* Content */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-4"
        >
          <KlipyMediaGrid
            key={`${activeTab}-${viewMode}-${searchQuery}`}
            items={items}
            onSelect={handleSelect}
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

        {/* Footer */}
        <div className="border-t border-[#262626] px-4 py-2 text-center">
          <p className="text-[10px] text-gray-600">
            Powered by KLIPY • Optimized for agricultural themes
          </p>
        </div>
      </div>
    </>
  );
}
