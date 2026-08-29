// ============================================================
// CENTRALIZED CONSTRUCTION PACKAGE SPECIFICATION SYSTEM
// Defines specification baselines, deterministic multi-package
// comparison execution, and recommendation engine.
// ============================================================

import {
  EngineInput,
  CalculationResult,
  ZoneFlooringSelection,
  WallCladdingSelection,
  DoorSelection,
  WindowSelection,
  ElectricalSelection,
  BathroomFittingSelection,
  PaintingSelection,
} from '../types';
import { runCalculator } from '../calculator';

export type ConstructionPackageId = 'STANDARD' | 'PREMIUM' | 'LUXURY';

export interface PackageSpecProfile {
  id: ConstructionPackageId;
  title: string;
  subtitle: string;
  tagline: string;
  description: string;
  badge?: string;
  isRecommended?: boolean;
  recommendationReason: string;
  specificationTier: 'standard' | 'premium' | 'luxury';
  qualityTier: 'Essential' | 'Premium' | 'Luxury';
  keyHighlights: string[];
  specs: {
    steel: 'Indus TMT' | 'Tata Tiscon' | 'JSW Neosteel';
    cement: 'Dalmia Bharat' | 'UltraTech' | 'ACC Cement';
    masonry: string;
    flooring: ZoneFlooringSelection;
    wallCladding: WallCladdingSelection;
    doors: DoorSelection;
    windows: WindowSelection;
    electrical: ElectricalSelection;
    bathroomFittings: BathroomFittingSelection;
    painting: PaintingSelection;
  };
}

