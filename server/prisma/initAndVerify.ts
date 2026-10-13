// ============================================================
// ALL-IN-ONE PRODUCTION DATABASE INITIALIZATION & VERIFICATION
// Sequence:
// 1. Synchronize PostgreSQL schema non-destructively: prisma db push
// 2. Populate essential reference data idempotently: seed
// 3. Perform comprehensive schema & record diagnostic: checkDb
//
// SAFETY:
// - Non-destructive (no database drop, no reset, no truncate).
// - Never logs credentials, passwords, or connection strings.
// - Returns exit code 0 only after successful verification.
// ============================================================

import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';
import { runSeed } from './seed';
import { checkDatabase } from './checkDb';

const prisma = new PrismaClient();

async function main() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║  Hutty Production Database Safe Initialization & Verification ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log(`Timestamp:   ${new Date().toISOString()}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'production'}`);
  console.log('----------------------------------------------------------------');

  if (!process.env.DATABASE_URL) {
    console.error('❌ CRITICAL ERROR: DATABASE_URL environment variable is missing.');
    console.error('   Ensure DATABASE_URL is configured in Render service settings.');
    process.exit(1);
  }

  // ── STEP 1: Schema Synchronization ──
  console.log('\n[Step 1/3] Synchronizing PostgreSQL schema via Prisma db push...');
  try {
    execSync('npx prisma db push --skip-generate', {
      stdio: 'inherit',
      env: process.env,
    });
    console.log('✅ Schema synchronization completed successfully.');
  } catch (pushErr: any) {
    console.error('❌ Schema synchronization failed:', pushErr.message);
    process.exit(1);
  }

  // ── STEP 2: Idempotent Seed ──
  console.log('\n[Step 2/3] Seeding essential reference data idempotently...');
  try {
    await runSeed(prisma);
    console.log('✅ Idempotent seed completed successfully.');
  } catch (seedErr: any) {
    console.error('❌ Database seed failed:', seedErr.message);
    process.exit(1);
  }

  // ── STEP 3: Complete Diagnostic Check ──
  console.log('\n[Step 3/3] Running database diagnostic verification...');
  try {
    const isHealthy = await checkDatabase(prisma);
    if (!isHealthy) {
      console.error('❌ Diagnostic check reported missing tables or incomplete data.');
      process.exit(1);
    }
  } catch (diagErr: any) {
    console.error('❌ Diagnostic check encountered an error:', diagErr.message);
    process.exit(1);
  }

  console.log('\n════════════════════════════════════════════════════════════════');
  console.log('🎉 INITIALIZATION COMPLETE: Database is fully provisioned & verified.');
  console.log('   The Hutty backend is now ready for production traffic.');
  console.log('════════════════════════════════════════════════════════════════');
  process.exit(0);
}

main()
  .catch((e) => {
    console.error('Initialization pipeline failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
