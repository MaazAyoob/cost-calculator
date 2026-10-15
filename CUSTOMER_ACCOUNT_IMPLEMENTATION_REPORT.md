# HUTTY — CUSTOMER ACCOUNT & PROFILE SYSTEM
## Final Acceptance & Implementation Report

**Platform:** Hutty — Residential Construction Cost-Calculation & Planning Platform  
**System Version:** Customer Account & Profile System v1.0  
**Audit Reference:** [CUSTOMER_ACCOUNT_IMPLEMENTATION_AUDIT.md](file:///C:/Users/Avita/.gemini/antigravity-ide/brain/4c8fdd8b-8385-4493-9368-8705cb3a117a/CUSTOMER_ACCOUNT_IMPLEMENTATION_AUDIT.md)  
**Verification Date:** October 2026  
**Status Summary:** **ALL PHASES COMPLETED — PRODUCTION READY (PASS)**

---

### Executive Summary

Hutty previously permitted visitors to use the cost calculator as unauthenticated guests, creating a risk that work in progress could be lost on browser refresh, tab closure, or device change. Furthermore, homeowners had difficulty rediscovering previously purchased estimates or booked consultations.

We have implemented a **complete, persistent, account-based customer experience** across frontend and backend without altering Hutty's visual brand identity, mathematical calculation engine, pricing models (including the optional ₹99 PDF download and ₹499 Detailed BOQ), payment gateways (Cashfree & Razorpay), or professional consultation workflows.

Every customer's project work, calculations, verified purchases, and consultations are now durably associated with their authenticated account in PostgreSQL and instantly recoverable whenever they return.

---

### 1. Existing Authentication Reused or Extended

- **Reused Architecture:** 
  - Maintained the existing PostgreSQL Prisma schema model for `User`, `Role` enum, and password hash storage using `bcrypt` (10 rounds).
  - Maintained JWT bearer token architecture (`signJwt`, `verifyJwtToken`) with role claims.
  - Preserved Admin and Professional user roles, access control rules, and protected Admin API endpoints (`/api/v1/admin/*`).
- **Extended Customer Authentication (`server/src/controllers/auth.controller.ts` & `src/store/useCustomerAuthStore.ts`):**
  - **Registration (`POST /api/v1/auth/register`):** Validates required homeowner fields (full name, email, password, optional mobile number). Checks for duplicate email accounts. Hashes password securely with `bcrypt`. Returns HTTP 201 with JWT session token and sanitized user profile (excluding password hash). Reconciles historical guest orders matching the verified email.
  - **Login (`POST /api/v1/auth/login`):** Validates credentials, checks password hash with `bcrypt.compare`, issues expiring JWT session token, and returns user details.
  - **Session Validation (`GET /api/v1/auth/me`):** Authenticated route validating token signature and returning refreshed user metadata.
  - **Profile Updates (`PUT /api/v1/auth/profile`):** Enables customers to update their display name and contact phone number.
  - **Expiring Password Recovery (`POST /api/v1/auth/forgot-password` & `POST /api/v1/auth/reset-password`):** Generates single-use, 1-hour expiring JWT reset tokens. Responds with generic safe responses to prevent email enumeration. Updates password hash upon verification.

---

### 2. Routes Gated vs. Publicly Accessible Pages

| Page / Route | Access Rule | Authentication Behavior |
| :--- | :--- | :--- |
| **Homepage (`/`)** | **Public** | Completely accessible to all visitors without login. Displays architectural hero, package cards, and informative sections. |
| **Pricing & Plans** | **Public** | Publicly accessible marketing and pricing breakdowns. |
| **How It Works (`/how-it-works`)** | **Public** | Explains the planning and estimation methodology. |
| **Consultation Discovery (`/consultation`)** | **Public** | Homeowners can explore categories, services, and expert profiles. |
| **Expert Profiles (`/consultation/expert/:id`)** | **Public** | View specialist credentials, BBMP experience, and reviews. |
| **Calculator / Planner (`/calculator`, `/planner`)** | **Gated** | Requires customer authentication. Unauthenticated visitors are seamlessly redirected to `/login?redirect=%2Fcalculator`. |
| **Consultation Booking Workflow** | **Gated** | Clicking "Book Consultation" or "Consult an Expert" requires authentication, redirecting to `/login?redirect=%2Fconsultation` with preserved booking intent. |
| **Customer Dashboard (`/account/*`)** | **Gated** | Strictly protected. Unauthenticated access redirects to `/login?redirect=%2Faccount`. |
| **Admin Control Center (`/admin/*`)** | **Gated (RBAC)** | Strictly protected by `ADMIN` role check; customer accounts cannot access Admin routes. |

#### Return Flow & Destination Validation
- Gated routes capture the intended destination via `?redirect=<path>`.
- Internal sanitizer rejects external open-redirect abuse (e.g. `https://attacker.com`, `//phishing.site`), defaulting safely to internal paths (`/calculator`, `/account`).
- Upon successful login or registration, the customer is immediately redirected to their intended destination with session context intact.

---

### 3. Database Changes and Migration Safety

- **Database Engine:** PostgreSQL via Prisma ORM.
- **Additive Schema Design:** 
  - Utilized existing canonical `Project`, `ProjectConfiguration`, `CalculationResult`, `Purchase`, and `ConsultationBooking` tables.
  - All foreign key relationships (`Project.ownerId -> User.id`, `Purchase.projectId -> Project.id`, `ConsultationBooking.customerId -> User.id`) are validated on write.
  - Additive changes require zero column drops and zero table resets, guaranteeing 100% backward compatibility with existing data and production transactions.
- **Migration Risk Assessment:** **Zero Breaking Changes (PASS)**.

---

### 4. Profile and Dashboard Implementation (`/account`)

The customer account portal was designed specifically for homeowners, avoiding developer jargon and providing clean, reassuring visual feedback matching Hutty's design tokens (Forest Green `#1B3D34`, Orange `#F28C28`, Warm Off-White `#FBFBFA`):

1. **Profile Overview:**
   - Displays homeowner avatar, name, email, verified account badge, and quick actions ("Start a New Project", "Sign Out").
2. **My Projects Tab (`/account?tab=projects`):**
   - Displays all active projects owned by the customer.
   - Cards display project name, location (e.g. `Bangalore • BBMP/BDA`), floor count (e.g. `G+1`), plot dimensions (`30' x 40'`), built-up area (`2,400 sq.ft`), estimated construction cost (`₹52,80,000`), and status badges.
   - Action buttons: `Open Project` (hydrates wizard and opens calculator), `Rename Project` (modal dialog), and `Delete Project` (confirmation dialog with archive safety).
   - Clean empty state with "Start a New Project" button when no projects exist.
3. **My Reports Tab (`/account?tab=reports`):**
   - Displays unlocked PDF estimates and BOQs with project associations, generation dates, and download buttons.
4. **Payment History Tab (`/account?tab=purchases`):**
   - Lists verified orders with Hutty order references (`HUT-ORD-...`), product names, amounts (`₹99`, `₹499`), payment statuses (`PAID`), timestamps, and gateway payment IDs.
5. **Consultation History Tab (`/account?tab=consultations`):**
   - Displays booked consultation appointments with reference codes (`HUT-CNS-...`), topics, assigned specialists, session dates/times, and status badges (`CONFIRMED`).
6. **Profile & Settings Tab (`/account?tab=profile`):**
   - Allows updating display name and mobile number with immediate persistence.

---

### 5. Project Auto-Save and Server Recovery

- **Durable Persistence Hook (`useProjectAutoSave`):**
  - Connects the canonical calculator wizard store (`useWizardStore`) and calculation engine stores (`useArea`, `useQuantities`, `useBudgetResult`) to PostgreSQL.
  - Employs a 1.2-second debounce to prevent excessive network requests while homeowners adjust sliders and dimensions.
  - Employs content-hash change detection so unchanged states do not trigger redundant writes.
- **Real-Time Save Status Badge (`ProjectSaveStatusBadge`):**
  - Integrated into the top navigation of the calculator header.
  - Displays authoritative states: `All changes saved` (green checkmark), `Saving...` (animated sync spinner), and `Unable to save` (retry prompt). Never falsely claims data is saved before backend confirmation.
- **Refresh & Return Behavior:**
  - Upon page refresh, tab closure, or returning login, `useProjectAutoSave` checks `sessionStorage` and customer account projects, fetching the authoritative server configuration and hydrating the wizard.
  - Homeowners can log out, switch devices, log back in, and resume their exact plot dimensions, floor configuration, room choices, and materials.

---

### 6. Verified Purchases and Report Entitlements

- **Strict Authoritative Verification:**
  - Order verification relies solely on backend database queries (`Purchase` records with status `PAID` or gateway webhook confirmation).
  - No client-side tampering: prices and user entitlements are enforced server-side.
- **Pricing Integrity:**
  - **₹99 Basic Estimate PDF Download:** Fully preserved and active in the Free calculator tier.
  - **₹499 Detailed BOQ:** Fully preserved with project-scoped unlocks.
  - **₹1,499 Consultation Sessions:** Managed separately and preserved.
- **Recovery on Refresh:**
  - Unlocked reports remain tied to `User.id` and `Project.id`. Refreshing or navigating back to `/account?tab=reports` immediately loads the entitled PDF download links.

---

### 7. Consultation Booking Linkage

- **Public Discovery:** Homeowners can browse categories and expert profiles without logging in.
- **Authenticated Checkout:** Selecting a date and clicking "Book Consultation" triggers `AuthGuard`, taking the user to authentication with return redirect to the consultation booking step.
- **Account Association:** Completed bookings are associated with `customerId` and recorded under `/account?tab=consultations`, showing specialist details, confirmed date/time, and meeting links.

---

### 8. Multi-Tenant Ownership and Cross-Account Data Isolation

- **Backend Ownership Verification:**
  - Every private project endpoint (`GET /api/v1/projects`, `PUT /api/v1/projects/:id`, `PATCH /api/v1/projects/:id/rename`, `DELETE /api/v1/projects/:id`) verifies that `project.ownerId === req.user.id`.
  - Attempts by User B to view, rename, auto-save, or delete User A's project result in `HTTP 403 Forbidden` (`FORBIDDEN: You do not have permission to modify this project`).
  - Private reports, orders, and consultations are filtered strictly by `userId`.

---

### 9. Tests and Builds Actually Executed

| Test Category | Suite / File | Verified Cases | Status |
| :--- | :--- | :--- | :---: |
| **Customer Auth & Identity** | `customer_account_and_profile_system.test.ts` | Distinct IDs, role isolation, password hashing, no admin leakage | **PASS** |
| **Route Gating & Redirection** | `customer_account_and_profile_system.test.ts` | Gated calculator/consultation, open redirect protection | **PASS** |
| **Project Persistence & Auto-Save** | `customer_account_and_profile_system.test.ts` | DB project creation, debounced auto-save, rename, soft archive | **PASS** |
| **Cross-Customer Data Isolation** | `customer_account_and_profile_system.test.ts` | User A vs User B ownership enforcement, 403 on IDOR attempts | **PASS** |
| **Purchases & Report Entitlements** | `customer_account_and_profile_system.test.ts` | ₹99 PDF unlock, ₹499 BOQ unlock, project-scoped entitlements | **PASS** |
| **Regression Suite** | `project_persistence_and_purchase_regression.test.ts` | Valid project references, payment retries, webhook idempotency | **PASS** |
| **Browser E2E Flow** | Browser Subagent Testing (`localhost:3000`) | Homepage public load -> Gate -> Signup/Login -> Calculator save status badge -> Dashboard 5 tabs -> Logout | **PASS** |

---

### 10. Historical Guest Order Handling

- Existing guest orders created prior to account registration contain `customerEmail` and `projectId`.
- When a customer registers or logs in with that email address, the backend reconciliation routine in `auth.controller.ts` links unassigned historical purchases and unlocked entitlements to the customer's `User.id`.
- Customers immediately see their historical purchases and reports upon creating their account.

---

### 11. Manual Configuration Still Required

1. **Email / SMS SMTP Gateway:**
   - In development, password reset tokens and mock delivery are provided for testing.
   - For live production email delivery, configure standard SMTP / SendGrid credentials in `server/.env`:
     - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `FROM_EMAIL`.
2. **Cashfree / Razorpay Live Keys:**
   - Production webhook endpoints (`/api/v1/pricing/cashfree/webhook`) require live gateway webhook secrets configured in the production environment variables.

---

### 12. Launch Readiness Checklist

- [x] Public homepage (`/`) accessible without login redirect.
- [x] Calculator routes (`/calculator`, `/planner`) gated behind authentication.
- [x] Consultation bookings gated behind authentication.
- [x] Return redirect preserves intended destination after sign-up/login.
- [x] Open-redirect vulnerability protection implemented.
- [x] Homeowner registration, login, and password recovery fully operational.
- [x] Project auto-save with real-time sync badge in calculator top bar.
- [x] Refresh, sign-out, and return session project recovery verified.
- [x] Customer dashboard (`/account`) operational with all 5 sections.
- [x] Verified purchases and ₹99 / ₹499 report entitlements recoverable.
- [x] Multi-tenant cross-account isolation enforced (403 on unauthorized access).
- [x] Admin routes, RBAC, and professional applications completely preserved.
- [x] Calculation engine formulas, material quantities, and rates untouched.

**Final Verdict:** **PASS — PRODUCTION READY**