export const CONSTRUCTION_PACKAGES: Record<ConstructionPackageId, PackageSpecProfile> = {
  STANDARD: {
    id: 'STANDARD',
    title: 'Standard',
    subtitle: 'Practical & Value-Focused',
    tagline: 'Practical, cost-conscious construction focused on essential quality and value.',
    description: 'Practical, cost-conscious construction focused on essential quality and value.',
    recommendationReason: 'Ideal for value-oriented builds or rental configurations seeking certified structural durability with sensible finishes.',
    specificationTier: 'standard',
    qualityTier: 'Essential',
    keyHighlights: [
      'Certified Fe 500D TMT Steel & PPC Grade Cement',
      'Double-charged Vitrified Tiles (800×800mm)',
      'Anodized Aluminium Glazing & Flush/Teak Doors',
      'Anchor FRLS Copper Wiring & ISI Conduit',
      'Standard Branded Sanitaryware (Cera / Parryware)',
      'Smooth Acrylic Interior & Weather Guard Exterior',
    ],
    specs: {
      steel: 'Indus TMT',
      cement: 'Dalmia Bharat',
      masonry: 'Solid Concrete Blocks',
      flooring: {
        living: 'Vitrified Tiles 800x800mm',
        kitchenDining: 'Vitrified Tiles',
        bedrooms: 'Vitrified Tiles',
        bathrooms: 'Anti-skid Ceramic Tiles',
        parkingUtility: 'Heavy-Duty Parking Tiles',
        balconies: 'Anti-skid Ceramic',
      },
      wallCladding: {
        kitchenDadoHeight: '2 ft',
        bathroomTileHeight: '7 ft (Lintel)',
      },
      doors: {
        mainDoor: 'Normal Teak',
        internalDoor: 'Flush Door',
        bathroomDoor: 'WPC Door',
      },
      windows: {
        primaryMaterial: 'Aluminium',
        subGrade: 'Anodized Aluminium',
      },
      electrical: {
        wireTier: 'Economy (Anchor)',
        conduit: 'Heavy-Duty ISI Marked PVC',
      },
      bathroomFittings: {
        sanitaryTier: 'Essential (Cera / Hindware / Parryware)',
        cpvcBrand: 'Supreme',
      },
      painting: {
        baseLayer: 'Putty + Primer',
        internalPaint: 'Tractor Emulsion',
        externalPaint: 'Ace Exterior Emulsion',
        brand: 'Berger Paints',
      },
    },
  },

  PREMIUM: {
    id: 'PREMIUM',
    title: 'Premium',
    subtitle: 'Architectural Balance & Quality',
    tagline: 'Better materials, improved finishes and upgraded fixtures for a higher-quality home.',
    description: 'Better materials, improved finishes and upgraded fixtures for a higher-quality home.',
    badge: 'RECOMMENDED',
    isRecommended: true,
    recommendationReason: 'Offers a balanced combination of quality, certified durability, and estimated cost for modern residential living.',
    specificationTier: 'premium',
    qualityTier: 'Premium',
    keyHighlights: [
      'Tata Tiscon 550D High-Ductility Rebar & UltraTech 53G Cement',
      'Birla Aerocon Precision AAC Insulating Blocks',
      'Natural Granite & German AC4 Wooden Laminate Flooring',
      'First-Grade Burma Teak Main Door & Multi-Chamber uPVC',
      'V-Guard Triple-Layer FRLS Wiring & Modular Controls',
      'Jaquar / Kohler Concealed Cisterns & Rain Showers',
      'Asian Paints Apcolite Washable Interior Emulsion',
    ],
    specs: {
      steel: 'Tata Tiscon',
      cement: 'UltraTech',
      masonry: 'Birla Aerocon AAC Blocks',
      flooring: {
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
        wireTier: 'Mid-range (V-Guard)',
        conduit: 'Heavy-Duty ISI Marked PVC',
      },
      bathroomFittings: {
        sanitaryTier: 'Premium (Jaquar / Kohler / Grohe)',
        cpvcBrand: 'Ashirwad',
      },
      painting: {
        baseLayer: 'Putty + Primer',
        internalPaint: 'Premium Emulsion',
        externalPaint: 'Ultima Weather Proof',
        brand: 'Asian Paints',
      },
    },
  },

  LUXURY: {
    id: 'LUXURY',
    title: 'Luxury',
    subtitle: 'Bespoke Finishes & High-End MEP',
    tagline: 'High-end materials, premium fixtures and greater customization for a refined finish.',
    description: 'High-end materials, premium fixtures and greater customization for a refined finish.',
    recommendationReason: 'Designed for homeowners who prioritize mirror-polished natural stones, bespoke solid joinery, and premium bath sanctuaries.',
    specificationTier: 'luxury',
    qualityTier: 'Luxury',
    keyHighlights: [
      'Tata Tiscon Super Ductile Rebar & UltraTech 53G Micro-fine',
      'Imported Italian Marble (Bottochino/Statuario) & Polished Granite',
      'Solid 45mm Burma Teak Main Door with Biometric Locks',
      'Acoustic Teak Wood / System Aluminium Double Glazing',
      'Polycab/Finolex Zero-Halogen FRLS-H Copper Wiring',
      'Toto / Grohe / Hansgrohe Thermostatic Multi-Flow Suites',
      'Asian Paints Royale Luxury Silk with Teflon Shield',
    ],
    specs: {
      steel: 'Tata Tiscon',
      cement: 'UltraTech',
      masonry: 'Birla Aerocon AAC Blocks',
      flooring: {
        living: 'Italian Marble',
        kitchenDining: 'Granite',
        bedrooms: 'Granite',
        bathrooms: 'Matte Finish Vitrified',
        parkingUtility: 'Flamed Granite',
        balconies: 'Wooden Finish Tiles',
      },
      wallCladding: {
        kitchenDadoHeight: '4 ft',
        bathroomTileHeight: 'Full Height (Ceiling)',
      },
      doors: {
        mainDoor: 'Burma Teak Custom Carved',
        internalDoor: 'Burma Teak Frame Flush',
        bathroomDoor: 'FRP / WPC Laminated',
      },
      windows: {
        primaryMaterial: 'Wood',
        subGrade: 'Teak Wood Frame',
      },
      electrical: {
        wireTier: 'Premium (Finolex / Polycab)',
        conduit: 'Heavy-Duty ISI Marked PVC',
      },
      bathroomFittings: {
        sanitaryTier: 'Luxury (Toto / Hansgrohe / Duravit)',
        cpvcBrand: 'Astral',
      },
      painting: {
        baseLayer: 'Putty + Primer',
        internalPaint: 'Royale Luxury Silk',
        externalPaint: 'Apex Ultima Protek',
        brand: 'Asian Paints Royale',
      },
    },
  },
};

/** Get package configuration by ID */
export function getPackageConfig(packageId: ConstructionPackageId | string): PackageSpecProfile {
  const normalized = (packageId || 'PREMIUM').toUpperCase() as ConstructionPackageId;
  return CONSTRUCTION_PACKAGES[normalized] || CONSTRUCTION_PACKAGES.PREMIUM;
}

