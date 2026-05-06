'use client';

import { Lang } from '@/lib/i18n';

interface LanguageToggleProps {
  current: Lang;
  onChange: (lang: Lang) => void;
}

export default function LanguageToggle({ current, onChange }: LanguageToggleProps) {
  const langs: { code: Lang; label: string }[] = [
    { code: 'en', label: 'EN' },
    { code: 'zh', label: '中' },
    { code: 'ms', label: 'BM' },
  ];

  return (
    <div className="inline-flex border border-neutral-700">
      {langs.map((l) => (
        <button
          key={l.code}
          onClick={() => onChange(l.code)}
          className={`px-3 py-1.5 font-display text-xs tracking-wider transition-colors ${
            current === l.code
              ? 'bg-accent text-ink'
              : 'text-neutral-400 hover:text-bone'
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
