# HUTTY 2.0 — REMAINING LAUNCH BLOCKERS & DEPENDENCY MATRIX

**Date:** October 28, 2026  
**Scope:** Production Deployment Prerequisites, Third-Party Integrations, Operational Clearances, and Client Decisions  
**Governing Standard:** Every requirement must be explicitly classified as `PASS`, `FAIL`, `BLOCKED`, or `NEEDS CLIENT DECISION`.

---

## 1. Launch Prerequisites & Integration Blockers

| System / Dependency | Status | Classification | Detailed Blocker Description | Required Resolution Action |
| :--- | :--- | :--- | :--- | :--- |
| **Payment Gateway Credentials (Cashfree / Razorpay)** | Pending Client Provisioning | **BLOCKED** | Local development environment uses simulated mock checkout sessions. Production payments require live Merchant ID, Client Secret, and Webhook Signing Key. | Client must provision live credentials from Cashfree and/or Razorpay merchant dashboards. |
| **Payment Webhook Registration** | Pending Domain Deployment | **BLOCKED** | Webhook listener endpoint (`/api/payments/webhook`) is implemented, but production webhook registration requires a public HTTPS domain. | Register `https://<production-domain>/api/payments/webhook` in the gateway merchant dashboard upon deployment. |
| **Production SMTP / Transactional Email** | Pending SMTP Host Setup | **BLOCKED** | System logs password resets, PDF report links, and OTP codes to server console during development. Live delivery requires SMTP host credentials (SendGrid, AWS SES, or Brevo). | Client must configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, and `SMTP_PASS` in production `.env`. |
| **SMS / WhatsApp OTP Gateway** | Development Mock Active | **BLOCKED** | Phone OTP verification operates via cryptographically secure in-memory challenge fallback for testing. Live SMS delivery requires Twilio, Gupshup, or MSG91 credentials. | Client must provide production SMS gateway API credentials. |
| **Production Consultant Roster** | Seeded Demo Profiles Active | **NEEDS CLIENT DECISION** | Seeded consultant cards are explicitly labelled with "Sample Profile" badges to avoid misleading users. Certified architects and structural engineers must be formally onboarded. | Client must approve whether to launch with a curated internal team desk or onboard verified third-party consultants. |
| **Custom Domain & SSL Configuration** | Awaiting Client Domain Name | **BLOCKED** | Deployment scripts are ready for Vercel/Render, but canonical custom domain (e.g. `hutty.in`) has not been linked to DNS. | Client must point DNS records (A / CNAME) to host infrastructure. |

---

## 2. Requirements & Verification Matrix

### Core Application & UX
- `[PASS]` **Canonical 8-Stage Calculator Workflow:** Exactly 8 stages verified in local browser; no 10-step legacy remnants.
- `[PASS]` **Details & Assumptions Progressive Disclosure:** Accessible drawer with 9 authoritative tabs, collapsed by default, preserves state.
- `[PASS]` **Plain English Homeowner Microcopy:** Replaced engineering jargon with plain language; clarified "Ground floor plus one upper floor".
- `[PASS]` **Touch Targets & Typography:** $\ge 44\text{px}$ touch targets verified; minimum 16px body text scale implemented.
- `[PASS]` **Guest Estimate Access:** Unauthenticated users can complete Stages 1–7 and view preliminary estimate without forced login.
- `[PASS]` **Pricing Alignment:** Free (₹0), Detailed BOQ (₹499), Premium (₹1,499), and Consultation (₹1,499) enforced. Zero obsolete ₹99 references in active UI.
- `[PASS]` **QA Screenshot Isolation:** 19 verification screenshots saved to `artifacts/hutty-2-verification-screenshots/`; zero screenshots in `dist/`.

### Calculation Engine & Engineering Integrity
- `[PASS]` **Setback Geometry vs. Coverage Constraint:** Rigorously distinguishes physical boundary envelope from statutory coverage cap (e.g. $963\text{ sq.ft}$ setback envelope vs. $840\text{ sq.ft}$ cap on $30 \times 40$ plot).
- `[PASS]` **Zero-Residual Cost Reconciliation:** Direct Materials + Direct Labour + Services exactly equals Total Construction Cost ($₹0.00$ residual).
- `[PASS]` **Physical Quantity Invariance:** Structural steel, cement, and sand quantities remain 100% invariant across Standard, Premium, and Luxury finish packages.
- `[PASS]` **Automated Test Coverage:** 784 of 784 unit and integration tests passing (`npm test`).
- `[PASS]` **TypeScript Compilation:** Zero compilation errors across client and server (`npx tsc -b`).
- `[PASS]` **Production Bundle Build:** Production bundle builds cleanly in under 70 seconds (`npm run build`).

### Items Requiring Client Decision
- `[NEEDS CLIENT DECISION]` **Consultant Booking Commercial Model:** Independent expert consultation is set to flat ₹1,499 for 45 minutes. Client to confirm whether revenue share with third-party experts is handled offline or through platform split payouts.
- `[NEEDS CLIENT DECISION]` **Regional Authority Setback Tables:** Currently configured with BBMP / BDA Bengaluru urban residential rules. Client to confirm target rollout cities beyond Bengaluru.
- `[NEEDS CLIENT DECISION]` **GST Invoice Issuance:** Confirm whether downloadable PDF invoices for ₹499 and ₹1,499 report purchases require client corporate GSTIN display.

---

## 3. Summary & Release Readiness Conclusion

- **Local Working Tree:** **100% READY FOR RELEASE REVIEW**  
  All functional, usability, design system, and calculation engine requirements in scope have been implemented, tested, and verified against the local preview server.
- **Production Deployment:** **HELD PENDING EXTERNAL CREDENTIALS**  
  Deployment to public production should proceed immediately once the client provides production payment gateway keys, SMTP credentials, and custom domain DNS mapping.

