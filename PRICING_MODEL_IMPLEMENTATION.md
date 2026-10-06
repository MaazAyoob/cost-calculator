# HUTTY PRICING MODEL V1 IMPLEMENTATION ARCHITECTURE
## FREE + ₹99 + ₹499 + COMPLETE PACKAGE (COMING SOON)

---

### EXECUTIVE SUMMARY & BOUNDARY INTEGRITY

This document records the architecture, data models, server authority, and security controls for **Hutty's Commercial Pricing Model V1**.

- **FREE Tier:** ₹0 (0 paise) — Basic preliminary cost indicators, footprint, and built-up area (BUA) calculations.
- **₹99 Verified Plan (`ESTIMATE_99`):** ₹99 (9,900 paise) — Primary customer lead-capture level, cloud-saved project feasibility, and high-level trade brackets.
- **₹499 Detailed Construction Dossier (`DETAILED_ESTIMATE_499`):** ₹499 (49,900 paise) — Flagship quantity surveyor dossier unlocking itemized civil/structural Works BOQ, physical material takeoff schedules (steel kg, cement bags, sand CFT), installed fixture lists, labour wage allocations, and downloadable official bank-ready PDF.
- **COMPLETE PACKAGE (`COMPLETE_PACKAGE`):** Price NOT YET FINALIZED by business management. Stored as unpurchasable with `priceMinorUnits: 0` and badge "Coming Soon". Server and UI strictly reject purchase attempts until Admin configures a valid final price (> ₹0).
- **CONSULTATION FEATURE IS COMPLETELY SEPARATE:** The ₹1,499 launch consultation service remains strictly independent with its own booking flow, consultant profiles, and pipeline. It is NOT merged into calculator tiers.
- **CALCULATION MATHEMATICS ARE INVARIANT:** The canonical calculation engine (`runCalculator`, Rate Master, physical material formulas, concrete/steel equations) is the sole source of truth. Physical quantities do NOT change based on customer pricing tier. The pricing layer sits ABOVE the engine to govern **COMMERCIAL ACCESS**.

---

### 1. COMMERCIAL PRICING TIERS

| Tier Code | Display Name | Price (Paise) | Price (INR) | Purchasable | Public Status | Deliverable Scope |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`FREE`** | Free Estimate | 0 | ₹0 | No (Open) | Active | Basic summary, total BUA, preliminary cost range, 10-step spec explorer. |
| **`ESTIMATE_99`** | ₹99 Verified Estimate | 9,900 | ₹99 | Yes | Active | Lead capture, saved project geometry, preliminary trade brackets. |
| **`DETAILED_ESTIMATE_499`** | Detailed Construction Dossier | 49,900 | ₹499 | Yes | Active | Itemized Works BOQ, material takeoff, fixture schedule, labour, high-res PDF. |
| **`COMPLETE_PACKAGE`** | Complete Construction Package | 0 | Unfinalized | **No** | Coming Soon | Turnkey architectural drawing set, structural vetting, BOQ governance (Awaiting business pricing). |

---

### 2. DATABASE PERSISTENCE & PRISMA SCHEMA

The schema is additive to PostgreSQL via Prisma:

