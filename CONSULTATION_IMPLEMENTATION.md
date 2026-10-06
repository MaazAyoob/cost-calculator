# Hutty Consultation Platform — Phase 1 MVP Implementation Guide

## 1. Feature Overview
The **Hutty Consultation Platform (Phase 1 MVP)** provides homeowners planning or undertaking residential construction in Bengaluru with direct access to certified, Hutty-approved experts—including Architects, Chartered Structural Engineers, Class-1 Contractors, Interior Designers, Approvals Liaisons, Quantity Surveyors, and Site Supervisors.

### Core Principles
- **Deterministic Fixed Launch Pricing:** Every consultation is fixed at **₹1,499** (`149900` paise in the backend engine). No confusing pricing tiers, hidden commissions, or markups.
- **Clear Scheduling Expectations:** Payment confirms the consultation *request*, but the appointment is confirmed only after Hutty administrators review the topic and confirm expert availability. Customers see **"Paid — Awaiting Admin Review"** instead of an automated "Booking Confirmed" label.
- **Admin-Controlled Professional Management:** Consultants cannot self-register; they are manually curated, vetted, and administered through the Hutty Admin Panel.
- **Optional Project Linking:** Homeowners can either link an existing Hutty cost calculation/estimation (passing a high-level snapshot of BUA, floors, and budget) or proceed without a saved project. Internal calculation formulas remain completely private.

---

## 2. End-to-End User Flow

```
Homeowner Visits /consult
       ↓
Search & Filter by Name, Category, or Location
       ↓
View Consultant Cards or Public Profile (/consult/:slug)
       ↓
Click "Book Consultation"
       ↓
Step 1: Consultation Details (Name, Phone, Email, Topic, Preferred Date & Slot)
       ↓
Step 2: Optional Project Linking (Link Saved/Current Hutty Estimate or Continue Standalone)
       ↓
Step 3: Review & Pay (Fixed Launch Price: ₹1,499 with Policy Disclaimer)
       ↓
Step 4: Secure Online Payment (Razorpay Order & Signature Verification)
       ↓
Payment Verified & Consultation Request Created (Status: AWAITING_REVIEW)
       ↓
Confirmation Screen: "Paid — Awaiting Admin Review" + Reference ID (e.g., HT-CON-4F8A9B)
```

---

## 3. End-to-End Admin Flow

```
Admin Logs into /admin
       ↓
Navigate to "7. Consultation" in the Admin Navigation
       ↓
├── Subsection A: "Consultants"
│     ├── Add new verified consultant (Name, Title, Category, City, Service Areas, Bio, Specializations)
│     ├── Edit profile details & upload photo URL
│     ├── Toggle Active / Inactive (instantly hides/shows in public directory)
│     └── Feature / Unfeature consultant
│
└── Subsection B: "Requests"
      ├── Live Counters: Total, Paid, Awaiting Review, Assigned, Scheduled, Completed, Cancelled
      ├── Search requests by Reference ID, customer phone, name, or email
      ├── Filter requests by review status
      ├── Open Request Review:
      │     ├── Inspect customer contact, topic, and optional linked project snapshot
      │     ├── Step 1: Assign / Reassign verified consultant
      │     ├── Step 2: Confirm appointment date & time (marks status SCHEDULED)
      │     ├── Step 3: Transition status (UNDER_REVIEW, COMPLETED, CANCELLED)
      │     └── Step 4: Record private internal notes (strictly hidden from homeowner)
```

---

## 4. Database Models (Prisma Schema)

Both `prisma/schema.prisma` and `server/prisma/schema.prisma` are synchronized with the following PostgreSQL models:

```prisma
enum ConsultationStatus {
  AWAITING_REVIEW
  UNDER_REVIEW
  ASSIGNED
  ACCEPTED
  SCHEDULED
  RESCHEDULE_REQUESTED
  COMPLETED
  REJECTED
  CANCELLED
}

enum PaymentStatus {
  PENDING
  PAID
  FAILED
  REFUND_PENDING
  REFUNDED
}

model Consultant {
  id              String                 @id @default(uuid())
  slug            String                 @unique
  name            String
  title           String
  category        String                 // "Architect" | "Structural Engineer" | "Contractor", etc.
  profileImage    String?
  experienceYears Int                    @default(5)
  city            String                 @default("Bangalore")
  serviceAreas    String[]
  about           String
  specializations String[]
  services        String[]
  active          Boolean                @default(true)
  featured        Boolean                @default(false)
  displayOrder    Int                    @default(0)
  createdAt       DateTime               @default(now())
  updatedAt       DateTime               @updatedAt
  requests        ConsultationRequest[]

  @@index([category])
  @@index([city])
  @@index([active])
  @@index([slug])
  @@map("consultants")
}

model ConsultationRequest {
  id                String                @id @default(uuid())
  publicReference   String                @unique // e.g. "HT-CON-89421A"
  userId            String?
  user              User?                 @relation(fields: [userId], references: [id], onDelete: SetNull)
  consultantId      String?
  consultant        Consultant?           @relation(fields: [consultantId], references: [id], onDelete: SetNull)
  homeownerName     String
  homeownerPhone    String
  homeownerEmail    String
  projectId         String?
  project           Project?              @relation(fields: [projectId], references: [id], onDelete: SetNull)
  projectSnapshot   Json?
  projectLocation   String
  projectType       String
  consultationTopic String
  message           String?
  preferredDate     String
  preferredTime     String
  confirmedDateTime DateTime?
  status            ConsultationStatus    @default(AWAITING_REVIEW)
  amountMinorUnits  Int                   @default(149900) // ₹1,499 in paise
  currency          String                @default("INR")
  createdAt         DateTime              @default(now())
  updatedAt         DateTime              @updatedAt
  payments          ConsultationPayment[]
  events            ConsultationEvent[]

  @@index([userId])
  @@index([consultantId])
  @@index([status])
  @@index([publicReference])
  @@index([createdAt])
  @@map("consultation_requests")
}

model ConsultationPayment {
  id                    String              @id @default(uuid())
  consultationRequestId String
  consultationRequest   ConsultationRequest @relation(fields: [consultationRequestId], references: [id], onDelete: Cascade)
  gateway               String              @default("RAZORPAY")
  gatewayOrderId        String              @unique
  gatewayPaymentId      String?             @unique
  gatewaySignature      String?
  amountMinorUnits      Int                 @default(149900)
  currency              String              @default("INR")
  status                PaymentStatus       @default(PENDING)
  verifiedAt            DateTime?
  rawResponseJson       Json?
  createdAt             DateTime            @default(now())
  updatedAt             DateTime            @updatedAt

  @@index([consultationRequestId])
  @@index([gatewayOrderId])
  @@index([status])
  @@map("consultation_payments")
}

model ConsultationEvent {
  id                    String              @id @default(uuid())
  consultationRequestId String
  consultationRequest   ConsultationRequest @relation(fields: [consultationRequestId], references: [id], onDelete: Cascade)
  actorId               String?
  actorRole             String?             // "ADMIN" | "USER" | "SYSTEM"
  eventType             String              // "REQUEST_CREATED" | "PAYMENT_CONFIRMED" | "STATUS_CHANGED" | "CONSULTANT_ASSIGNED" | "SCHEDULE_CONFIRMED" | "INTERNAL_NOTE_ADDED"
  title                 String
  internalNote          String?             // Strictly private to Admin
  metadataJson          Json?
  createdAt             DateTime            @default(now())

  @@index([consultationRequestId])
  @@index([createdAt])
  @@map("consultation_events")
}
```

---

## 5. API Endpoints

### Public Endpoints
| Method | Path | Description |
|---|---|---|
| `GET` | `/api/v1/consultants` | List active approved consultants with optional search, category, and city filters |
| `GET` | `/api/v1/consultants/categories` | List supported consultant categories |
| `GET` | `/api/v1/consultants/:slug` | Retrieve public profile by slug (returns 404 if inactive) |

### Customer / Homeowner Endpoints
| Method | Path | Description |
|---|---|---|
| `POST` | `/api/v1/consultations` | Submit booking request and generate backend payment order for ₹1,499 |
| `POST` | `/api/v1/consultations/:id/verify-payment` | Verify online payment signature; marks payment `PAID` & request `AWAITING_REVIEW` |
| `GET` | `/api/v1/consultations/my` | Retrieve homeowner's consultation requests (ownership validated) |
| `GET` | `/api/v1/consultations/:id` | Retrieve single request (internal notes stripped) |

### Admin Endpoints (RBAC Protected: Requires Admin JWT)
| Method | Path | Description |
|---|---|---|
| `GET` | `/api/v1/admin/consultants` | List all consultants (including inactive) |
| `POST` | `/api/v1/admin/consultants` | Manually create new consultant |
| `PUT` | `/api/v1/admin/consultants/:id` | Update consultant profile |
| `PATCH` | `/api/v1/admin/consultants/:id/status` | Activate/deactivate or feature consultant |
| `GET` | `/api/v1/admin/consultations` | List requests with counters & filters |
| `GET` | `/api/v1/admin/consultations/:id` | Detailed request dossier (includes internal notes and event audit trail) |
| `PATCH` | `/api/v1/admin/consultations/:id/assign` | Assign / reassign consultant to request |
| `PATCH` | `/api/v1/admin/consultations/:id/schedule` | Confirm appointment schedule date & time |
| `PATCH` | `/api/v1/admin/consultations/:id/status` | Transition request lifecycle status |
| `POST` | `/api/v1/admin/consultations/:id/notes` | Record confidential administrative internal note |

---

## 6. Environment Variables Required

