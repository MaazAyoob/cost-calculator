import { useWizardStore } from '../store/useWizardStore';

export type SpecificationTier = 'standard' | 'premium' | 'luxury';

export interface RecommendationInfo {
  recommendedValue: string;
  badgeLabel: string;
  reason: string;
}

export function useRecommendations() {
  const specificationTier = useWizardStore((s) => s.specificationTier) || 'premium';

  // Tier Display Name & Badges
  const tierName = specificationTier === 'standard' ? 'Standard' : specificationTier === 'premium' ? 'Premium' : 'Luxury';

  const getTierBadge = () => {
    switch (specificationTier) {
      case 'standard':
        return 'Value choice';
      case 'luxury':
        return 'Luxury choice';
      case 'premium':
      default:
        return 'Best match for Premium';
    }
  };

  // 1. Core Structural Materials
  const getCoreMaterialsRecommendation = () => {
    switch (specificationTier) {
      case 'standard':
        return {
          steel: 'Indus TMT' as const,
          cement: 'Dalmia Bharat' as const,
          masonry: 'Solid Concrete Blocks',
          label: 'Standard Structural Spec',
          badge: 'Value choice',
          reason: 'Economical high-durability TMT bar with certified masonry blocks.',
        };
      case 'luxury':
        return {
          steel: 'Tata Tiscon' as const,
          cement: 'UltraTech' as const,
          masonry: 'Birla Aerocon AAC Blocks',
          label: 'Luxury Structural Spec',
          badge: 'Luxury choice',
          reason: 'Highest tensile strength Fe 550D rebar with precision thermal AAC blocks.',
        };
      case 'premium':
      default:
        return {
          steel: 'Tata Tiscon' as const,
          cement: 'UltraTech' as const,
          masonry: 'Birla Aerocon AAC Blocks',
          label: 'Premium Structural Spec',
          badge: 'Recommended for Premium',
          reason: 'Balanced seismic-grade Tata Tiscon rebar with UltraTech 53G concrete matrix.',
        };
    }
  };

  // 2. Flooring Recommendations per Zone
  const getFlooringRecommendation = (zoneKey: string): RecommendationInfo => {
    switch (zoneKey) {
      case 'living':
        if (specificationTier === 'standard') {
          return { recommendedValue: 'Vitrified Tiles 800x800mm', badgeLabel: 'Recommended for Standard', reason: 'Durable, stain-resistant high gloss finish.' };
        } else if (specificationTier === 'luxury') {
          return { recommendedValue: 'Italian Marble', badgeLabel: 'Recommended for Luxury', reason: 'Mirror polished imported marble with bookmatched veins.' };
        }
        return { recommendedValue: 'Granite Slab', badgeLabel: 'Recommended for Premium', reason: 'Natural polished South Indian stone for high-traffic elegance.' };

      case 'kitchenDining':
        if (specificationTier === 'standard') {
          return { recommendedValue: 'Vitrified Tiles', badgeLabel: 'Recommended for Standard', reason: 'Dual-coat low absorption tile.' };
        } else if (specificationTier === 'luxury') {
          return { recommendedValue: 'Granite', badgeLabel: 'Recommended for Luxury', reason: 'Heavy-duty natural stone resistant to spills and high heat.' };
        }
        return { recommendedValue: 'Matte Anti-Skid Vitrified', badgeLabel: 'Recommended for Premium', reason: 'Non-slip matte textured surface for kitchen safety.' };

      case 'bedrooms':
        if (specificationTier === 'standard') {
          return { recommendedValue: 'Vitrified Tiles', badgeLabel: 'Recommended for Standard', reason: 'Clean 600x600mm vitrified tiles with soft glaze.' };
        } else if (specificationTier === 'luxury') {
          return { recommendedValue: 'Granite', badgeLabel: 'Recommended for Luxury', reason: 'Cool natural granite for luxurious comfort.' };
        }
        return { recommendedValue: 'Wooden Laminate', badgeLabel: 'Recommended for Premium', reason: 'AC4 heavy residential German wooden laminate planks.' };

      case 'bathrooms':
        if (specificationTier === 'standard') {
          return { recommendedValue: 'Anti-skid Ceramic Tiles', badgeLabel: 'Recommended for Standard', reason: 'R10 safety certified anti-skid ceramic tiles.' };
        }
        return { recommendedValue: 'Matte Finish Vitrified', badgeLabel: 'Recommended for Premium', reason: 'Low-porosity matte vitrified floor tiles.' };

      case 'parkingUtility':
        if (specificationTier === 'standard') {
          return { recommendedValue: 'Heavy-Duty Parking Tiles', badgeLabel: 'Recommended for Standard', reason: 'Interlocking heavy vehicular paver tiles.' };
        }
        return { recommendedValue: 'Flamed Granite', badgeLabel: 'Recommended for Premium', reason: 'Thermal flamed rough texture non-slip granite stone.' };

      case 'balconies':
        if (specificationTier === 'standard') {
          return { recommendedValue: 'Anti-skid Ceramic', badgeLabel: 'Recommended for Standard', reason: 'Weather-resistant outdoor grade ceramic tiles.' };
        }
        return { recommendedValue: 'Wooden Finish Tiles', badgeLabel: 'Recommended for Premium', reason: 'Exterior timber grain porcelain plank tiles.' };

      default:
        return { recommendedValue: 'Vitrified Tiles 800x800mm', badgeLabel: 'Recommended', reason: 'General flooring recommendation.' };
    }
  };

  // 3. Wall Cladding & Dado
  const getWallCladdingRecommendation = () => {
    switch (specificationTier) {
      case 'standard':
        return {
          kitchenDadoHeight: '2 ft' as const,
          bathroomTileHeight: '7 ft (Lintel)' as const,
          badge: 'Standard Cladding',
        };
      case 'luxury':
      case 'premium':
      default:
        return {
          kitchenDadoHeight: '4 ft' as const,
          bathroomTileHeight: 'Full Height (Ceiling)' as const,
          badge: 'Recommended for Premium',
        };
    }
  };

  // 4. Doors Recommendations
  const getDoorRecommendation = (category: 'mainDoor' | 'internalDoor' | 'bathroomDoor') => {
    if (category === 'mainDoor') {
      if (specificationTier === 'standard') {
        return { recommendedValue: 'Normal Teak', badgeLabel: 'Recommended for Standard', reason: 'Commercial teakwood frame with seasoned polish.' };
      } else if (specificationTier === 'luxury') {
        return { recommendedValue: 'Burma Teak Custom Carved', badgeLabel: 'Recommended for Luxury', reason: 'Solid 45mm Burma Teakwood with artisan carvings and biometric lock.' };
      }
      return { recommendedValue: 'Premium Teak', badgeLabel: 'Recommended for Premium', reason: 'First-grade Burma Teakwood carved frame and 40mm shutter.' };
    }

    if (category === 'internalDoor') {
      if (specificationTier === 'luxury') {
        return { recommendedValue: 'Burma Teak Frame Flush', badgeLabel: 'Recommended for Luxury', reason: 'Burma teak jambs with high-grade veneered shutters.' };
      }
      return { recommendedValue: 'Flush Door', badgeLabel: 'Recommended', reason: 'BWP grade solid core flush doors.' };
    }

    // Bathroom Door
    if (specificationTier === 'standard') {
      return { recommendedValue: 'WPC Door', badgeLabel: 'Recommended for Standard', reason: '100% waterproof wood polymer composite doors.' };
    }
    return { recommendedValue: 'FRP / WPC Laminated', badgeLabel: 'Recommended for Premium', reason: 'Laminated moisture-sealed waterproof doors.' };
  };

  // 5. Windows Recommendation
  const getWindowRecommendation = () => {
    if (specificationTier === 'standard') {
      return {
        primaryMaterial: 'Aluminium' as const,
        subGrade: 'Anodized Aluminium',
        badgeLabel: 'Recommended for Standard',
        reason: 'Economical sliding aluminium section with clear float glass.',
      };
    } else if (specificationTier === 'luxury') {
      return {
        primaryMaterial: 'Wood' as const,
        subGrade: 'Teak Wood Frame',
        badgeLabel: 'Recommended for Luxury',
        reason: 'Seasoned teak wood frame with brass hardware and toughened acoustic glass.',
      };
    }
    return {
      primaryMaterial: 'uPVC' as const,
      subGrade: 'Standard uPVC',
      badgeLabel: 'Recommended for Premium',
      reason: 'Multichamber uPVC with toughened glass and SS mosquito mesh.',
    };
  };

  // 6. Electrical Recommendation
  const getElectricalRecommendation = () => {
    if (specificationTier === 'standard') {
      return {
        wireTier: 'Economy (Anchor)' as const,
        badgeLabel: 'Recommended for Standard',
        reason: 'Anchor by Panasonic FRLS copper wiring with modular switches.',
      };
    } else if (specificationTier === 'luxury') {
      return {
        wireTier: 'Premium (Finolex / Polycab)' as const,
        badgeLabel: 'Recommended for Luxury',
        reason: 'Zero-halogen low smoke Finolex/Polycab cables with Schneider automation readiness.',
      };
    }
    return {
      wireTier: 'Mid-range (V-Guard)' as const,
      badgeLabel: 'Recommended for Premium',
      reason: 'Triple layer insulated V-Guard FRLS high-conductivity wiring.',
    };
  };

  // 7. Bathroom Fittings Recommendation
  const getBathroomRecommendation = () => {
    if (specificationTier === 'standard') {
      return {
        sanitaryTier: 'Essential (Cera / Hindware / Parryware)',
        cpvcBrand: 'Supreme',
        badgeLabel: 'Recommended for Standard',
        reason: 'Standard ceramic wall-mount WC and chrome plated brass taps.',
      };
    } else if (specificationTier === 'luxury') {
      return {
        sanitaryTier: 'Luxury (Toto / Hansgrohe / Duravit)',
        cpvcBrand: 'Astral',
        badgeLabel: 'Recommended for Luxury',
        reason: 'Wall-hung rimless WC with thermostatic multi-flow shower and PVD finish.',
      };
    }
    return {
      sanitaryTier: 'Premium (Jaquar / Kohler / Grohe)',
      cpvcBrand: 'Ashirwad',
      badgeLabel: 'Recommended for Premium',
      reason: 'Concealed cistern closet, rain shower with thermostatic mixer and vanity basin.',
    };
  };

  // 8. Painting Recommendation
  const getPaintingRecommendation = () => {
    if (specificationTier === 'standard') {
      return {
        internalPaint: 'Tractor Emulsion',
        externalPaint: 'Ace Exterior Emulsion',
        brand: 'Berger Paints',
        badgeLabel: 'Recommended for Standard',
        reason: 'Economical smooth interior emulsion with primer base.',
      };
    } else if (specificationTier === 'luxury') {
      return {
        internalPaint: 'Royale Luxury Silk',
        externalPaint: 'Apex Ultima Protek',
        brand: 'Asian Paints Royale',
        badgeLabel: 'Recommended for Luxury',
        reason: 'Teflon surface protector luxury sheen with Teflon anti-fungal barrier.',
      };
    }
    return {
      internalPaint: 'Premium Emulsion',
      externalPaint: 'Ultima Weather Proof',
      brand: 'Asian Paints',
      badgeLabel: 'Recommended for Premium',
      reason: 'Washable Asian Paints Apcolite interior finish with weather-guard exterior coat.',
    };
  };

  return {
    specificationTier,
    tierName,
    getTierBadge,
    getCoreMaterialsRecommendation,
    getFlooringRecommendation,
    getWallCladdingRecommendation,
    getDoorRecommendation,
    getWindowRecommendation,
    getElectricalRecommendation,
    getBathroomRecommendation,
    getPaintingRecommendation,
  };
}