/** Normalize package identifier safely */
export function normalizePackageId(raw: string | undefined | null): ConstructionPackageId {
  if (!raw) return 'PREMIUM';
  const u = raw.toUpperCase();
  if (u === 'STANDARD' || u === 'ESSENTIAL') return 'STANDARD';
  if (u === 'LUXURY') return 'LUXURY';
  return 'PREMIUM';
}

/**
 * Creates an EngineInput for a specific package using the base project geometry
 * without modifying any structural dimensions or room counts.
 */
export function createEngineInputForPackage(
  baseInput: EngineInput,
  packageId: ConstructionPackageId
): EngineInput {
  const pkg = getPackageConfig(packageId);

  return {
    ...baseInput,
    qualityTier: pkg.qualityTier,
    materialBrands: {
      ...baseInput.materialBrands,
      steel: pkg.specs.steel,
      cement: pkg.specs.cement,
      masonry: pkg.specs.masonry,
    },
    flooringZones: { ...pkg.specs.flooring },
    wallCladding: { ...pkg.specs.wallCladding },
    doors: { ...pkg.specs.doors },
    windows: { ...pkg.specs.windows },
    electrical: { ...pkg.specs.electrical },
    bathroomFittings: { ...pkg.specs.bathroomFittings },
    painting: { ...pkg.specs.painting },
  };
}

export interface MultiPackageComparisonResult {
  currentPackageId: ConstructionPackageId;
  results: Record<ConstructionPackageId, CalculationResult>;
  packageConfigs: Record<ConstructionPackageId, PackageSpecProfile>;
  recommendation: {
    recommendedPackageId: ConstructionPackageId;
    title: string;
    description: string;
    rationale: string;
  };
}

/**
 * Executes deterministic calculation engine independently for all 3 packages
 * without mutating current user state.
 */
export function computeMultiPackageComparison(
  baseInput: EngineInput,
  currentPackageId: ConstructionPackageId = 'PREMIUM'
): MultiPackageComparisonResult {
  const standardInput = createEngineInputForPackage(baseInput, 'STANDARD');
  const premiumInput = createEngineInputForPackage(baseInput, 'PREMIUM');
  const luxuryInput = createEngineInputForPackage(baseInput, 'LUXURY');

  const standardResult = runCalculator(standardInput);
  const premiumResult = runCalculator(premiumInput);
  const luxuryResult = runCalculator(luxuryInput);

  const recommendation = generateHuttyRecommendation(baseInput, {
    STANDARD: standardResult,
    PREMIUM: premiumResult,
    LUXURY: luxuryResult,
  });

  return {
    currentPackageId,
    results: {
      STANDARD: standardResult,
      PREMIUM: premiumResult,
      LUXURY: luxuryResult,
    },
    packageConfigs: CONSTRUCTION_PACKAGES,
    recommendation,
  };
}

/**
 * Generates an objective, non-dogmatic Hutty recommendation based on project characteristics.
 */
export function generateHuttyRecommendation(
  input: EngineInput,
  comparisonResults: Record<ConstructionPackageId, CalculationResult>
): {
  recommendedPackageId: ConstructionPackageId;
  title: string;
  description: string;
  rationale: string;
} {
  const bua = comparisonResults.PREMIUM?.area?.totalBUASqFt || 0;
  const floors = input.floors || 1;
  const isRental = input.houseType === 'Rental Units' || input.houseType === 'Mixed Use';

  if (isRental) {
    return {
      recommendedPackageId: 'STANDARD',
      title: 'Standard',
      description: 'Hutty recommends Standard for rental and mixed-use configurations.',
      rationale:
        'Based on your project requirements for rental/mixed-use living, Standard provides the optimal rental yield with certified structural longevity and easy-to-maintain finishes.',
    };
  }

  if (bua > 4500 || floors >= 4) {
    return {
      recommendedPackageId: 'PREMIUM',
      title: 'Premium',
      description: 'Hutty recommends Premium for large multi-storey residences.',
      rationale:
        'Based on your expansive built-up area and layout requirements, Premium provides high-ductility Tata Tiscon rebar, thermal AAC block masonry, and durable granite surfaces with disciplined cost control.',
    };
  }

  return {
    recommendedPackageId: 'PREMIUM',
    title: 'Premium',
    description: 'Hutty recommends Premium as the best overall balance.',
    rationale:
      'Based on your project requirements and selected preferences, Premium offers a balanced combination of quality, specifications and estimated cost.',
  };
}

