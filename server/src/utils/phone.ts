// ==============================================================================
// Hutty Phone Number Normalization & Validation Utility
// Canonical Indian Mobile Number (+91 E.164) Formatter & Validator
// ==============================================================================

export interface NormalizedPhoneResult {
  isValid: boolean;
  e164: string;           // Canonical E.164: +919876543210
  domestic: string;       // 10 digits: 9876543210 (Fast2SMS standard format)
  providerFormat: string; // 12-digit format without leading plus: 919876543210
  masked: string;         // Masked display: +91 98765 ••••• or +91 98••••••10
  error?: string;
}

/**
 * Normalizes and validates Indian mobile phone numbers.
 * Supports:
 *  - 10-digit domestic: 9876543210
 *  - With country code: +919876543210 or 919876543210
 *  - With trunk 0: 09876543210
 *  - Formatted strings: "+91 98765 43210", "98765-43210", "(+91) 9876543210"
 *
 * Valid Indian mobile numbers must begin with 6, 7, 8, or 9 and contain exactly 10 digits.
 */
export function normalizeIndianPhoneNumber(input: string | null | undefined): NormalizedPhoneResult {
  if (!input || typeof input !== 'string') {
    return {
      isValid: false,
      e164: '',
      domestic: '',
      providerFormat: '',
      masked: '',
      error: 'Phone number is required.',
    };
  }

  // Strip all whitespace, hyphens, parentheses, periods, slashes
  const cleaned = input.trim().replace(/[\s\-\(\)\.\/\\]/g, '');

  let rawDigits = cleaned;

  // If starts with +, strip it to inspect digits
  if (rawDigits.startsWith('+')) {
    rawDigits = rawDigits.substring(1);
  }

  // If 11 digits starting with 0 (trunk prefix)
  if (rawDigits.length === 11 && rawDigits.startsWith('0')) {
    rawDigits = rawDigits.substring(1);
  }

  // If 12 digits starting with 91 (country code)
  if (rawDigits.length === 12 && rawDigits.startsWith('91')) {
    rawDigits = rawDigits.substring(2);
  }

  // Must now be exactly 10 digits
  if (rawDigits.length !== 10) {
    return {
      isValid: false,
      e164: '',
      domestic: '',
      providerFormat: '',
      masked: '',
      error: 'Please enter a valid 10-digit Indian mobile number.',
    };
  }

  // Must only contain digits 0-9
  if (!/^\d{10}$/.test(rawDigits)) {
    return {
      isValid: false,
      e164: '',
      domestic: '',
      providerFormat: '',
      masked: '',
      error: 'Phone number must contain only numeric digits.',
    };
  }

  // First digit of Indian mobile numbers must be 6, 7, 8, or 9
  const firstDigit = rawDigits.charAt(0);
  if (!['6', '7', '8', '9'].includes(firstDigit)) {
    return {
      isValid: false,
      e164: '',
      domestic: '',
      providerFormat: '',
      masked: '',
      error: 'Invalid Indian mobile prefix. Mobile numbers must start with 6, 7, 8, or 9.',
    };
  }

  const domestic = rawDigits;
  const e164 = `+91${domestic}`;
  const providerFormat = `91${domestic}`;
  // Mask: e.g. +91 98••••••10
  const masked = `+91 ${domestic.substring(0, 2)}••••••${domestic.substring(8)}`;

  return {
    isValid: true,
    e164,
    domestic,
    providerFormat,
    masked,
  };
}

/**
 * Format a domestic 10-digit number for clean UI presentation: e.g. "98765 43210"
 */
export function formatDomesticPhone(digits: string): string {
  const norm = normalizeIndianPhoneNumber(digits);
  if (!norm.isValid) return digits;
  return `${norm.domestic.substring(0, 5)} ${norm.domestic.substring(5)}`;
}
