// ============================================================
// PRICE UPDATE CONTROLLER
// Handles Auto Price Update pipeline, review, and approval
// ============================================================

import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { priceUpdateService } from '../services/priceUpdate/priceUpdateProviders';
import { MarketPriceProposal, PriceUpdateRunSummary } from '../services/priceUpdate/priceUpdate.types';
import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient | null = null;
try {
  prisma = new PrismaClient();
} catch (e) {
  console.warn('[PriceUpdateController] Prisma client notice:', e);
}

// In-memory fallback stores for offline/preview mode
export const inMemoryPriceRuns: Map<string, PriceUpdateRunSummary> = new Map();
export const inMemoryProposals: Map<string, MarketPriceProposal> = new Map();

// Helper to access overrides from admin.controller if available
import { inMemoryOverrides, inMemoryAuditLogs } from './admin.controller';

// Canonical fallback sample rates for when database is empty
const CANONICAL_SAMPLE_RATES = [
  { id: 'steel.fe550d_tmt', name: 'TMT Reinforcement Steel Fe 550D / Fe 500D', category: 'Steel', rate: 74000, unit: '₹/Tonne' },
  { id: 'steel.indus_fe500d', name: 'Indus TMT Fe 500D Rebar', category: 'Steel', rate: 68000, unit: '₹/Tonne' },
  { id: 'steel.jsw_neosteel', name: 'JSW Neosteel Fe 550D Rebar', category: 'Steel', rate: 75000, unit: '₹/Tonne' },
  { id: 'steel.tata_tiscon', name: 'Tata Tiscon 550D Super Ductile Rebar', category: 'Steel', rate: 79000, unit: '₹/Tonne' },
  { id: 'cement.coromandel_super', name: 'Coromandel King Super Power PPC', category: 'Cement', rate: 380, unit: '₹/Bag' },
  { id: 'cement.birla_super', name: 'Birla Super 53-Grade / PPC Cement', category: 'Cement', rate: 400, unit: '₹/Bag' },
  { id: 'cement.ultratech_super', name: 'UltraTech Super Weather Plus Cement', category: 'Cement', rate: 425, unit: '₹/Bag' },
  { id: 'sand.m_sand', name: 'Manufactured M-Sand (Concrete Grade)', category: 'Sand', rate: 55, unit: '₹/CFT' },
  { id: 'sand.p_sand', name: 'Manufactured Plastering P-Sand', category: 'Sand', rate: 65, unit: '₹/CFT' },
  { id: 'aggregate.20mm', name: 'Crushed Granite Aggregate 20mm', category: 'Aggregate', rate: 40, unit: '₹/CFT' },
  { id: 'aggregate.40mm', name: 'Crushed Granite Aggregate 40mm', category: 'Aggregate', rate: 36, unit: '₹/CFT' },
  { id: 'masonry.solid_block_8in', name: 'Dense Concrete Solid Block (8-inch)', category: 'Masonry', rate: 42, unit: '₹/Block' },
  { id: 'masonry.solid_block_6in', name: 'Dense Concrete Solid Block (6-inch)', category: 'Masonry', rate: 34, unit: '₹/Block' },
  { id: 'masonry.solid_block_4in', name: 'Dense Concrete Solid Block (4-inch)', category: 'Masonry', rate: 28, unit: '₹/Block' },
  { id: 'masonry.red_clay_brick', name: 'Wire-Cut Kiln Red Clay Bricks', category: 'Masonry', rate: 11.5, unit: '₹/Brick' },
  { id: 'paint.asian_tractor_emulsion', name: 'Asian Paints Tractor Emulsion (Interior)', category: 'Paint', rate: 16, unit: '₹/SqFt' },
  { id: 'paint.asian_apcolite_premium', name: 'Asian Paints Apcolite Premium Emulsion', category: 'Paint', rate: 24, unit: '₹/SqFt' },
  { id: 'paint.asian_royale_luxury', name: 'Asian Paints Royale Luxury Emulsion', category: 'Paint', rate: 36, unit: '₹/SqFt' },
  { id: 'flooring.vitrified_tiles', name: 'Double Charged Vitrified Tiles 800x800mm', category: 'Flooring', rate: 85, unit: '₹/SqFt' },
  { id: 'flooring.granite_slab', name: 'Sadahalli Grey Granite Polished Slab', category: 'Flooring', rate: 145, unit: '₹/SqFt' },
  { id: 'doors.flush_door', name: 'Waterproof Membrane Flush Door (32mm)', category: 'Doors', rate: 3500, unit: '₹/Door' },
  { id: 'windows.upvc_slider', name: '2.5-Track uPVC Sliding Window with Mosquito Mesh', category: 'Windows', rate: 650, unit: '₹/SqFt' },
  { id: 'electrical.wire_bundle', name: 'Finolex / Havells FRLS Copper Wire Bundle (1.5 sq mm)', category: 'Electrical wiring', rate: 2200, unit: '₹/Bundle' },
  { id: 'plumbing.cpvc_pipe', name: 'Astral SDR 11 CPVC Plumbing Pipe 1-inch (3m)', category: 'Plumbing', rate: 480, unit: '₹/Length' },
  { id: 'sanitaryware.wall_hung_ewc', name: 'Jaquar Rimless Wall Hung EWC with Soft Close Seat', category: 'Sanitaryware', rate: 7800, unit: '₹/Unit' },
  { id: 'labour.mason_daily', name: 'Lead Mason Daily Labour Wage', category: 'Labour', rate: 1050, unit: '₹/Day' },
  { id: 'labour.helper_daily', name: 'Helper Daily Construction Wage', category: 'Labour', rate: 700, unit: '₹/Day' },
];