```prisma
enum PricingPurchaseStatus {
  CREATED
  PENDING
  PAID
  FAILED
  CANCELLED
  REFUNDED
}

model PricingTier {
  id               String            @id @default(uuid())
  code             String            @unique // "FREE" | "ESTIMATE_99" | "DETAILED_ESTIMATE_499" | "COMPLETE_PACKAGE"
  name             String
  description      String
  priceMinorUnits  Int               @default(0) // Integer paise (0, 9900, 49900)
  currency         String            @default("INR")
  active           Boolean           @default(true)
  purchasable      Boolean           @default(false)
  sortOrder        Int               @default(0)
  badge            String?
  features         String[]
  createdAt        DateTime          @default(now())
  updatedAt        DateTime          @updatedAt
  purchases        PricingPurchase[]
  auditLogs        PricingAuditLog[]

  @@index([code])
  @@index([active])
  @@index([purchasable])
  @@map("pricing_tiers")
}

model PricingPurchase {
  id                 String                @id @default(uuid())
  publicReference    String                @unique // e.g. "HT-PUR-XXXXXX"
  userId             String?
  user               User?                 @relation(fields: [userId], references: [id], onDelete: SetNull)
  tierId             String
  tier               PricingTier           @relation(fields: [tierId], references: [id])
  tierCodeSnapshot   String
  tierNameSnapshot   String
  amountMinorUnits   Int                   // Preserved historical purchase amount
  currency           String                @default("INR")
  status             PricingPurchaseStatus @default(PENDING)
  gateway            String                @default("RAZORPAY")
  gatewayOrderId     String?               @unique
  gatewayPaymentId   String?               @unique
  leadName           String
  leadPhone          String
  leadEmail          String
  projectId          String?
  project            Project?              @relation(fields: [projectId], references: [id], onDelete: SetNull)
  projectSnapshot    Json?
  entitlements       UserEntitlement[]
  createdAt          DateTime              @default(now())
  updatedAt          DateTime              @updatedAt

  @@index([userId])
  @@index([tierId])
  @@index([status])
  @@index([publicReference])
  @@index([gatewayOrderId])
  @@index([createdAt])
  @@map("pricing_purchases")
}

model UserEntitlement {
  id               String           @id @default(uuid())
  userId           String?
  user             User?            @relation(fields: [userId], references: [id], onDelete: SetNull)
  userEmail        String?
  projectId        String?
  project          Project?         @relation(fields: [projectId], references: [id], onDelete: SetNull)
  featureCode      String
  sourcePurchaseId String?
  sourcePurchase   PricingPurchase? @relation(fields: [sourcePurchaseId], references: [id], onDelete: SetNull)
  active           Boolean          @default(true)
  startsAt         DateTime         @default(now())
  expiresAt        DateTime?
  createdAt        DateTime         @default(now())
  updatedAt        DateTime         @updatedAt

  @@index([userId])
  @@index([userEmail])
  @@index([projectId])
  @@index([featureCode])
  @@index([active])
  @@map("user_entitlements")
}

model PricingAuditLog {
  id          String       @id @default(uuid())
  tierId      String?
  tier        PricingTier? @relation(fields: [tierId], references: [id], onDelete: SetNull)
  tierCode    String?
  actorEmail  String       @default("admin@hutty.in")
  action      String       // "PRICE_UPDATED" | "STATUS_CHANGED" | "FEATURES_UPDATED" | "TIER_CREATED"
  oldValue    Json?
  newValue    Json?
  reason      String?
  createdAt   DateTime     @default(now())

  @@index([tierId])
  @@index([createdAt])
  @@map("pricing_audit_logs")
}
```

---

### 3. SERVER-SIDE PRICE AUTHORITY

- **No Client Price Authority:** The frontend never sends `amount` or `price` to determine charge.
- The browser sends `tierCode` (e.g. `'DETAILED_ESTIMATE_499'`).
- The backend server looks up the tier in the database, verifying `tier.active === true` and `tier.purchasable === true`.
- Price is resolved strictly in integer minor units (paise):
  - `ESTIMATE_99` = `9900`
  - `DETAILED_ESTIMATE_499` = `49900`
  - `FREE` = `0`
- Any `amount` or `discount` passed in request payloads is ignored by the server.

---

### 4. HISTORICAL PURCHASE SNAPSHOT INVARIANCE

- Every purchase records:
  - `tierCodeSnapshot`: Name/code at the time of order creation.
  - `tierNameSnapshot`: Human-readable label at the time of order creation.
  - `amountMinorUnits`: The exact amount paid at that moment in history.
- When Hutty Admin updates tier prices (e.g. from ₹499 to ₹599 in the future):
  - Historical purchases **NEVER** mutate.
  - Past orders retain their `49900` paise snapshot.
  - Future orders resolve to the newly configured price.
  - Fully tested by regression test suite.

---

### 5. COMPLETE PACKAGE SAFETY PROTOCOL

