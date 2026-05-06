'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase-client';
import { Lang, t } from '@/lib/i18n';
import { Customer } from '@/lib/types';
import CheckinHeader from '@/components/CheckinHeader';

export default function RemindersPage() {
  const router = useRouter();
  const supabase = createClient();
  const [lang, setLang] = useState<Lang>('en');
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');

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

  const handleAcknowledge = async () => {
    if (!customer) return;
    setLoading(true);
    setErrorMsg('');

    const { error: insertError } = await supabase.from('visits').insert({
      customer_id: customer.id,
      ic: customer.ic,
      status: 'approved',
    });

    if (insertError) {
      setLoading(false);
      // Database trigger may reject due to 30-minute cooldown
      if (insertError.message?.includes('COOLDOWN')) {
        // Extract minutes-remaining from the message if possible
        const match = insertError.message.match(/wait (\d+) minute/);
        const remaining = match ? match[1] : '30';
        setErrorMsg(
          lang === 'zh'
            ? `您已在不久前入场过。请等候约 ${remaining} 分钟后再试。`
            : lang === 'ms'
            ? `Anda baru daftar masuk tidak lama dahulu. Sila tunggu kira-kira ${remaining} minit lagi.`
            : `You checked in recently. Please wait approximately ${remaining} more minutes before trying again.`
        );
      } else {
        setErrorMsg(t(lang, 'error') + ': ' + insertError.message);
      }
      return;
    }

    sessionStorage.setItem('xf-success-name', customer.name);
    router.push('/checkin/approved');
  };

  if (!customer) return null;

  return (
    <main className="min-h-screen flex flex-col bg-ink">
      <CheckinHeader />

      <section className="flex-1 px-5 py-8 max-w-md mx-auto w-full">
        <div className="mb-5">
          <p className="font-mono text-[10px] tracking-[0.3em] text-accent mb-3">
            // {t(lang, 'gymRulesReminder')}
          </p>
          <h1 className="font-display text-3xl md:text-4xl leading-[0.9] mb-3">
            {t(lang, 'beforeYouTrain')}
          </h1>
          <div className="h-1 w-16 bg-accent" />
        </div>

        <p className="font-mono text-xs text-neutral-400 mb-1">
          {t(lang, 'welcomeBack')}, <span className="text-accent">{customer.name}</span>
        </p>

        {/* Rule 1: RE-RACK */}
        <div className="border-2 border-ink-line mb-4 overflow-hidden">
          <div className="bg-accent text-ink px-4 py-2 font-display text-xs tracking-widest flex items-center gap-2">
            ⚠ {t(lang, 'rule1')}
          </div>
          <div className="bg-black">
            <Image
              src="/rerack.png"
              alt="RE-RACK"
              width={740}
              height={740}
              className="w-full h-auto"
              priority
            />
          </div>
        </div>

        {/* Rule 2: NO SLIPPERS */}
        <div className="border-2 border-ink-line mb-6 overflow-hidden">
          <div className="bg-accent text-ink px-4 py-2 font-display text-xs tracking-widest flex items-center gap-2">
            ⚠ {t(lang, 'rule2')}
          </div>
          <div className="bg-black">
            <Image
              src="/no-slippers.png"
              alt="NO SLIPPERS"
              width={690}
              height={250}
              className="w-full h-auto"
              priority
            />
          </div>
        </div>

        <button
          onClick={handleAcknowledge}
          disabled={loading}
          className="btn-primary"
        >
          {loading ? (
            <span className="flex gap-1.5 justify-center">
              <span className="loading-dot inline-block w-2 h-2 bg-ink rounded-full" />
              <span className="loading-dot inline-block w-2 h-2 bg-ink rounded-full" />
              <span className="loading-dot inline-block w-2 h-2 bg-ink rounded-full" />
            </span>
          ) : (
            <>{t(lang, 'acknowledge')} →</>
          )}
        </button>

        {errorMsg && (
          <div className="bg-danger text-bone px-4 py-3 mt-4 font-display text-sm tracking-wider animate-shake">
            {errorMsg}
          </div>
        )}
      </section>
    </main>
  );
}
