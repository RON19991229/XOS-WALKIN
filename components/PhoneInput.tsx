'use client';

import { useState } from 'react';
import { COUNTRY_CODES, digitsOnly } from '@/lib/utils';

interface PhoneInputProps {
  value: { code: string; digits: string };
  onChange: (v: { code: string; digits: string }) => void;
  placeholder?: string;
}

export default function PhoneInput({ value, onChange, placeholder }: PhoneInputProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const selected = COUNTRY_CODES.find((c) => c.code === value.code) || COUNTRY_CODES[0];

  const handleDigitsChange = (raw: string) => {
    if (value.code === '+other') {
      // Allow + at start for "Other"
      const cleaned = raw.replace(/[^\d+]/g, '').slice(0, 16);
      onChange({ ...value, digits: cleaned });
    } else {
      onChange({ ...value, digits: digitsOnly(raw).slice(0, 15) });
    }
  };

  return (
    <div className="flex gap-2 relative">
      <button
        type="button"
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex-shrink-0 bg-ink-soft border-2 border-ink-line text-bone px-3 py-3.5 font-mono text-sm flex items-center gap-2 hover:border-accent"
      >
        <span>{selected.flag}</span>
        <span>{selected.code}</span>
        <span className="text-neutral-500">▼</span>
      </button>

      <input
        type="tel"
        inputMode="numeric"
        value={value.digits}
        onChange={(e) => handleDigitsChange(e.target.value)}
        placeholder={placeholder || 'Phone number'}
        className="input-field flex-1"
        maxLength={16}
      />

      {showDropdown && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setShowDropdown(false)}
          />
          <div className="absolute top-full mt-1 left-0 z-40 bg-ink-soft border-2 border-accent w-72 max-h-72 overflow-y-auto">
            {COUNTRY_CODES.map((c) => (
              <button
                key={c.code}
                type="button"
                onClick={() => {
                  onChange({ ...value, code: c.code });
                  setShowDropdown(false);
                }}
                className={`w-full text-left px-4 py-3 hover:bg-accent hover:text-ink transition-colors flex items-center gap-3 ${
                  c.code === value.code ? 'bg-accent text-ink' : 'text-bone'
                }`}
              >
                <span className="text-xl">{c.flag}</span>
                <span className="font-mono text-sm flex-1">{c.country}</span>
                <span className="font-mono text-xs opacity-70">{c.code}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