export interface CustomizationItem {
  category: string;
  label: string;
  packageDefault: string;
  currentValue: string;
}

/**
 * Calculates which specifications have been customized relative to the selected package baseline.
 */
export function getCustomizationDiff(
  packageId: ConstructionPackageId,
  currentState: {
    materialBrands?: any;
    flooringZones?: any;
    wallCladding?: any;
    doors?: any;
    windows?: any;
    electrical?: any;
    bathroomFittings?: any;
    painting?: any;
  }
): CustomizationItem[] {
  const pkg = getPackageConfig(packageId);
  const diffs: CustomizationItem[] = [];

  // 1. Steel
  if (currentState.materialBrands?.steel && currentState.materialBrands.steel !== pkg.specs.steel) {
    diffs.push({
      category: 'Structure',
      label: 'TMT Steel',
      packageDefault: pkg.specs.steel,
      currentValue: currentState.materialBrands.steel,
    });
  }

  // 2. Cement
  if (currentState.materialBrands?.cement && currentState.materialBrands.cement !== pkg.specs.cement) {
    diffs.push({
      category: 'Structure',
      label: 'Portland Cement',
      packageDefault: pkg.specs.cement,
      currentValue: currentState.materialBrands.cement,
    });
  }

  // 3. Masonry
  if (currentState.materialBrands?.masonry && !currentState.materialBrands.masonry.includes(pkg.specs.masonry.split(' ')[0])) {
    diffs.push({
      category: 'Structure',
      label: 'Masonry Material',
      packageDefault: pkg.specs.masonry,
      currentValue: currentState.materialBrands.masonry,
    });
  }

  // 4. Flooring Zones
  if (currentState.flooringZones) {
    const zones = ['living', 'kitchenDining', 'bedrooms', 'bathrooms', 'parkingUtility', 'balconies'] as const;
    zones.forEach((z) => {
      const current = currentState.flooringZones[z];
      const baseline = pkg.specs.flooring[z];
      if (current && baseline && current !== baseline) {
        diffs.push({
          category: 'Flooring',
          label: `${z.charAt(0).toUpperCase() + z.slice(1)} Flooring`,
          packageDefault: baseline,
          currentValue: current,
        });
      }
    });
  }

  // 5. Doors
  if (currentState.doors?.mainDoor && currentState.doors.mainDoor !== pkg.specs.doors.mainDoor) {
    diffs.push({
      category: 'Doors',
      label: 'Main Door',
      packageDefault: pkg.specs.doors.mainDoor,
      currentValue: currentState.doors.mainDoor,
    });
  }

  // 6. Windows
  if (currentState.windows?.primaryMaterial && currentState.windows.primaryMaterial !== pkg.specs.windows.primaryMaterial) {
    diffs.push({
      category: 'Windows',
      label: 'Window System',
      packageDefault: `${pkg.specs.windows.primaryMaterial} (${pkg.specs.windows.subGrade})`,
      currentValue: `${currentState.windows.primaryMaterial} (${currentState.windows.subGrade || ''})`,
    });
  }

  // 7. Electrical
  if (currentState.electrical?.wireTier && currentState.electrical.wireTier !== pkg.specs.electrical.wireTier) {
    diffs.push({
      category: 'Electrical',
      label: 'Electrical Wiring',
      packageDefault: pkg.specs.electrical.wireTier,
      currentValue: currentState.electrical.wireTier,
    });
  }

  // 8. Bathroom
  if (currentState.bathroomFittings?.sanitaryTier && currentState.bathroomFittings.sanitaryTier !== pkg.specs.bathroomFittings.sanitaryTier) {
    diffs.push({
      category: 'Bathroom',
      label: 'Sanitary Fixtures',
      packageDefault: pkg.specs.bathroomFittings.sanitaryTier,
      currentValue: currentState.bathroomFittings.sanitaryTier,
    });
  }

  // 9. Paint
  if (currentState.painting?.internalPaint && currentState.painting.internalPaint !== pkg.specs.painting.internalPaint) {
    diffs.push({
      category: 'Painting',
      label: 'Interior Paint',
      packageDefault: `${pkg.specs.painting.internalPaint} (${pkg.specs.painting.brand})`,
      currentValue: `${currentState.painting.internalPaint} (${currentState.painting.brand || ''})`,
    });
  }

  return diffs;
}