### Server (`server/.env`)
```bash
# Server Port & Mode
PORT=4000
NODE_ENV=production

# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/cost_calculator_db"

# JWT Authentication
JWT_SECRET="your-secure-random-jwt-secret-key-here"
JWT_EXPIRES_IN=7d

# CORS Allowed Origins
CORS_ORIGIN=http://localhost:3000,https://cost-calculator-ten-kappa.vercel.app

# Razorpay Integration (Live Keys for Production / Test Keys for Staging)
RAZORPAY_KEY_ID="rzp_live_xxxxxxxxxxxx"
RAZORPAY_KEY_SECRET="your_razorpay_key_secret_here"
RAZORPAY_WEBHOOK_SECRET="your_webhook_secret_here"
```

### Client Frontend (`.env` or Vercel Environment Variables)
```bash
# API Base URL (leave empty in local dev to use Vite proxy)
VITE_API_BASE_URL=https://hutty-api.onrender.com

# Razorpay Public Key ID (Safe to expose on client)
VITE_RAZORPAY_KEY_ID="rzp_live_xxxxxxxxxxxx"
```

---

## 7. Admin Usage Guide

### How to Add a Consultant
1. Navigate to `/admin` and authenticate as an Admin.
2. Click group **7. Consultation** in the navigation bar, then select **Consultants**.
3. Click the **+ Add New Consultant** button in the top right.
4. Fill in:
   - Full Name (e.g., `Ar. Ramesh Nambiar`)
   - Category (`Architect`, `Structural Engineer`, etc.)
   - Professional Title
   - Experience in Years
   - City & Service Areas
   - Biography & About section
   - Specializations (comma separated)
   - Services Covered (comma separated)
   - Profile Photo URL
5. Keep **Active for Public Directory** checked and click **Create Consultant**.

### How to Activate / Deactivate a Consultant
- In the **Consultants** table, locate the consultant.
- Click the **Active / Inactive** pill badge in the Status column.
- Inactive consultants are immediately hidden from the public directory (`/consult`) and their public profile `/consult/:slug` will display an unavailable state.

### How to View Requests & Stats
- Select the **Requests** tab in group **7. Consultation**.
- View counters at the top:
  - Total Requests, Paid, Awaiting Review, Assigned, Scheduled, Completed, Cancelled.
- Filter requests by status dropdown or search by customer name, phone, or reference code (e.g., `HT-CON-`).

### How to Assign a Consultant
1. Click **Manage** next to any request in the Requests table.
2. In the **1. Assign Consultant** form, select an active consultant from the dropdown.
3. Click **Save Assignment**. The request status transitions to `ASSIGNED` and an audit event is logged.

### How to Confirm a Schedule
1. In the request review modal, go to **2. Confirm Schedule**.
2. Select the confirmed date and time using the calendar picker.
3. Click **Confirm & Schedule**. The status transitions to `SCHEDULED`, and the confirmed timestamp is saved.

### How to Add Internal Notes
1. At the bottom of the request review modal, locate **Internal Administrative Notes**.
2. Type your observation (e.g., *"Customer plans to start excavation in Nov, wants foundation drawing review."*).
3. Click **Add Note**.
4. **Security Guarantee:** Internal notes are strictly stored server-side and are NEVER transmitted to public APIs or customer-facing endpoints.

---

## 8. Testing Performed & Results
- **Vitest Suites:** 27 test files, **355 tests passed** (including 15 comprehensive consultation unit & regression tests).
- **Consultant Lifecycle:** Admin creation, editing, active/inactive filtering, and public slug lookup verified.
- **Fixed Pricing Enforcement:** Backend source of truth strictly resolves to ₹1,499 (149900 paise); frontend manipulation rejected.
- **Payment Verification:** Verified payment transitions payment to `PAID` and request to `AWAITING_REVIEW`.
- **Security & Privacy:** Homeowner ownership validation enforced; cross-user access denied; internal notes stripped.
- **Calculator Regression:** Full 7-case benchmark validation suite, 22-section PDF engine, and rate master propagation tested and confirmed 100% invariant.
- **TypeScript & Build Checks:** `tsc -b` and production Vite bundle passed with 0 errors.

---

## 9. Future Pricing-Model Integration Point
When Hutty introduces the broader multi-tiered pricing model (free, ₹99, ₹499, and full consultation bundles):
- The consultation price is centralized in:
  - Backend: `server/src/constants/consultation.constants.ts` (`CONSULTATION_PRICE_INR`, `CONSULTATION_PRICE_PAISE`)
  - Frontend: `src/config/consultation.ts` (`LAUNCH_CONSULTATION_PRICE_INR`, `LAUNCH_CONSULTATION_PRICE_DISPLAY`)
- No hardcoded `1499` values exist in UI components or business logic, allowing direct substitution with dynamic package resolvers in the upcoming phase.
