// ============================================================
// HUTTY PRODUCTION DATABASE INITIALIZATION SERVICE
// Safe, programmatic orchestrator for PostgreSQL schema synchronization,
// idempotent reference seeding, and diagnostic verification.
//
// SAFETY INVARIANTS:
// - Read-only inspection before DDL.
// - Non-destructive schema push (never drops tables, never resets).
// - Idempotent upsert seeding (never duplicates records).
// - Never logs raw credentials, passwords, or connection strings.
// ============================================================

import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';
import { runSeed } from './seed.service';
import { checkDatabase } from './checkDb.service';

export interface InitDbResult {
  success: boolean;
  alreadyInitialized: boolean;
  tableCounts: Record<string, number>;
  message: string;
  timestamp: string;
}

function getSanitizedDbUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) return '[NOT CONFIGURED]';
  try {
    const parsed = new URL(url);
    return `${parsed.protocol}//${parsed.username ? '***' : ''}${parsed.password ? ':***@' : ''}${parsed.host}${parsed.pathname}`;
  } catch {
    return '[CONFIGURED (Custom Format)]';
  }
}

function resolveSchemaPath(): string {
  const candidates = [
    path.resolve(__dirname, '../../prisma/schema.prisma'),
    path.resolve(__dirname, '../prisma/schema.prisma'),
    path.resolve(process.cwd(), 'prisma/schema.prisma'),
    path.resolve(process.cwd(), 'server/prisma/schema.prisma'),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  throw new Error(`Could not find schema.prisma in candidate locations: ${candidates.join(', ')}`);
}

export async function runInitAndVerifyPipeline(prismaClient?: PrismaClient): Promise<InitDbResult> {
  const prisma = prismaClient || new PrismaClient();
  const timestamp = new Date().toISOString();

  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║  Hutty Production Database Initialization Pipeline            ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log(`[InitPipeline] Timestamp:   ${timestamp}`);
  console.log(`[InitPipeline] Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`[InitPipeline] Target DB:   ${getSanitizedDbUrl()}`);

  if (!process.env.DATABASE_URL) {
    const err = 'DATABASE_URL environment variable is missing.';
    console.error(`[InitPipeline] ❌ CRITICAL: ${err}`);
    return {
      success: false,
      alreadyInitialized: false,
      tableCounts: {},
      message: err,
      timestamp,
    };
  }

  // ── Step 0: Test Handshake & Check Table Presence ──
  let pricingTiersExist = false;
  try {
    await prisma.$connect();
    const checkResult: any = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'pricing_tiers'
      ) as "exists";
    `;
    pricingTiersExist = Boolean(checkResult?.[0]?.exists);
  } catch (handshakeErr: any) {
    console.warn('[InitPipeline] Handshake or table pre-check note:', handshakeErr.message);
  }

  // Ensure critical columns like User.phoneVerifiedAt exist non-destructively
  try {
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "phoneVerifiedAt" TIMESTAMP(3);`
    );
    console.log('[InitPipeline] Verified User.phoneVerifiedAt column exists.');
  } catch (colErr: any) {
    console.warn('[InitPipeline] Note on column check:', colErr.message);
  }

  // ── Step 1: Schema Synchronization (if table missing) ──
  if (!pricingTiersExist) {
    console.log('[InitPipeline] Table public.pricing_tiers not found. Running Prisma db push...');
    const schemaPath = resolveSchemaPath();
    const schemaDir = path.dirname(schemaPath);
    console.log(`[InitPipeline] Using schema: ${schemaPath}`);

    try {
      execSync(`npx prisma db push --schema="${schemaPath}" --skip-generate`, {
        stdio: 'inherit',
        env: process.env,
        cwd: schemaDir,
      });
      console.log('[InitPipeline] ✅ Prisma db push completed successfully.');
    } catch (pushErr: any) {
      const msg = `Prisma db push failed: ${pushErr.message}`;
      console.error(`[InitPipeline] ❌ ${msg}`);
      return {
        success: false,
        alreadyInitialized: false,
        tableCounts: {},
        message: msg,
        timestamp,
      };
    }
  } else {
    console.log('[InitPipeline] Schema already contains public.pricing_tiers. Skipping schema push.');
  }

  // ── Step 2: Idempotent Reference Seed ──
  console.log('[InitPipeline] Running idempotent database seed...');
  try {
    await runSeed(prisma);
    console.log('[InitPipeline] ✅ Idempotent seed completed.');
  } catch (seedErr: any) {
    const msg = `Database seed failed: ${seedErr.message}`;
    console.error(`[InitPipeline] ❌ ${msg}`);
    return {
      success: false,
      alreadyInitialized: false,
      tableCounts: {},
      message: msg,
      timestamp,
    };
  }

  // ── Step 3: Diagnostic Verification ──
  console.log('[InitPipeline] Running database diagnostic verification...');
  let isHealthy = false;
  const tableCounts: Record<string, number> = {};
  try {
    isHealthy = await checkDatabase(prisma);

    tableCounts.pricing_tiers = await prisma.pricingTier.count().catch(() => -1);
    tableCounts.consultants = await prisma.consultant.count().catch(() => -1);
    tableCounts.users = await prisma.user.count().catch(() => -1);
    tableCounts.material_categories = await prisma.materialCategory.count().catch(() => -1);
    tableCounts.calculation_config_versions = await prisma.calculationConfigVersion.count().catch(() => -1);
    tableCounts.calculation_config_parameters = await prisma.calculationConfigParameter.count().catch(() => -1);
  } catch (diagErr: any) {
    const msg = `Diagnostic check error: ${diagErr.message}`;
    console.error(`[InitPipeline] ❌ ${msg}`);
    return {
      success: false,
      alreadyInitialized: pricingTiersExist,
      tableCounts,
      message: msg,
      timestamp,
    };
  }

  if (isHealthy) {
    console.log('[InitPipeline] 🎉 Database fully verified and healthy.');
    return {
      success: true,
      alreadyInitialized: pricingTiersExist,
      tableCounts,
      message: 'Database schema synchronized, seeded, and verified successfully.',
      timestamp,
    };
  } else {
    return {
      success: false,
      alreadyInitialized: false,
      tableCounts,
      message: 'Database check failed. One or more tables are missing.',
      timestamp,
    };
  }
}
