BEGIN;

-- ==============================================================================
-- Hutty Migration: 20261021_add_project_persistence
-- Non-destructive addition of Project Persistence and Estimation Schema Objects
--
-- Safety Invariants:
-- - All operations run within an atomic transaction (BEGIN/COMMIT).
-- - All operations use IF NOT EXISTS or safe conditional blocks.
-- - No tables, columns, or records are dropped, truncated, or automatically nulled.
-- - Preserves valid existing business relationships, purchases, and entitlements.
-- ==============================================================================

-- 1. Create Enums if not present
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE lower(typname) = 'projectstatus') THEN
        CREATE TYPE "ProjectStatus" AS ENUM ('DRAFT', 'PLANNED', 'IN_PROGRESS', 'COMPLETED', 'ARCHIVED');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE lower(typname) = 'qualitytier') THEN
        CREATE TYPE "QualityTier" AS ENUM ('Essential', 'Premium', 'Luxury');
    END IF;
END$$;

-- 2. Create Project Table
CREATE TABLE IF NOT EXISTS "Project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "authority" TEXT NOT NULL,
    "status" "ProjectStatus" NOT NULL DEFAULT 'PLANNED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Project_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Indexes on Project
CREATE INDEX IF NOT EXISTS "Project_ownerId_idx" ON "Project"("ownerId");
CREATE INDEX IF NOT EXISTS "Project_city_idx" ON "Project"("city");
CREATE INDEX IF NOT EXISTS "Project_status_idx" ON "Project"("status");

-- 3. Create ProjectConfiguration Table
CREATE TABLE IF NOT EXISTS "ProjectConfiguration" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "plotLength" DOUBLE PRECISION NOT NULL,
    "plotWidth" DOUBLE PRECISION NOT NULL,
    "houseType" TEXT NOT NULL,
    "floors" INTEGER NOT NULL,
    "parkingType" TEXT NOT NULL,
    "carCount" INTEGER NOT NULL,
    "bikeCount" INTEGER NOT NULL,
    "evCharging" BOOLEAN NOT NULL,
    "liftRequired" BOOLEAN NOT NULL,
    "roomsJson" JSONB NOT NULL,
    "qualityTier" "QualityTier" NOT NULL,
    "materialBrands" JSONB NOT NULL,

    CONSTRAINT "ProjectConfiguration_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ProjectConfiguration_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "ProjectConfiguration_projectId_key" ON "ProjectConfiguration"("projectId");
CREATE INDEX IF NOT EXISTS "ProjectConfiguration_projectId_idx" ON "ProjectConfiguration"("projectId");

-- 4. Create CalculationResult Table
CREATE TABLE IF NOT EXISTS "CalculationResult" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "totalBUASqFt" DOUBLE PRECISION NOT NULL,
    "totalCostINR" DOUBLE PRECISION NOT NULL,
    "costPerSqFt" DOUBLE PRECISION NOT NULL,
    "steelTonnes" DOUBLE PRECISION NOT NULL,
    "cementBags" INTEGER NOT NULL,
    "concreteCuM" DOUBLE PRECISION NOT NULL,
    "timelineMonths" INTEGER NOT NULL,
    "budgetBreakdown" JSONB NOT NULL,
    "quantitiesJson" JSONB NOT NULL,
    "configSnapshot" JSONB,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CalculationResult_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "CalculationResult_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "CalculationResult_projectId_key" ON "CalculationResult"("projectId");
CREATE INDEX IF NOT EXISTS "CalculationResult_projectId_idx" ON "CalculationResult"("projectId");

-- 5. Create BOQItem Table
CREATE TABLE IF NOT EXISTS "BOQItem" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unitRate" DOUBLE PRECISION NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "brand" TEXT NOT NULL,
    "remarks" TEXT,

    CONSTRAINT "BOQItem_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "BOQItem_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "BOQItem_projectId_idx" ON "BOQItem"("projectId");
CREATE INDEX IF NOT EXISTS "BOQItem_category_idx" ON "BOQItem"("category");

