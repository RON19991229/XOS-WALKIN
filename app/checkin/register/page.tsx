'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import { Lang, t } from '@/lib/i18n';
import { termsAndConditions } from '@/lib/terms';
import BrandMark from '@/components/BrandMark';

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();
  const [lang, setLang] = useState<Lang>('en');
  const [ic, setIc] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedLang = sessionStorage.getItem('xf-lang') as Lang | null;
    if (savedLang) setLang(savedLang);

    const savedIc = sessionStorage.getItem('xf-ic');
    if (!savedIc) {
      router.replace('/checkin');
      return;
    }
    setIc(savedIc);
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !phone.trim()) {
      setError(t(lang, 'fillAllFields'));
      return;
    }

    if (!agreed) {
      setError(t(lang, 'mustAgree'));
      return;
    }

    setLoading(true);

    const { data: customer, error: insertError } = await supabase
      .from('customers')
      .insert({
        ic,
        name: name.trim(),
        phone: phone.trim(),
        emergency_contact_name: emergencyName.trim() || null,
        emergency_contact_phone: emergencyPhone.trim() || null,
      })
      .select()
      .single();

    if (insertError || !customer) {
      setLoading(false);
      if (insertError?.code === '23505') {
        setError(t(lang, 'duplicateIc'));
      } else {
        setError(t(lang, 'error'));
      }
      return;
    }

    // Log first visit
    await supabase.from('visits').insert({
      customer_id: customer.id,
      ic: customer.ic,
      status: 'approved',
    });

    sessionStorage.setItem('xf-success-name', customer.name);
    router.push('/checkin/approved');
  };

  return (
    <main className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-6 py-5 border-b-4 border-ink">
        <BrandMark size="md" />
        <button
          onClick={() => router.push('/checkin')}
          className="font-mono text-xs underline underline-offset-4"
        >
          ← {t(lang, 'back')}
        </button>
      </header>

      <div className="h-3 stripes-yellow" />

      <section className="flex-1 px-6 py-10 max-w-2xl mx-auto w-full">
        <div className="mb-8">
          <p className="font-mono text-xs tracking-[0.3em] text-ink/60 mb-3">
            // {t(lang, 'firstTimeHere').toUpperCase()}
          </p>
          <h1 className="font-display text-5xl md:text-6xl leading-[0.85] tracking-tighter mb-4">
            {t(lang, 'register')}
          </h1>
          <div className="h-2 w-24 bg-accent" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Field label="IC / PASSPORT">
            <input value={ic} disabled className="input-field bg-ink/5 cursor-not-allowed" />
          </Field>

          <Field label={t(lang, 'fullName')} required>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t(lang, 'namePlaceholder')}
              className="input-field"
              required
            />
          </Field>

          <Field label={t(lang, 'phone')} required>
            <input
              type="tel"
              inputMode="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={t(lang, 'phonePlaceholder')}
              className="input-field"
              required
            />
          </Field>

          <Field label={t(lang, 'emergencyName')}>
            <input
              type="text"
              value={emergencyName}
              onChange={(e) => setEmergencyName(e.target.value)}
              className="input-field"
            />
          </Field>

          <Field label={t(lang, 'emergencyPhone')}>
            <input
              type="tel"
              inputMode="tel"
              value={emergencyPhone}
              onChange={(e) => setEmergencyPhone(e.target.value)}
              className="input-field"
            />
          </Field>

          {/* T&C */}
          <div className="bg-ink text-bone p-5 border-4 border-ink">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 w-6 h-6 accent-accent flex-shrink-0"
              />
              <span className="text-sm leading-relaxed">
                {t(lang, 'agreeTerms')}{' '}
                <button
                  type="button"
                  onClick={() => setShowTerms(true)}
                  className="text-accent underline underline-offset-4 font-bold"
                >
                  ({t(lang, 'viewTerms')})
                </button>
              </span>
            </label>
          </div>

          {error && (
            <div className="bg-danger text-bone px-4 py-3 font-display text-sm tracking-wider animate-shake">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center"
          >
            {loading ? (
              <span className="flex gap-2">
                <span className="loading-dot w-3 h-3 bg-bone" />
                <span className="loading-dot w-3 h-3 bg-bone" />
                <span className="loading-dot w-3 h-3 bg-bone" />
              </span>
            ) : (
              <>{t(lang, 'submit')} →</>
            )}
          </button>
        </form>
      </section>

      {/* Terms modal */}
      {showTerms && (
        <div className="fixed inset-0 z-50 bg-ink/80 flex items-center justify-center p-4">
          <div className="bg-bone border-4 border-ink max-w-3xl w-full max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b-4 border-ink bg-ink text-bone">
              <h2 className="font-display text-xl tracking-wider">TERMS & CONDITIONS</h2>
              <button
                onClick={() => setShowTerms(false)}
                className="font-display text-2xl"
              >
                ✕
              </button>
            </div>
            <div className="overflow-y-auto p-6">
              <pre className="whitespace-pre-wrap font-body text-sm leading-relaxed">
                {termsAndConditions}
              </pre>
            </div>
            <div className="border-t-4 border-ink p-4">
              <button
                onClick={() => setShowTerms(false)}
                className="btn-secondary w-full"
              >
                {t(lang, 'back')}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="font-display text-xs tracking-widest mb-2 block">
        {label} {required && <span className="text-danger">*</span>}
      </label>
      {children}
    </div>
  );
}
