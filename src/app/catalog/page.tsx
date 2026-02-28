'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Header } from '@/components/layout/Header';
import { MobileNav } from '@/components/layout/MobileNav';
import { CategoryFilter } from '@/components/catalog/CategoryFilter';
import { OutfitGrid } from '@/components/catalog/OutfitGrid';
import { Button } from '@/components/ui/Button';
import { Outfit } from '@/types/outfit';

export default function CatalogPage() {
  const router = useRouter();
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [filteredOutfits, setFilteredOutfits] = useState<Outfit[]>([]);
  const [category, setCategory] = useState('ALL');
  const [selectedOutfits, setSelectedOutfits] = useState<Map<string, Outfit>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [trayExpanded, setTrayExpanded] = useState(false);

  const fetchOutfits = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/outfits');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as { outfits: Outfit[] };
      setOutfits(data.outfits);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load outfits');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void fetchOutfits();
  }, [fetchOutfits]);

  // Apply category filter
  useEffect(() => {
    if (category === 'ALL') {
      setFilteredOutfits(outfits);
    } else {
      setFilteredOutfits(outfits.filter((o) => o.category === category));
    }
  }, [outfits, category]);

  // Pull-to-refresh (touch events)
  useEffect(() => {
    let startY = 0;
    let isPulling = false;

    const onTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
      isPulling = window.scrollY === 0;
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!isPulling) return;
      const deltaY = e.changedTouches[0].clientY - startY;
      if (deltaY > 80) {
        void fetchOutfits(true);
      }
      isPulling = false;
    };

    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [fetchOutfits]);

  const handleSelect = (outfit: Outfit) => {
    setSelectedOutfits((prev) => {
      const next = new Map(prev);
      if (next.has(outfit.id)) {
        next.delete(outfit.id);
      } else {
        next.set(outfit.id, outfit);
      }
      return next;
    });
  };

  const handleTryOnSingle = (outfit: Outfit) => {
    router.push(`/tryon?outfitId=${outfit.id}`);
  };

  const handleTryOnSelected = () => {
    if (selectedOutfits.size === 0) return;
    const ids = Array.from(selectedOutfits.keys()).join(',');
    router.push(`/tryon?outfitIds=${ids}`);
  };

  const clearSelection = () => setSelectedOutfits(new Map());

  const selectedCount = selectedOutfits.size;
  const selectedArray = Array.from(selectedOutfits.values());

  return (
    <div className="min-h-screen pb-32">
      <Header />

      {/* Pull-to-refresh indicator */}
      {refreshing && (
        <div className="fixed top-14 left-0 right-0 z-30 flex justify-center py-3" aria-live="polite">
          <div className="glass rounded-full px-4 py-2 text-sm text-white/60 flex items-center gap-2">
            <svg className="animate-spin h-4 w-4 text-[#6C5CE7]" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Refreshing...
          </div>
        </div>
      )}

      <main className="max-w-6xl mx-auto px-4 pt-20 pb-8">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">Browse Outfits</h1>
          <p className="text-white/50 text-sm">
            Select items to try on together, or tap &ldquo;Try On&rdquo; for a single piece.
          </p>
        </div>

        {/* Category filter */}
        <div className="mb-6">
          <CategoryFilter selected={category} onChange={setCategory} />
        </div>

        {/* Outfit grid */}
        <OutfitGrid
          outfits={filteredOutfits}
          selectedOutfits={new Set(selectedOutfits.keys())}
          onSelect={handleSelect}
          onTryOn={handleTryOnSingle}
          loading={loading}
          error={error}
        />
      </main>

      {/* Fitting room tray */}
      {selectedCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 safe-bottom">
          <div className="glass border-t border-white/[0.1] shadow-2xl">
            {/* Expand/collapse handle */}
            <button
              className="w-full flex items-center justify-between px-4 py-3"
              onClick={() => setTrayExpanded(!trayExpanded)}
              aria-expanded={trayExpanded}
              aria-label="Toggle fitting room tray"
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-[#6C5CE7] rounded-full flex items-center justify-center text-xs font-bold">
                  {selectedCount}
                </div>
                <span className="font-semibold text-sm">
                  {selectedCount === 1 ? '1 item selected' : `${selectedCount} items selected`}
                </span>
              </div>
              <svg
                className={`w-5 h-5 text-white/60 transition-transform duration-200 ${trayExpanded ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>

            {/* Expanded content: thumbnail strip + actions */}
            {trayExpanded && (
              <div className="px-4 pb-3">
                {/* Thumbnails */}
                <div className="flex gap-2 overflow-x-auto pb-3 -mx-1 px-1 scroll-smooth-mobile mb-3" role="list" aria-label="Selected outfits">
                  {selectedArray.map((outfit) => (
                    <div
                      key={outfit.id}
                      className="relative flex-shrink-0 w-16 h-16 rounded-xl bg-white/[0.06] border border-white/[0.1] overflow-hidden"
                      role="listitem"
                    >
                      <Image
                        src={outfit.assetPath}
                        alt={outfit.name}
                        fill
                        className="object-contain p-1"
                        sizes="64px"
                      />
                      <button
                        className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center"
                        onClick={() => handleSelect(outfit)}
                        aria-label={`Remove ${outfit.name}`}
                      >
                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button variant="ghost" size="sm" onClick={clearSelection} className="flex-shrink-0">
                    Clear all
                  </Button>
                  <Button size="sm" onClick={handleTryOnSelected} className="flex-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                    </svg>
                    Try These On
                  </Button>
                </div>
              </div>
            )}

            {/* Collapsed quick-try button */}
            {!trayExpanded && (
              <div className="px-4 pb-3">
                <Button size="sm" onClick={handleTryOnSelected} className="w-full">
                  Try These On →
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      <MobileNav />
    </div>
  );
}
