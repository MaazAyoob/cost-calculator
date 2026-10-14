"use strict";
// ============================================================
// COST CALCULATOR & HUTTY PLATFORM – DATABASE HEALTH CHECK CLI
// Safe, read-only diagnostic script to verify database connectivity,
// schema table presence, and initial record populations.
//
// SAFETY:
// - Read-only (no writes, no drops, no schema modifications).
// - NEVER prints credentials, passwords, or raw connection strings.
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkDatabase = checkDatabase;
const client_1 = require("@prisma/client");
const defaultPrisma = new client_1.PrismaClient();
function getSanitizedDbUrl() {
    const url = process.env.DATABASE_URL;
    if (!url)
        return '[NOT CONFIGURED]';
    try {
        const parsed = new URL(url);
        return `${parsed.protocol}//${parsed.username ? '***' : ''}${parsed.password ? ':***@' : ''}${parsed.host}${parsed.pathname}`;
    }
    catch {
        return '[CONFIGURED (Custom Format)]';
    }
}
async function checkDatabase(client) {
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
    }
    catch (connErr) {
        console.error('❌ PostgreSQL Connection Failed:');
        console.error(`   Message: ${connErr.message}`);
        return false;
    }
    let allHealthy = true;
    console.log('2. Verifying critical schema tables and reference data:');
    const checkTable = async (name, query) => {
        try {
            const count = await query();
            console.log(`   ✅ Table "${name}": OK (${count} records)`);
            if (count === 0) {
                console.warn(`      ⚠️ Note: "${name}" has 0 records. Running "npm run db:seed" is recommended.`);
            }
            return count;
        }
        catch (err) {
            allHealthy = false;
            if (err.code === 'P2021' || err.message?.includes('does not exist')) {
                console.error(`   ❌ Table "${name}": MISSING (Table does not exist in PostgreSQL schema)`);
            }
            else {
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
    await checkTable('projects', () => prisma.project.count());
    console.log('----------------------------------------------------------------');
    if (allHealthy) {
        console.log('🎉 SUCCESS: All required tables exist and are accessible.');
        console.log('════════════════════════════════════════════════════════════════');
        return true;
    }
    else {
        console.error('🚨 SCHEMA INCOMPLETE: One or more tables are missing.');
        console.error('   Action required: Run "npx prisma db push" to initialize the database schema,');
        console.error('   followed by "npm run db:seed" to populate reference records.');
        console.log('════════════════════════════════════════════════════════════════');
        return false;
    }
}
if (require.main === module) {
    checkDatabase()
        .then((healthy) => {
        process.exit(healthy ? 0 : 1);
    })
        .catch((e) => {
        console.error('Diagnostic error:', e);
        process.exit(1);
    })
        .finally(async () => {
        await defaultPrisma.$disconnect();
    });
}
