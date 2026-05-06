'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lang, t } from '@/lib/i18n';
import { formatDateTime } from '@/lib/utils';
import BrandMark from '@/components/BrandMark';

export default function ApprovedPage() {
  const router = useRouter();
  const [lang, setLang] = useState<Lang>('en');
  const [name, setName] = useState('');
  const [now, setNow] = useState('');

  useEffect(() => {
    const savedLang = sessionStorage.getItem('xf-lang') as Lang | null;
    const savedName = sessionStorage.getItem('xf-success-name');

    if (!savedName) {
      router.replace('/checkin');
      return;
    }
    if (savedLang) setLang(savedLang);
    setName(savedName);
    setNow(formatDateTime(new Date()));

    const timeout = setTimeout(() => {
      sessionStorage.clear();
      router.replace('/checkin');
    }, 12000);

    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <main className="min-h-screen bg-ink text-bone flex flex-col relative">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 text-center">
        <div className="mb-6 opacity-50">
          <BrandMark size="sm" />
        </div>

        <div className="animate-slam mb-6">
          <div className="w-32 h-32 md:w-40 md:h-40 bg-accent text-ink flex items-center justify-center text-7xl md:text-8xl font-display -rotate-3">
            ✓
          </div>
        </div>

        <p className="font-mono text-xs tracking-[0.3em] text-accent mb-3 animate-slam"
          style={{ animationDelay: '0.1s', animationFillMode: 'both', opacity: 0 }}>
          {t(lang, 'statusActive')}
        </p>

        <h1 className="font-display text-4xl md:text-5xl leading-[0.9] tracking-tighter mb-6 animate-slam max-w-md"
          style={{ animationDelay: '0.2s', animationFillMode: 'both', opacity: 0 }}>
          WALK-IN<br />ACCESS<br />
          <span className="text-accent">APPROVED</span>
        </h1>

        <div className="bg-accent text-ink px-6 py-3 mb-8 inline-block animate-slam"
          style={{ animationDelay: '0.3s', animationFillMode: 'both', opacity: 0 }}>
          <p className="font-display text-xl md:text-2xl tracking-wider">
            {name.toUpperCase()}
          </p>
        </div>

        <p className="font-display text-sm md:text-base tracking-wider max-w-md text-neutral-300 animate-slam mb-2"
          style={{ animationDelay: '0.4s', animationFillMode: 'both', opacity: 0 }}>
          {t(lang, 'approvedSub')}
        </p>

        <p className="font-mono text-xs text-neutral-500 mt-4">{now}</p>
      </div>
    </main>
  );
}