-- 6. Create PaymentSchedule Table
CREATE TABLE IF NOT EXISTS "PaymentSchedule" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "stage" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "percentage" DOUBLE PRECISION NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "targetDate" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "bankDisbursement" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PaymentSchedule_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "PaymentSchedule_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "PaymentSchedule_projectId_idx" ON "PaymentSchedule"("projectId");

-- 7. Create ProcurementList Table
CREATE TABLE IF NOT EXISTS "ProcurementList" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "trade" TEXT NOT NULL,
    "item" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "specification" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "unitRate" DOUBLE PRECISION NOT NULL,
    "totalCost" DOUBLE PRECISION NOT NULL,
    "supplierNote" TEXT,
    "leadTimeDays" INTEGER NOT NULL DEFAULT 3,

    CONSTRAINT "ProcurementList_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ProcurementList_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "ProcurementList_projectId_idx" ON "ProcurementList"("projectId");

-- 8. Preserve valid data and integrate foreign keys from existing tables
DO $$
DECLARE
    orphaned_purchases INT := 0;
    orphaned_entitlements INT := 0;
    orphaned_consultations INT := 0;
    backfilled_projects INT := 0;
BEGIN
    -- 8.1 Ensure projectId columns exist if tables exist
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pricing_purchases') THEN
        EXECUTE 'ALTER TABLE "pricing_purchases" ADD COLUMN IF NOT EXISTS "projectId" TEXT';
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_entitlements') THEN
        EXECUTE 'ALTER TABLE "user_entitlements" ADD COLUMN IF NOT EXISTS "projectId" TEXT';
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'consultation_requests') THEN
        EXECUTE 'ALTER TABLE "consultation_requests" ADD COLUMN IF NOT EXISTS "projectId" TEXT';
    END IF;

    -- 8.2 Safe backfilling of Project records from historical pricing_purchases
    -- Preserves valuable customer project data and payment relationships rather than nulling them out.
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pricing_purchases') THEN
        EXECUTE '
            WITH candidate_projects AS (
                SELECT DISTINCT ON (p."projectId")
                    p."projectId" AS "id",
                    COALESCE(p."projectSnapshot"->>''projectName'', p."tierNameSnapshot" || '' Project'', ''Homeowner Construction Project'') AS "name",
                    COALESCE(p."userId", u."id") AS "ownerId",
                    COALESCE(p."projectSnapshot"->>''city'', ''Bangalore'') AS "city",
                    ''BBMP/BDA'' AS "authority",
                    ''PLANNED''::"ProjectStatus" AS "status",
                    p."createdAt" AS "createdAt",
                    p."updatedAt" AS "updatedAt"
                FROM "pricing_purchases" p
                LEFT JOIN "User" u ON lower(u."email") = lower(p."leadEmail")
                WHERE p."projectId" IS NOT NULL
                  AND p."projectId" NOT IN (SELECT "id" FROM "Project")
                  AND (
                      (p."userId" IS NOT NULL AND EXISTS (SELECT 1 FROM "User" WHERE "id" = p."userId"))
                      OR u."id" IS NOT NULL
                  )
                ORDER BY p."projectId", p."createdAt" ASC
            ),
            inserted_projects AS (
                INSERT INTO "Project" ("id", "name", "ownerId", "city", "authority", "status", "createdAt", "updatedAt")
                SELECT "id", "name", "ownerId", "city", "authority", "status", "createdAt", "updatedAt"
                FROM candidate_projects
                ON CONFLICT ("id") DO NOTHING
                RETURNING "id"
            )
            SELECT count(*) FROM inserted_projects' INTO backfilled_projects;

        RAISE NOTICE '[Migration] Backfilled % project(s) from historical pricing purchases.', backfilled_projects;
    END IF;

    -- 8.3 Safe backfilling of Project records from historical consultation_requests
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'consultation_requests') THEN
        EXECUTE '
            WITH candidate_con_projects AS (
                SELECT DISTINCT ON (c."projectId")
                    c."projectId" AS "id",
                    COALESCE(c."projectSnapshot"->>''projectName'', ''Consultation Project - '' || c."publicReference") AS "name",
                    COALESCE(c."userId", u."id") AS "ownerId",
                    COALESCE(c."projectLocation", ''Bangalore'') AS "city",
                    ''BBMP/BDA'' AS "authority",
                    ''PLANNED''::"ProjectStatus" AS "status",
                    c."createdAt" AS "createdAt",
                    c."updatedAt" AS "updatedAt"
                FROM "consultation_requests" c
                LEFT JOIN "User" u ON lower(u."email") = lower(c."homeownerEmail")
                WHERE c."projectId" IS NOT NULL
                  AND c."projectId" NOT IN (SELECT "id" FROM "Project")
                  AND (
                      (c."userId" IS NOT NULL AND EXISTS (SELECT 1 FROM "User" WHERE "id" = c."userId"))
                      OR u."id" IS NOT NULL
                  )
                ORDER BY c."projectId", c."createdAt" ASC
            ),
            inserted_con_projects AS (
                INSERT INTO "Project" ("id", "name", "ownerId", "city", "authority", "status", "createdAt", "updatedAt")
                SELECT "id", "name", "ownerId", "city", "authority", "status", "createdAt", "updatedAt"
                FROM candidate_con_projects
                ON CONFLICT ("id") DO NOTHING
                RETURNING "id"
            )
            SELECT count(*) FROM inserted_con_projects' INTO backfilled_projects;

        RAISE NOTICE '[Migration] Backfilled % project(s) from historical consultation requests.', backfilled_projects;
    END IF;

    -- 8.4 Report orphaned records where no valid owner account exists in User
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pricing_purchases') THEN
        EXECUTE 'SELECT count(*) FROM "pricing_purchases" WHERE "projectId" IS NOT NULL AND "projectId" NOT IN (SELECT "id" FROM "Project")' 
        INTO orphaned_purchases;
        IF orphaned_purchases > 0 THEN
            RAISE NOTICE '[Migration] Found % orphaned purchase record(s) referencing non-existent projects without owner accounts. Data is preserved.', orphaned_purchases;
        END IF;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_entitlements') THEN
        EXECUTE 'SELECT count(*) FROM "user_entitlements" WHERE "projectId" IS NOT NULL AND "projectId" NOT IN (SELECT "id" FROM "Project")' 
        INTO orphaned_entitlements;
        IF orphaned_entitlements > 0 THEN
            RAISE NOTICE '[Migration] Found % orphaned entitlement record(s) referencing non-existent projects without owner accounts. Data is preserved.', orphaned_entitlements;
        END IF;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'consultation_requests') THEN
        EXECUTE 'SELECT count(*) FROM "consultation_requests" WHERE "projectId" IS NOT NULL AND "projectId" NOT IN (SELECT "id" FROM "Project")' 
        INTO orphaned_consultations;
        IF orphaned_consultations > 0 THEN
            RAISE NOTICE '[Migration] Found % orphaned consultation record(s) referencing non-existent projects without owner accounts. Data is preserved.', orphaned_consultations;
        END IF;
    END IF;

    -- 8.5 Add Foreign Key constraints using NOT VALID
    -- Using NOT VALID enforces the constraint for all future inserts and updates without failing on legacy unlinked rows,
    -- guaranteeing zero data loss, preserving historical relationships, and preventing migration aborts.
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pricing_purchases') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'pricing_purchases_projectId_fkey'
        ) THEN
            EXECUTE 'ALTER TABLE "pricing_purchases" ADD CONSTRAINT "pricing_purchases_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE NOT VALID';
        END IF;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_entitlements') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'user_entitlements_projectId_fkey'
        ) THEN
            EXECUTE 'ALTER TABLE "user_entitlements" ADD CONSTRAINT "user_entitlements_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE NOT VALID';
        END IF;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'consultation_requests') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'consultation_requests_projectId_fkey'
        ) THEN
            EXECUTE 'ALTER TABLE "consultation_requests" ADD CONSTRAINT "consultation_requests_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE NOT VALID';
        END IF;
    END IF;
END$$;

COMMIT;

