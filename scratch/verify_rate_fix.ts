import { runCalculator } from '../src/calculation-engine/calculator';
import { rateService } from '../src/calculation-engine/data/rateService';
import { CANONICAL_SAMPLE_RATES, TRADE_PREFIX_DEFAULTS } from '../server/src/constants/canonicalRates';

console.log('=== STEP 1: VERIFY CANONICAL RATES AND DEFAULTS ===');
console.log(`Canonical sample rates count: ${Object.keys(CANONICAL_SAMPLE_RATES).length}`);
console.log(`Trade prefix defaults count: ${Object.keys(TRADE_PREFIX_DEFAULTS).length}`);

// Test fallback logic used in server/src/controllers/admin.controller.ts
function resolveCategoryAndUnit(rateId: string, payloadCategory?: string, payloadUnit?: string, existing?: { category?: string; unit?: string }) {
  let category = (payloadCategory || '').trim();
  let unit = (payloadUnit || '').trim();

  if (!category || !unit) {
    if (existing) {
      if (!category && existing.category) category = existing.category;
      if (!unit && existing.unit) unit = existing.unit;
    }
    const canon = (CANONICAL_SAMPLE_RATES as any)[rateId];
    if (canon) {
      if (!category && canon.category) category = canon.category;
      if (!unit && canon.unit) unit = canon.unit;
    }
    const prefix = rateId.split('.')[0]?.toLowerCase();
    const tradeDef = (TRADE_PREFIX_DEFAULTS as any)[prefix];
    if (tradeDef) {
      if (!category && tradeDef.category) category = tradeDef.category;
      if (!unit && tradeDef.unit) unit = tradeDef.unit;
    }
  }

  return { category, unit };
}

console.log('\n=== STEP 2: TEST EDIT EXISTING RATE (PAYLOAD WITH NO CATEGORY/UNIT) ===');
const existingRecord = { category: 'Structure', unit: '₹/CuM' };
const editResult = resolveCategoryAndUnit('concrete.m25_rcc', undefined, undefined, existingRecord);
console.log('Resolved when editing existing record with empty category/unit:', editResult);
if (editResult.category === 'Structure' && editResult.unit === '₹/CuM') {
  console.log(' PASS: Existing category and unit retained correctly!');
} else {
  console.error(' FAIL: Existing category and unit not retained!');
  process.exit(1);
}

console.log('\n=== STEP 3: TEST CANONICAL FALLBACK (BRAND NEW OVERRIDE ON BASE RATE WITHOUT CATEGORY/UNIT) ===');
const canonResult = resolveCategoryAndUnit('windows.upvc_slider', undefined, undefined, undefined);
console.log('Resolved from canonical sample catalog:', canonResult);
if (canonResult.category === 'Windows' && canonResult.unit === '₹/SqFt') {
  console.log(' PASS: Canonical catalog resolved category and unit!');
} else {
  console.error(' FAIL: Canonical fallback failed!');
  process.exit(1);
}

console.log('\n=== STEP 4: TEST TRADE PREFIX FALLBACK FOR NOVEL SUB-KEY ===');
const prefixResult = resolveCategoryAndUnit('steel.primary_fe550d_custom', undefined, undefined, undefined);
console.log('Resolved from trade prefix defaults:', prefixResult);
if (prefixResult.category === 'Steel' && prefixResult.unit === '₹/Tonne') {
  console.log(' PASS: Trade prefix default resolved category and unit!');
} else {
  console.error(' FAIL: Trade prefix fallback failed!');
  process.exit(1);
}

console.log('\n=== STEP 5: VERIFY RATE SERVICE OVERRIDE AND AUDIT TRAIL ===');
rateService.setOverride({
  id: 'ovr-windows-1',
  rateId: 'windows.upvc_slider',
  category: 'Windows',
  unit: '₹/SqFt',
  rate: 950,
  overrideRate: 950,
  packageTier: 'ALL',
  location: 'ALL',
  isActive: true,
  updatedAt: new Date().toISOString(),
}, 'admin@hutty.in', 'Testing price update');

const effectiveWinRate = rateService.getEffectiveRate('windows.upvc_slider', { packageTier: 'PREMIUM', location: 'Bangalore' });
console.log('Effective window rate after override:', effectiveWinRate);
if (effectiveWinRate === 950) {
  console.log(' PASS: rateService successfully applies the updated rate (950)!');
} else {
  console.error(' FAIL: rateService did not apply the rate');
  process.exit(1);
}

const audit = rateService.getAuditLogs()[0];
console.log('Audit trail top entry:', {
  rateId: audit?.rateId,
  oldValue: audit?.oldValue,
  newValue: audit?.newValue,
  action: audit?.action,
  reason: audit?.reason,
});
if (audit && audit.newValue === 950) {
  console.log(' PASS: Audit trail accurately recorded the price update!');
} else {
  console.error(' FAIL: Audit trail did not record the update!');
  process.exit(1);
}

// Reset the override
rateService.removeOverride('windows.upvc_slider', 'ALL', 'ALL', 'admin@hutty.in', 'Reset test');
const resetWinRate = rateService.getEffectiveRate('windows.upvc_slider', { packageTier: 'PREMIUM', location: 'Bangalore' });
console.log('Effective window rate after reset:', resetWinRate);
if (resetWinRate !== 950) {
  console.log(' PASS: rateService successfully resets override back to baseline!');
} else {
  console.error(' FAIL: Reset did not revert override');
  process.exit(1);
}

