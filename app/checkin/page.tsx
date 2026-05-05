'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import { Lang, t } from '@/lib/i18n';
import LanguageToggle from '@/components/LanguageToggle';
import BrandMark from '@/components/BrandMark';

export default function CheckinPage() {
  const router = useRouter();
  const supabase = createClient();
  const [lang, setLang] = useState<Lang>('en');
  const [ic, setIc] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Persist language choice
  useEffect(() => {
    const saved = localStorage.getItem('xf-lang') as Lang | null;
    if (saved && ['en', 'zh', 'ms'].includes(saved)) setLang(saved);
  }, []);

  const handleLangChange = (l: Lang) => {
    setLang(l);
    localStorage.setItem('xf-lang', l);
  };

  const cleanIc = (raw: string) => raw.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleaned = cleanIc(ic);
    if (cleaned.length < 6) {
      setError(t(lang, 'invalidIc'));
      return;
    }

    setLoading(true);

    // Lookup customer
    const { data: customer, error: dbError } = await supabase
      .from('customers')
      .select('*')
      .eq('ic', cleaned)
      .maybeSingle();

    setLoading(false);

    if (dbError) {
      setError(t(lang, 'error'));
      return;
    }

    // Save to session for next page
    sessionStorage.setItem('xf-ic', cleaned);
    sessionStorage.setItem('xf-lang', lang);

    if (!customer) {
      router.push('/checkin/register');
    } else if (customer.status === 'banned') {
      sessionStorage.setItem('xf-customer', JSON.stringify(customer));
      router.push('/checkin/banned');
    } else {
      sessionStorage.setItem('xf-customer', JSON.stringify(customer));
      router.push('/checkin/confirm');
    }
  };

  return (
    <main className="min-h-screen flex flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-5 border-b-4 border-ink">
        <BrandMark size="md" />
        <LanguageToggle current={lang} onChange={handleLangChange} />
      </header>

      {/* Diagonal stripe accent */}
      <div className="h-3 stripes-yellow" />

      {/* Hero */}
      <section className="flex-1 flex flex-col justify-center px-6 py-12 max-w-2xl mx-auto w-full">
        <div className="mb-12">
          <p className="font-mono text-xs tracking-[0.3em] text-ink/60 mb-3">
            // WALK-IN CHECK-IN
          </p>
          <h1 className="font-display text-6xl md:text-8xl leading-[0.85] tracking-tighter mb-4">
            {t(lang, 'welcome')}
          </h1>
          <div className="h-2 w-24 bg-accent" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="font-display text-sm tracking-widest mb-3 block">
              {t(lang, 'enterIc')}
            </label>
            <input
              type="text"
              inputMode="text"
              autoComplete="off"
              autoCapitalize="characters"
              autoFocus
              value={ic}
              onChange={(e) => setIc(e.target.value)}
              placeholder={t(lang, 'icPlaceholder')}
              className="input-field-lg"
              maxLength={20}
            />
          </div>

          {error && (
            <div className="bg-danger text-bone px-4 py-3 font-display text-sm tracking-wider animate-shake">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !ic.trim()}
            className="btn-primary w-full flex items-center justify-center"
          >
            {loading ? (
              <span className="flex gap-2">
                <span className="loading-dot w-3 h-3 bg-bone" />
                <span className="loading-dot w-3 h-3 bg-bone" />
                <span className="loading-dot w-3 h-3 bg-bone" />
              </span>
            ) : (
              <>{t(lang, 'continue')} →</>
            )}
          </button>
        </form>
      </section>

      {/* Footer ticker */}
      <footer className="border-t-4 border-ink bg-ink text-bone overflow-hidden">
        <div className="flex whitespace-nowrap animate-ticker py-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center font-display tracking-widest text-sm">
              <span className="px-6">X FITNESS</span>
              <span className="text-accent">●</span>
              <span className="px-6">TRAIN HARD</span>
              <span className="text-accent">●</span>
              <span className="px-6">NO EXCUSES</span>
              <span className="text-accent">●</span>
              <span className="px-6">EST. 2025</span>
              <span className="text-accent">●</span>
            </div>
          ))}
        </div>
      </footer>
    </main>
  );
}
