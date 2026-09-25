import { describe, it, expect, beforeEach } from 'vitest';
import { configVersionService } from '../../../server/src/services/configVersion.service';
import { rateService } from '../data/rateService';
import { configResolver } from '../config/configurationResolver';
import { runCalculator } from '../calculator';
import type { EngineInput } from '../types';

describe('Admin Calculation Formula System V2 — Backend Persistence & Customer Propagation', () => {
  const sampleInput: EngineInput = {
    city: 'Bangalore',
    authority: 'BBMP',
    plotLength: 30,
    plotWidth: 40,
    roadWidthFt: 30,
    builtUpAreaPerFloor: 1200,
    houseType: 'Duplex',
    floors: 2, // 2400 sq.ft total BUA
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
      balcony: 1,
      office: 0,
      pooja: 1,
      utility: 1,
      storeRoom: 0,
      commonToilets: 0,
    },
    materialBrands: {
      steel: 'Tata Tiscon',
      cement: 'UltraTech',
    },
    qualityTier: 'Premium',
  };

  beforeEach(() => {
    configResolver.resetToBaseline();
  });

  it('1. Admin draft persistence: creates and updates draft parameters on backend', async () => {
    const draft = await configVersionService.createDraftVersion({
      versionNumber: 'v2.1.0-draft-test',
      description: 'Test draft for RCC methodology customization',
      changeNote: 'Client requested footing allocation adjustment',
      adminEmail: 'admin@hutty.in',
    });

    expect(draft.id).toBeDefined();
    expect(draft.status).toBe('DRAFT');

    // Update draft with adjusted RCC footing allocation: 22% -> 25%
    const updateResult = await configVersionService.updateDraft(draft.id, {
      changeNote: 'Adjust footing allocation to 25%',
      adminEmail: 'admin@hutty.in',
      parameters: [
        {
          key: 'config.rcc.footing_allocation_pct',
          value: 25.0,
        },
      ],
    });

    expect(updateResult.success).toBe(true);

    // Retrieve draft from backend to verify persistence
    const retrieved = await configVersionService.getVersionById(draft.id);
    expect(retrieved).not.toBeNull();
    expect(retrieved.status).toBe('DRAFT');

    const paramList = Array.isArray(retrieved.parameters)
      ? retrieved.parameters
      : Array.from(retrieved.parameters.values());
    const footingParam = paramList.find((p: any) => p.key === 'config.rcc.footing_allocation_pct');
    expect(footingParam).toBeDefined();
    expect(footingParam.valueJson ?? footingParam.value).toBe(25.0);
  });

  it('2. Admin publish persistence: validates, publishes version, and marks it ACTIVE', async () => {
    const draft = await configVersionService.createDraftVersion({
      versionNumber: 'v2.2.0-test-publish',
      description: 'Publish test version',
      changeNote: 'Update footing allocation to 26%',
      adminEmail: 'admin@hutty.in',
    });

    await configVersionService.updateDraft(draft.id, {
      changeNote: 'Set footing allocation to 26%',
      adminEmail: 'admin@hutty.in',
      parameters: [
        {
          key: 'config.rcc.footing_allocation_pct',
          value: 26.0,
        },
      ],
    });

    const publishResult = await configVersionService.publishVersion({
      id: draft.id,
      adminEmail: 'chief.qs@hutty.in',
      acceptConflicts: true,
      conflictAcceptanceReason: 'Approved for client production release',
    });

    expect(publishResult.success).toBe(true);
    expect(publishResult.status).toBe('ACTIVE');

    // Verify published version is now ACTIVE in version store
    const activeVer = await configVersionService.getVersionById(draft.id);
    expect(activeVer.status).toBe('ACTIVE');

    // Verify audit trail recorded
    const audits = await configVersionService.getVersionAuditLogs(draft.id);
    expect(audits.some((a) => a.action === 'PUBLISH')).toBe(true);
  });

  it('3. Active config retrieval: resolves the published active version and parameters', async () => {
    const activeConfig = await configVersionService.getActiveConfiguration();
    expect(activeConfig.status).toBe('ACTIVE');
    expect(activeConfig.parameters).toBeDefined();
    expect(activeConfig.versionNumber).toBeDefined();
  });

  it('4. Customer config retrieval: syncActiveConfiguration reaches configResolver and updates calculation', async () => {
    // Baseline calculation with 22% footing allocation
    const baseCalc = runCalculator(sampleInput);
    const baseFootingConcrete = baseCalc.quantities.footingConcreteCuM;

    // Simulate customer config sync with 28% footing allocation
    configResolver.syncActiveConfiguration({
      versionNumber: 'v2.3.0-sync-test',
      parameters: {
        'config.rcc.footing_allocation_pct': 28.0,
        'config.rcc.concrete_factor_cum_sqft': 0.052,
      },
      source: 'POSTGRESQL',
    });

    // Customer calculator recalculates with active server config
    const updatedCalc = runCalculator(sampleInput);
    const updatedFootingConcrete = updatedCalc.quantities.footingConcreteCuM;

    expect(updatedFootingConcrete).toBeGreaterThan(baseFootingConcrete);
    // 28% vs 22% = ratio 28/22
    expect(updatedFootingConcrete).toBeCloseTo(baseFootingConcrete * (28 / 22), 1);
  });

  it('5. Publish failure handling: invalid parameter blocks publication and preserves active config', async () => {
    const draft = await configVersionService.createDraftVersion({
      versionNumber: 'v2.4.0-invalid-test',
      adminEmail: 'admin@hutty.in',
    });

    // Attempt to set a negative factor (schema violation)
    await configVersionService.updateDraft(draft.id, {
      adminEmail: 'admin@hutty.in',
      parameters: [
        {
          key: 'config.rcc.concrete_factor_cum_sqft',
          value: -0.05,
        },
      ],
    });

    // Publication should throw validation error
    await expect(
      configVersionService.publishVersion({
        id: draft.id,
        adminEmail: 'admin@hutty.in',
      })
    ).rejects.toThrow();

    // Draft remains DRAFT, never ACTIVE
    const draftStatus = await configVersionService.getVersionById(draft.id);
    expect(draftStatus.status).toBe('DRAFT');
  });

  it('6. Rollback persistence: restoring a historical version activates it and archives current', async () => {
    // 1. Create and publish Version A (footing: 23%)
    const verA = await configVersionService.createDraftVersion({
      versionNumber: 'v2.5.0-ver-A',
      adminEmail: 'admin@hutty.in',
    });
    await configVersionService.updateDraft(verA.id, {
      adminEmail: 'admin@hutty.in',
      parameters: [{ key: 'config.rcc.footing_allocation_pct', value: 23.0 }],
    });
    await configVersionService.publishVersion({
      id: verA.id,
      adminEmail: 'admin@hutty.in',
      acceptConflicts: true,
      conflictAcceptanceReason: 'Version A baseline',
    });

    // 2. Create and publish Version B (footing: 30%)
    const verB = await configVersionService.createDraftVersion({
      versionNumber: 'v2.5.0-ver-B',
      adminEmail: 'admin@hutty.in',
    });
    await configVersionService.updateDraft(verB.id, {
      adminEmail: 'admin@hutty.in',
      parameters: [{ key: 'config.rcc.footing_allocation_pct', value: 30.0 }],
    });
    await configVersionService.publishVersion({
      id: verB.id,
      adminEmail: 'admin@hutty.in',
      acceptConflicts: true,
      conflictAcceptanceReason: 'Version B update',
    });

    const activeBeforeRollback = await configVersionService.getActiveConfiguration();
    expect(activeBeforeRollback.parameters['config.rcc.footing_allocation_pct']).toBe(30.0);

    // 3. Rollback to Version A
    const rollbackRes = await configVersionService.rollbackToVersion({
      targetVersionId: verA.id,
      adminEmail: 'admin@hutty.in',
      reason: 'Rollback to Version A parameters',
    });

    expect(rollbackRes.success).toBe(true);

    // 4. Verify new ACTIVE configuration has Version A parameters (23%)
    const activeAfterRollback = await configVersionService.getActiveConfiguration();
    expect(activeAfterRollback.parameters['config.rcc.footing_allocation_pct']).toBe(23.0);
  });

  it('7. Formula propagation from Admin -> Customer: full round-trip verification', async () => {
    // Admin creates draft with custom structural concrete factor (0.060 instead of 0.052)
    const draft = await configVersionService.createDraftVersion({
      versionNumber: 'v2.6.0-factor-prop-test',
      adminEmail: 'admin@hutty.in',
    });

    await configVersionService.updateDraft(draft.id, {
      adminEmail: 'admin@hutty.in',
      parameters: [
        { key: 'config.rcc.concrete_factor_cum_sqft', value: 0.060 },
        { key: 'config.rcc.footing_allocation_pct', value: 25.0 },
      ],
    });

    await configVersionService.publishVersion({
      id: draft.id,
      adminEmail: 'admin@hutty.in',
      acceptConflicts: true,
      conflictAcceptanceReason: 'Client adjusted concrete volume requirement',
    });

    // Customer calculator fetches active config
    const serverActive = await configVersionService.getActiveConfiguration();
    configResolver.syncActiveConfiguration({
      versionNumber: serverActive.versionNumber,
      parameters: serverActive.parameters,
      source: 'POSTGRESQL',
    });

    const result = runCalculator(sampleInput);
    // BUA = 2400 sq.ft, Factor = 0.060 -> Total concrete approx = 144 m3
    expect(result.quantities.approxConcreteCuM).toBeCloseTo(2400 * 0.060, 1);
    // Footing = 25% of 144 = 36 m3
    expect(result.quantities.footingConcreteCuM).toBeCloseTo(144 * 0.25, 1);
  });

  it('8. Rate-only invariance: Material rate change modifies cost but leaves physical quantity untouched', async () => {
    const calc1 = runCalculator(sampleInput);
    const initialConcreteCuM = calc1.quantities.approxConcreteCuM;
    const initialCost = calc1.budget.totalProjectCost;

    // Simulate rate change (monetary change)
    rateService.setOverride({
      rateId: 'steel.fe550d_tmt',
      rate: 85000, // Increased steel rate per tonne
      unit: 'MT',
      category: 'Steel',
      location: 'ALL',
      packageTier: 'ALL',
      isActive: true,
    });

    const calc2 = runCalculator(sampleInput);
    const updatedConcreteCuM = calc2.quantities.approxConcreteCuM;
    const updatedCost = calc2.budget.totalProjectCost;

    // Physical volume MUST be 100% identical
    expect(updatedConcreteCuM).toBe(initialConcreteCuM);
    // Cost must reflect the rate increase
    expect(updatedCost).toBeGreaterThan(initialCost);
  });
});
