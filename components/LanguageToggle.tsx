'use client';

import { Lang } from '@/lib/i18n';

interface LanguageToggleProps {
  current: Lang;
  onChange: (lang: Lang) => void;
}

export default function LanguageToggle({ current, onChange }: LanguageToggleProps) {
  const langs: { code: Lang; label: string }[] = [
    { code: 'en', label: 'EN' },
    { code: 'zh', label: '中文' },
    { code: 'ms', label: 'BM' },
  ];

  return (
    <div className="inline-flex border-4 border-ink bg-bone">
      {langs.map((l) => (
        <button
          key={l.code}
          onClick={() => onChange(l.code)}
          className={`px-4 py-2 font-display text-sm tracking-wider transition-colors ${
            current === l.code
              ? 'bg-ink text-bone'
              : 'bg-bone text-ink hover:bg-accent hover:bg-opacity-40'
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
