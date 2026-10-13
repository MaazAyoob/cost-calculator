// ============================================================
// COST CALCULATOR & HUTTY PLATFORM – DATABASE HEALTH CHECK CLI
// Safe, read-only diagnostic script to verify database connectivity,
// schema table presence, and initial record populations.
//
// SAFETY:
// - Read-only (no writes, no drops, no schema modifications).
// - NEVER prints credentials, passwords, or raw connection strings.
// ============================================================

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

async function checkDatabase() {
  console.log('════════════════════════════════════════════════════════════════');
  console.log(' Hutty Production Database Diagnostic Check');
  console.log('════════════════════════════════════════════════════════════════');
  console.log(`Node Environment:  ${process.env.NODE_ENV || 'development'}`);
  console.log(`Database Target:   ${getSanitizedDbUrl()}`);
  console.log('----------------------------------------------------------------');

  if (!process.env.DATABASE_URL) {
    console.error('❌ CRITICAL: DATABASE_URL environment variable is missing.');
    process.exit(1);
  }

  try {
    console.log('1. Testing PostgreSQL TCP & authentication handshake...');
    await prisma.$connect();
    console.log('   ✅ Connection established successfully.');
  } catch (connErr: any) {
    console.error('❌ PostgreSQL Connection Failed:');
    console.error(`   Message: ${connErr.message}`);
    process.exit(1);
  }

  let allHealthy = true;

  console.log('2. Verifying critical schema tables and reference data:');

  const checkTable = async (name: string, query: () => Promise<number>) => {
    try {
      const count = await query();
      console.log(`   ✅ Table "${name}": OK (${count} records)`);
      if (count === 0) {
        console.warn(`      ⚠️ Note: "${name}" has 0 records. Running "npm run db:seed" is recommended.`);
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

  console.log('----------------------------------------------------------------');
  if (allHealthy) {
    console.log('🎉 SUCCESS: All required tables exist and are accessible.');
    console.log('════════════════════════════════════════════════════════════════');
    process.exit(0);
  } else {
    console.error('🚨 SCHEMA INCOMPLETE: One or more tables are missing.');
    console.error('   Action required: Run "npx prisma db push" to initialize the database schema,');
    console.error('   followed by "npm run db:seed" to populate reference records.');
    console.log('════════════════════════════════════════════════════════════════');
    process.exit(1);
  }
}

checkDatabase()
  .catch((e) => {
    console.error('Diagnostic error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