console.log('\n=== STEP 6: VERIFY ENGINE PHYSICAL QUANTITY INVARIANCE UPON RATE CHANGE ===');
import { createEngineInputForPackage } from '../src/calculation-engine/data/packageConfig';

const fullBaseInput: any = {
  city: 'Bangalore',
  authority: 'BBMP/BDA',
  plotLength: 40,
  plotWidth: 30,
  roadWidthFt: 30,
  builtUpAreaPerFloor: 720,
  floors: 2,
  houseType: 'Duplex',
  parkingType: 'Normal Ground',
  carCount: 1,
  bikeCount: 2,
  evCharging: false,
  liftRequired: false,
  rooms: {
    bedrooms: 3,
    bathrooms: 3,
    kitchen: 1,
    dining: 1,
    living: 1,
    balcony: 2,
    commonToilets: 1,
    office: 0,
    pooja: 1,
    utility: 1,
    storeRoom: 1,
  },
  qualityTier: 'Premium',
  materialBrands: {
    steel: 'Tata Tiscon',
    cement: 'UltraTech',
    masonry: 'Birla Aerocon AAC Blocks',
    doors: 'Premium Teak',
    windows: 'uPVC',
    flooring: 'Granite Slab',
    bathroom: 'Premium (Jaquar / Kohler / Grohe)',
    electrical: 'Mid-range (V-Guard)',
    paint: 'Premium Emulsion',
  },
  flooringZones: {
    living: 'Granite Slab',
    kitchenDining: 'Matte Anti-Skid Vitrified',
    bedrooms: 'Wooden Laminate',
    bathrooms: 'Matte Finish Vitrified',
    parkingUtility: 'Flamed Granite',
    balconies: 'Wooden Finish Tiles',
  },
  wallCladding: {
    kitchenDadoHeight: '4 ft',
    bathroomTileHeight: 'Full Height (Ceiling)',
  },
  doors: {
    mainDoor: 'Premium Teak',
    internalDoor: 'Flush Door',
    bathroomDoor: 'FRP / WPC Laminated',
  },
  windows: {
    primaryMaterial: 'uPVC',
    subGrade: 'Standard uPVC',
  },
  electrical: {
    conduit: 'Heavy-Duty ISI Marked PVC',
    wireTier: 'Mid-range (V-Guard)',
  },
  bathroomFittings: {
    sanitaryTier: 'Premium (Jaquar / Kohler / Grohe)',
    cpvcBrand: 'Ashirwad',
  },
  painting: {
    baseLayer: 'Putty + Primer',
    internalPaint: 'Premium Emulsion',
    externalPaint: 'Weather Proof Emulsion',
    brand: 'Asian Paints',
  },
};

const baseInput = createEngineInputForPackage(fullBaseInput, 'PREMIUM');

const estimateBefore = runCalculator(baseInput);
const steelTonnesBefore = estimateBefore.quantities?.steelTonnes;
const cementBagsBefore = estimateBefore.quantities?.cementBags;
const totalBUABefore = estimateBefore.area.totalBUASqFt;
const baseCost = estimateBefore.budget.totalProjectCost;

console.log(`Baseline Calculation:`);
console.log(`- Total BUA: ${totalBUABefore} sq ft`);
console.log(`- Total Cost: ₹${baseCost.toLocaleString('en-IN')}`);
console.log(`- Steel Tonnes: ${steelTonnesBefore}`);
console.log(`- Cement Bags: ${cementBagsBefore}`);

// Set an override on steel rate
rateService.setOverride({
  id: 'ovr-steel-test',
  rateId: 'steel.fe550d',
  category: 'Steel',
  unit: '₹/Tonne',
  rate: 90000, // higher price
  overrideRate: 90000,
  packageTier: 'ALL',
  location: 'ALL',
  isActive: true,
  updatedAt: new Date().toISOString()
}, 'admin@hutty.in', 'Testing quantity invariance');

const estimateAfter = runCalculator(baseInput);
const steelTonnesAfter = estimateAfter.quantities?.steelTonnes;
const cementBagsAfter = estimateAfter.quantities?.cementBags;
const totalBUAAfter = estimateAfter.area.totalBUASqFt;
const costAfter = estimateAfter.budget.totalProjectCost;

console.log(`\nAfter Steel Rate Override:`);
console.log(`- Total BUA: ${totalBUAAfter} sq ft`);
console.log(`- Total Cost: ₹${costAfter.toLocaleString('en-IN')} (Diff: ₹${(costAfter - baseCost).toLocaleString('en-IN')})`);
console.log(`- Steel Tonnes: ${steelTonnesAfter}`);
console.log(`- Cement Bags: ${cementBagsAfter}`);

// Cleanup
rateService.removeOverride('steel.fe550d', 'ALL', 'ALL', 'admin@hutty.in', 'Cleanup');

if (steelTonnesBefore === steelTonnesAfter && cementBagsBefore === cementBagsAfter && totalBUABefore === totalBUAAfter) {
  console.log('\n PASS: Physical quantities (BUA, steel tonnes, cement bags) are 100% invariant to rate changes!');
} else {
  console.error('\n FAIL: Physical quantities changed unexpectedly!');
  process.exit(1);
}

console.log('\n=== ALL END-TO-END VERIFICATION CHECKS PASSED ===');

