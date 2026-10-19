// ==============================================================================
// Hutty Phone Number Normalization & Validation Utility (Client)
// Canonical Indian Mobile Number (+91 E.164) Formatter & Validator
// ==============================================================================

export interface NormalizedPhoneResult {
  isValid: boolean;
  e164: string;           // Canonical E.164: +919876543210
  domestic: string;       // 10 digits: 9876543210
  providerFormat: string; // MSG91 format without leading plus: 919876543210
  masked: string;         // Masked display: +91 98••••••10
  error?: string;
}

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

  const cleaned = input.trim().replace(/[\s\-\(\)\.\/\\]/g, '');
  let rawDigits = cleaned;

  if (rawDigits.startsWith('+')) {
    rawDigits = rawDigits.substring(1);
  }

  if (rawDigits.length === 11 && rawDigits.startsWith('0')) {
    rawDigits = rawDigits.substring(1);
  }

  if (rawDigits.length === 12 && rawDigits.startsWith('91')) {
    rawDigits = rawDigits.substring(2);
  }

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
  const masked = `+91 ${domestic.substring(0, 2)}••••••${domestic.substring(8)}`;

  return {
    isValid: true,
    e164,
    domestic,
    providerFormat,
    masked,
  };
}

export function formatDomesticPhone(digits: string): string {
  const norm = normalizeIndianPhoneNumber(digits);
  if (!norm.isValid) return digits;
  return `${norm.domestic.substring(0, 5)} ${norm.domestic.substring(5)}`;
}
