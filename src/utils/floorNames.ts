/**
 * Canonical floor naming helper for Hutty residential construction calculator.
 * Maps internal floor indexes (0-based) to consistent customer-facing labels:
 * 0 -> Ground Floor
 * 1 -> First Floor
 * 2 -> Second Floor
 * 3 -> Third Floor
 * 4 -> Fourth Floor
 * 5 -> Fifth Floor
 * ...
 */
const ORDINAL_NAMES = [
  'Ground Floor',
  'First Floor',
  'Second Floor',
  'Third Floor',
  'Fourth Floor',
  'Fifth Floor',
  'Sixth Floor',
  'Seventh Floor',
  'Eighth Floor',
  'Ninth Floor',
  'Tenth Floor',
];

function getOrdinalSuffix(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

export function getFloorDisplayName(floorIndex: number): string {
  const idx = Math.floor(floorIndex);
  if (isNaN(idx) || idx <= 0) return 'Ground Floor';
  if (idx < ORDINAL_NAMES.length) {
    return ORDINAL_NAMES[idx];
  }
  return `${idx}${getOrdinalSuffix(idx)} Floor`;
}
