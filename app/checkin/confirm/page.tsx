'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import { Lang, t } from '@/lib/i18n';
import { Customer } from '@/lib/types';
import BrandMark from '@/components/BrandMark';

export default function ConfirmPage() {
  const router = useRouter();
  const supabase = createClient();
  const [lang, setLang] = useState<Lang>('en');
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedLang = sessionStorage.getItem('xf-lang') as Lang | null;
    if (savedLang) setLang(savedLang);

    const data = sessionStorage.getItem('xf-customer');
    if (!data) {
      router.replace('/checkin');
      return;
    }
    setCustomer(JSON.parse(data));
  }, [router]);

  const handleConfirm = async () => {
    if (!customer) return;
    setLoading(true);

    await supabase.from('visits').insert({
      customer_id: customer.id,
      ic: customer.ic,
      status: 'approved',
    });

    sessionStorage.setItem('xf-success-name', customer.name);
    router.push('/checkin/approved');
  };

  if (!customer) return null;

  // Mask phone (show only last 4)
  const maskedPhone = customer.phone.length > 4
    ? '••••' + customer.phone.slice(-4)
    : customer.phone;

  return (
    <main className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-6 py-5 border-b-4 border-ink">
        <BrandMark size="md" />
      </header>

      <div className="h-3 stripes-yellow" />

      <section className="flex-1 flex flex-col justify-center px-6 py-12 max-w-2xl mx-auto w-full">
        <div className="mb-10">
          <p className="font-mono text-xs tracking-[0.3em] text-ink/60 mb-3">
            // RETURNING MEMBER
          </p>
          <h1 className="font-display text-5xl md:text-7xl leading-[0.85] tracking-tighter mb-4">
            {t(lang, 'welcomeBack')}
          </h1>
          <div className="h-2 w-24 bg-accent" />
        </div>

        <div className="card-brutal mb-8">
          <p className="font-mono text-xs tracking-widest text-ink/60 mb-2">NAME</p>
          <p className="font-display text-3xl mb-6 break-words">{customer.name.toUpperCase()}</p>

          <p className="font-mono text-xs tracking-widest text-ink/60 mb-2">IC</p>
          <p className="font-mono text-lg mb-6">{customer.ic}</p>

          <p className="font-mono text-xs tracking-widest text-ink/60 mb-2">PHONE</p>
          <p className="font-mono text-lg">{maskedPhone}</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleConfirm}
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
              <>{t(lang, 'confirmCheckin')} →</>
            )}
          </button>

          <button
            onClick={() => router.push('/checkin')}
            className="w-full text-center font-mono text-sm underline underline-offset-4 py-2"
          >
            {t(lang, 'notYou')}
          </button>
        </div>
      </section>
    </main>
  );
}
