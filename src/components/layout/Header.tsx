'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Header() {
  const pathname = usePathname();

  // Don't show header on AR try-on page (it has its own overlay UI)
  if (pathname?.startsWith('/tryon')) return null;

  return (
    <header className="fixed top-0 left-0 right-0 z-40 safe-top">
      <div className="glass border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-bold text-xl tracking-tight">
            <span className="gradient-text">MirrorMe</span>
          </Link>
          <nav className="flex items-center gap-2">
            <Link
              href="/catalog"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === '/catalog'
                  ? 'bg-[#6C5CE7] text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              Catalog
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
