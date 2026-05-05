'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lang, t } from '@/lib/i18n';

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

    const d = new Date();
    setNow(
      d.toLocaleString('en-MY', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
    );

    // Auto-clear and return after 12s (give counter time to verify)
    const timeout = setTimeout(() => {
      sessionStorage.removeItem('xf-success-name');
      sessionStorage.removeItem('xf-customer');
      sessionStorage.removeItem('xf-ic');
      router.replace('/checkin');
    }, 12000);

    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <main className="min-h-screen bg-success text-ink flex flex-col relative overflow-hidden">
      {/* Stripe accents */}
      <div className="h-6 stripes-green" />

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 text-center relative z-10">
        {/* Giant check */}
        <div className="animate-slam mb-6">
          <div className="w-32 h-32 md:w-40 md:h-40 bg-ink text-success flex items-center justify-center text-7xl md:text-8xl font-display border-8 border-ink rotate-3">
            ✓
          </div>
        </div>

        <p className="font-mono text-xs tracking-[0.4em] mb-3 animate-slam" style={{ animationDelay: '0.1s', animationFillMode: 'both', opacity: 0 }}>
          // STATUS: ACTIVE
        </p>

        <h1
          className="font-display text-5xl md:text-7xl leading-[0.9] tracking-tighter mb-4 animate-slam max-w-3xl"
          style={{ animationDelay: '0.2s', animationFillMode: 'both', opacity: 0 }}
        >
          {t(lang, 'approved')}
        </h1>

        <div className="bg-ink text-bone px-6 py-3 mb-8 inline-block animate-slam" style={{ animationDelay: '0.3s', animationFillMode: 'both', opacity: 0 }}>
          <p className="font-display text-2xl md:text-3xl tracking-wider">
            {name.toUpperCase()}
          </p>
        </div>

        <p
          className="font-display text-lg md:text-xl tracking-wider max-w-md animate-slam mb-8"
          style={{ animationDelay: '0.4s', animationFillMode: 'both', opacity: 0 }}
        >
          {t(lang, 'approvedSub')}
        </p>

        <p className="font-mono text-sm opacity-70">{now}</p>
      </div>

      <div className="h-6 stripes-green" />
    </main>
  );
}
