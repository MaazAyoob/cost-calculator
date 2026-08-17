// ============================================================
// WINDOWS MODULE — Room-by-room opening geometry and fenestration schedule
// ============================================================

import { EngineInput, AreaResult } from '../types';

/** Standard window opening sizes (sq.ft) based on residential ventilation norms */
const WINDOW_SQFT_BY_ROOM = {
  bedroom:  20,  // 5×4 ft bedroom window
  living:   30,  // 6×5 ft picture window
  kitchen:  12,  // 4×3 ft kitchen window
  bathroom:  6,  // 2×3 ft louvred ventilator
  dining:   15,  // 5×3 ft dining window
  office:   15,  // 5×3 ft study window
  other:    12,
};

export function calculateWindows(input: EngineInput, area: AreaResult): {
  windowsCount: number;
  windowAreaSqFt: number;
} {
  const { rooms } = input;

  // Window unit count
  const windowsCount =
    (rooms.bedrooms || 0) * 2 +
    (rooms.living || 0) * 2 +
    (rooms.kitchen || 0) * 1 +
    (rooms.bathrooms || 0) * 1 +
    (rooms.commonToilets || 0) * 1 +
    (rooms.office || 0) * 1 +
    (rooms.dining || 0) * 1;

  // Total window area in Sq.Ft
  const windowAreaSqFt =
    (rooms.bedrooms || 0) * 2 * WINDOW_SQFT_BY_ROOM.bedroom +
    (rooms.living || 0) * 2 * WINDOW_SQFT_BY_ROOM.living +
    (rooms.kitchen || 0) * 1 * WINDOW_SQFT_BY_ROOM.kitchen +
    (rooms.bathrooms || 0) * 1 * WINDOW_SQFT_BY_ROOM.bathroom +
    (rooms.commonToilets || 0) * 1 * WINDOW_SQFT_BY_ROOM.bathroom +
    (rooms.office || 0) * 1 * WINDOW_SQFT_BY_ROOM.office +
    (rooms.dining || 0) * 1 * WINDOW_SQFT_BY_ROOM.dining;

  return { windowsCount, windowAreaSqFt };
}