1. Price is marked unfinalized (`priceMinorUnits: 0`).
2. Card is rendered with status **"Coming Soon"** on `/pricing`.
3. Checkout button is disabled in the UI.
4. Backend `initiatePurchase` rejects any purchase requests with code `COMPLETE_PACKAGE` until `purchasable === true`.
5. Admin Panel enforces:
   - Admin cannot set `purchasable: true` on Complete Package while price is `<= 0`.
   - Attempting to do so triggers an explicit validation error: *"Complete Package cannot be made purchasable until a valid final price (> 0) is configured"*.

---

### 6. CENTRALIZED ACCESS CONTROL & ENTITLEMENTS

Instead of hardcoded `if (paid === 499)` checks, access is centralized through:

```ts
canAccessFeature(featureCode: string, projectId?: string): boolean
```

**Feature Keys:**
- `BASIC_PROJECT_SUMMARY`: Always accessible (Free).
- `BASIC_COST_SUMMARY`: Always accessible (Free).
- `LEAD_CAPTURE`: Unlocked with ₹99 and ₹499.
- `SAVED_PROJECT`: Unlocked with ₹99 and ₹499.
- `DETAILED_QUANTITIES`: Unlocked with ₹499.
- `DETAILED_BOQ`: Unlocked with ₹499.
- `MATERIAL_SCHEDULE`: Unlocked with ₹499.
- `FIXTURES_SCHEDULE`: Unlocked with ₹499.
- `LABOUR_BREAKDOWN`: Unlocked with ₹499.
- `DETAILED_COST_BREAKDOWN`: Unlocked with ₹499.
- `FULL_PDF_REPORT`: Unlocked with ₹499.
- `REPORT_DOWNLOAD`: Unlocked with ₹499.
- `COMPLETE_PACKAGE_FEATURES`: Reserved for future Complete Package activation.

---

### 7. LEAD CAPTURE INTEGRATION

The ₹99 level serves primarily as a verified lead-capture tier. Upon order initiation:
- Homeowner Name, Phone, and Email are recorded.
- Project snapshot (BUA, house type, preliminary cost) is attached.
- Lead information is stored in `PricingPurchase` and cached in `useReportStore`.
- Admin can search, filter, and inspect leads directly in Admin -> Products & Pricing -> Purchases & Revenue.

---

### 8. PAYMENT GATEWAY INTEGRATION & ISOLATION

- **Production Safety:** No fake `PAID` statuses are simulated in live customer paths.
- Payment gateway orders are initialized with gateway order IDs (`order_rc_...`).
- When live credentials (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`) are provided in `.env`, the Razorpay order creation and HMAC verification activate seamlessly.
- Developer testing bypass is explicitly gated behind `isDevPdfTestingEnabled()` and clearly labeled with visual banners so production customers are never misled.

---

### 9. ADMIN PANEL CONTROLS

Under **Admin -> 8. Products & Pricing**:
1. **Pricing Tiers Tab (`AdminPricingTiersSection`):**
   - Live tier overview (price, minor units, purchasable state, active state).
   - Configure Tier modal (name, description, price in INR, active/purchasable toggles, feature entitlement matrix selector).
   - Complete Package price activation.
   - Comprehensive audit log table recording timestamp, tier, old price, new price, actor email, and reason.
2. **Purchases & Revenue Tab (`AdminPricingPurchasesSection`):**
   - Verified genuine revenue metrics (derived strictly from `PAID` purchases).
   - Order search by customer name, email, phone, or order reference (`HT-PUR-XXXXXX`).
   - Status filters (`ALL`, `PAID`, `PENDING`).
   - Historical snapshots and gateway references.

---

### 10. REVIEWS & REGRESSION TESTING SUMMARY

- **Calculation Invariance:** Same inputs across FREE, ₹99, and ₹499 produce **100% identical** physical quantities (BUA, concrete volume m³, steel rebar kg, cement bags, sand CFT, block count, tiles sqft, and total cost INR).
- **Price Authority:** Client price spoofing is completely ignored.
- **Safety Boundaries:** Complete package cannot be checked out with missing price.
- **Decoupled Consultation:** Consultation fee remains strictly ₹1,499.
