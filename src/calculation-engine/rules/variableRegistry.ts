// ============================================================
// CONTROLLED CALCULATION VARIABLE & OPERATOR REGISTRY
// Strict allowlist of accessible engineering variables & safe AST operators.
// Arbitrary variable names or code execution strictly prohibited.
// ============================================================

export interface ControlledVariable {
  key: string;
  label: string;
  category: 'AREA' | 'ROOMS' | 'ELEMENTS' | 'RATIOS';
  unit: string;
  description: string;
  sampleValue: number;
}

export const CONTROLLED_VARIABLE_REGISTRY: ControlledVariable[] = [
  // ── Area Variables ──
  {
    key: 'builtUpArea',
    label: 'BUA (Built-Up Area)',
    category: 'AREA',
    unit: 'sq.ft',
    description: 'Total multi-floor built-up residential construction area.',
    sampleValue: 1440,
  },
  {
    key: 'groundFloorArea',
    label: 'Ground Floor Area',
    category: 'AREA',
    unit: 'sq.ft',
    description: 'Buildable plinth footprint on the ground level.',
    sampleValue: 720,
  },
  {
    key: 'totalWallArea',
    label: 'Wall Area (Gross)',
    category: 'AREA',
    unit: 'sq.ft',
    description: 'Gross vertical envelope and partition wall surface area.',
    sampleValue: 4820,
  },
  {
    key: 'netWallArea',
    label: 'Net Wall Area',
    category: 'AREA',
    unit: 'sq.ft',
    description: 'Net vertical wall area after deducting doors, windows, and openings.',
    sampleValue: 4200,
  },
  {
    key: 'carpetArea',
    label: 'Carpet Area (Livable)',
    category: 'AREA',
    unit: 'sq.ft',
    description: 'Internal livable usable room floor area.',
    sampleValue: 1150,
  },
  {
    key: 'roofArea',
    label: 'Roof / Terrace Area',
    category: 'AREA',
    unit: 'sq.ft',
    description: 'Horizontal top terrace and parapet slab footprint.',
    sampleValue: 720,
  },
  {
    key: 'perimeterLength',
    label: 'External Perimeter Length',
    category: 'AREA',
    unit: 'ft',
    description: 'Outer foundation and plinth running perimeter.',
    sampleValue: 140,
  },

  // ── Multi-Storey & Counts ──
  {
    key: 'floors',
    label: 'Floor Count',
    category: 'ELEMENTS',
    unit: 'Nos',
    description: 'Total number of storeys (e.g. Ground = 1, G+1 = 2).',
    sampleValue: 2,
  },
  {
    key: 'columnCount',
    label: 'Column Count',
    category: 'ELEMENTS',
    unit: 'Nos',
    description: 'Estimated structural column instances on structural grid.',
    sampleValue: 16,
  },
  {
    key: 'footingCount',
    label: 'Footing Count',
    category: 'ELEMENTS',
    unit: 'Nos',
    description: 'Isolated and combined RCC foundation footing pits.',
    sampleValue: 16,
  },

  // ── Rooms & Spaces ──
  {
    key: 'bedrooms',
    label: 'Bedroom Count',
    category: 'ROOMS',
    unit: 'Nos',
    description: 'Total bedrooms across all levels.',
    sampleValue: 3,
  },
  {
    key: 'bathrooms',
    label: 'Bathroom Count',
    category: 'ROOMS',
    unit: 'Nos',
    description: 'Total attached and common bathrooms.',
    sampleValue: 3,
  },
  {
    key: 'kitchens',
    label: 'Kitchen Count',
    category: 'ROOMS',
    unit: 'Nos',
    description: 'Total kitchen units.',
    sampleValue: 1,
  },
  {
    key: 'livingRooms',
    label: 'Living Room Count',
    category: 'ROOMS',
    unit: 'Nos',
    description: 'Formal living and family lounge areas.',
    sampleValue: 1,
  },
  {
    key: 'totalRooms',
    label: 'Total Room Spaces',
    category: 'ROOMS',
    unit: 'Nos',
    description: 'Aggregate sum of all functional room units.',
    sampleValue: 8,
  },

  // ── Openings & Services ──
  {
    key: 'doorCount',
    label: 'Door Count',
    category: 'ELEMENTS',
    unit: 'Nos',
    description: 'Main, internal, and toilet door openings.',
    sampleValue: 10,
  },
  {
    key: 'windowCount',
    label: 'Window Count',
    category: 'ELEMENTS',
    unit: 'Nos',
    description: 'Primary and secondary exterior window units.',
    sampleValue: 8,
  },
  {
    key: 'totalElectricalPoints',
    label: 'Electrical Points',
    category: 'ELEMENTS',
    unit: 'Nos',
    description: 'Lights, fans, sockets, AC, and high-load power outlets.',
    sampleValue: 98,
  },
  {
    key: 'totalPlumbingPoints',
    label: 'Plumbing Core Points',
    category: 'ELEMENTS',
    unit: 'Nos',
    description: 'Cold/hot water feeds and soil/waste drainage fixtures.',
    sampleValue: 18,
  },
];

export interface ControlledOperator {
  symbol: string;
  code: 'ADD' | 'SUBTRACT' | 'MULTIPLY' | 'DIVIDE' | 'PERCENTAGE' | 'MIN' | 'MAX' | 'ROUND' | 'CEILING';
  name: string;
  description: string;
}

export const CONTROLLED_OPERATORS: ControlledOperator[] = [
  { symbol: '×', code: 'MULTIPLY', name: 'Multiply', description: 'Multiply two values' },
  { symbol: '÷', code: 'DIVIDE', name: 'Divide', description: 'Divide (with zero-division prevention)' },
  { symbol: '+', code: 'ADD', name: 'Add', description: 'Add two quantities' },
  { symbol: '-', code: 'SUBTRACT', name: 'Subtract', description: 'Subtract values' },
  { symbol: '%', code: 'PERCENTAGE', name: 'Percentage Of', description: 'Calculate percentage allocation (value * pct / 100)' },
  { symbol: 'MIN', code: 'MIN', name: 'Minimum Of', description: 'Returns the smaller of two values' },
  { symbol: 'MAX', code: 'MAX', name: 'Maximum / Floor Bound', description: 'Ensures quantity is at least the floor bound' },
  { symbol: 'ROUND', code: 'ROUND', name: 'Round', description: 'Round to decimal places' },
  { symbol: 'CEIL', code: 'CEILING', name: 'Ceiling', description: 'Round up to whole integer unit' },
];

export function getControlledVariable(key: string): ControlledVariable | undefined {
  return CONTROLLED_VARIABLE_REGISTRY.find(
    (v) => v.key.toLowerCase() === key.toLowerCase() || v.label.toLowerCase() === key.toLowerCase()
  );
}

export function validateFormulaVariables(variableKeys: string[]): { isValid: boolean; invalidKeys: string[] } {
  const invalidKeys = variableKeys.filter(
    (k) => !CONTROLLED_VARIABLE_REGISTRY.some((v) => v.key === k)
  );
  return {
    isValid: invalidKeys.length === 0,
    invalidKeys,
  };
}
