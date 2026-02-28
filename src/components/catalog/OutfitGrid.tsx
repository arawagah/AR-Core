'use client';

import { Outfit } from '@/types/outfit';
import { OutfitCard } from './OutfitCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface OutfitGridProps {
  outfits: Outfit[];
  selectedOutfits: Set<string>;
  onSelect: (outfit: Outfit) => void;
  onTryOn: (outfit: Outfit) => void;
  loading?: boolean;
  error?: string | null;
}

export function OutfitGrid({
  outfits,
  selectedOutfits,
  onSelect,
  onTryOn,
  loading = false,
  error = null,
}: OutfitGridProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <LoadingSpinner size="lg" label="Loading outfits..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center px-4">
        <div className="text-4xl mb-4" aria-hidden="true">😞</div>
        <p className="text-white/60 text-lg mb-2">Couldn&apos;t load outfits</p>
        <p className="text-white/40 text-sm">{error}</p>
      </div>
    );
  }

  if (outfits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center px-4">
        <div className="text-4xl mb-4" aria-hidden="true">🔍</div>
        <p className="text-white/60 text-lg mb-2">No outfits found</p>
        <p className="text-white/40 text-sm">Try a different category filter</p>
      </div>
    );
  }

  return (
    <div
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
      role="list"
      aria-label="Outfit catalog"
    >
      {outfits.map((outfit) => (
        <div key={outfit.id} role="listitem">
          <OutfitCard
            outfit={outfit}
            isSelected={selectedOutfits.has(outfit.id)}
            onSelect={onSelect}
            onTryOn={onTryOn}
          />
        </div>
      ))}
    </div>
  );
}
