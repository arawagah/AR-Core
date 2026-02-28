'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function MobileNav() {
  const pathname = usePathname();

  // Don't show on AR page or landing page
  if (pathname?.startsWith('/tryon') || pathname === '/') return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 safe-bottom md:hidden">
      <div className="glass border-t border-white/5">
        <div className="flex items-center justify-around h-16 px-4">
          <Link
            href="/"
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors ${
              pathname === '/' ? 'text-[#6C5CE7]' : 'text-white/50 hover:text-white'
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs font-medium">Home</span>
          </Link>
          <Link
            href="/catalog"
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors ${
              pathname === '/catalog' ? 'text-[#6C5CE7]' : 'text-white/50 hover:text-white'
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            <span className="text-xs font-medium">Catalog</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
