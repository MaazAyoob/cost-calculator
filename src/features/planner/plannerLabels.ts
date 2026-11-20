import { HouseType } from '../../store/useWizardStore';

/**
 * Standardized homeowner-friendly labels for House Configurations.
 * Ensures 100% consistency between Step 2, LivePreviewPanel sidebar, and Step 5 Estimate.
 */
export function getHouseTypeLabel(type?: HouseType | string | null): string {
  switch (type) {
    case 'Triplex':
      return 'Independent Villa / Triplex';
    case 'Rental Units':
      return 'Self-Use + Rental Floors';
    case 'Duplex':
    default:
      return 'Single Family / Duplex';
  }
}

/**
 * Standardized floor configuration label.
 * E.g. floors = 2 -> "G + 1 (2 Floors)"
 */
export function getFloorLabel(floors?: number | null): string {
  const f = floors && floors > 0 ? floors : 2;
  if (f === 1) return 'Ground floor (1 Floor)';
  return `G + ${f - 1} (${f} Floors)`;
}

/**
 * Standardized construction quality tier label.
 * Clarifies physical construction quality vs report pricing tiers.
 */
export function getConstructionQualityLabel(tier?: string | null): string {
  const t = (tier || '').toLowerCase();
  if (t === 'luxury') return 'Luxury Residence';
  if (t === 'standard') return 'Standard Build';
  return 'Premium Build';
}
