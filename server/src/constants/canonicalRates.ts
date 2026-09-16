// ============================================================
// CANONICAL RATE DEFINITIONS & TRADE DEFAULTS
// Provides authoritative default categories and units for all
// Hutty construction items across Karnataka urban residential specs.
// ============================================================

export interface CanonicalRateItem {
  id: string;
  name: string;
  category: string;
  rate: number;
  unit: string;
}

export const CANONICAL_SAMPLE_RATES: CanonicalRateItem[] = [
  { id: 'steel.fe550d_tmt', name: 'TMT Reinforcement Steel Fe 550D / Fe 500D', category: 'Steel', rate: 74000, unit: '₹/Tonne' },
  { id: 'steel.indus_fe500d', name: 'Indus TMT Fe 500D Rebar', category: 'Steel', rate: 68000, unit: '₹/Tonne' },
  { id: 'steel.jsw_neosteel', name: 'JSW Neosteel Fe 550D Rebar', category: 'Steel', rate: 75000, unit: '₹/Tonne' },
  { id: 'steel.tata_tiscon', name: 'Tata Tiscon 550D Super Ductile Rebar', category: 'Steel', rate: 79000, unit: '₹/Tonne' },
  { id: 'steel.sail_fe550d', name: 'SAIL TMT Fe 550D Rebar', category: 'Steel', rate: 72000, unit: '₹/Tonne' },
  { id: 'cement.coromandel_super', name: 'Coromandel King Super Power PPC', category: 'Cement', rate: 380, unit: '₹/Bag' },
  { id: 'cement.birla_super', name: 'Birla Super 53-Grade / PPC Cement', category: 'Cement', rate: 400, unit: '₹/Bag' },
  { id: 'cement.ultratech_super', name: 'UltraTech Super Weather Plus Cement', category: 'Cement', rate: 425, unit: '₹/Bag' },
  { id: 'cement.acc_suraksha', name: 'ACC Suraksha Power Cement', category: 'Cement', rate: 410, unit: '₹/Bag' },
  { id: 'cement.dalmia_dsp', name: 'Dalmia DSP Cement', category: 'Cement', rate: 375, unit: '₹/Bag' },
  { id: 'sand.m_sand', name: 'Manufactured M-Sand (Concrete Grade)', category: 'Sand', rate: 55, unit: '₹/CFT' },
  { id: 'sand.p_sand', name: 'Manufactured Plastering P-Sand', category: 'Sand', rate: 65, unit: '₹/CFT' },
  { id: 'aggregate.20mm', name: 'Crushed Granite Aggregate 20mm', category: 'Aggregate', rate: 40, unit: '₹/CFT' },
  { id: 'aggregate.40mm', name: 'Crushed Granite Aggregate 40mm', category: 'Aggregate', rate: 36, unit: '₹/CFT' },
  { id: 'masonry.solid_block_8in', name: 'Dense Concrete Solid Block (8-inch)', category: 'Masonry', rate: 42, unit: '₹/Block' },
  { id: 'masonry.solid_block_6in', name: 'Dense Concrete Solid Block (6-inch)', category: 'Masonry', rate: 34, unit: '₹/Block' },
  { id: 'masonry.solid_block_4in', name: 'Dense Concrete Solid Block (4-inch)', category: 'Masonry', rate: 28, unit: '₹/Block' },
  { id: 'masonry.red_clay_brick', name: 'Wire-Cut Kiln Red Clay Bricks', category: 'Masonry', rate: 11.5, unit: '₹/Brick' },
  { id: 'masonry.aac_block', name: 'Autoclaved Aerated Concrete (AAC) Blocks', category: 'Masonry', rate: 65, unit: '₹/Block' },
  { id: 'paint.asian_tractor_emulsion', name: 'Asian Paints Tractor Emulsion (Interior)', category: 'Paint', rate: 16, unit: '₹/SqFt' },
  { id: 'paint.asian_apcolite_premium', name: 'Asian Paints Apcolite Premium Emulsion', category: 'Paint', rate: 24, unit: '₹/SqFt' },
  { id: 'paint.asian_royale_luxury', name: 'Asian Paints Royale Luxury Emulsion', category: 'Paint', rate: 36, unit: '₹/SqFt' },
  { id: 'paint.berger_bison', name: 'Berger Bison Acrylic Emulsion', category: 'Paint', rate: 18, unit: '₹/SqFt' },
  { id: 'paint.dulux_velvet', name: 'Dulux Velvet Touch Luxury', category: 'Paint', rate: 38, unit: '₹/SqFt' },
  { id: 'flooring.vitrified_tiles', name: 'Double Charged Vitrified Tiles 800x800mm', category: 'Flooring', rate: 85, unit: '₹/SqFt' },
  { id: 'flooring.granite_slab', name: 'Sadahalli Grey Granite Polished Slab', category: 'Flooring', rate: 145, unit: '₹/SqFt' },
  { id: 'flooring.italian_marble', name: 'Italian Botticino / Dyna Marble Slab', category: 'Flooring', rate: 420, unit: '₹/SqFt' },
  { id: 'flooring.anti_skid_tiles', name: 'Matte Anti-Skid Ceramic Floor Tiles', category: 'Flooring', rate: 65, unit: '₹/SqFt' },
  { id: 'doors.flush_door', name: 'Waterproof Membrane Flush Door (32mm)', category: 'Doors', rate: 3500, unit: '₹/Door' },
  { id: 'doors.teak_wood', name: 'Burma Teak Engineered Main Entrance Door', category: 'Doors', rate: 28000, unit: '₹/Door' },
  { id: 'doors.wpc_bathroom', name: 'WPC / FRP Waterproof Bathroom Door', category: 'Doors', rate: 4200, unit: '₹/Door' },
  { id: 'windows.upvc_slider', name: '2.5-Track uPVC Sliding Window with Mosquito Mesh', category: 'Windows', rate: 650, unit: '₹/SqFt' },
  { id: 'windows.aluminium_slider', name: 'Anodized Aluminium 2-Track Slider', category: 'Windows', rate: 450, unit: '₹/SqFt' },
  { id: 'windows.teak_wood', name: 'Honne / Teak Traditional Glazed Window', category: 'Windows', rate: 1400, unit: '₹/SqFt' },
  { id: 'electrical.wire_bundle', name: 'Finolex / Havells FRLS Copper Wire Bundle (1.5 sq mm)', category: 'Electrical wiring', rate: 2200, unit: '₹/Bundle' },
  { id: 'electrical.conduit_pipe', name: 'Heavy Duty Rigid PVC Conduit Pipe (25mm)', category: 'Electrical conduits', rate: 45, unit: '₹/Length' },
  { id: 'electrical.switch_modular', name: 'Legrand Arteor / Anchor Roma Modular Switch & Socket Point', category: 'Switches', rate: 750, unit: '₹/Point' },
  { id: 'plumbing.cpvc_pipe', name: 'Astral SDR 11 CPVC Plumbing Pipe 1-inch (3m)', category: 'Plumbing', rate: 480, unit: '₹/Length' },
  { id: 'plumbing.pvc_drainage', name: 'Supreme SWR Drainage Pipe 4-inch (3m)', category: 'Plumbing', rate: 650, unit: '₹/Length' },
  { id: 'sanitaryware.wall_hung_ewc', name: 'Jaquar Rimless Wall Hung EWC with Soft Close Seat', category: 'Sanitaryware', rate: 7800, unit: '₹/Unit' },
  { id: 'sanitaryware.floor_mounted_ewc', name: 'Cera / Hindware Floor Mounted European Water Closet', category: 'Sanitaryware', rate: 3800, unit: '₹/Unit' },
  { id: 'sanitaryware.diverter_set', name: 'Jaquar Single Lever Concealed Bath Diverter Set', category: 'Sanitaryware', rate: 5200, unit: '₹/Set' },
  { id: 'labour.mason_daily', name: 'Lead Mason Daily Labour Wage', category: 'Labour', rate: 1050, unit: '₹/Day' },
  { id: 'labour.helper_daily', name: 'Helper Daily Construction Wage', category: 'Labour', rate: 700, unit: '₹/Day' },
  { id: 'labour.carpenter_daily', name: 'Skilled Shuttering Carpenter Daily Wage', category: 'Labour', rate: 1100, unit: '₹/Day' },
  { id: 'labour.bar_bender_daily', name: 'Rebar Steel Bender Daily Wage', category: 'Labour', rate: 1050, unit: '₹/Day' },
];

