# HUTTY — CONSULTATION MVP: BACKEND, DATABASE, PAYMENT & PRODUCTION HARDENING AUDIT
**Document Version:** 1.0.0 (Phase 1B Production Hardening)  
**Execution Timestamp:** 2026-10-04  
**Scope:** Residential Construction Consultation Booking & Admin Workflow  

---

## 1. Executive Summary & Architecture Overview

The Hutty Residential Planning Platform Consultation MVP has undergone a comprehensive backend, database, payment, security, and concurrency hardening audit. The Consultation feature connects Bangalore homeowners with verified architectural, structural, contracting, and quantity surveying experts for a single fixed fee of **₹1,499** (strictly **149900 paise**).

### High-Level Architecture Flow
```
[ Homeowner / Client ]
      │  (Selects Consultant, enters details, optional linked Project)
      ▼
[ POST /api/v1/consultations ]
      │  • Validates input schema via Zod
      │  • Verifies consultant exists & active
      │  • Enforces project ownership if projectId supplied (User A vs User B check)
      │  • Discards client-sent amount/fee (server authoritative: 149900 paise)
      │  • Generates order & HT-CON-XXXXXX public reference
      │  • Creates Request (AWAITING_REVIEW) + Payment (PENDING) in atomic transaction
      ▼
[ Razorpay Gateway Checkout ]
      │  • Real Razorpay order ID (or deterministic sandbox ID when keys not set)
      │  • Homeowner pays ₹1,499 online
      ▼
[ POST /api/v1/consultations/:id/verify-payment ] OR [ POST /api/v1/consultations/webhook ]
      │  • Cryptographic HMAC-SHA256 signature verification (constant-time timingSafeEqual)
      │  • Replay & idempotency check (already-PAID requests return immediately)
      │  • In atomic Prisma transaction:
      │      - Payment.status = PAID, verifiedAt recorded
      │      - ConsultationRequest.status = AWAITING_REVIEW
      │      - ConsultationEvent = PAYMENT_CONFIRMED
      ▼
[ Admin Panel Workflow ]
      │  • RBAC Protected (authenticateToken + requireAdmin)
      │  • Consultant Assignment & Reassignment (ASSIGNED)
      │  • Schedule Appointment (SCHEDULED with confirmedDateTime)
      │  • Enforced Status State Machine (disallows illegal jumps like COMPLETED -> AWAITING_REVIEW)
      │  • Internal Notes (strictly stripped from customer endpoints)
```

---

## 2. Database Models & Schema Audit

PostgreSQL persistence is managed via Prisma with model definitions in both `server/prisma/schema.prisma` and `prisma/schema.prisma`.

### Models Configured:
1. **`Consultant`** (`consultants` table):
   - `id`: UUID primary key.
   - `slug`: Unique lowercase slug (e.g. `ar-ramesh-nambiar`).
   - `name`, `title`, `category`: Professional categorization.
   - `experienceYears`, `city`, `serviceAreas`, `about`, `specializations`, `services`.
   - `active` (Boolean), `featured` (Boolean), `displayOrder` (Int).
   - Indexed on: `[category]`, `[city]`, `[active]`, `[slug]`.

2. **`ConsultationRequest`** (`consultation_requests` table):
   - `id`: UUID primary key.
   - `publicReference`: Unique uppercase human reference (e.g. `HT-CON-89421A`).
   - `idempotencyKey`: Optional unique key preventing double-click duplicate creation.
   - `userId`: Nullable relation to `User`.
   - `consultantId`: Nullable relation to `Consultant` (OnDelete: SetNull).
   - `consultantNameSnapshot`, `consultantTitleSnapshot`: **Historical immutable snapshots**.
   - `homeownerName`, `homeownerPhone`, `homeownerEmail`.
   - `projectId`: Nullable relation to `Project` (OnDelete: SetNull).
   - `projectSnapshot`: JSON summary preserving snapshot data.
   - `projectLocation`, `projectType`, `consultationTopic`, `message`.
   - `preferredDate`, `preferredTime`, `confirmedDateTime` (Nullable DateTime).
   - `status`: Enum (`AWAITING_REVIEW`, `UNDER_REVIEW`, `ASSIGNED`, `ACCEPTED`, `SCHEDULED`, `RESCHEDULE_REQUESTED`, `COMPLETED`, `REJECTED`, `CANCELLED`).
   - `amountMinorUnits`: `149900` (₹1,499 in paise).
   - `currency`: `'INR'`.
   - Indexed on: `[userId]`, `[consultantId]`, `[status]`, `[publicReference]`, `[idempotencyKey]`, `[createdAt]`.

