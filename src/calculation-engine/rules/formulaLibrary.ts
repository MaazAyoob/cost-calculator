// ============================================================
// CANONICAL FORMULA LIBRARY REGISTRY
// Human-readable documentation, inputs, visual AST representations,
// units, and impact metadata for all core residential engineering formulas.
// ============================================================

export interface FormulaLibraryItem {
  id: string;
  domain:
    | 'RCC'
    | 'STEEL'
    | 'CEMENT'
    | 'MASONRY'
    | 'FLOORING'
    | 'WATERPROOFING'
    | 'PAINT'
    | 'DOORS_WINDOWS'
    | 'ELECTRICAL'
    | 'PLUMBING'
    | 'FIXTURES'
    | 'LABOUR'
    | 'COMMERCIAL';
  name: string;
  whatIsIt: string;
  purpose: string;
  currentMethod: string;
  methodType: 'BUA_BASED' | 'GEOMETRY_BASED' | 'QUANTITY_BASED' | 'SCHEDULE_BASED' | 'PERCENTAGE_BASED' | 'MANUAL';
  inputs: Array<{ key: string; label: string; unit?: string }>;
  output: string;
  unit: string;
  affects: string[];
  notAffected: string[];
  visualBlocks: Array<{
    left: string;
    operator: string;
    right: string;
    condition?: string;
    result: string;
  }>;
  version: string;
  updatedAt: string;
}

