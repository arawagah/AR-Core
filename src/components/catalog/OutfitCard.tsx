'use client';

import Image from 'next/image';
import { Outfit } from '@/types/outfit';
import { CATEGORY_LABELS } from '@/lib/constants';

interface OutfitCardProps {
  outfit: Outfit;
  isSelected: boolean;
  onSelect: (outfit: Outfit) => void;
  onTryOn: (outfit: Outfit) => void;
}

export function OutfitCard({ outfit, isSelected, onSelect, onTryOn }: OutfitCardProps) {
  const categoryLabel = CATEGORY_LABELS[outfit.category] ?? outfit.category;

  return (
    <div
      className={`relative rounded-2xl overflow-hidden border transition-all duration-200 cursor-pointer group ${
        isSelected
          ? 'border-[#6C5CE7] ring-2 ring-[#6C5CE7]/30 bg-[#6C5CE7]/10'
          : 'border-white/[0.08] bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]'
      }`}
    >
      {/* Thumbnail */}
      <div
        className="relative aspect-[3/4] bg-white/[0.04] overflow-hidden"
        onClick={() => onSelect(outfit)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onSelect(outfit)}
        aria-label={`Select ${outfit.name}`}
        aria-pressed={isSelected}
      >
        <Image
          src={outfit.assetPath}
          alt={outfit.name}
          fill
          className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        {/* Selection checkmark */}
        {isSelected && (
          <div className="absolute top-3 right-3 w-7 h-7 bg-[#6C5CE7] rounded-full flex items-center justify-center shadow-lg" aria-hidden="true">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}

        {/* Color dot */}
        {outfit.colorHex && (
          <div
            className="absolute top-3 left-3 w-4 h-4 rounded-full border-2 border-white/20 shadow"
            style={{ backgroundColor: outfit.colorHex }}
            aria-hidden="true"
          />
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-sm font-semibold leading-tight line-clamp-2 flex-1">{outfit.name}</h3>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs px-2 py-0.5 rounded-full bg-white/[0.07] text-white/50">
            {categoryLabel}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onTryOn(outfit);
            }}
            className="text-xs text-[#a29bfe] hover:text-white font-medium transition-colors"
            aria-label={`Try on ${outfit.name}`}
          >
            Try On →
          </button>
        </div>
      </div>
    </div>
  );
}
