// ============================================================
// HUTTY PLATFORM – DATABASE HEALTH CHECK SERVICE
// Safe, read-only diagnostic service to verify database connectivity,
// schema table presence, and initial record populations.
//
// SAFETY:
// - Read-only (no writes, no drops, no schema modifications).
// - NEVER prints credentials, passwords, or raw connection strings.
// ============================================================

import { PrismaClient } from '@prisma/client';

const defaultPrisma = new PrismaClient();

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

export async function checkDatabase(client?: PrismaClient): Promise<boolean> {
  const prisma = client || defaultPrisma;

  console.log('════════════════════════════════════════════════════════════════');
  console.log(' Hutty Production Database Diagnostic Check');
  console.log('════════════════════════════════════════════════════════════════');
  console.log(`Node Environment:  ${process.env.NODE_ENV || 'development'}`);
  console.log(`Database Target:   ${getSanitizedDbUrl()}`);
  console.log('----------------------------------------------------------------');

  if (!process.env.DATABASE_URL) {
    console.error('❌ CRITICAL: DATABASE_URL environment variable is missing.');
    return false;
  }

  try {
    console.log('1. Testing PostgreSQL TCP & authentication handshake...');
    await prisma.$connect();
    console.log('   ✅ Connection established successfully.');
  } catch (connErr: any) {
    console.error('❌ PostgreSQL Connection Failed:');
    console.error(`   Message: ${connErr.message}`);
    return false;
  }

  let allHealthy = true;

  console.log('2. Verifying critical schema tables and reference data:');

  const checkTable = async (name: string, query: () => Promise<number>) => {
    try {
      const count = await query();
      console.log(`   ✅ Table "${name}": OK (${count} records)`);
      if (count === 0) {
        console.warn(`      ⚠️ Note: "${name}" has 0 records. Running database seed is recommended.`);
      }
      return count;
    } catch (err: any) {
      allHealthy = false;
      if (err.code === 'P2021' || err.message?.includes('does not exist')) {
        console.error(`   ❌ Table "${name}": MISSING (Table does not exist in PostgreSQL schema)`);
      } else {
        console.error(`   ❌ Table "${name}": ERROR (${err.message})`);
      }
      return -1;
    }
  };

  await checkTable('pricing_tiers', () => prisma.pricingTier.count());
  await checkTable('consultants', () => prisma.consultant.count());
  await checkTable('users', () => prisma.user.count());
  await checkTable('material_categories', () => prisma.materialCategory.count());
  await checkTable('calculation_config_versions', () => prisma.calculationConfigVersion.count());
  await checkTable('calculation_config_parameters', () => prisma.calculationConfigParameter.count());
  await checkTable('pricing_purchases', () => prisma.pricingPurchase.count());
  await checkTable('user_entitlements', () => prisma.userEntitlement.count());
  await checkTable('projects', () => (prisma as any).project.count());
  await checkTable('project_configurations', () => (prisma as any).projectConfiguration.count());
  await checkTable('calculation_results', () => (prisma as any).calculationResult.count());

  console.log('3. Checking for case-insensitive email conflicts in User table...');
  try {
    const users = await prisma.user.findMany({ select: { id: true, email: true } });
    const emailCounts = new Map<string, string[]>();
    for (const u of users) {
      const lower = u.email.trim().toLowerCase();
      if (!emailCounts.has(lower)) {
        emailCounts.set(lower, []);
      }
      emailCounts.get(lower)!.push(u.id);
    }
    const duplicates = Array.from(emailCounts.entries()).filter(([_, ids]) => ids.length > 1);
    if (duplicates.length > 0) {
      console.warn(`   ⚠️ WARNING: Found ${duplicates.length} case-insensitive duplicate email group(s):`);
      duplicates.forEach(([dupEmail, ids]) => {
        console.warn(`      - Email: "${dupEmail}", User IDs: [${ids.join(', ')}]`);
      });
    } else {
      console.log('   ✅ No case-insensitive duplicate accounts found.');
    }
  } catch (scanErr: any) {
    console.warn(`   ⚠️ Note: Could not perform duplicate email scan: ${scanErr.message}`);
  }

  console.log('----------------------------------------------------------------');
  if (allHealthy) {
    console.log('🎉 SUCCESS: All required tables exist and are accessible.');
    console.log('════════════════════════════════════════════════════════════════');
    return true;
  } else {
    console.error('🚨 SCHEMA INCOMPLETE: One or more tables are missing.');
    console.error('   Action required: Run "npx prisma db push" to initialize the database schema,');
    console.error('   followed by database seed to populate reference records.');
    console.log('════════════════════════════════════════════════════════════════');
    return false;
  }
}
