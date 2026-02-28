'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ARScene } from '@/components/ar/ARScene';
import { Outfit } from '@/types/outfit';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

function TryOnContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [allOutfits, setAllOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Parse outfit IDs from URL query params
  const outfitId = searchParams.get('outfitId');
  const outfitIds = searchParams.get('outfitIds');

  const selectedIds = outfitId
    ? [outfitId]
    : outfitIds?.split(',').filter(Boolean) ?? [];

  useEffect(() => {
    const loadOutfits = async () => {
      try {
        // Load all outfits for the thumbnail strip
        const res = await fetch('/api/outfits');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json() as { outfits: Outfit[] };
        setAllOutfits(data.outfits);

        // Filter to selected outfits
        if (selectedIds.length > 0) {
          const selected = data.outfits.filter((o) => selectedIds.includes(o.id));
          setOutfits(selected);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load outfits');
      } finally {
        setLoading(false);
      }
    };

    void loadOutfits();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleOutfitSelect = useCallback((outfit: Outfit) => {
    setOutfits((prev) => {
      const isSelected = prev.some((o) => o.id === outfit.id);
      if (isSelected) {
        return prev.filter((o) => o.id !== outfit.id);
      } else {
        return [...prev, outfit];
      }
    });
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#0a0a0f] flex items-center justify-center">
        <LoadingSpinner size="lg" label="Loading AR experience..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-[#0a0a0f] flex flex-col items-center justify-center p-6 text-center">
        <div className="text-4xl mb-4" aria-hidden="true">😞</div>
        <h2 className="text-xl font-bold mb-3">Failed to load</h2>
        <p className="text-white/60 mb-6">{error}</p>
        <button
          onClick={handleBack}
          className="px-6 py-3 bg-[#6C5CE7] rounded-xl font-semibold"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <ARScene
      outfits={outfits}
      allOutfits={allOutfits}
      onBack={handleBack}
      onOutfitSelect={handleOutfitSelect}
    />
  );
}

export default function TryOnPage() {
  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 bg-[#0a0a0f] flex items-center justify-center">
          <LoadingSpinner size="lg" label="Loading AR experience..." />
        </div>
      }
    >
      <TryOnContent />
    </Suspense>
  );
}
