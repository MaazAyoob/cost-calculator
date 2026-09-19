// ============================================================
// PHASE 2C: CONFIGURATION VERSIONING LIFECYCLE & PERSISTENCE TEST SUITE
// Tests for Draft creation, Validation, Simulation, Publishing,
// Immutability, Conflict Registry, Rollback, and Fail-Closed Safety.
// ============================================================

import { describe, it, expect, beforeEach } from 'vitest';
import { configVersionService } from '../../../server/src/services/configVersion.service';
import { configResolver } from '../config/configurationResolver';
import { runCalculator } from '../calculator';
import { EngineInput } from '../types';

describe('Phase 2C: Configuration Versioning Lifecycle & Persistence', () => {
  beforeEach(() => {
    configResolver.resetToBaseline();
  });

  // ── 1. Draft Creation & Parameter Isolation ──
  it('1. Admin can create a new Draft version based on active baseline', async () => {
    const draft = await configVersionService.createDraftVersion({
      versionNumber: 'v1.1.0-test-draft',
      description: 'Test draft for structural parameter optimization',
      changeNote: 'Adjusting wall height and rebar factors',
      adminEmail: 'lead-architect@hutty.in',
    });

    expect(draft.id).toBeDefined();
    expect(draft.versionNumber).toBe('v1.1.0-test-draft');
    expect(draft.status).toBe('DRAFT');
    expect(draft.parametersCount).toBeGreaterThanOrEqual(30);

    // Fetch version details
    const fullVer = await configVersionService.getVersionById(draft.id);
    expect(fullVer).not.toBeNull();
    expect(fullVer.status).toBe('DRAFT');
    expect(fullVer.createdBy).toBe('lead-architect@hutty.in');
  });

  it('2. Editing Draft parameters does NOT alter production ACTIVE resolution', async () => {
    const draft = await configVersionService.createDraftVersion({
      versionNumber: 'v1.2.0-isolated-draft',
      adminEmail: 'admin@hutty.in',
    });

    // Update draft parameter: increase wall height from 10.0 to 12.5 ft
    await configVersionService.updateDraft(draft.id, {
      parameters: [{ key: 'config.structure.wall_height_ft', value: 12.5 }],
      adminEmail: 'admin@hutty.in',
      changeNote: 'Increased clear wall height to 12.5ft for villa spec',
    });

    // Verify draft has updated value
    const updatedDraft = await configVersionService.getVersionById(draft.id);
    const draftParam = updatedDraft.parameters.find(
      (p: any) => p.key === 'config.structure.wall_height_ft'
    );
    expect(draftParam.valueJson ?? draftParam.value).toBe(12.5);

    // Verify production ACTIVE resolution still resolves baseline 10.0 ft!
    const activeConfig = await configVersionService.getActiveConfiguration();
    expect(activeConfig.parameters['config.structure.wall_height_ft']).toBe(10.0);

    // Engine resolution in public calculator remains 10.0 ft
    const resolvedInEngine = configResolver.resolveParameter('config.structure.wall_height_ft');
    expect(resolvedInEngine).toBe(10.0);
  });

  // ── 2. Server-side Validation & Critical Divisor Checks ──
  it('3. Validation rejects NaN, Infinity, negative values, and critical zero divisors', async () => {
    const draft = await configVersionService.createDraftVersion({
      versionNumber: 'v1.3.0-validation-draft',
      adminEmail: 'qa@hutty.in',
    });

    // Inject invalid values into draft
    await configVersionService.updateDraft(draft.id, {
      parameters: [
        { key: 'config.structure.wall_height_ft', value: 0 }, // Critical zero divisor!
        { key: 'config.rcc.steel_base_factor_kg_sqft', value: -1.5 }, // Negative value!
        { key: 'config.paint.interior_coverage_sqft_per_litre', value: NaN }, // NaN!
      ],
      adminEmail: 'qa@hutty.in',
    });

    const report = await configVersionService.validateVersion(draft.id, 'qa@hutty.in');

    expect(report.schemaValid).toBe(false);
    expect(report.validationStatus).toBe('INVALID');
    expect(report.schemaErrors.length).toBeGreaterThanOrEqual(3);

    const wallHeightErr = report.schemaErrors.find(
      (e) => e.key === 'config.structure.wall_height_ft'
    );
    expect(wallHeightErr).toBeDefined();
    expect(wallHeightErr?.error).toContain('cannot be zero');

    const steelErr = report.schemaErrors.find(
      (e) => e.key === 'config.rcc.steel_base_factor_kg_sqft'
    );
    expect(steelErr).toBeDefined();
    expect(steelErr?.error).toContain('cannot be negative');

    const paintErr = report.schemaErrors.find(
      (e) => e.key === 'config.paint.interior_coverage_sqft_per_litre'
    );
    expect(paintErr).toBeDefined();
    expect(paintErr?.error).toContain('NaN');
  });

  // ── 3. Conflict Registry Integration ──
  it('4. Distinguishes SCHEMA_VALID from BUSINESS_REVIEW_REQUIRED for flagged conflicts', async () => {
    const draft = await configVersionService.createDraftVersion({
      versionNumber: 'v1.4.0-conflict-check',
      adminEmail: 'admin@hutty.in',
    });

    // Run validation on standard draft with baseline parameters
    const report = await configVersionService.validateVersion(draft.id, 'admin@hutty.in');

    // Schema is valid (no NaN, no negatives, within bounds)
    expect(report.schemaValid).toBe(true);
    expect(report.validationStatus).toBe('VALID');

    // But contains business conflict warnings requiring review
    expect(report.requiresBusinessReview).toBe(true);
    expect(report.conflictWarnings.length).toBe(5);

    const paintConflict = report.conflictWarnings.find(
      (c) => c.key === 'config.paint.interior_coverage_sqft_per_litre'
    );
    expect(paintConflict).toBeDefined();
    expect(paintConflict?.effectiveValue).toBe(45);
    expect(paintConflict?.alternateValue).toBe(60);
    expect(paintConflict?.status).toBe('CONFLICT_REQUIRES_REVIEW');

    const marginConflict = report.conflictWarnings.find(
      (c) => c.key === 'config.commercial.contractor_margin'
    );
    expect(marginConflict).toBeDefined();
    expect(marginConflict?.effectiveValue).toBe(15);
  });

  // ── 4. Server-Side Simulation (What-If Delta Analysis) ──
  it('5. Server-side simulation computes exact cost and quantity deltas between Active and Draft', async () => {
    const draft = await configVersionService.createDraftVersion({
      versionNumber: 'v1.5.0-simulation-draft',
      adminEmail: 'economist@hutty.in',
    });

    // In draft: increase steel from 2.8 to 3.5 kg/sqft and paint coverage from 45 to 60 sqft/L
    await configVersionService.updateDraft(draft.id, {
      parameters: [
        { key: 'config.rcc.steel_base_factor_kg_sqft', value: 3.5 },
        { key: 'config.paint.interior_coverage_sqft_per_litre', value: 60 },
      ],
      adminEmail: 'economist@hutty.in',
      changeNote: 'Simulation trial for higher steel spec and higher paint coverage',
    });

    const sim = await configVersionService.simulateVersion(draft.id, 'economist@hutty.in');

    expect(sim.versionNumber).toBe('v1.5.0-simulation-draft');
    expect(sim.baseVersionNumber).toBe('v1.0.0');
    expect(sim.projectSummary.builtUpAreaSqFt).toBe(2400);

    // Financial deltas
    expect(sim.financialDelta.activeTotalCost).toBeGreaterThan(0);
    expect(sim.financialDelta.draftTotalCost).toBeGreaterThan(0);
    expect(sim.financialDelta.costDifference).not.toBe(0);

    // Quantity deltas
    const steelDelta = sim.quantityDeltas.find((q) => q.item === 'Structural Steel Rebar');
    expect(steelDelta).toBeDefined();
    expect(steelDelta?.draftQuantity).toBeGreaterThan(steelDelta?.activeQuantity || 0);

    const paintDelta = sim.quantityDeltas.find((q) => q.item === 'Interior Emulsion Paint');
    expect(paintDelta).toBeDefined();
    // Higher spread rate (60 vs 45) means fewer litres required!
    expect(paintDelta?.draftQuantity).toBeLessThan(paintDelta?.activeQuantity || 9999);

    // Affected BOQ lines & report sections
    expect(sim.affectedBOQLines).toContain('Reinforcement TMT Steel Fe 550D');
    expect(sim.affectedBOQLines).toContain('Interior Acrylic Emulsion Paint');
    expect(sim.affectedReportSections).toContain('Structural RCC Schedule');
  });

  // ── 5. Publishing Safety & Transaction Rollback ──
  it('6. Publishing rejects versions with unresolved conflicts unless explicitly accepted with reason', async () => {
    const draft = await configVersionService.createDraftVersion({
      versionNumber: 'v1.6.0-publish-guard',
      adminEmail: 'admin@hutty.in',
    });

    // Attempting to publish without accepting conflicts fails closed
    await expect(
      configVersionService.publishVersion({
        id: draft.id,
        adminEmail: 'admin@hutty.in',
        acceptConflicts: false,
      })
    ).rejects.toThrow(/unresolved business parameter conflicts/);

    // Publishing with acceptConflicts: true and valid reason succeeds
    const publishRes = await configVersionService.publishVersion({
      id: draft.id,
      adminEmail: 'lead-qs@hutty.in',
      acceptConflicts: true,
      conflictAcceptanceReason: 'Approved by Client Quantity Surveyor Review Committee on Sep 19',
    });

    expect(publishRes.success).toBe(true);
    expect(publishRes.status).toBe('ACTIVE');
    expect(publishRes.publishedBy).toBe('lead-qs@hutty.in');

    // The published version is now the active configuration in resolver
    const active = await configVersionService.getActiveConfiguration();
    expect(active.versionNumber).toBe('v1.6.0-publish-guard');
  });

  // ── 6. Version Comparison (A vs B) ──
  it('7. Version comparison accurately reports added, removed, changed, and unchanged parameters', async () => {
    const draftA = await configVersionService.createDraftVersion({
      versionNumber: 'v1.7.0-ver-A',
      adminEmail: 'admin@hutty.in',
    });

    const draftB = await configVersionService.createDraftVersion({
      versionNumber: 'v1.7.0-ver-B',
      adminEmail: 'admin@hutty.in',
    });

    // Modify a parameter in B
    await configVersionService.updateDraft(draftB.id, {
      parameters: [{ key: 'config.structure.wall_height_ft', value: 11.0 }],
      adminEmail: 'admin@hutty.in',
    });

    const diff = await configVersionService.compareVersions(draftA.id, draftB.id);

    expect(diff.summary.changedCount).toBe(1);
    expect(diff.changed[0].key).toBe('config.structure.wall_height_ft');
    expect(diff.changed[0].oldValue).toBe(10.0);
    expect(diff.changed[0].newValue).toBe(11.0);
    expect(diff.summary.unchangedCount).toBeGreaterThan(30);
  });

  // ── 7. Rollback Safety (Creates NEW Version, Old Remains Immutable) ──
  it('8. Rollback creates a new version with historical parameters and preserves historical version immutability', async () => {
    // 1. We have an old baseline version 'cfg-ver-1.0.0'
    const baseline = await configVersionService.getVersionById('cfg-ver-1.0.0');
    expect(baseline).not.toBeNull();

    // 2. Perform rollback request to cfg-ver-1.0.0
    const rollbackResult = await configVersionService.rollbackToVersion({
      targetVersionId: 'cfg-ver-1.0.0',
      newVersionNumber: 'v1.8.0-rollback-release',
      adminEmail: 'chief-engineer@hutty.in',
      reason: 'Reverting to certified pilot baseline v1.0.0 due to client audit review',
    });

    expect(rollbackResult.success).toBe(true);
    expect(rollbackResult.newDraftVersion.versionNumber).toBe('v1.8.0-rollback-release');
    expect(rollbackResult.newDraftVersion.status).toBe('DRAFT');

    // 3. Verify target historical version was NOT mutated
    const targetAfter = await configVersionService.getVersionById('cfg-ver-1.0.0');
    expect(targetAfter.versionNumber).toBe('v1.0.0');

    // 4. Verify audit trail has ROLLBACK_PREPARE entry
    const audits = await configVersionService.getVersionAuditLogs(rollbackResult.newDraftVersion.id);
    const rollbackAudit = audits.find((a) => a.action === 'ROLLBACK_PREPARE');
    expect(rollbackAudit).toBeDefined();
    expect(rollbackAudit?.reason).toContain('Reverting to certified pilot baseline');
  });

  // ── 8. Historical Snapshot Immutability ──
  it('9. Existing calculation results preserve their configuration snapshot even after a new version is published', async () => {
    const sampleInput: EngineInput = {
      plotLength: 40,
      plotWidth: 30,
      floors: 2,
      city: 'Bangalore',
      qualityTier: 'Premium',
      houseType: 'Duplex',
      parkingType: 'Surface Parking',
      contractorMode: 'turnkey',
      rooms: { bedrooms: 3, bathrooms: 3, living: 1, kitchen: 1, dining: 1, commonToilets: 0, balcony: 1, utility: 1 },
    } as unknown as EngineInput;

    // 1. Run a calculation under active baseline
    const initialCalc = runCalculator(sampleInput);

    const snapshotV1 = initialCalc.resolvedConfiguration;
    expect(snapshotV1).toBeDefined();
    const cementBagsV1 = initialCalc.quantities.cementBags;
    const totalProjectCostV1 = initialCalc.budget.totalProjectCost;

    // 2. Create and publish a new configuration version with altered cement thumb rule
    const newDraft = await configVersionService.createDraftVersion({
      versionNumber: 'v1.9.0-cement-boost',
      adminEmail: 'admin@hutty.in',
    });

    await configVersionService.updateDraft(newDraft.id, {
      parameters: [{ key: 'config.material.cement_bags_per_sqft', value: 0.50 }], // 0.40 -> 0.50
      adminEmail: 'admin@hutty.in',
    });

    await configVersionService.publishVersion({
      id: newDraft.id,
      adminEmail: 'admin@hutty.in',
      acceptConflicts: true,
      conflictAcceptanceReason: 'Approved cement ratio increase',
    });

    // 3. Verify that the previous calculation snapshot object and values remain completely unchanged!
    expect(snapshotV1?.parameters['config.material.cement_bags_per_sqft']).toBe(0.40);
    expect(initialCalc.quantities.cementBags).toBe(cementBagsV1);
    expect(initialCalc.budget.totalProjectCost).toBe(totalProjectCostV1);
  });

  // ── 9. Critical Database Fail-Closed Diagnostic ──
  it('10. Fail-closed diagnosis distinguishes DB_UNAVAILABLE and does not pretend in-memory is fresh PostgreSQL', async () => {
    // Set explicit diagnosis
    configResolver.setDatabaseError('DB_UNAVAILABLE');

    expect(configResolver.getDbStatus()).toBe('DB_UNAVAILABLE');
    expect(configResolver.getResolutionSource()).toBe('STATIC_APPROVED_BASELINE');

    const sampleInput: EngineInput = {
      plotLength: 40,
      plotWidth: 30,
      floors: 2,
      city: 'Bangalore',
      qualityTier: 'Essential',
      houseType: 'Duplex',
      parkingType: 'Surface Parking',
      contractorMode: 'turnkey',
      rooms: { bedrooms: 2, bathrooms: 2, living: 1, kitchen: 1, dining: 1, commonToilets: 0, balcony: 1, utility: 1 },
    } as unknown as EngineInput;

    // Engine still safely calculates using immutable baseline
    const result = runCalculator(sampleInput);

    expect(result.budget.totalProjectCost).toBeGreaterThan(0);
    expect(result.quantities.steelTonnes).toBeGreaterThan(0);
  });

  // ── 10. Audit Trail Completeness ──
  it('11. Every lifecycle operation produces an auditable log entry without leaking secrets', async () => {
    const draft = await configVersionService.createDraftVersion({
      versionNumber: 'v1.10.0-audit-trail-test',
      adminEmail: 'security-auditor@hutty.in',
    });

    await configVersionService.updateDraft(draft.id, {
      parameters: [{ key: 'config.structure.wall_height_ft', value: 10.5 }],
      adminEmail: 'security-auditor@hutty.in',
      changeNote: 'Security audit test update',
    });

    await configVersionService.validateVersion(draft.id, 'security-auditor@hutty.in');
    await configVersionService.simulateVersion(draft.id, 'security-auditor@hutty.in');

    const logs = await configVersionService.getVersionAuditLogs(draft.id);

    expect(logs.length).toBeGreaterThanOrEqual(4);
    const actions = logs.map((l) => l.action);
    expect(actions).toContain('CREATE_DRAFT');
    expect(actions).toContain('EDIT_PARAMETER');
    expect(actions).toContain('VALIDATE');
    expect(actions).toContain('SIMULATE');

    // Verify zero secrets leaked in audit logs
    const serialized = JSON.stringify(logs);
    expect(serialized).not.toContain('password');
    expect(serialized).not.toContain('JWT_SECRET');
    expect(serialized).not.toContain('DATABASE_URL');
  });
});