export const CANONICAL_FORMULA_LIBRARY: FormulaLibraryItem[] = [
  // ── RCC DOMAIN ──
  {
    id: 'formula.rcc.structural_concrete',
    domain: 'RCC',
    name: 'RCC — Structural Concrete Volume',
    whatIsIt: 'Overall monolithic structural framing concrete sizing across footings, columns, beams, slabs, and stairs.',
    purpose: 'Calculates baseline structural concrete volume envelope.',
    currentMethod: 'BUA × Concrete Factor (0.052 m³/sq.ft)',
    methodType: 'BUA_BASED',
    inputs: [
      { key: 'builtUpArea', label: 'BUA', unit: 'sq.ft' },
      { key: 'config.rcc.concrete_factor_cum_sqft', label: 'Concrete Factor', unit: 'm³/sq.ft' },
    ],
    output: 'Structural Framing Concrete',
    unit: 'm³',
    affects: ['RCC BOQ', 'Ready Mix Concrete (RMC)', 'Reinforcement Steel', 'Shuttering Formwork', 'Structural Cost'],
    notAffected: ['Wall Area', 'AAC Block Count', 'Interior Paint Area'],
    visualBlocks: [
      {
        left: 'BUA (sq.ft)',
        operator: '×',
        right: 'Concrete Factor (0.052 m³/sq.ft)',
        result: 'Structural Concrete Volume (m³)',
      },
    ],
    version: 'v2.0',
    updatedAt: '2026-09-25',
  },
  {
    id: 'formula.rcc.footing',
    domain: 'RCC',
    name: 'RCC — Footing Concrete',
    whatIsIt: 'Estimated isolated and combined reinforced concrete foundation volume.',
    purpose: 'Calculates estimated footing concrete quantity for excavation, RMC, and sub-structure casting.',
    currentMethod: 'Structural Concrete × Footing Allocation % (min: Minimum Footing Quantity)',
    methodType: 'PERCENTAGE_BASED',
    inputs: [
      { key: 'builtUpArea', label: 'BUA', unit: 'sq.ft' },
      { key: 'config.rcc.concrete_factor_cum_sqft', label: 'Concrete Factor', unit: 'm³/sq.ft' },
      { key: 'config.rcc.footing_allocation_pct', label: 'Footing Allocation', unit: '%' },
      { key: 'config.rcc.min_footing_concrete_cum', label: 'Minimum Footing Quantity', unit: 'm³' },
    ],
    output: 'Footing Concrete',
    unit: 'm³',
    affects: ['Foundation BOQ (FD-02)', 'RMC Pouring', 'Footing Rebar Cage', 'Excavation Depth', 'Substructure Cost'],
    notAffected: ['Wall Area', 'AAC Block Count', 'Door/Window Openings'],
    visualBlocks: [
      {
        left: 'Structural Concrete (m³)',
        operator: '×',
        right: 'Footing Allocation (22%)',
        condition: 'with minimum: Minimum Footing Quantity (5.0 m³)',
        result: 'Footing Concrete (m³)',
      },
    ],
    version: 'v2.0',
    updatedAt: '2026-09-25',
  },
  {
    id: 'formula.rcc.column',
    domain: 'RCC',
    name: 'RCC — Column Concrete',
    whatIsIt: 'Vertical reinforced concrete column stems extending from footing neck to top terrace slab.',
    purpose: 'Calculates vertical structural column volume for shuttering, caging, and concrete casting.',
    currentMethod: 'Structural Concrete × Column Allocation % (min: Minimum Column Quantity)',
    methodType: 'PERCENTAGE_BASED',
    inputs: [
      { key: 'builtUpArea', label: 'BUA', unit: 'sq.ft' },
      { key: 'config.rcc.concrete_factor_cum_sqft', label: 'Concrete Factor', unit: 'm³/sq.ft' },
      { key: 'config.rcc.column_allocation_pct', label: 'Column Allocation', unit: '%' },
      { key: 'config.rcc.min_column_concrete_cum', label: 'Minimum Column Quantity', unit: 'm³' },
    ],
    output: 'Column Concrete',
    unit: 'm³',
    affects: ['RCC Structure BOQ (RC-01)', 'Column Shuttering', 'Vertical Rebar Tying', 'Superstructure Cost'],
    notAffected: ['Flooring Tile Area', 'Plumbing Points', 'Sanitaryware'],
    visualBlocks: [
      {
        left: 'Structural Concrete (m³)',
        operator: '×',
        right: 'Column Allocation (18%)',
        condition: 'with minimum: Minimum Column Quantity (3.0 m³)',
        result: 'Column Concrete (m³)',
      },
    ],
    version: 'v2.0',
    updatedAt: '2026-09-25',
  },
  {
    id: 'formula.rcc.slab',
    domain: 'RCC',
    name: 'RCC — Slab & Beam Concrete',
    whatIsIt: 'Horizontal suspended reinforced floor and roof slabs including downstand and inverted beams.',
    purpose: 'Calculates suspended floor/roof slab casting volume.',
    currentMethod: 'Structural Concrete × Slab Allocation % (min: Minimum Slab Quantity)',
    methodType: 'PERCENTAGE_BASED',
    inputs: [
      { key: 'builtUpArea', label: 'BUA', unit: 'sq.ft' },
      { key: 'config.rcc.concrete_factor_cum_sqft', label: 'Concrete Factor', unit: 'm³/sq.ft' },
      { key: 'config.rcc.slab_allocation_pct', label: 'Slab & Beam Allocation', unit: '%' },
      { key: 'config.rcc.min_slab_concrete_cum', label: 'Minimum Slab Quantity', unit: 'm³' },
    ],
    output: 'Slab Concrete',
    unit: 'm³',
    affects: ['RCC Structure BOQ (RC-02)', 'Slab Formwork Staging', 'Top & Bottom Rebar Mesh', 'Superstructure Cost'],
    notAffected: ['Wall Masonry Blocks', 'Door Frames', 'Window Grills'],
    visualBlocks: [
      {
        left: 'Structural Concrete (m³)',
        operator: '×',
        right: 'Slab & Beam Allocation (52%)',
        condition: 'with minimum: Minimum Slab Quantity (8.0 m³)',
        result: 'Slab Concrete (m³)',
      },
    ],
    version: 'v2.0',
    updatedAt: '2026-09-25',
  },

  // ── STEEL DOMAIN ──
  {
    id: 'formula.steel.rebar',
    domain: 'STEEL',
    name: 'Steel — Structural Reinforcement Tonnage',
    whatIsIt: 'Total Fe 550D / Fe 500D thermo-mechanically treated reinforcement rebar for the building framework.',
    purpose: 'Determines procurement rebar tonnage with floor-height seismic caging multipliers.',
    currentMethod: 'BUA × [Base Steel (2.8 kg/sqft) + (Floors - 1) × 0.2] ÷ 1000 + Wastage',
    methodType: 'BUA_BASED',
    inputs: [
      { key: 'builtUpArea', label: 'BUA', unit: 'sq.ft' },
      { key: 'floors', label: 'Floor Count', unit: 'Nos' },
      { key: 'config.rcc.steel_base_factor_kg_sqft', label: 'Base Steel Factor', unit: 'kg/sq.ft' },
      { key: 'config.rcc.steel_additional_floor_factor', label: 'Additional Floor Factor', unit: 'kg/sq.ft/floor' },
      { key: 'config.wastage.steel', label: 'Cutting & Lapping Wastage', unit: '%' },
    ],
    output: 'Total TMT Rebar',
    unit: 'Tonne',
    affects: ['BOQ Steel Lines (FD-03, PL-02, RC-04, RC-05)', 'Bar Bending Labour', 'Structural Cost', 'Report Summary'],
    notAffected: ['Wall Tile Area', 'Internal Paint Litres', 'Switch Modules'],
    visualBlocks: [
      {
        left: 'BUA (sq.ft)',
        operator: '×',
        right: 'Effective Steel Factor [Base + (Floors - 1) × 0.2]',
        result: 'Steel Weight (kg)',
      },
      {
        left: 'Steel Weight (kg)',
        operator: '÷',
        right: '1000',
        result: 'TMT Reinforcement (Tonnes)',
      },
    ],
    version: 'v2.0',
    updatedAt: '2026-09-25',
  },

  // ── CEMENT DOMAIN ──
  {
    id: 'formula.cement.consumption',
    domain: 'CEMENT',
    name: 'Cement — Total Consumption Bags',
    whatIsIt: 'Total 50kg bags of OPC 53 Grade / PPC cement required across structural RMC, masonry mortar, and plaster.',
    purpose: 'Calculates procurement cement quantity and bag supply schedule.',
    currentMethod: 'BUA × Cement Factor (0.40 bags/sq.ft) × (1 + Handling Wastage %)',
    methodType: 'BUA_BASED',
    inputs: [
      { key: 'builtUpArea', label: 'BUA', unit: 'sq.ft' },
      { key: 'config.material.cement_bags_per_sqft', label: 'Cement Factor', unit: 'bags/sq.ft' },
      { key: 'config.wastage.cement', label: 'Handling Wastage', unit: '%' },
    ],
    output: 'Total Cement Bags',
    unit: 'Bags (50kg)',
    affects: ['Cement Material Schedule', 'Site Godown Storage', 'Bag Unloading Labour', 'Material Budget'],
    notAffected: ['Clear Wall Height', 'Door Opening Area', 'Window Glazing'],
    visualBlocks: [
      {
        left: 'BUA (sq.ft)',
        operator: '×',
        right: 'Cement Factor (0.40 bags/sq.ft)',
        result: 'Baseline Cement Bags',
      },
    ],
    version: 'v2.0',
    updatedAt: '2026-09-25',
  },

  // ── MASONRY DOMAIN ──
  {
    id: 'formula.masonry.block_count',
    domain: 'MASONRY',
    name: 'Masonry — Block Consumption & Coverage',
    whatIsIt: 'AAC blocks or solid concrete blocks required to construct perimeter envelope and partition walls.',
    purpose: 'Calculates discrete block count based on net wall area, wall thickness, and block unit dimensions.',
    currentMethod: 'Net Wall Volume (m³) ÷ Block Unit Volume (m³) × (1 + Cutting Wastage %)',
    methodType: 'GEOMETRY_BASED',
    inputs: [
      { key: 'netWallArea', label: 'Net Wall Area', unit: 'sq.ft' },
      { key: 'config.masonry.external_wall_thickness_m', label: 'Wall Thickness', unit: 'm' },
      { key: 'config.masonry.aac_block_unit_volume_cum', label: 'Unit Block Volume', unit: 'm³' },
      { key: 'config.wastage.masonry', label: 'Cutting Wastage', unit: '%' },
    ],
    output: 'Blocks Required',
    unit: 'Nos',
    affects: ['Masonry BOQ (MS-01, MS-02)', 'Block Laying Labour', 'Polymer Adhesive / Joint Mortar', 'Wall Budget'],
    notAffected: ['Structural Steel Tonnage', 'Terrace Waterproofing Area', 'Plumbing Points'],
    visualBlocks: [
      {
        left: 'Net Wall Area (sq.ft)',
        operator: '×',
        right: 'Wall Thickness (m)',
        result: 'Net Wall Volume (m³)',
      },
      {
        left: 'Net Wall Volume (m³)',
        operator: '÷',
        right: 'Unit Block Volume (0.018 m³)',
        result: 'Final Blocks Required (Nos)',
      },
    ],
    version: 'v2.0',
    updatedAt: '2026-09-25',
  },

  // ── FLOORING DOMAIN ──
  {
    id: 'formula.flooring.vitrified',
    domain: 'FLOORING',
    name: 'Flooring — Vitrified Tiles & Tiling Area',
    whatIsIt: 'Internal livable floor area requiring vitrified floor tile installation including corridors and skirting.',
    purpose: 'Calculates floor tile area with circulation and cutting wastage.',
    currentMethod: 'Carpet Area × (1 + Circulation Allowance %) × (1 + Tile Wastage %)',
    methodType: 'QUANTITY_BASED',
    inputs: [
      { key: 'carpetArea', label: 'Livable Carpet Area', unit: 'sq.ft' },
      { key: 'config.flooring.circulation_allowance_pct', label: 'Circulation Allowance', unit: '%' },
      { key: 'config.wastage.flooring', label: 'Tile Wastage', unit: '%' },
    ],
    output: 'Flooring Tile Area',
    unit: 'sq.ft',
    affects: ['Flooring BOQ (FL-01)', 'Tile Fixing Labour & Adhesive', 'Skirting Running Metres', 'Finishes Budget'],
    notAffected: ['Excavation Earthwork', 'Foundation Footing Volume', 'Structural Column Concrete'],
    visualBlocks: [
      {
        left: 'Carpet Area (sq.ft)',
        operator: '×',
        right: 'Circulation Multiplier (1.10)',
        result: 'Flooring Raw Surface (sq.ft)',
      },
      {
        left: 'Flooring Raw Surface (sq.ft)',
        operator: '×',
        right: 'Tile Wastage (1.07)',
        result: 'Total Floor Tile Area (sq.ft)',
      },
    ],
    version: 'v2.0',
    updatedAt: '2026-09-25',
  },

  // ── WATERPROOFING DOMAIN ──
  {
    id: 'formula.waterproofing.wet_areas',
    domain: 'WATERPROOFING',
    name: 'Waterproofing — Bathroom & Terrace Membrane',
    whatIsIt: 'Multi-coat elastomeric waterproofing membrane applied to wet bathroom sunken slabs and exposed roof terrace.',
    purpose: 'Calculates waterproofing surface area including mandatory 1-foot vertical upturn flashings.',
    currentMethod: 'Bathroom Floor Area + (Perimeter × 1.0 ft Upturn) + Roof Terrace Area',
    methodType: 'GEOMETRY_BASED',
    inputs: [
      { key: 'bathrooms', label: 'Bathroom Count', unit: 'Nos' },
      { key: 'config.waterproofing.bathroom_upturn_ft', label: 'Vertical Upturn Height', unit: 'ft' },
      { key: 'roofArea', label: 'Roof Terrace Area', unit: 'sq.ft' },
    ],
    output: 'Waterproofing Application Area',
    unit: 'sq.ft',
    affects: ['Waterproofing BOQ (WP-01, WP-02)', 'Dr. Fixit Chemical Application', 'Ponding Test Inspections'],
    notAffected: ['Interior Wall Paint Litres', 'Switch Modules', 'Door Hardware'],
    visualBlocks: [
      {
        left: 'Bathroom Floor Area',
        operator: '+',
        right: '(Perimeter × 1.0 ft Upturn)',
        result: 'Total Bathroom Waterproofing (sq.ft)',
      },
    ],
    version: 'v2.0',
    updatedAt: '2026-09-25',
  },

  // ── PAINT DOMAIN ──
  {
    id: 'formula.paint.interior',
    domain: 'PAINT',
    name: 'Paint — Interior Acrylic Emulsion & Putty',
    whatIsIt: '2-coat interior wall and ceiling acrylic emulsion paint along with 2-coat wall putty prep.',
    purpose: 'Calculates interior paintable surface area and paint consumption in litres.',
    currentMethod: '(Internal Wall Area + Ceiling Area) ÷ Paint Spread Rate (45 sq.ft/L) × (1 + Wastage %)',
    methodType: 'QUANTITY_BASED',
    inputs: [
      { key: 'netWallArea', label: 'Internal Wall Area', unit: 'sq.ft' },
      { key: 'config.paint.interior_coverage_sqft_per_litre', label: 'Coverage Rate', unit: 'sq.ft/L' },
      { key: 'config.wastage.paint', label: 'Application Wastage', unit: '%' },
    ],
    output: 'Interior Paint Volume',
    unit: 'Litres',
    affects: ['Painting BOQ (PT-01)', 'Wall Putty Bags (kg)', 'Painter Labour Days', 'Finishing Budget'],
    notAffected: ['Footing Concrete Volume', 'Plinth Tie Beams', 'Structural Steel'],
    visualBlocks: [
      {
        left: 'Paintable Surface Area (sq.ft)',
        operator: '÷',
        right: 'Coverage Rate (45 sq.ft/L)',
        result: 'Interior Paint Required (Litres)',
      },
    ],
    version: 'v2.0',
    updatedAt: '2026-09-25',
  },

  // ── ELECTRICAL DOMAIN ──
  {
    id: 'formula.electrical.wiring',
    domain: 'ELECTRICAL',
    name: 'Electrical — Wiring Lengths & Point Ckts',
    whatIsIt: 'Concealed PVC conduit wiring runs (1.5 sq.mm light, 2.5 sq.mm socket, 4.0 sq.mm AC/Geyser).',
    purpose: 'Calculates total circuit wiring metres and modular switch plates based on room electrical points.',
    currentMethod: 'Light Points × 8.5m + Socket Points × 12.5m + Power Points × 22.0m',
    methodType: 'SCHEDULE_BASED',
    inputs: [
      { key: 'totalElectricalPoints', label: 'Total Points', unit: 'Nos' },
      { key: 'config.electrical.wire_1_5_m_per_point', label: 'Wire per Light Point', unit: 'm' },
      { key: 'config.electrical.wire_2_5_m_per_point', label: 'Wire per Socket Point', unit: 'm' },
    ],
    output: 'Electrical Wiring Length',
    unit: 'Metres',
    affects: ['Electrical BOQ (EL-01 to EL-05)', 'Wire Coils (90m boxes)', 'Concealed Conduit Piping', 'Electrical Labour'],
    notAffected: ['Slab Concrete Volume', 'Excavation Earthwork', 'AAC Blocks'],
    visualBlocks: [
      {
        left: 'Total Electrical Points (Nos)',
        operator: '×',
        right: 'Average Wire Run (8.5 m/pt)',
        result: 'Wiring Metres Required (m)',
      },
    ],
    version: 'v2.0',
    updatedAt: '2026-09-25',
  },

  // ── PLUMBING DOMAIN ──
  {
    id: 'formula.plumbing.piping',
    domain: 'PLUMBING',
    name: 'Plumbing — Internal Water Supply & Drainage',
    whatIsIt: 'Concealed CPVC/UPVC water feed lines and SWR soil/waste drainage stacks.',
    purpose: 'Calculates hot/cold piping lengths and drainage shaft lines based on configured bathrooms and kitchens.',
    currentMethod: 'Water Points × 4.5m CPVC + Drainage Points × 3.5m SWR + Shaft Risers',
    methodType: 'SCHEDULE_BASED',
    inputs: [
      { key: 'totalPlumbingPoints', label: 'Total Plumbing Points', unit: 'Nos' },
      { key: 'config.plumbing.cpvc_m_per_point', label: 'CPVC per Point', unit: 'm' },
      { key: 'config.plumbing.swr_m_per_point', label: 'SWR per Point', unit: 'm' },
    ],
    output: 'Piping Length',
    unit: 'Metres',
    affects: ['Plumbing BOQ (PL-01, PL-02)', 'CPVC Pipe Lengths', 'SWR Heavy Stacks', 'Plumber Trade Labour'],
    notAffected: ['Tile Area', 'Paint Litres', 'Masonry Blocks'],
    visualBlocks: [
      {
        left: 'Plumbing Core Points (Nos)',
        operator: '×',
        right: 'CPVC Supply Allowance (4.5 m/pt)',
        result: 'Water Supply Piping Metres (m)',
      },
    ],
    version: 'v2.0',
    updatedAt: '2026-09-25',
  },

  // ── COMMERCIAL & TAX DOMAIN ──
  {
    id: 'formula.commercial.margin',
    domain: 'COMMERCIAL',
    name: 'Commercial — Contractor Margin & Taxes',
    whatIsIt: 'Contractor management overhead, contingency risk reserve, and statutory GST additions on base BOQ.',
    purpose: 'Compiles final commercial customer budget from works BOQ sum.',
    currentMethod: 'Base BOQ + Contractor Margin (15%) + Contingency (6%) + GST (18%)',
    methodType: 'PERCENTAGE_BASED',
    inputs: [
      { key: 'baseBOQ', label: 'Direct Works BOQ Sum', unit: '₹' },
      { key: 'config.commercial.contractor_margin_rate', label: 'Contractor Margin', unit: '%' },
      { key: 'config.commercial.contingency_rate', label: 'Contingency Rate', unit: '%' },
      { key: 'config.commercial.gst_rate', label: 'Statutory GST', unit: '%' },
    ],
    output: 'Total Project Cost',
    unit: '₹ INR',
    affects: ['Final Project Budget', 'Customer Milestone Payment Plan', 'Detailed Report Cover'],
    notAffected: ['Physical Material Quantities', 'Steel Tonnes', 'Cement Bags'],
    visualBlocks: [
      {
        left: 'Direct Works BOQ Sum (₹)',
        operator: '×',
        right: 'Contractor Overhead Markup (15%)',
        result: 'Contractor Execution Cost (₹)',
      },
      {
        left: 'Taxable Project Subtotal (₹)',
        operator: '×',
        right: 'GST Rate (18%)',
        result: 'Total Project Cost (₹)',
      },
    ],
    version: 'v2.0',
    updatedAt: '2026-09-25',
  },
];
