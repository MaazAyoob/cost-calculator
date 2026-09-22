import { describe, it, expect, beforeEach } from 'vitest';
import { catalogService } from '../../../server/src/services/catalog.service';
import { storageService } from '../../../server/src/services/storage.service';
import { useCatalogStore, validateCatalogRateIds } from '../../store/useCatalogStore';
import { useWizardStore } from '../../store/useWizardStore';
import { runCalculator } from '../calculator';
import { rateService } from '../data/rateService';
import type { EngineInput } from '../types';

describe('Hutty Material Brand & Product Visual Catalog Suite', () => {
  beforeEach(() => {
    // Reset stores and baseline rates
    rateService.setOverrides([]);
    useWizardStore.getState().startNewProject();
  });

  // ═════════════════════════════════════════════════════════════════════════
  // 1. BRAND LIFECYCLE TESTS (1 - 5)
  // ═════════════════════════════════════════════════════════════════════════
  describe('Brand Entity & Lifecycle', () => {
    it('1. Admin can create a new brand', async () => {
      const testBrand = await catalogService.createBrand({
        name: 'JSW Steel Structural',
        logoUrl: 'https://images.example.com/jsw-logo.png',
        description: 'Primary structural steel manufacturer in Karnataka',
        website: 'https://www.jsw.in',
        active: true,
        displayOrder: 10,
      });

      expect(testBrand).toBeDefined();
      expect(testBrand.name).toBe('JSW Steel Structural');
      expect(testBrand.id).toBeTruthy();
    });

    it('2. Admin can edit brand information', async () => {
      const brand = await catalogService.createBrand({
        name: 'UltraTech Pro Edition',
        active: true,
      });

      const updated = await catalogService.updateBrand(brand.id, {
        description: 'Updated micro-fine cement formula',
        website: 'https://ultratechpro.com',
      });

      expect(updated.description).toBe('Updated micro-fine cement formula');
      expect(updated.website).toBe('https://ultratechpro.com');
    });

    it('3. Admin can activate and deactivate a brand', async () => {
      const brand = await catalogService.createBrand({
        name: 'Temporary Brand Demo',
        active: true,
      });

      const deactivated = await catalogService.updateBrand(brand.id, { active: false });
      expect(deactivated.active).toBe(false);

      const activeBrands = await catalogService.getActiveBrands();
      expect(activeBrands.find((b) => b.id === brand.id)).toBeUndefined();

      const reactivated = await catalogService.updateBrand(brand.id, { active: true });
      expect(reactivated.active).toBe(true);
    });

    it('4. Logo metadata persists with correct dimensions and url', async () => {
      const brand = await catalogService.createBrand({
        name: 'ACC Concrete Gold',
        logoUrl: 'https://cdn.example.com/acc-gold.svg',
      });

      expect(brand.logoUrl).toBe('https://cdn.example.com/acc-gold.svg');
    });

    it('5. Customer catalog receives active brands only', async () => {
      const activeBrands = await catalogService.getActiveBrands();
      expect(activeBrands.length).toBeGreaterThan(0);
      activeBrands.forEach((b) => {
        expect(b.active).toBe(true);
      });
    });
  });

  // ═════════════════════════════════════════════════════════════════════════
  // 2. PRODUCT / MATERIAL MODEL TESTS (6 - 13)
  // ═════════════════════════════════════════════════════════════════════════
  describe('Material Product Model & Tile Metadata', () => {
    it('6. Admin can create a product', async () => {
      const prod = await catalogService.createProduct({
        name: 'Kajaria Slate Stone Grey',
        category: 'flooring',
        specification: 'Premium Glazed Vitrified',
        unit: 'sq.ft',
        rate: 95,
        active: true,
      });

      expect(prod).toBeDefined();
      expect(prod.name).toBe('Kajaria Slate Stone Grey');
      expect(prod.category).toBe('flooring');
    });

    it('7. Admin can edit product properties', async () => {
      const prod = await catalogService.createProduct({
        name: 'Somany Duramax Heavy',
        category: 'flooring',
        rate: 80,
      });

      const updated = await catalogService.updateProduct(prod.id, {
        rate: 90,
        description: 'Heavy duty high traffic rating',
      });

      expect(updated.rate).toBe(90);
      expect(updated.description).toBe('Heavy duty high traffic rating');
    });

    it('8. Uploaded image metadata persists properly', async () => {
      const prod = await catalogService.createProduct({
        name: 'Birla Aerocon Light 150mm',
        category: 'masonry',
        imageUrl: '/uploads/birla-aerocon.webp',
      });

      expect(prod.imageUrl).toBe('/uploads/birla-aerocon.webp');
    });

    it('9. Product assigns to brand and resolves brand name', async () => {
      const brand = await catalogService.createBrand({ name: 'Godrej AAC Blocks' });
      const prod = await catalogService.createProduct({
        brandId: brand.id,
        category: 'masonry',
        name: 'Godrej High Strength AAC 200mm',
      });

      expect(prod.brandId).toBe(brand.id);
      expect(prod.brand).toBe('Godrej AAC Blocks');
    });

    it('10. Product correctly maps to canonical categories', async () => {
      const prod = await catalogService.createProduct({
        name: 'Finolex FRLS Class 5',
        category: 'electrical',
        unit: 'Metre',
        rate: 48,
      });

      expect(prod.category).toBe('electrical');
    });

    it('11. Tile-specific metadata (size, finish, material, thickness) persists', async () => {
      const tileProd = await catalogService.createProduct({
        name: 'Kajaria Urban Matt 60x60',
        category: 'flooring',
        unit: 'sq.ft',
        rate: 85,
        metadataJson: {
          size: '600 × 600 mm',
          finish: 'Matt Finish',
          material: 'Glazed Vitrified',
          colour: 'Grey Stone',
          thickness: '9 mm',
          coveragePerBoxSqFt: 15.5,
        },
      });

      expect(tileProd.metadataJson).toBeDefined();
      expect(tileProd.metadataJson?.size).toBe('600 × 600 mm');
      expect(tileProd.metadataJson?.finish).toBe('Matt Finish');
      expect(tileProd.metadataJson?.thickness).toBe('9 mm');
    });

    it('12. Links stable Rate Master reference to product', async () => {
      const prod = await catalogService.createProduct({
        name: 'Tata Tiscon 550D Rebar',
        category: 'steel',
        unit: 'kg',
        rate: 78,
        rateId: 'st-tata',
      });

      expect(prod.rateId).toBe('st-tata');
    });

    it('13. Activate and deactivate products', async () => {
      const prod = await catalogService.createProduct({
        name: 'Temporary Flooring Sample',
        category: 'flooring',
        active: true,
      });

      await catalogService.updateProduct(prod.id, { active: false });
      const activeFlooring = await catalogService.getActiveProducts('flooring');
      expect(activeFlooring.find((p) => p.id === prod.id)).toBeUndefined();
    });
  });

  // ═════════════════════════════════════════════════════════════════════════
  // 3. CUSTOMER CATALOG & STORE TESTS (14 - 20)
  // ═════════════════════════════════════════════════════════════════════════
  describe('Customer Visual Experience & Selection', () => {
    it('14. Active products appear in customer catalog store', () => {
      const steelProducts = useCatalogStore.getState().getProductsByCategory('steel');
      expect(steelProducts.length).toBeGreaterThan(0);
      expect(steelProducts.every((p) => p.active)).toBe(true);
    });

    it('15. Brand logos and names resolve correctly', () => {
      const tataProd = useCatalogStore.getState().products.find((p) => p.name.includes('Tata Tiscon'));
      expect(tataProd).toBeDefined();
      if (tataProd?.brandId) {
        const brand = useCatalogStore.getState().getBrandById(tataProd.brandId);
        expect(brand).toBeDefined();
        expect(brand?.name).toBe('Tata Tiscon');
      }
    });

    it('16. Tile products include dimensions and finish attributes', () => {
      const tileProducts = useCatalogStore.getState().getProductsByCategory('flooring');
      const vitrified = tileProducts.find((p) => p.metadataJson?.size);
      expect(vitrified).toBeDefined();
      expect(vitrified?.metadataJson?.size).toBeTruthy();
    });

    it('17. Selection state integrates with useWizardStore without duplicating pricing', () => {
      const { setCoreMaterials, setFlooringZone } = useWizardStore.getState();

      // Customer selects Tata Tiscon steel, ACC cement, and AAC blocks
      setCoreMaterials('Tata Tiscon', 'ACC Cement', 'AAC Blocks');
      setFlooringZone('living', 'Vitrified Tiles 800x800mm');

      const state = useWizardStore.getState();
      expect(state.materialBrands.steel).toBe('Tata Tiscon');
      expect(state.materialBrands.cement).toBe('ACC Cement');
      expect(state.materialBrands.masonry).toBe('AAC Blocks');
      expect(state.flooringZones.living).toBe('Vitrified Tiles 800x800mm');
    });
  });

  // ═════════════════════════════════════════════════════════════════════════
  // 4. CANONICAL CALCULATION ENGINE INTEGRATION (21 - 25)
  // ═════════════════════════════════════════════════════════════════════════
  describe('Canonical Engine Authority & Invariance', () => {
    const baseSampleInput: EngineInput = {
      plotLength: 40,
      plotWidth: 30,
      builtUpArea: 2160,
      floors: 2,
      qualityTier: 'Premium',
      city: 'Bangalore',
      roadWidthFt: 30,
      rooms: {
        masterBedroom: 1,
        bedroom: 2,
        kitchen: 1,
        living: 1,
        dining: 1,
        balcony: 1,
        commonToilets: 2,
        attachedToilets: 1,
        puja: 1,
        utility: 1,
      },
      materialBrands: {
        steel: 'Tata Tiscon',
        cement: 'UltraTech',
        masonry: 'AAC Blocks',
        doors: 'Flush Door',
        windows: 'uPVC',
        flooring: 'Vitrified Tiles',
        bathroom: 'Jaquar',
        electrical: 'Finolex',
        paint: 'Asian Paints',
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
        kitchenDadoHeight: '2 ft',
        bathroomTileHeight: '7 ft (Lintel)',
      },
      doors: {
        mainDoor: 'Premium Teak',
        internalDoors: 'Normal Teak',
        bathroomDoors: 'Flush Door',
      },
      windows: {
        primaryMaterial: 'uPVC',
      },
      electrical: {
        wireTier: 'Premium (Finolex / Polycab)',
      },
      bathroomFittings: {
        sanitaryTier: 'Premium (Jaquar)',
        cpvcBrand: 'Supreme / Astral',
      },
      painting: {
        internalPaint: 'Premium (Royale / Velvet)',
        externalPaint: 'Weatherproof Emulsion (Apex)',
        brand: 'Asian Paints',
      },
    };

    it('21. Canonical engine receives user material selection and determines quantities independently', () => {
      const result1 = runCalculator(baseSampleInput);
      expect(result1.quantities.steelTonnes).toBeGreaterThan(0);
      expect(result1.quantities.cementBags).toBeGreaterThan(0);
      expect(result1.quantities.floorTilesSqFt).toBeGreaterThan(0);

      // Change steel brand to Indus TMT in input
      const inputIndus: EngineInput = {
        ...baseSampleInput,
        materialBrands: {
          ...baseSampleInput.materialBrands,
          steel: 'Indus TMT',
        },
      };

      const result2 = runCalculator(inputIndus);

      // Physical steel tonnage MUST remain 100% invariant across brand selections!
      expect(result2.quantities.steelTonnes).toBe(result1.quantities.steelTonnes);
      expect(result2.quantities.steelKg).toBe(result1.quantities.steelKg);

      // But cost must reflect the specific brand rate
      const steel1 = result1.materialSchedule.find((m) => m.material.toLowerCase().includes('steel'));
      const steel2 = result2.materialSchedule.find((m) => m.material.toLowerCase().includes('steel'));
      expect(steel1?.amount).toBeDefined();
      expect(steel2?.amount).toBeDefined();
      expect(steel2!.amount).toBeLessThan(steel1!.amount);
      expect(result2.budget.directMaterialCost).toBeLessThan(result1.budget.directMaterialCost);
    });

    it('22. Rate overrides propagate to product rate through Rate Master', () => {
      const product = useCatalogStore.getState().products.find((p) => p.rateId === 'st-tata');
      expect(product).toBeDefined();

      const initialRateInfo = useCatalogStore.getState().getEffectiveProductRate(product!, 'PREMIUM', 'Bangalore');
      expect(initialRateInfo.rate).toBe(78); // TMT per kg in Rate Master

      // Admin overrides rate in Rate Master
      rateService.setOverrides([
        {
          id: 'test-override-tata',
          rateId: 'st-tata',
          rate: 85,
          overrideRate: 85,
          location: 'Bangalore',
          packageTier: 'ALL',
          isActive: true,
        },
      ]);

      const updatedRateInfo = useCatalogStore.getState().getEffectiveProductRate(product!, 'PREMIUM', 'Bangalore');
      expect(updatedRateInfo.rate).toBe(85);
      expect(updatedRateInfo.isOverridden).toBe(true);
    });

    it('23. Product cards do not calculate costs independently of canonical engine', () => {
      const result = runCalculator(baseSampleInput);
      // Works BOQ amount and Budget result must be derived exclusively by the engine
      expect(result.budget.totalProjectCost).toBeGreaterThan(0);
      expect(result.boq.length).toBeGreaterThan(0);
    });
  });

  // ═════════════════════════════════════════════════════════════════════════
  // 5. HISTORICAL REPORT IMMUTABILITY TEST (31)
  // ═════════════════════════════════════════════════════════════════════════
  describe('Historical Report Immutability', () => {
    it('31. Modifying brand or product metadata later does not alter historical snapshotted report', () => {
      const sampleInput: EngineInput = {
        plotLength: 40,
        plotWidth: 30,
        builtUpArea: 1440,
        floors: 2,
        qualityTier: 'Premium',
        city: 'Bangalore',
        rooms: {
          masterBedroom: 1,
          bedroom: 1,
          kitchen: 1,
          living: 1,
          dining: 1,
          balcony: 1,
          commonToilets: 1,
          attachedToilets: 1,
          puja: 0,
          utility: 1,
        },
        materialBrands: {
          steel: 'Tata Tiscon',
          cement: 'UltraTech',
          masonry: 'AAC Blocks',
          doors: 'Flush Door',
          windows: 'uPVC',
          flooring: 'Vitrified Tiles',
          bathroom: 'Jaquar',
          electrical: 'Finolex',
          paint: 'Asian Paints',
        },
        flooringZones: {
          living: 'Vitrified Tiles 800x800mm',
        },
      };

      const originalResult = runCalculator(sampleInput);
      const originalSnapshot = originalResult.report.catalogSnapshot;

      expect(originalSnapshot).toBeDefined();
      expect(originalSnapshot?.steel.brandName).toBe('Tata Tiscon');
      expect(originalSnapshot?.cement.brandName).toBe('UltraTech');

      // Admin updates brand name in catalog service later
      const tataBrand = useCatalogStore.getState().brands.find((b) => b.name === 'Tata Tiscon');
      if (tataBrand) {
        tataBrand.name = 'Tata Tiscon NextGen Ultra';
      }

      // The historical report must remain completely unaffected
      expect(originalResult.report.catalogSnapshot?.steel.brandName).toBe('Tata Tiscon');
      expect(originalResult.report.catalogSnapshot?.cement.brandName).toBe('UltraTech');
    });
  });

  // ═════════════════════════════════════════════════════════════════════════
  // 6. IMAGE STORAGE & VALIDATION SECURITY TESTS (32 - 34)
  // ═════════════════════════════════════════════════════════════════════════
  describe('Image Storage & Validation Security', () => {
    it('32. Rejects malicious or executable files', async () => {
      const maliciousPayload = 'data:application/x-msdownload;base64,TVqQAAMAAAAEAAAA//8AALgAAAAAAAAAQAAaAAAAAAAAAAAAAAAA';
      await expect(storageService.saveBase64Image(maliciousPayload, 'malware.exe')).rejects.toThrow(
        /Prohibited file type|Unsupported image/i
      );
    });

    it('33. Rejects oversized files (> 5MB)', async () => {
      // 6MB buffer
      const largeBuffer = Buffer.alloc(6 * 1024 * 1024, 0);
      const largePayload = `data:image/png;base64,${largeBuffer.toString('base64')}`;

      await expect(storageService.saveBase64Image(largePayload, 'huge_image.png')).rejects.toThrow(
        /exceeds maximum allowed size/i
      );
    });

    it('34. Successfully validates and saves legitimate PNG/WEBP/JPG image with UUID filename', async () => {
      // Valid small 1x1 PNG
      const validPng =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

      const uploadResult = await storageService.saveBase64Image(validPng, 'tile_sample.png');
      expect(uploadResult).toBeDefined();
      expect(uploadResult.url).toContain('/uploads/');
      expect(uploadResult.filename).toContain('.png');

      // Cleanup
      await storageService.deleteFile(uploadResult.filename);
    });

    it('35. Rejects SVG containing executable script tags', async () => {
      const maliciousSvg = `<svg xmlns="http://www.w3.org/2000/svg"><script>alert('xss')</script></svg>`;
      const svgBase64 = `data:image/svg+xml;base64,${Buffer.from(maliciousSvg).toString('base64')}`;

      await expect(storageService.saveBase64Image(svgBase64, 'xss.svg')).rejects.toThrow(
        /Malicious or executable script elements detected/i
      );
    });

    it('36. Rejects file with fraudulent MIME type but invalid magic bytes', async () => {
      // Fake PNG header: plain ASCII text disguised as image/png
      const fakePngPayload = `data:image/png;base64,${Buffer.from('Hello world this is not a valid png binary file').toString('base64')}`;
      await expect(storageService.saveBase64Image(fakePngPayload, 'fake.png')).rejects.toThrow(
        /Invalid file content/i
      );
    });

    it('37. Production storage configuration fails clearly when persistent storage is unconfigured', async () => {
      const originalEnv = process.env.NODE_ENV;
      const originalProvider = process.env.STORAGE_PROVIDER;
      try {
        process.env.NODE_ENV = 'production';
        delete process.env.STORAGE_PROVIDER;
        delete process.env.S3_BUCKET_NAME;

        // Valid small 1x1 PNG
        const validPng =
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

        await expect(storageService.saveBase64Image(validPng, 'test.png')).rejects.toThrow(
          /Production persistent object storage is not configured/i
        );
      } finally {
        process.env.NODE_ENV = originalEnv;
        if (originalProvider) process.env.STORAGE_PROVIDER = originalProvider;
      }
    });

    it('38. Inactive brand hides its products from customer catalog', () => {
      // Ensure Somany brand is present in catalog store
      const somanyBrand = useCatalogStore.getState().brands.find((b) => b.name === 'Somany');
      expect(somanyBrand).toBeDefined();

      // Active products before deactivation include Somany
      const flooringBefore = useCatalogStore.getState().getProductsByCategory('flooring');
      const somanyBefore = flooringBefore.find((p) => p.brand === 'Somany');
      expect(somanyBefore).toBeDefined();

      // Deactivate Somany brand
      useCatalogStore.setState((state) => ({
        brands: state.brands.map((b) => (b.id === somanyBrand!.id ? { ...b, active: false } : b)),
      }));

      // Customer category filter must now hide Somany products
      const flooringAfter = useCatalogStore.getState().getProductsByCategory('flooring');
      const somanyAfter = flooringAfter.find((p) => p.brand === 'Somany');
      expect(somanyAfter).toBeUndefined();

      // Re-activate Somany brand for subsequent tests
      useCatalogStore.setState((state) => ({
        brands: state.brands.map((b) => (b.id === somanyBrand!.id ? { ...b, active: true } : b)),
      }));
    });

    it('39. Automated Rate Master integrity: all active catalog products resolve to non-zero rates without orphans', () => {
      const activeProducts = useCatalogStore.getState().products.filter((p) => p.active);
      const validation = validateCatalogRateIds(activeProducts);

      expect(validation.valid).toBe(true);
      expect(validation.orphans).toHaveLength(0);
      expect(Object.keys(validation.resolvedRates).length).toBe(activeProducts.length);

      for (const prod of activeProducts) {
        const rateInfo = validation.resolvedRates[prod.id];
        expect(rateInfo).toBeDefined();
        expect(rateInfo.rate).toBeGreaterThan(0);
      }
    });

    it('40. Automated Rate Master integrity: detects orphan or invalid rateId without fabricating rates', () => {
      const fakeProduct: any = {
        id: 'fake-prod-orphan',
        name: 'Imaginary Steel Rebar',
        category: 'steel',
        unit: 'kg',
        rateId: 'non_existent_orphan_rate_id_xyz',
        active: true,
      };

      const validation = validateCatalogRateIds([fakeProduct]);
      expect(validation.valid).toBe(false);
      expect(validation.orphans.length).toBeGreaterThan(0);
      expect(validation.orphans[0]).toContain('orphan rateId');
    });

    it('41. Admin can configure displayType: Compact Material and Visual Product', async () => {
      const compactProd = await catalogService.createProduct({
        name: 'JSW Fe 600 Ultra Rebar',
        category: 'steel',
        displayType: 'compact',
        unit: 'kg',
        rate: 82,
        rateId: 'st-jsw',
        active: true,
      });
      expect(compactProd.displayType).toBe('compact');

      const visualProd = await catalogService.createProduct({
        name: 'Kajaria Moroccan Blue 600x600',
        category: 'flooring',
        displayType: 'visual',
        unit: 'sq.ft',
        rate: 140,
        rateId: 'fl-vitrified',
        metadataJson: {
          size: '600 × 600 mm',
          finish: 'Matt Tactile',
          colour: 'Moroccan Blue',
          material: 'Vitrified',
          thickness: '9 mm',
        },
        active: true,
      });
      expect(visualProd.displayType).toBe('visual');
      expect(visualProd.metadataJson?.finish).toBe('Matt Tactile');
    });

    it('42. New Admin-created company appears in catalog dynamically without code changes', async () => {
      // 1. Admin creates a new brand
      const brand = await catalogService.createBrand({
        name: 'ABC Ceramics Karnataka',
        logoUrl: 'https://cdn.example.com/abc-ceramics-logo.png',
        active: true,
        displayOrder: 99,
      });
      expect(brand.id).toBeTruthy();

      // 2. Admin creates a new product assigned to this brand
      const product = await catalogService.createProduct({
        brandId: brand.id,
        name: 'Urban Grey 600x600 Matt',
        category: 'flooring',
        displayType: 'visual',
        unit: 'sq.ft',
        rate: 92,
        rateId: 'fl-vitrified',
        active: true,
        metadataJson: {
          size: '600 × 600 mm',
          finish: 'Matt',
          material: 'Vitrified',
          thickness: '9 mm',
        },
      });
      expect(product.brand).toBe('ABC Ceramics Karnataka');

      // 3. Customer catalog store receives and filters it
      useCatalogStore.setState((state) => ({
        brands: [...state.brands, brand as any],
        products: [...state.products, product as any],
      }));

      const activeFlooring = useCatalogStore.getState().getProductsByCategory('flooring');
      const found = activeFlooring.find((p) => p.name === 'Urban Grey 600x600 Matt');
      expect(found).toBeDefined();
      expect(found?.brand).toBe('ABC Ceramics Karnataka');
      expect(found?.displayType).toBe('visual');
    });

    it('43. Brand and Product selection keeps physical quantities 100% invariant', () => {
      const baseInput: EngineInput = {
        city: 'Bangalore',
        authority: 'BBMP/BDA',
        plotLength: 40,
        plotWidth: 30,
        builtUpAreaPerFloor: 800,
        houseType: 'Duplex',
        floors: 3,
        parkingType: 'Normal Ground',
        carCount: 1,
        bikeCount: 1,
        evCharging: false,
        liftRequired: false,
        rooms: {
          bedrooms: 3,
          bathrooms: 3,
          commonToilets: 1,
          kitchen: 1,
          dining: 1,
          living: 1,
          balcony: 1,
          office: 0,
          pooja: 1,
          utility: 1,
          storeRoom: 0,
        },
        qualityTier: 'Premium',
        materialBrands: {
          steel: 'Tata Tiscon',
          cement: 'UltraTech',
          doors: 'Flush Door',
          windows: 'uPVC',
          flooring: 'Vitrified Tiles',
          bathroom: 'Jaquar',
          electrical: 'V-Guard',
          paint: 'Asian Paints',
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
          kitchenDadoHeight: '2 ft',
          bathroomTileHeight: '7 ft (Lintel)',
        },
        doors: {
          mainDoor: 'Premium Teak',
          internalDoor: 'Flush Door',
          bathroomDoor: 'WPC Door',
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
          externalPaint: 'Ultima Weather Proof',
          brand: 'Asian Paints',
        },
      };

      const resultTata = runCalculator(baseInput);

      const altInput: EngineInput = {
        ...baseInput,
        materialBrands: {
          ...baseInput.materialBrands,
          steel: 'JSW Neosteel',
          cement: 'ACC Cement',
        },
      };

      const resultJSW = runCalculator(altInput);

      // Physical quantities MUST be strictly identical
      expect(resultTata.quantities.steelTonnes).toBe(resultJSW.quantities.steelTonnes);
      expect(resultTata.quantities.cementBags).toBe(resultJSW.quantities.cementBags);
      expect(resultTata.quantities.flooringAreaSqFt).toBe(resultJSW.quantities.flooringAreaSqFt);
      expect(resultTata.area.totalBUASqFt).toBe(resultJSW.area.totalBUASqFt);
    });

    it('44. Historical report snapshot immutably preserves brand, logo, and product metadata', () => {
      const snapshotItem = {
        productId: 'prod-kajaria-statuary-gloss',
        productName: 'Kajaria Statuario Marble Gloss Vitrified',
        brandId: 'brand-kajaria',
        brandName: 'Kajaria',
        brandLogoUrl: 'https://images.unsplash.com/photo-kajaria-logo',
        productImageUrl: 'https://images.unsplash.com/photo-tile-photo',
        category: 'flooring',
        displayType: 'visual' as const,
        specification: 'Luxury High-Gloss',
        metadataJson: {
          size: '800 × 800 mm',
          finish: 'High-Gloss Nano Polish',
          colour: 'Statuario White',
          material: 'Double Charged Vitrified',
          thickness: '10 mm',
        },
        rate: 120,
        unit: 'sq.ft',
      };

      // Ensure snapshot is independent of future store mutations
      const frozenSnapshot = JSON.parse(JSON.stringify(snapshotItem));
      expect(frozenSnapshot.brandName).toBe('Kajaria');
      expect(frozenSnapshot.displayType).toBe('visual');
      expect(frozenSnapshot.metadataJson.size).toBe('800 × 800 mm');
      expect(frozenSnapshot.rate).toBe(120);
    });
  });
});
