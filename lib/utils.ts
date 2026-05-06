/**
 * Parse Malaysian IC number (12 digits) to extract date of birth.
 *
 * Format: YYMMDD-PB-####
 * Year disambiguation:
 *   - YY 00-29 → 2000-2029
 *   - YY 30-99 → 1930-1999
 * (Standard Malaysian IC convention)
 */
export function parseICDob(ic: string): Date | null {
  if (!/^\d{12}$/.test(ic)) return null;

  const yy = parseInt(ic.slice(0, 2), 10);
  const mm = parseInt(ic.slice(2, 4), 10);
  const dd = parseInt(ic.slice(4, 6), 10);

  if (mm < 1 || mm > 12) return null;
  if (dd < 1 || dd > 31) return null;

  const year = yy <= 29 ? 2000 + yy : 1900 + yy;
  const dob = new Date(year, mm - 1, dd);

  // Sanity check: month/day must round-trip
  if (
    dob.getFullYear() !== year ||
    dob.getMonth() !== mm - 1 ||
    dob.getDate() !== dd
  ) {
    return null;
  }

  // Not in the future
  if (dob > new Date()) return null;

  return dob;
}

/**
 * Calculate exact age from date of birth.
 * Returns -1 if dob is null/invalid.
 *
 * IMPORTANT: Considers if birthday has passed this year.
 * E.g. someone born 2010-12-15, on 2026-12-14 is still 15, not 16.
 */
export function calcAge(dob: Date | null): number {
  if (!dob) return -1;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

/**
 * Age category for entry rules.
 */
export type AgeCategory = 'under-12' | '12-15' | '16-plus' | 'unknown';

export function ageCategory(age: number): AgeCategory {
  if (age < 0) return 'unknown';
  if (age < 12) return 'under-12';
  if (age < 16) return '12-15';
  return '16-plus';
}

/**
 * Strip all non-digits.
 */
export function digitsOnly(s: string): string {
  return s.replace(/\D/g, '');
}

/**
 * Country codes for phone numbers.
 * Sorted by likelihood for X FITNESS (Malaysia gym).
 */
export const COUNTRY_CODES = [
  { code: '+60', country: 'Malaysia', flag: '🇲🇾', minDigits: 9, maxDigits: 11 },
  { code: '+65', country: 'Singapore', flag: '🇸🇬', minDigits: 8, maxDigits: 8 },
  { code: '+62', country: 'Indonesia', flag: '🇮🇩', minDigits: 9, maxDigits: 12 },
  { code: '+66', country: 'Thailand', flag: '🇹🇭', minDigits: 9, maxDigits: 9 },
  { code: '+86', country: 'China', flag: '🇨🇳', minDigits: 11, maxDigits: 11 },
  { code: '+91', country: 'India', flag: '🇮🇳', minDigits: 10, maxDigits: 10 },
  { code: '+63', country: 'Philippines', flag: '🇵🇭', minDigits: 10, maxDigits: 10 },
  { code: '+84', country: 'Vietnam', flag: '🇻🇳', minDigits: 9, maxDigits: 10 },
  { code: '+880', country: 'Bangladesh', flag: '🇧🇩', minDigits: 10, maxDigits: 10 },
  { code: '+95', country: 'Myanmar', flag: '🇲🇲', minDigits: 8, maxDigits: 10 },
  { code: '+other', country: 'Other', flag: '🌍', minDigits: 8, maxDigits: 15 },
] as const;

export type CountryCode = typeof COUNTRY_CODES[number];

export function getCountryByCode(code: string): CountryCode {
  return COUNTRY_CODES.find((c) => c.code === code) || COUNTRY_CODES[0];
}

/**
 * Combine country code with raw phone digits → full phone string.
 * If country is "other", the user types the whole number including code.
 */
export function buildPhone(countryCode: string, digits: string): string {
  if (countryCode === '+other') {
    // User typed full number, just normalize to start with +
    return digits.startsWith('+') ? digits : '+' + digits;
  }
  // Strip leading 0 (common in Malaysia: 012-345-6789 → +60 12-345-6789)
  const clean = digits.replace(/^0+/, '');
  return countryCode + clean;
}

/**
 * Validate phone digits against country code rules.
 * Returns null if valid, error message string if invalid.
 */
export function validatePhone(countryCode: string, digits: string): string | null {
  const c = getCountryByCode(countryCode);
  let len = digits.length;
  if (countryCode !== '+other' && digits.startsWith('0')) {
    // Leading 0 will be stripped, so don't count it
    len = digits.replace(/^0+/, '').length;
  }
  if (countryCode === '+other') {
    if (len < 8) return 'Phone number too short (min 8 digits)';
    if (len > 15) return 'Phone number too long (max 15 digits)';
  } else {
    if (len < c.minDigits) return `${c.country} phone needs at least ${c.minDigits} digits`;
    if (len > c.maxDigits) return `${c.country} phone max ${c.maxDigits} digits`;
  }
  return null;
}

/**
 * Validate Malaysian IC: must be exactly 12 digits.
 */
export function validateMyIC(ic: string): string | null {
  if (!/^\d{12}$/.test(ic)) {
    return 'Malaysian IC must be exactly 12 digits';
  }
  if (!parseICDob(ic)) {
    return 'IC contains invalid date of birth';
  }
  return null;
}

/**
 * Validate passport: at least 5 chars, alphanumeric.
 */
export function validatePassport(passport: string): string | null {
  const cleaned = passport.trim().toUpperCase();
  if (cleaned.length < 5) return 'Passport too short';
  if (cleaned.length > 20) return 'Passport too long';
  if (!/^[A-Z0-9]+$/.test(cleaned)) return 'Passport: letters & numbers only';
  return null;
}

/**
 * Format timestamp to HH:MM:SS in Asia/Kuala_Lumpur timezone.
 */
export function formatTime(iso: string | Date): string {
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  return d.toLocaleTimeString('en-MY', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'Asia/Kuala_Lumpur',
  });
}

export function formatDateTime(iso: string | Date): string {
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  return d.toLocaleString('en-MY', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'Asia/Kuala_Lumpur',
  });
}
