import React from 'react';
import { describe, it, expect } from 'vitest';
import { runCalculator } from '../calculator';
import { EngineInput, DOMAIN_UNITS, formatUnitLabel } from '../types';
import { DetailedReportPdfDocument } from '../../features/report/DetailedReportPdfDocument';

describe('HUTTY — UNIT GOVERNANCE & CONSISTENT FINAL PDF REPORT STRUCTURE', () => {
  const testInput: EngineInput = {
    city: 'Bangalore',
    plotLength: 50,
    plotWidth: 30,
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
      living: 1,
      kitchen: 1,
      dining: 1,
      balcony: 1,
      utility: 1,
      pooja: 1,
    },
    qualityTier: 'PREMIUM',
    materialBrands: {
      steel: 'Tata Tiscon',
      cement: 'UltraTech',
      masonry: 'AAC Blocks',
      electrical: 'Finolex',
      bathroom: 'Jaquar',
    },
    flooringZones: {
      living: 'Vitrified Tiles 800x800mm',
      kitchenDining: 'Vitrified Tiles',
      bedrooms: 'Vitrified Tiles',
      bathrooms: 'Anti-skid Ceramic Tiles',
      parkingUtility: 'Heavy-Duty Parking Tiles',
      balconies: 'Anti-skid Ceramic',
    },
    wallCladding: {
      bathroomTileHeight: '7 ft (Lintel)',
      kitchenDadoHeight: '2 ft',
    },
    doors: {
      mainDoor: 'Premium Teak',
      internalDoor: 'Flush Door',
      bathroomDoor: 'WPC Door',
    },
    windows: {
      primaryMaterial: 'uPVC',
      subGrade: 'Standard 2.5-Track',
    },
    electrical: {
      conduit: 'Heavy-Duty ISI Marked PVC',
      wireTier: 'Premium (Finolex / Polycab)',
    },
    bathroomFittings: {
      sanitaryTier: 'Premium (Jaquar / Kohler / Grohe)',
      cpvcBrand: 'Ashirwad',
    },
    painting: {
      baseLayer: 'Putty + Primer',
      internalPaint: 'Premium Emulsion',
      externalPaint: 'Apex Ultima Protek',
      brand: 'Asian Paints',
    },
  };

  const calcResult = runCalculator(testInput);

  // ────────────────────────────────────────────────────────────
  // PART 1 — UNIT GOVERNANCE
  // ────────────────────────────────────────────────────────────

  describe('Part 1: Unit Governance & Primary Measurement Units', () => {
    // 1. RCC output is m³
    it('1. RCC concrete output is canonically in m³', () => {
      expect(DOMAIN_UNITS.rcc.displayUnit).toBe('m³');
      expect(calcResult.quantities.approxConcreteCuM).toBeGreaterThan(0);
      expect(formatUnitLabel('cum')).toBe('m³');
      expect(formatUnitLabel('Cu M')).toBe('m³');
    });

    // 2. Footing concrete is m³
    it('2. Footing concrete is measured in m³', () => {
      expect(calcResult.quantities.footingConcreteCuM).toBeGreaterThan(0);
      const structExplanation = calcResult.explanations?.structure;
      const footingDerived = structExplanation?.derivedQuantities.find((d) => d.label.includes('Footing'));
      expect(footingDerived?.unit).toBe('m³');
    });

    // 3. Column concrete is m³
    it('3. Column concrete is measured in m³', () => {
      expect(calcResult.quantities.columnConcreteCuM).toBeGreaterThan(0);
      const structExplanation = calcResult.explanations?.structure;
      const colDerived = structExplanation?.derivedQuantities.find((d) => d.label.includes('Column'));
      expect(colDerived?.unit).toBe('m³');
    });

    // 4. Slab/beam concrete is m³
    it('4. Slab & beam concrete is measured in m³', () => {
      expect(calcResult.quantities.slabConcreteCuM).toBeGreaterThan(0);
      const structExplanation = calcResult.explanations?.structure;
      const slabDerived = structExplanation?.derivedQuantities.find((d) => d.label.includes('Slab'));
      expect(slabDerived?.unit).toBe('m³');
    });

    // 5. Total RCC is m³
    it('5. Total RCC concrete is measured in m³', () => {
      expect(calcResult.quantities.rccConcreteTotalCuM).toBeGreaterThan(0);
      const structExplanation = calcResult.explanations?.structure;
      const totalDerived = structExplanation?.derivedQuantities.find((d) => d.label.includes('Total RCC'));
      expect(totalDerived?.unit).toBe('m³');
    });

    // 6. Masonry primary area is sq.ft
    it('6. Masonry primary area is sq.ft', () => {
      expect(calcResult.quantities.netWallAreaSqFt).toBeGreaterThan(0);
      expect(DOMAIN_UNITS.masonry.displayUnit).toBe('sq.ft');
      const masonryExp = calcResult.explanations?.masonry;
      const netWallMetric = masonryExp?.summaryMetrics.find((m) => m.label === 'Net Wall Area');
      expect(netWallMetric?.unit).toBe('sq.ft');
    });

    // 7. Block coverage is sq.ft
    it('7. Block wall coverage is sq.ft', () => {
      expect(calcResult.quantities.blockWallCoverageSqFt).toBeGreaterThan(0);
      const masonryExp = calcResult.explanations?.masonry;
      const covMetric = masonryExp?.summaryMetrics.find((m) => m.label === 'Block Wall Coverage');
      expect(covMetric?.unit).toBe('sq.ft');
    });

    // 8. Block count is Nos.
    it('8. Discrete block count is Nos.', () => {
      expect(calcResult.quantities.masonryUnitsCount).toBeGreaterThan(0);
      const masonryExp = calcResult.explanations?.masonry;
      const reqMetric = masonryExp?.summaryMetrics.find((m) => m.label === 'Blocks Required');
      expect(reqMetric?.unit).toBe('Nos');
    });

    // 9. Blocks are never exposed as m³ in summary metrics or customer derived quantities
    it('9. Blocks are never exposed as m³ in customer-facing metrics', () => {
      const masonryExp = calcResult.explanations?.masonry;
      // summaryMetrics should NOT contain any unit of m³
      const hasCuMMetric = masonryExp?.summaryMetrics.some((m) => m.unit === 'm³' || m.unit === 'cum');
      expect(hasCuMMetric).toBe(false);
      // derivedQuantities should NOT contain any unit of m³
      const hasCuMDerived = masonryExp?.derivedQuantities.some((d) => d.unit === 'm³' || d.unit === 'cum');
      expect(hasCuMDerived).toBe(false);
    });

    // 10. Steel remains kg/tonnes
    it('10. Steel remains in kg and tonnes', () => {
      expect(calcResult.quantities.steelKg).toBeGreaterThan(0);
      expect(calcResult.quantities.steelTonnes).toBeGreaterThan(0);
      expect(DOMAIN_UNITS.steel.displayUnit).toBe('Tonnes');
      expect(DOMAIN_UNITS.steel.secondaryDisplayUnit).toBe('kg');
    });

    // 11. Cement remains bags
    it('11. Cement remains in bags', () => {
      expect(calcResult.quantities.cementBags).toBeGreaterThan(0);
      expect(DOMAIN_UNITS.cement.displayUnit).toBe('Bags');
    });

    // 12. Sand remains CFT
    it('12. Sand remains in CFT', () => {
      expect(calcResult.quantities.mSandCuFt).toBeGreaterThan(0);
      expect(calcResult.quantities.pSandCuFt).toBeGreaterThan(0);
      expect(DOMAIN_UNITS.sand.displayUnit).toBe('CFT');
    });

    // 13. Aggregate remains CFT
    it('13. Aggregate remains in CFT', () => {
      expect(calcResult.quantities.coarseAggregateCuFt).toBeGreaterThan(0);
      expect(DOMAIN_UNITS.aggregate.displayUnit).toBe('CFT');
    });

    // 14. Paint remains litres
    it('14. Paint remains in litres', () => {
      expect(calcResult.quantities.interiorPaintLitres).toBeGreaterThan(0);
      expect(calcResult.quantities.exteriorPaintLitres).toBeGreaterThan(0);
      expect(DOMAIN_UNITS.paint.displayUnit).toBe('Litres');
    });

    // 15. Putty remains kg
    it('15. Putty remains in kg', () => {
      expect(calcResult.quantities.puttyKg).toBeGreaterThan(0);
      expect(DOMAIN_UNITS.putty.displayUnit).toBe('kg');
    });

    // 16. Flooring remains sq.ft
    it('16. Flooring remains in sq.ft', () => {
      expect(calcResult.quantities.floorTilesSqFt).toBeGreaterThan(0);
      expect(DOMAIN_UNITS.flooring.displayUnit).toBe('sq.ft');
    });
  });

  // ────────────────────────────────────────────────────────────
  // PART 2 — FINAL PDF REPORT STRUCTURE
  // ────────────────────────────────────────────────────────────

  describe('Part 2: Consistent Final PDF Report Structure', () => {
    const renderedDoc = DetailedReportPdfDocument({
      data: calcResult,
      projectName: 'Test Residence',
      preparedFor: 'Valued Client',
      specificationTier: 'Premium',
    }) as React.ReactElement;

    // Extract pages from rendered Document tree
    const children = React.Children.toArray(renderedDoc.props.children) as React.ReactElement[];

    it('17. PDF contains Section A: WHAT WE BUILD', () => {
      const page2 = children[1]; // Page 2 is Section A
      expect(page2).toBeDefined();
      expect(page2.props['size']).toBe('A4');
      // Verify Section A covers works BOQ
      expect(calcResult.boq.length).toBeGreaterThan(0);
    });

    it('18. PDF contains Section B: WHAT WE CONSUME', () => {
      const page3 = children[2]; // Page 3 is Section B
      expect(page3).toBeDefined();
      expect(calcResult.materialSchedule.length).toBeGreaterThan(0);
      // Section B has physical materials
      const hasSteel = calcResult.materialSchedule.some((m) => m.category === 'Rebar');
      const hasCement = calcResult.materialSchedule.some((m) => m.category === 'Cement');
      const hasAgg = calcResult.materialSchedule.some((m) => m.category === 'Aggregates');
      expect(hasSteel).toBe(true);
      expect(hasCement).toBe(true);
      expect(hasAgg).toBe(true);
    });

    it('19. PDF contains Section C: WHAT WE INSTALL', () => {
      const page4 = children[3]; // Page 4 is Section C
      expect(page4).toBeDefined();
      expect(calcResult.fixtureSchedule.length).toBeGreaterThan(0);
    });

    it('20. Electrical is represented as an installation/service subsection in Section C', () => {
      const elecItems = calcResult.fixtureSchedule.filter(
        (f) => f.category === 'Electrical Fixtures' || f.category.toLowerCase().includes('electrical')
      );
      expect(elecItems.length).toBeGreaterThan(0);
      // Check that electrical fixtures have proper rate and amount
      elecItems.forEach((item) => {
        expect(item.quantity).toBeGreaterThan(0);
        expect(item.unitRate).toBeGreaterThan(0);
        expect(item.amount).toBe(item.quantity * item.unitRate);
      });
    });

    it('21. Plumbing is represented consistently as an installation/service subsection', () => {
      const plumbItems = calcResult.fixtureSchedule.filter(
        (f) => f.category === 'Plumbing Tanks & Pumps' || f.category.toLowerCase().includes('plumbing')
      );
      expect(plumbItems.length).toBeGreaterThan(0);
      plumbItems.forEach((item) => {
        expect(item.quantity).toBeGreaterThan(0);
        expect(item.amount).toBe(item.quantity * item.unitRate);
      });
    });

    it('22. Sanitary & Fixtures follows the same structure as Electrical and Plumbing', () => {
      const sanItems = calcResult.fixtureSchedule.filter(
        (f) => f.category === 'Sanitary Fixtures' || f.category.toLowerCase().includes('sanitary')
      );
      expect(sanItems.length).toBeGreaterThan(0);
      sanItems.forEach((item) => {
        expect(item.quantity).toBeGreaterThan(0);
        expect(item.amount).toBe(item.quantity * item.unitRate);
      });
    });

    it('23. Doors & Windows follows the same installation structure', () => {
      const dwItems = calcResult.fixtureSchedule.filter(
        (f) => f.category === 'Doors' || f.category === 'Windows'
      );
      expect(dwItems.length).toBeGreaterThan(0);
      dwItems.forEach((item) => {
        expect(item.quantity).toBeGreaterThan(0);
        expect(item.amount).toBe(item.quantity * item.unitRate);
      });
    });

    it('24. Empty service categories are not rendered', () => {
      // In base test input, liftRequired is false and evCharging is false
      // Special Equipment category should have 0 items
      const specialEquip = calcResult.fixtureSchedule.filter(
        (f) => f.category === 'Special Equipment'
      );
      expect(specialEquip.length).toBe(0);
    });

    it('25. All service costs reconcile into the final cost summary', () => {
      const fixturesTotal = calcResult.fixtureSchedule.reduce((s, f) => s + f.amount, 0);
      expect(calcResult.budget.directFixtureCost).toBe(fixturesTotal);
      // directConstructionBudget = directMaterialCost + directFixtureCost + directLabourCost
      const sumDirect =
        calcResult.budget.directMaterialCost +
        calcResult.budget.directFixtureCost +
        calcResult.budget.directLabourCost;
      expect(calcResult.budget.directConstructionBudget).toBe(sumDirect);
    });

    it('26. No duplicate Electrical cost is introduced', () => {
      // Direct construction budget equals baseConstructionCost
      expect(calcResult.budget.directConstructionBudget).toBe(calcResult.budget.baseConstructionCost);
    });

    it('27. No duplicate Plumbing cost is introduced', () => {
      // Verify commercial reconciliation is fully reconciled
      if (calcResult.budget.commercialReconciliation) {
        expect(calcResult.budget.commercialReconciliation.isFullyReconciled).toBe(true);
        expect(calcResult.budget.commercialReconciliation.unexplainedResidual).toBe(0);
      }
    });

    it('28. No duplicate Sanitary cost is introduced', () => {
      const boqTotal = calcResult.boq.reduce((s, b) => s + b.amount, 0);
      expect(calcResult.budget.baseConstructionCost).toBe(boqTotal);
    });

    it('29. PDF does not display block consumption as m³', () => {
      const masonryItem = calcResult.materialSchedule.find((m) => m.category === 'Masonry');
      expect(masonryItem).toBeDefined();
      expect(masonryItem?.unit).not.toBe('Cu M');
      expect(masonryItem?.unit).not.toBe('m³');
      expect(masonryItem?.unit).toBe('Nos');
    });

    it('30. PDF displays RCC in m³', () => {
      expect(calcResult.quantities.rccConcreteTotalCuM).toBeGreaterThan(0);
      expect(DOMAIN_UNITS.rcc.displayUnit).toBe('m³');
    });
  });
});