3. **`ConsultationPayment`** (`consultation_payments` table):
   - `id`: UUID primary key.
   - `consultationRequestId`: Relation to `ConsultationRequest` (Cascade).
   - `gateway`: `'RAZORPAY'`.
   - `gatewayOrderId`: Unique order string.
   - `gatewayPaymentId`: Unique nullable payment transaction ID.
   - `gatewaySignature`: Cryptographic signature hex string.
   - `amountMinorUnits`: `149900`.
   - `currency`: `'INR'`.
   - `status`: Enum (`PENDING`, `PAID`, `FAILED`, `REFUND_PENDING`, `REFUNDED`).
   - `verifiedAt`: Nullable DateTime.
   - Indexed on: `[consultationRequestId]`, `[gatewayOrderId]`, `[status]`.

4. **`ConsultationEvent`** (`consultation_events` table):
   - `id`: UUID primary key.
   - `consultationRequestId`: Relation to `ConsultationRequest` (Cascade).
   - `actorId`, `actorRole`: (`ADMIN` | `USER` | `SYSTEM`).
   - `eventType`: (`REQUEST_CREATED`, `PAYMENT_CONFIRMED`, `STATUS_CHANGED`, `CONSULTANT_ASSIGNED`, `SCHEDULE_CONFIRMED`, `INTERNAL_NOTE_ADDED`).
   - `title`: Event description.
   - `internalNote`: Private admin note (**strictly excluded from homeowner responses**).
   - `metadataJson`: Structured context.
   - Indexed on: `[consultationRequestId]`, `[createdAt]`.

---

## 3. Money Handling & Anti-Tampering Protections

- **Fixed Price Representation:** ₹1,499 is represented strictly as **149900 paise** in minor units. No floating point math is used.
- **Server-Side Price Authority:** The backend completely ignores any client-supplied `amount`, `fee`, or price values in `createBookingRequest`.
- **Payment Verification Integrity:** When verifying payments, the backend checks that the associated payment record has `amountMinorUnits === 149900` and `currency === 'INR'`.
- **No Mock Success:** Removed mock bypasses. Payment status transitions to `PAID` only when cryptographic verification or verified gateway callbacks succeed.

---

## 4. Payment Gateway & Cryptographic Verification

### Razorpay Integration
1. **Order Creation:**
   - Calls official Razorpay Orders API (`POST https://api.razorpay.com/v1/orders`) when `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are configured.
   - When keys are not configured (local development/unit tests), generates deterministic sandbox order identifiers.
2. **Signature Verification:**
   - Evaluates:
     $$\text{HMAC-SHA256}(\text{keySecret}, \text{gatewayOrderId} + "|" + \text{gatewayPaymentId})$$
   - Uses `crypto.timingSafeEqual` to prevent timing attacks.
   - If `RAZORPAY_KEY_SECRET` is set, `gatewaySignature` is **strictly required**. Any request lacking a signature or providing a mismatched signature is rejected with an audit failure record.

---

## 5. Webhook Security & Idempotency

- **Endpoint:** `POST /api/v1/consultations/webhook`
- **Raw Body Handling:** Express middleware configured with `verify` hook preserving `req.rawBody` as a raw string.
- **Signature Header:** `x-razorpay-signature` validated against `RAZORPAY_WEBHOOK_SECRET`.
- **Idempotency Guarantee:**
  - Sending the same webhook 2, 5, or 10 times will not create duplicate consultation requests, duplicate payment records, or repeated state transitions.
  - If `payment.status === 'PAID'`, subsequent events return `{ status: 'idempotent', message: 'Payment already marked as PAID' }` with HTTP 200.
- **Handled Events:** `payment.captured`, `order.paid`, `payment.failed`.

---

## 6. Project Link Security

- **Optional Linking:** Homeowners can book with or without a project.
- **Ownership Verification:**
  - If `projectId` is passed:
    - User **must** be authenticated (`userContext.id` required).
    - If user is unauthenticated, booking is rejected (`"Authentication required to link an existing project."`).
    - Project owner ID checked against `userContext.id`. If mismatched, rejected with HTTP 403 (`"Forbidden: You do not have permission to link this project."`).
- **Data Leak Prevention:** Only non-sensitive architectural summary fields are copied into `projectSnapshot` (`projectId`, `projectName`, `city`, `houseType`, `floors`, `totalBUASqFt`, `estimatedTotalCostINR`). Raw calculation formulas, margin markups, and internal IDs are never leaked.

---

## 7. Admin Authorization & Security Controls

- **Route Protection:** All admin endpoints (`/api/v1/admin/consultants`, `/api/v1/admin/consultations`) protected by `authenticateToken` and `requireAdmin` middlewares.
- **Homeowner Isolation:** Customer endpoints (`/api/v1/consultations/my`, `/api/v1/consultations/:id`) enforce ownership. A homeowner cannot view requests belonging to other users (returns HTTP 403/404).
- **Internal Note Privacy:** Internal notes created by admins are strictly filtered out of customer-facing responses both at the database query level and in serialization helpers.
- **State Machine Transitions:**
  - Enforced valid status transitions:
    - `AWAITING_REVIEW` $\rightarrow$ `UNDER_REVIEW`, `ASSIGNED`, `CANCELLED`, `REJECTED`
    - `UNDER_REVIEW` $\rightarrow$ `ASSIGNED`, `REJECTED`, `CANCELLED`
    - `ASSIGNED` $\rightarrow$ `ACCEPTED`, `SCHEDULED`, `RESCHEDULE_REQUESTED`, `CANCELLED`
    - `ACCEPTED` $\rightarrow$ `SCHEDULED`, `RESCHEDULE_REQUESTED`, `CANCELLED`
    - `SCHEDULED` $\rightarrow$ `RESCHEDULE_REQUESTED`, `COMPLETED`, `CANCELLED`
    - `RESCHEDULE_REQUESTED` $\rightarrow$ `SCHEDULED`, `CANCELLED`
    - `COMPLETED`, `REJECTED`, `CANCELLED` $\rightarrow$ Terminal (no further transitions)
  - Illegal status jumps (e.g. `COMPLETED` $\rightarrow$ `AWAITING_REVIEW`) are rejected with HTTP 400.

---

## 8. Rate Limiting & Production CORS

- **Rate Limiting:**
  - Booking Creation: 15 requests per 15 minutes per IP (`Retry-After` header sent when throttled).
  - Payment Verification: 20 requests per 15 minutes per IP.
  - Webhooks: 120 requests per minute per IP.
  - Public Catalog: 150 requests per minute per IP.
- **CORS Hardening:**
  - In production (`NODE_ENV === 'production'`), wildcard `*` with credentials is explicitly prohibited.
  - Production origins whitelist: `https://hutty.in`, `https://www.hutty.in`, `https://cost-calculator-ten-kappa.vercel.app`, and configured `*.vercel.app` preview branches.

