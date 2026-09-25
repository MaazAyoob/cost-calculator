// ============================================================
// CONFIGURATION VERSIONING CONTROLLER
// Handles Express request/response endpoints for the configuration lifecycle
// ============================================================

import { Request, Response } from 'express';
import { configVersionService, VersionStatus } from '../services/configVersion.service';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

// ── 1. PUBLIC: GET ACTIVE CONFIGURATION ──
export async function getActiveConfig(req: Request, res: Response) {
  try {
    const { location, specificationTier, date } = req.query;
    const config = await configVersionService.getActiveConfiguration({
      location: location as string,
      specificationTier: specificationTier as string,
      date: date as string,
    });

    res.setHeader('X-Config-Version', config.versionNumber);
    res.setHeader('X-Config-Source', config.source);

    return res.json({
      success: true,
      data: config,
    });
  } catch (err: any) {
    console.error('[ConfigController] getActiveConfig failure:', err);
    return res.status(500).json({
      success: false,
      error: 'CRITICAL_CONFIGURATION_UNAVAILABLE',
      message: err.message || 'Failed to resolve active configuration',
    });
  }
}

// ── 2. ADMIN: LIST ALL VERSIONS ──
export async function listVersions(req: AuthenticatedRequest, res: Response) {
  try {
    const { status } = req.query;
    const versions = await configVersionService.getVersions({
      status: status as VersionStatus,
    });

    return res.json({
      success: true,
      count: versions.length,
      versions,
      data: versions,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// ── 3. ADMIN: GET VERSION DETAILS ──
export async function getVersion(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const version = await configVersionService.getVersionById(id);
    if (!version) {
      return res.status(404).json({ success: false, error: `Version '${id}' not found` });
    }

    return res.json({
      success: true,
      version,
      data: version,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// ── 4. ADMIN: CREATE NEW DRAFT VERSION ──
export async function createDraft(req: AuthenticatedRequest, res: Response) {
  try {
    const { baseVersionId, versionNumber, description, changeNote, parameters } = req.body;
    const adminEmail = req.user?.email || 'admin@costcalculator.app';
    const ipAddress = req.ip;
    const userAgent = req.get('user-agent');

    const draft = await configVersionService.createDraftVersion({
      baseVersionId,
      versionNumber,
      description,
      changeNote,
      parameters,
      adminEmail,
      ipAddress,
      userAgent,
    });

    return res.status(201).json({
      success: true,
      message: `Draft version '${draft.versionNumber}' created successfully.`,
      draft,
      data: draft,
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
}

// ── 5. ADMIN: UPDATE DRAFT PARAMETERS / METADATA ──
export async function updateDraft(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const { description, changeNote, effectiveFrom, parameters } = req.body;
    const adminEmail = req.user?.email || 'admin@costcalculator.app';
    const ipAddress = req.ip;
    const userAgent = req.get('user-agent');

    const result = await configVersionService.updateDraft(id, {
      description,
      changeNote,
      effectiveFrom,
      parameters,
      adminEmail,
      ipAddress,
      userAgent,
    });

    return res.json({
      success: true,
      message: 'Draft configuration updated successfully.',
      result,
      data: result,
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
}

// ── 6. ADMIN: VALIDATE CONFIGURATION VERSION ──
export async function validateVersion(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const adminEmail = req.user?.email || 'admin@costcalculator.app';

    const report = await configVersionService.validateVersion(id, adminEmail);

    return res.json({
      success: report.schemaValid,
      report,
      data: report,
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
}

// ── 7. ADMIN: SUBMIT VERSION FOR REVIEW ──
export async function submitReview(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const adminEmail = req.user?.email || 'admin@costcalculator.app';

    const result = await configVersionService.submitReview(id, adminEmail);

    return res.json({
      success: true,
      message: `Version submitted for review.`,
      result,
      data: result,
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
}

// ── 8. ADMIN: SIMULATE VERSION (WHAT-IF) ──
export async function simulateVersion(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const adminEmail = req.user?.email || 'admin@costcalculator.app';

    const simulation = await configVersionService.simulateVersion(id, adminEmail);

    return res.json({
      success: true,
      simulation,
      data: simulation,
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
}

// ── 9. ADMIN: PUBLISH CONFIGURATION VERSION ──
export async function publishVersion(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const { effectiveFrom, effectiveTo, acceptConflicts, conflictAcceptanceReason } = req.body;
    const adminEmail = req.user?.email || 'admin@costcalculator.app';
    const ipAddress = req.ip;
    const userAgent = req.get('user-agent');

    const result = await configVersionService.publishVersion({
      id,
      adminEmail,
      effectiveFrom,
      effectiveTo,
      acceptConflicts,
      conflictAcceptanceReason,
      ipAddress,
      userAgent,
    });

    return res.json({
      success: true,
      message: `Configuration version ${result.versionNumber} published and activated.`,
      result,
      data: result,
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
}

// ── 10. ADMIN: ARCHIVE VERSION ──
export async function archiveVersion(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const adminEmail = req.user?.email || 'admin@costcalculator.app';

    const result = await configVersionService.archiveVersion(id, adminEmail, reason);

    return res.json({
      success: true,
      message: 'Version archived successfully.',
      result,
      data: result,
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
}

// ── 11. ADMIN: GET AUDIT TRAIL ──
export async function getVersionAudit(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const logs = await configVersionService.getVersionAuditLogs(id);

    return res.json({
      success: true,
      versionId: id,
      count: logs.length,
      auditLogs: logs,
      data: logs,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// ── 12. ADMIN: COMPARE TWO VERSIONS (A vs B) ──
export async function compareVersions(req: AuthenticatedRequest, res: Response) {
  try {
    const { a, b } = req.params;
    const comparison = await configVersionService.compareVersions(a, b);

    return res.json({
      success: true,
      comparison,
      data: comparison,
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
}

// ── 13. ADMIN: ROLLBACK TO HISTORICAL VERSION ──
export async function rollbackVersion(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const { targetVersionId, targetVersionNumber, newVersionNumber, reason } = req.body;
    const adminEmail = req.user?.email || 'admin@costcalculator.app';
    const ipAddress = req.ip;
    const userAgent = req.get('user-agent');

    // Resolve target version ID if not provided directly
    let resolvedTargetId = id || targetVersionId;
    if (!resolvedTargetId && targetVersionNumber !== undefined) {
      const allVers = await configVersionService.getVersions();
      const match = allVers.find(
        (v) =>
          String(v.versionNumber) === String(targetVersionNumber) ||
          v.id === String(targetVersionNumber) ||
          (v.versionNumber && v.versionNumber.toLowerCase() === String(targetVersionNumber).toLowerCase())
      );
      if (match) {
        resolvedTargetId = match.id;
      }
    }

    if (!resolvedTargetId) {
      return res.status(400).json({
        success: false,
        error: 'Target version ID or targetVersionNumber is required for rollback.',
      });
    }

    const result = await configVersionService.rollbackToVersion({
      targetVersionId: resolvedTargetId,
      newVersionNumber,
      adminEmail,
      reason,
      ipAddress,
      userAgent,
    });

    return res.status(200).json({
      success: true,
      ...result,
      data: result,
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
}
