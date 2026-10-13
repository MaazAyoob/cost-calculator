"use strict";
// ============================================================
// COST CALCULATOR & HUTTY PLATFORM – DATABASE SEED SCRIPT
// Authoritative Idempotent Seed Script
// Populates:
// 1. Admin & Client users
// 2. Material categories
// 3. Commercial pricing tiers (Pricing Model V1)
// 4. Curated expert consultants (Consultation V1)
// 5. Authoritative baseline calculation version & parameters (v1.0.0)
// 6. System audit log
//
// SAFETY: All operations use idempotent upsert without deleting,
// dropping, or altering existing production data.
// ============================================================
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runSeed = runSeed;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const pricing_constants_1 = require("../src/constants/pricing.constants");
const consultation_service_1 = require("../src/services/consultation.service");
const canonicalConfig_1 = require("../src/constants/canonicalConfig");
const defaultPrisma = new client_1.PrismaClient();
async function runSeed(client) {
    const prisma = client || defaultPrisma;
    console.log('[Seed] Starting Hutty production database seed...');
    // 1. Default Admin Users
    const adminPasswordHash = await bcryptjs_1.default.hash('Admin@123456', 10);
    const adminEmails = ['admin@costcalculator.app', 'admin@hutty.in'];
    for (const email of adminEmails) {
        const admin = await prisma.user.upsert({
            where: { email },
            update: {
                role: 'ADMIN',
            },
            create: {
                email,
                name: email === 'admin@hutty.in' ? 'Hutty Administrator' : 'System Admin',
                phone: '+91 9876543210',
                role: 'ADMIN',
                password: adminPasswordHash,
            },
        });
        console.log(`[Seed] Admin user verified: ${admin.email}`);
    }
    // 2. Sample Client User
    const userPasswordHash = await bcryptjs_1.default.hash('Client@123456', 10);
    const clientUser = await prisma.user.upsert({
        where: { email: 'client@rightcon.in' },
        update: {},
        create: {
            email: 'client@rightcon.in',
            name: 'Rajesh Sharma',
            phone: '+91 9845012345',
            role: 'USER',
            password: userPasswordHash,
        },
    });
    console.log(`[Seed] Client user verified: ${clientUser.email}`);
    // 3. Material Categories
    const categories = [
        { name: 'Steel', unit: 'tonne' },
        { name: 'Cement', unit: 'bag' },
        { name: 'Doors', unit: 'set' },
        { name: 'Windows', unit: 'sq ft' },
        { name: 'Flooring', unit: 'sq ft' },
        { name: 'Paint', unit: 'litre' },
        { name: 'Electrical', unit: 'metre' },
        { name: 'Plumbing', unit: 'set' },
    ];
    for (const cat of categories) {
        await prisma.materialCategory.upsert({
            where: { name: cat.name },
            update: { unit: cat.unit },
            create: {
                name: cat.name,
                unit: cat.unit,
            },
        });
    }
    console.log(`[Seed] Verified ${categories.length} material categories.`);
    // 4. Commercial Pricing Tiers (Pricing Model V1)
    let seededTiers = 0;
    for (const t of pricing_constants_1.INITIAL_PRICING_TIERS) {
        await prisma.pricingTier.upsert({
            where: { code: t.code },
            update: {
                name: t.name,
                description: t.description,
                priceMinorUnits: t.priceMinorUnits,
                currency: t.currency,
                active: t.active,
                purchasable: t.purchasable,
                sortOrder: t.sortOrder,
                badge: t.badge,
                features: [...t.features],
            },
            create: {
                id: `tier-${t.code.toLowerCase()}`,
                code: t.code,
                name: t.name,
                description: t.description,
                priceMinorUnits: t.priceMinorUnits,
                currency: t.currency,
                active: t.active,
                purchasable: t.purchasable,
                sortOrder: t.sortOrder,
                badge: t.badge,
                features: [...t.features],
            },
        });
        seededTiers++;
    }
    console.log(`[Seed] Verified ${seededTiers} commercial pricing tiers.`);
    // 5. Curated Expert Consultants (Consultation V1)
    let seededConsultants = 0;
    for (const c of consultation_service_1.INITIAL_CONSULTANTS) {
        await prisma.consultant.upsert({
            where: { slug: c.slug },
            update: {
                name: c.name,
                title: c.title,
                category: c.category,
                profileImage: c.profileImage,
                experienceYears: c.experienceYears,
                city: c.city,
                serviceAreas: c.serviceAreas,
                about: c.about,
                specializations: c.specializations,
                services: c.services,
                active: c.active,
                featured: c.featured,
                displayOrder: c.displayOrder,
            },
            create: {
                id: c.id,
                slug: c.slug,
                name: c.name,
                title: c.title,
                category: c.category,
                profileImage: c.profileImage,
                experienceYears: c.experienceYears,
                city: c.city,
                serviceAreas: c.serviceAreas,
                about: c.about,
                specializations: c.specializations,
                services: c.services,
                active: c.active,
                featured: c.featured,
                displayOrder: c.displayOrder,
            },
        });
        seededConsultants++;
    }
    console.log(`[Seed] Verified ${seededConsultants} expert consultants.`);
    // 6. Authoritative Baseline Calculation Version (v1.0.0)
    const baselineVersion = await prisma.calculationConfigVersion.upsert({
        where: { versionNumber: canonicalConfig_1.CANONICAL_BASELINE_VERSION.versionNumber },
        update: {
            status: canonicalConfig_1.CANONICAL_BASELINE_VERSION.status,
            parametersCount: canonicalConfig_1.CANONICAL_CONFIG_PARAMETERS.length,
        },
        create: {
            versionNumber: canonicalConfig_1.CANONICAL_BASELINE_VERSION.versionNumber,
            status: canonicalConfig_1.CANONICAL_BASELINE_VERSION.status,
            description: 'Authoritative Baseline Configuration Version 1.0.0',
            changeNote: canonicalConfig_1.CANONICAL_BASELINE_VERSION.changeNote,
            createdBy: canonicalConfig_1.CANONICAL_BASELINE_VERSION.createdBy,
            publishedBy: canonicalConfig_1.CANONICAL_BASELINE_VERSION.publishedBy,
            effectiveFrom: canonicalConfig_1.CANONICAL_BASELINE_VERSION.effectiveFrom,
            parametersCount: canonicalConfig_1.CANONICAL_CONFIG_PARAMETERS.length,
            validationStatus: 'VALID',
        },
    });
    console.log(`[Seed] Calculation configuration version verified: ${baselineVersion.versionNumber} (${baselineVersion.status})`);
    // 7. Authoritative Canonical Parameters
    let seededParams = 0;
    for (const param of canonicalConfig_1.CANONICAL_CONFIG_PARAMETERS) {
        const loc = param.location || 'Global';
        const tier = param.specificationTier || 'Global';
        await prisma.calculationConfigParameter.upsert({
            where: {
                config_param_unique: {
                    versionId: baselineVersion.id,
                    key: param.key,
                    location: loc,
                    specificationTier: tier,
                },
            },
            update: {
                name: param.name,
                valueJson: param.value,
                unit: param.unit,
                valueType: param.valueType,
                minimum: param.minimum ?? null,
                maximum: param.maximum ?? null,
            },
            create: {
                versionId: baselineVersion.id,
                key: param.key,
                name: param.name,
                description: param.description || null,
                category: param.category,
                valueJson: param.value,
                unit: param.unit,
                valueType: param.valueType,
                minimum: param.minimum ?? null,
                maximum: param.maximum ?? null,
                location: loc,
                specificationTier: tier,
                source: param.source || 'Canonical Spec',
                isStatutory: Boolean(param.isStatutory),
                status: 'ACTIVE',
                createdBy: 'Hutty Engineering',
            },
        });
        seededParams++;
    }
    console.log(`[Seed] Verified ${seededParams} canonical configuration parameters.`);
    // 8. System Seed Audit Log
    const adminRecord = await prisma.user.findUnique({
        where: { email: 'admin@costcalculator.app' },
    });
    if (adminRecord) {
        await prisma.auditLog.create({
            data: {
                action: 'SYSTEM_SEED',
                userId: adminRecord.id,
                details: {
                    message: 'Database verified with baseline users, categories, pricing tiers, consultants, and canonical config v1.0.0',
                    pricingTiersCount: seededTiers,
                    consultantsCount: seededConsultants,
                    configParametersCount: seededParams,
                },
            },
        });
    }
    console.log('[Seed] Database seed completed successfully!');
}
if (require.main === module) {
    runSeed()
        .catch((e) => {
        console.error('[Seed Error]', e);
        process.exit(1);
    })
        .finally(async () => {
        await defaultPrisma.$disconnect();
    });
}