---

## 9. Environment Variables Audit

| Variable | Scope | Status | Purpose |
|---|---|---|---|
| `DATABASE_URL` | Server | Required | PostgreSQL connection string |
| `JWT_SECRET` | Server | Required | Auth token signing key |
| `NODE_ENV` | Server | Required | `production` / `development` / `test` |
| `CORS_ORIGIN` | Server | Required | Whitelisted frontend origin |
| `RAZORPAY_KEY_ID` | Server | Required for Live | Razorpay Key ID (`rzp_live_...` or `rzp_test_...`) |
| `RAZORPAY_KEY_SECRET` | Server | Required for Live | Razorpay Key Secret for cryptographic HMAC verification |
| `RAZORPAY_WEBHOOK_SECRET` | Server | Required for Live | Razorpay Webhook Secret for incoming events |
| `FRONTEND_URL` | Server | Optional | Frontend application URL |

*Note: Real secrets are never stored in client bundles or committed to Git. Only placeholders are placed in `.env.example`.*

---

## 10. Test Execution & Build Verification

### Vitest Test Suite Results:
- **Total Test Files:** 27 passed (27)
- **Total Tests:** 363 passed (363)
- **Pass Rate:** **100%**
- **Test Breakdown in `consultation_feature.test.ts` (23 tests):**
  1. Admin consultant creation with required profile fields
  2. Admin consultant editing
  3. Inactive consultant hidden from public listing
  4. Public profile route slug resolution
  5. Search query filtering
  6. Category filtering
  7. Fixed ₹1,499 pricing verification
  8. Booking request without project
  9. Booking request with linked project snapshot
  10. Payment verification and transition to "Paid — Awaiting Admin Review"
  11. Admin consultant assignment and timeline event recording
  12. Admin appointment scheduling with confirmedDateTime
  13. Admin internal notes privacy (strictly hidden from homeowner)
  14. Security: User cannot access another user's request
  15. **Anti-Tampering:** Server ignores manipulated client price
  16. **Project Link Security:** Unauthenticated user cannot link a project
  17. **Payment Verification:** Authentic HMAC-SHA256 signature verification
  18. **Payment Tampering:** Invalid or missing signature fails
  19. **Webhook:** Processes `payment.captured` and marks payment PAID
  20. **Webhook Idempotency:** Duplicate webhook 5 times is safe and idempotent
  21. **State Machine:** Rejects illegal status transitions
  22. **Consultant Validation:** Deactivated consultant booking rejected
  23. **Regression:** Residential cost calculation engine deterministic output

### Build Results:
- **Server Build (`prisma generate && tsc`):** Exit code 0 (Success)
- **Frontend Build (`tsc -b && vite build`):** Exit code 0 (Success in 59.19s, 2985 modules bundled)

---

## 11. Production Deployment Safety & Next Steps

1. **Additive Database Migrations:** Run `prisma migrate deploy` or `prisma db push` on staging/production PostgreSQL. No existing tables, users, or calculation rules will be modified.
2. **Configure Razorpay Secrets:** Populate `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `RAZORPAY_WEBHOOK_SECRET` in your host environment (e.g. Render / AWS).
3. **Configure Webhook URL in Razorpay Dashboard:** Set webhook URL to `https://<api-domain>/api/v1/consultations/webhook` with events `payment.captured`, `order.paid`, `payment.failed`.
