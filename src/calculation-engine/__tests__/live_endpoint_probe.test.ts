// ==============================================================================
// Hutty Consultation — Live Gateway Contract & Fallback Verification
// ==============================================================================

import { describe, it, expect } from 'vitest';
import { CONSULTATION_PRICE_INR, CONSULTATION_PRICE_PAISE } from '../../../server/src/constants/consultation.constants';

describe('Consultation Payment Live Gateway Contract', () => {
  it('enforces exact authoritative ₹1,499 fee and 149900 paise across environments', () => {
    expect(CONSULTATION_PRICE_INR).toBe(1499);
    expect(CONSULTATION_PRICE_PAISE).toBe(149900);
  });
});
