'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import { Lang, t } from '@/lib/i18n';
import {
  validateMyIC,
  validatePassport,
  parseICDob,
  calcAge,
  ageCategory,
  digitsOnly,
} from '@/lib/utils';
import CheckinHeader from '@/components/CheckinHeader';

export default function IdInputPage() {
  const router = useRouter();
  const supabase = createClient();
  const [lang, setLang] = useState<Lang>('en');
  const [nationality, setNationality] = useState<'malaysian' | 'foreigner'>('malaysian');
  const [id, setId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedLang = sessionStorage.getItem('xf-lang') as Lang | null;
    if (savedLang) setLang(savedLang);

    const nat = sessionStorage.getItem('xf-nationality') as 'malaysian' | 'foreigner' | null;
    if (!nat) {
      router.replace('/checkin');
      return;
    }
    setNationality(nat);
  }, [router]);

  const handleIdChange = (raw: string) => {
    setError('');
    if (nationality === 'malaysian') {
      // Strip non-digits, max 12
      const cleaned = digitsOnly(raw).slice(0, 12);
      setId(cleaned);
    } else {
      // Allow alphanumeric, uppercase, max 20
      const cleaned = raw.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 20);
      setId(cleaned);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate format
    let validationError: string | null = null;
    if (nationality === 'malaysian') {
      validationError = validateMyIC(id);
    } else {
      validationError = validatePassport(id);
    }
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    // Look up customer in DB
    const { data: customer, error: dbError } = await supabase
      .from('customers')
      .select('*')
      .eq('ic', id)
      .maybeSingle();

    setLoading(false);

    if (dbError) {
      setError(t(lang, 'error'));
      return;
    }

    sessionStorage.setItem('xf-ic', id);

    // For Malaysian: check age FIRST (before everything)
    if (nationality === 'malaysian') {
      const dob = parseICDob(id);
      const age = calcAge(dob);
      const cat = ageCategory(age);

      if (cat === 'under-12') {
        // Log denial
        if (customer) {
          await supabase.from('visits').insert({
            customer_id: customer.id,
            ic: id,
            status: 'denied_age',
          });
        } else {
          await supabase.from('visits').insert({
            customer_id: null,
            ic: id,
            status: 'denied_age',
          });
        }
        sessionStorage.setItem('xf-age', String(age));
        router.push('/checkin/under-age');
        return;
      }

      sessionStorage.setItem('xf-age', String(age));
      sessionStorage.setItem('xf-age-category', cat);
    }

    // Banned check
    if (customer && customer.status === 'banned') {
      sessionStorage.setItem('xf-customer', JSON.stringify(customer));
      router.push('/checkin/banned');
      return;
    }

    // Existing customer
    if (customer) {
      sessionStorage.setItem('xf-customer', JSON.stringify(customer));
      router.push('/checkin/reminders');
      return;
    }

    // New customer → register
    router.push('/checkin/register');
  };

  const placeholder = nationality === 'malaysian'
    ? t(lang, 'icPlaceholder')
    : t(lang, 'passportPlaceholder');

  const title = nationality === 'malaysian'
    ? t(lang, 'enterIc')
    : t(lang, 'enterPassport');

  const flag = nationality === 'malaysian' ? '🇲🇾 MY' : '🌍 INTL';

  return (
    <main className="min-h-screen flex flex-col bg-ink">
      <CheckinHeader
        lang={lang}
        onLangChange={(l) => { setLang(l); localStorage.setItem('xf-lang', l); }}
      />

      <section className="flex-1 flex flex-col justify-center px-5 py-10 max-w-md mx-auto w-full">
        <div className="mb-8">
          <p className="font-mono text-[10px] tracking-[0.3em] text-accent mb-3">
            // {flag}
          </p>
          <h1 className="font-display text-5xl md:text-6xl leading-[0.85] mb-4">
            {title}
          </h1>
          <div className="h-1 w-16 bg-accent" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              inputMode={nationality === 'malaysian' ? 'numeric' : 'text'}
              autoComplete="off"
              autoCapitalize="characters"
              autoFocus
              value={id}
              onChange={(e) => handleIdChange(e.target.value)}
              placeholder={placeholder}
              className="input-field-lg"
              maxLength={nationality === 'malaysian' ? 12 : 20}
            />
            {nationality === 'malaysian' && (
              <p className="text-right text-xs font-mono text-neutral-500 mt-1">
                {id.length}/12
              </p>
            )}
          </div>

          {error && (
            <div className="bg-danger text-bone px-4 py-3 font-display text-sm tracking-wider animate-shake">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !id.trim()}
            className="btn-primary"
          >
            {loading ? (
              <span className="flex gap-1.5 justify-center">
                <span className="loading-dot inline-block w-2 h-2 bg-ink rounded-full" />
                <span className="loading-dot inline-block w-2 h-2 bg-ink rounded-full" />
                <span className="loading-dot inline-block w-2 h-2 bg-ink rounded-full" />
              </span>
            ) : (
              <>{t(lang, 'continue')} →</>
            )}
          </button>

          <button
            type="button"
            onClick={() => router.push('/checkin')}
            className="btn-secondary"
          >
            ← {t(lang, 'changeNationality')}
          </button>
        </form>
      </section>
    </main>
  );
}