/**
 * GET /api/v1/admin/price-updates/providers
 * List available price update providers
 */
export async function getPriceProviders(_req: AuthenticatedRequest, res: Response) {
  try {
    const providers = priceUpdateService.listProviders();
    return res.json({ success: true, providers });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to list price providers', details: err.message });
  }
}

/**
 * GET /api/v1/admin/price-updates
 * List price update runs and pending proposals
 */
export async function getPriceUpdates(_req: AuthenticatedRequest, res: Response) {
  try {
    let proposals = Array.from(inMemoryProposals.values());
    let runs = Array.from(inMemoryPriceRuns.values());

    if (prisma && (prisma as any).priceUpdateProposal) {
      try {
        const dbProposals = await (prisma as any).priceUpdateProposal.findMany({
          orderBy: { createdAt: 'desc' },
          take: 150,
        });
        if (dbProposals && dbProposals.length > 0) {
          proposals = dbProposals;
        }

        const dbRuns = await (prisma as any).priceUpdateRun.findMany({
          orderBy: { createdAt: 'desc' },
          take: 20,
        });
        if (dbRuns && dbRuns.length > 0) {
          runs = dbRuns;
        }
      } catch {
        // Fallback to in-memory
      }
    }

    const counts = {
      total: proposals.length,
      pending: proposals.filter((p) => p.status === 'PENDING').length,
      needsReview: proposals.filter((p) => p.status === 'NEEDS_REVIEW').length,
      approved: proposals.filter((p) => p.status === 'APPROVED').length,
      rejected: proposals.filter((p) => p.status === 'REJECTED').length,
      unverified: proposals.filter((p) => p.status === 'UNVERIFIED').length,
    };

    return res.json({
      success: true,
      counts,
      proposals,
      runs,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to retrieve price updates', details: err.message });
  }
}

/**
 * POST /api/v1/admin/price-updates/run
 * Execute a price update run and generate proposals.
 * NOTE: Proposals NEVER alter active rates without explicit approval.
 */
export async function runPriceUpdate(req: AuthenticatedRequest, res: Response) {
  try {
    const { providerId = 'market_index', scope = 'ALL', category, rateIds } = req.body;
    const adminEmail = req.user?.email || 'admin@hutty.in';

    let targetRates = CANONICAL_SAMPLE_RATES;
    if (scope === 'CATEGORY' && category && category !== 'ALL') {
      const catLower = category.toLowerCase().trim();
      const filtered = targetRates.filter(
        (r) =>
          r.category.toLowerCase() === catLower ||
          r.category.toLowerCase().startsWith(catLower) ||
          catLower.startsWith(r.category.toLowerCase())
      );
      if (filtered.length > 0) {
        targetRates = filtered;
      }
    } else if (scope === 'SELECTED' && Array.isArray(rateIds) && rateIds.length > 0) {
      const filtered = targetRates.filter((r) => rateIds.includes(r.id));
      if (filtered.length > 0) {
        targetRates = filtered;
      }
    }

    const runId = `run_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const runSummary = await priceUpdateService.generateProposals(providerId, targetRates, runId);
    runSummary.runBy = adminEmail;
    runSummary.scope = scope;
    runSummary.category = category;

    // Cache proposals in memory
    inMemoryPriceRuns.set(runId, runSummary);
    runSummary.proposals.forEach((p) => {
      inMemoryProposals.set(p.id, p);
    });

    // Persist to Prisma DB if available
    if (prisma && (prisma as any).priceUpdateRun) {
      try {
        await (prisma as any).priceUpdateRun.create({
          data: {
            id: runSummary.id,
            provider: runSummary.provider,
            status: runSummary.status,
            totalProposed: runSummary.totalProposed,
            totalApproved: 0,
            totalRejected: 0,
            scope: runSummary.scope,
            category: runSummary.category || null,
            runBy: adminEmail,
            notes: runSummary.notes,
            createdAt: new Date(),
          },
        });

        for (const p of runSummary.proposals) {
          await (prisma as any).priceUpdateProposal.create({
            data: {
              id: p.id,
              runId: p.runId,
              rateId: p.rateId,
              rateName: p.rateName,
              category: p.category,
              unit: p.unit,
              currentRate: p.currentRate,
              proposedRate: p.proposedRate,
              difference: p.difference,
              differencePercent: p.differencePercent,
              currency: p.currency,
              location: p.location,
              packageTier: p.packageTier,
              source: p.source,
              sourceUrl: p.sourceUrl || null,
              confidence: p.confidence,
              status: p.status,
              notes: p.notes || null,
              warning: p.warning || null,
              isAiAssisted: p.isAiAssisted,
              createdAt: new Date(),
            },
          });
        }
      } catch (dbErr) {
        console.warn('[PriceUpdateController] DB run save note:', dbErr);
      }
    }

    return res.status(201).json({
      success: true,
      message: `Price update run complete. Generated ${runSummary.proposals.length} proposed updates awaiting administrator review.`,
      run: runSummary,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to run price update', details: err.message });
  }
}

/**
 * Helper to apply approval: updates proposal, writes RateOverride, and logs RateAuditLog
 */
function applyApprovalInternal(
  proposal: MarketPriceProposal,
  adminEmail: string,
  approvedRate?: number,
  adminNotes?: string
): { override: any; auditLog: any } {
  const finalRate = typeof approvedRate === 'number' && !isNaN(approvedRate) && approvedRate >= 0
    ? approvedRate
    : proposal.proposedRate;

  proposal.status = 'APPROVED';
  proposal.reviewedBy = adminEmail;
  proposal.reviewedAt = new Date().toISOString();
  if (adminNotes) {
    proposal.notes = `${proposal.notes ? proposal.notes + ' | ' : ''}Admin: ${adminNotes}`;
  }

  // 1. Create or update RateOverride
  const overrideKey = `${proposal.rateId}:::${proposal.packageTier}:::${proposal.location}`;
  const existing = inMemoryOverrides.get(overrideKey);

  const overrideData = {
    id: existing?.id || `ov-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    rateId: proposal.rateId,
    rate: finalRate,
    category: proposal.category,
    unit: proposal.unit,
    location: proposal.location,
    packageTier: proposal.packageTier,
    isActive: true,
    reason: `Auto Price Update approved from ${proposal.source}${proposal.isAiAssisted ? ' (AI-Assisted)' : ''}${adminNotes ? ` — ${adminNotes}` : ''}`,
    createdBy: adminEmail,
    createdAt: existing?.createdAt || new Date(),
    updatedAt: new Date(),
  };
  inMemoryOverrides.set(overrideKey, overrideData);

  // 2. Create distinguished RateAuditLog entry
  const auditEntry = {
    id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    rateId: proposal.rateId,
    rateName: proposal.rateName,
    category: proposal.category,
    unit: proposal.unit,
    oldValue: proposal.currentRate,
    newValue: finalRate,
    action: 'AUTO_PRICE_APPROVED',
    location: proposal.location,
    packageTier: proposal.packageTier,
    adminEmail,
    reason: `Market price approved from source: ${proposal.source}. Difference: ₹${(finalRate - proposal.currentRate).toFixed(2)} (${proposal.differencePercent > 0 ? '+' : ''}${proposal.differencePercent.toFixed(1)}%). Source ref: ${proposal.sourceUrl || 'N/A'}${adminNotes ? ` Note: ${adminNotes}` : ''}`,
    timestamp: new Date(),
  };
  inMemoryAuditLogs.unshift(auditEntry);

  return { override: overrideData, auditLog: auditEntry };
}

/**
 * POST /api/v1/admin/price-updates/:id/approve
 * Explicit administrator approval of a market price proposal.
 * Creates a RateOverride and generates a RateAuditLog entry.
 */
export async function approveProposal(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const { approvedRate, notes } = req.body;
    const adminEmail = req.user?.email || 'admin@hutty.in';

    let proposal = inMemoryProposals.get(id);

    if (!proposal && prisma && (prisma as any).priceUpdateProposal) {
      try {
        const dbProposal = await (prisma as any).priceUpdateProposal.findUnique({ where: { id } });
        if (dbProposal) {
          proposal = dbProposal;
          inMemoryProposals.set(id, proposal as MarketPriceProposal);
        }
      } catch {
        // Continue
      }
    }

    if (!proposal) {
      return res.status(404).json({ error: `Proposal not found: ${id}` });
    }

    const { override, auditLog } = applyApprovalInternal(proposal, adminEmail, approvedRate, notes);

    // Persist to DB if Prisma available
    if (prisma && (prisma as any).rateOverride) {
      try {
        await (prisma as any).rateOverride.upsert({
          where: {
            rate_dimension_unique: {
              rateId: proposal.rateId,
              packageTier: proposal.packageTier,
              location: proposal.location,
            },
          },
          update: {
            rate: override.rate,
            category: override.category,
            unit: override.unit,
            isActive: true,
            reason: override.reason,
            createdBy: adminEmail,
          },
          create: {
            rateId: proposal.rateId,
            rate: override.rate,
            category: override.category,
            unit: override.unit,
            location: proposal.location,
            packageTier: proposal.packageTier,
            isActive: true,
            reason: override.reason,
            createdBy: adminEmail,
          },
        });

        await (prisma as any).rateAuditLog.create({
          data: {
            rateId: auditLog.rateId,
            rateName: auditLog.rateName,
            category: auditLog.category,
            unit: auditLog.unit,
            oldValue: auditLog.oldValue,
            newValue: auditLog.newValue,
            action: 'AUTO_PRICE_APPROVED',
            location: auditLog.location,
            packageTier: auditLog.packageTier,
            adminEmail,
            reason: auditLog.reason,
          },
        });

        await (prisma as any).priceUpdateProposal.update({
          where: { id },
          data: {
            status: 'APPROVED',
            reviewedBy: adminEmail,
            reviewedAt: new Date(),
          },
        });
      } catch (dbErr) {
        console.warn('[PriceUpdateController] DB approval sync note:', dbErr);
      }
    }

    return res.json({
      success: true,
      message: `Proposal ${id} approved. Rate override successfully applied to calculator.`,
      proposal,
      override,
      auditLog,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to approve proposal', details: err.message });
  }
}

/**
 * POST /api/v1/admin/price-updates/:id/reject
 * Explicit administrator rejection of a proposal.
 * Live rates remain strictly unchanged.
 */
export async function rejectProposal(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const { reason = 'Rejected by administrator' } = req.body;
    const adminEmail = req.user?.email || 'admin@hutty.in';

    let proposal = inMemoryProposals.get(id);
    if (!proposal && prisma && (prisma as any).priceUpdateProposal) {
      try {
        proposal = await (prisma as any).priceUpdateProposal.findUnique({ where: { id } });
      } catch {}
    }

    if (!proposal) {
      return res.status(404).json({ error: `Proposal not found: ${id}` });
    }

    proposal.status = 'REJECTED';
    proposal.reviewedBy = adminEmail;
    proposal.reviewedAt = new Date().toISOString();
    proposal.notes = `${proposal.notes ? proposal.notes + ' | ' : ''}Rejected: ${reason}`;

    inMemoryProposals.set(id, proposal);

    if (prisma && (prisma as any).priceUpdateProposal) {
      try {
        await (prisma as any).priceUpdateProposal.update({
          where: { id },
          data: {
            status: 'REJECTED',
            reviewedBy: adminEmail,
            reviewedAt: new Date(),
            notes: proposal.notes,
          },
        });
      } catch {}
    }

    return res.json({
      success: true,
      message: `Proposal ${id} rejected. Existing rate remains untouched.`,
      proposal,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to reject proposal', details: err.message });
  }
}

/**
 * POST /api/v1/admin/price-updates/bulk-approve
 * Bulk approval of multiple selected proposals.
 */
export async function bulkApproveProposals(req: AuthenticatedRequest, res: Response) {
  try {
    const { proposalIds } = req.body;
    const adminEmail = req.user?.email || 'admin@hutty.in';

    if (!Array.isArray(proposalIds) || proposalIds.length === 0) {
      return res.status(400).json({ error: 'Array of proposalIds is required' });
    }

    const approvedOverrides: any[] = [];
    const approvedLogs: any[] = [];
    const updatedProposals: MarketPriceProposal[] = [];

    for (const id of proposalIds) {
      let proposal = inMemoryProposals.get(id);
      if (!proposal && prisma && (prisma as any).priceUpdateProposal) {
        try {
          proposal = await (prisma as any).priceUpdateProposal.findUnique({ where: { id } });
        } catch {}
      }

      if (proposal && proposal.status !== 'APPROVED') {
        const { override, auditLog } = applyApprovalInternal(proposal, adminEmail);
        approvedOverrides.push(override);
        approvedLogs.push(auditLog);
        updatedProposals.push(proposal);

        if (prisma && (prisma as any).rateOverride) {
          try {
            await (prisma as any).rateOverride.upsert({
              where: {
                rate_dimension_unique: {
                  rateId: proposal.rateId,
                  packageTier: proposal.packageTier,
                  location: proposal.location,
                },
              },
              update: {
                rate: override.rate,
                category: override.category,
                unit: override.unit,
                isActive: true,
                reason: override.reason,
                createdBy: adminEmail,
              },
              create: {
                rateId: proposal.rateId,
                rate: override.rate,
                category: override.category,
                unit: override.unit,
                location: proposal.location,
                packageTier: proposal.packageTier,
                isActive: true,
                reason: override.reason,
                createdBy: adminEmail,
              },
            });

            await (prisma as any).rateAuditLog.create({
              data: {
                rateId: auditLog.rateId,
                rateName: auditLog.rateName,
                category: auditLog.category,
                unit: auditLog.unit,
                oldValue: auditLog.oldValue,
                newValue: auditLog.newValue,
                action: 'AUTO_PRICE_APPROVED',
                location: auditLog.location,
                packageTier: auditLog.packageTier,
                adminEmail,
                reason: auditLog.reason,
              },
            });

            await (prisma as any).priceUpdateProposal.update({
              where: { id },
              data: {
                status: 'APPROVED',
                reviewedBy: adminEmail,
                reviewedAt: new Date(),
              },
            });
          } catch {}
        }
      }
    }

    return res.json({
      success: true,
      message: `Successfully approved ${updatedProposals.length} proposals.`,
      approvedCount: updatedProposals.length,
      overrides: approvedOverrides,
      auditLogs: approvedLogs,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Bulk approval failed', details: err.message });
  }
}