export const TRADE_PREFIX_DEFAULTS: Record<string, { category: string; unit: string }> = {
  steel: { category: 'Steel', unit: '₹/Tonne' },
  cement: { category: 'Cement', unit: '₹/Bag' },
  sand: { category: 'Sand', unit: '₹/CFT' },
  aggregate: { category: 'Aggregate', unit: '₹/CFT' },
  masonry: { category: 'Masonry', unit: '₹/Block' },
  brick: { category: 'Masonry', unit: '₹/Brick' },
  paint: { category: 'Paint', unit: '₹/SqFt' },
  flooring: { category: 'Flooring', unit: '₹/SqFt' },
  tile: { category: 'Flooring', unit: '₹/SqFt' },
  doors: { category: 'Doors', unit: '₹/Door' },
  door: { category: 'Doors', unit: '₹/Door' },
  windows: { category: 'Windows', unit: '₹/SqFt' },
  window: { category: 'Windows', unit: '₹/SqFt' },
  electrical: { category: 'Electrical wiring', unit: '₹/Point' },
  plumbing: { category: 'Plumbing', unit: '₹/Point' },
  sanitary: { category: 'Sanitaryware', unit: '₹/Unit' },
  sanitaryware: { category: 'Sanitaryware', unit: '₹/Unit' },
  labour: { category: 'Labour', unit: '₹/Day' },
};
