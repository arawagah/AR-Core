'use client';

import { CATEGORY_LABELS } from '@/lib/constants';

interface CategoryFilterProps {
  selected: string;
  onChange: (category: string) => void;
}

const CATEGORIES = ['ALL', 'TOP', 'BOTTOM', 'FULL_OUTFIT', 'DRESS', 'OUTERWEAR', 'ACCESSORIES'];

export function CategoryFilter({ selected, onChange }: CategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scroll-smooth-mobile" role="tablist" aria-label="Filter by category">
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          role="tab"
          aria-selected={selected === cat}
          onClick={() => onChange(cat)}
          className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
            selected === cat
              ? 'bg-[#6C5CE7] text-white shadow-lg shadow-[#6C5CE7]/25'
              : 'bg-white/[0.06] text-white/60 hover:bg-white/[0.1] hover:text-white border border-white/[0.08]'
          }`}
        >
          {CATEGORY_LABELS[cat]}
        </button>
      ))}
    </div>
  );
}
