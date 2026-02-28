'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';

interface BrowserInfo {
  isIOS: boolean;
  isSafari: boolean;
  isSupported: boolean;
}

function detectBrowser(): BrowserInfo {
  if (typeof navigator === 'undefined') {
    return { isIOS: false, isSafari: false, isSupported: true };
  }
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
  const isSupported = isIOS && isSafari;
  return { isIOS, isSafari, isSupported };
}

const STEPS = [
  {
    number: '01',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: 'Open Camera',
    description: 'Allow camera access and we\'ll instantly start tracking your body movements in real-time.',
  },
  {
    number: '02',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
    title: 'Browse Outfits',
    description: 'Explore our catalog of clothes. Mix and match tops, bottoms, and full outfits.',
  },
  {
    number: '03',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    ),
    title: 'See It On You',
    description: 'AI-powered pose detection overlays outfits on your body in real-time. Screenshot and share!',
  },
];

export default function LandingPage() {
  const [browserInfo, setBrowserInfo] = useState<BrowserInfo | null>(null);

  useEffect(() => {
    setBrowserInfo(detectBrowser());
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden">
      <Header />

      {/* Browser notice */}
      {browserInfo && !browserInfo.isSupported && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500/90 text-black text-sm px-4 py-2.5 text-center font-medium">
          ✨ Best experienced on iPhone Safari for full AR functionality
        </div>
      )}

      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center min-h-screen px-6 text-center overflow-hidden">
        {/* Background gradient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#6C5CE7]/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#a29bfe]/10 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-2xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#6C5CE7]/15 border border-[#6C5CE7]/30 text-[#a29bfe] text-sm font-medium mb-8">
            <span className="w-2 h-2 bg-[#6C5CE7] rounded-full animate-pulse" aria-hidden="true" />
            Powered by MediaPipe AI
          </div>

          {/* App name */}
          <h1 className="text-6xl sm:text-7xl md:text-8xl font-black tracking-tight mb-6">
            <span className="gradient-text">MirrorMe</span>
          </h1>

          {/* Tagline */}
          <p className="text-xl sm:text-2xl text-white/70 mb-4 font-medium leading-relaxed">
            Try before you buy.{' '}
            <span className="text-white">In AR. Right now.</span>
          </p>

          <p className="text-base text-white/50 mb-10 max-w-md mx-auto">
            Real-time augmented reality clothing try-on, powered by your iPhone camera.
            No app download needed.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/catalog">
              <Button size="lg" className="w-full sm:w-auto text-lg px-10 py-4">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                Start Try-On
              </Button>
            </Link>
            <Link href="/catalog">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Browse Catalog
              </Button>
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30" aria-hidden="true">
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-white/30 to-transparent" />
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-white/50 text-lg max-w-xl mx-auto">
              Three simple steps to try on your favorite looks without ever leaving home.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {STEPS.map((step, i) => (
              <div
                key={step.number}
                className="relative flex flex-col items-center md:items-start p-8 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-[#6C5CE7]/30 transition-colors"
              >
                {/* Step number */}
                <div className="absolute top-6 right-6 text-5xl font-black text-white/[0.04] select-none" aria-hidden="true">
                  {step.number}
                </div>

                {/* Icon */}
                <div className="w-16 h-16 rounded-2xl bg-[#6C5CE7]/15 border border-[#6C5CE7]/25 flex items-center justify-center text-[#a29bfe] mb-6">
                  {step.icon}
                </div>

                {/* Connector arrow */}
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 z-10 text-[#6C5CE7]/40" aria-hidden="true">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}

                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-white/55 leading-relaxed text-center md:text-left">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6 border-t border-white/[0.05]">
        <div className="max-w-4xl mx-auto">
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'Real-time AI', desc: '33-point body tracking at 30 FPS' },
              { label: 'No App Needed', desc: 'Works directly in Safari browser' },
              { label: 'Mix & Match', desc: 'Try multiple items simultaneously' },
              { label: 'Instant Share', desc: 'Screenshot and share your looks' },
            ].map((f) => (
              <div key={f.label} className="text-center p-6 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <div className="text-[#a29bfe] font-bold mb-1">{f.label}</div>
                <div className="text-white/50 text-sm">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to try it on?
          </h2>
          <p className="text-white/50 mb-8 text-lg">
            Browse our catalog, pick your style, and see how it looks on you instantly.
          </p>
          <Link href="/catalog">
            <Button size="lg" className="px-12">
              Browse Outfits →
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-white/[0.05] text-center text-white/30 text-sm">
        <p>MirrorMe – AR Virtual Try-On MVP</p>
      </footer>
    </div>
  );
}
