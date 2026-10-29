# HUTTY — PRE-LAUNCH BLOCKERS & OPERATIONAL READINESS MATRIX

**Audit Date:** 2026-10-26  
**Scope:** Localhost to Live Production Deployment Transition

---

## 1. Executive Status

All local code remediation, calculation engine fixes, frontend UX/UI redesign, and automated regression testing are **100% complete**. 

Before launching the application to public production (e.g. Render / Vercel with a live custom domain), the following operational dependencies, production credentials, and business decisions must be resolved by the client team.

---

## 2. External Dependency Blockers

| Blocker ID | Category | Description | Local Status | Production Blocker | Exact Verification Needed to Close |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **BLK-01** | Payment Gateway | **Live Cashfree Production API Credentials** | Simulated with local mock / test keys (`CF_APP_ID`, `CF_SECRET_KEY`) | Real payments cannot be processed until live Cashfree production merchant account is activated and production API keys are provisioned in `.env.production`. | Deploy keys to production environment; execute ₹1 test transaction in live mode; verify webhook signature and order transition to `PAID`. |
| **BLK-02** | Email / Delivery | **Production SMTP / Transactional Email Provider** | Simulated via console logs (`[OPERATIONAL_LEAD_DISPATCH]`) | PDF reports and consultation booking confirmations cannot be delivered to client inboxes without production SendGrid / AWS SES / Postmark SMTP credentials. | Configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` in Render environment variables; trigger consultation booking and verify receipt of email with PDF attachment in customer inbox. |
| **BLK-03** | Webhooks | **Public HTTPS Webhook URL Registration** | Localhost listener cannot receive incoming webhooks from external gateways | Cashfree and Razorpay asynchronous webhook notifications require an active, public HTTPS domain (e.g., `https://api.hutty.in/api/payments/webhook`). | Set webhook URL in Cashfree Merchant Dashboard; trigger test refund and test payment completion; confirm server logs record HTTP 200 with signature validation. |
| **BLK-04** | Expert Operations | **Onboarding Real Verified Consultants** | Demo consultant profiles marked with illustrative badge | Real homeowners booking a consultation need genuine verified architects and structural engineers rather than mock profiles. | Sign vendor agreements with at least 3 Bangalore-based architects/engineers; update database with real credentials, bios, calendar URLs, and payout accounts. |

---

## 3. Required Human / Client Decisions

| Decision ID | Area | Context & Trade-Off | Proposed Recommendation | Status |
| :--- | :--- | :--- | :--- | :--- |
| **DEC-01** | Report Pricing | Client briefs specify ₹499 for Detailed BOQ and ₹1,499 for Premium BOQ. Earlier versions used ₹99. | Keep ₹499 (Detailed) and ₹1,499 (Premium) as implemented. Do not reintroduce ₹99. | **Awaiting Client Sign-Off** |
| **DEC-02** | Regional Setback Overrides | Bangalore BBMP bylaws strictly enforce Table 4 coverage limits (65%–70%). Gram Panchayat and rural plots outside BDA limits often allow higher coverage or traditional setbacks. | Keep BBMP standard as default; add "Gram Panchayat / BMRDA" specific rule tables when regulatory documents are supplied. | **Awaiting Client Rule Supply** |
| **DEC-03** | Structural Disclaimer Vetting | Stage 7 and Stage 8 include a disclaimer: *"This estimate is an indicative preliminary cost forecast for planning purposes based on regional rates. It does not constitute a sanctioned municipal design or structural engineering certification."* | Have client's legal counsel review wording to ensure complete exemption from construction liability. | **Awaiting Legal Sign-Off** |

---

## 4. Security & Data Integrity Readiness

| Checkpoint | Status | Assessment Details |
| :--- | :--- | :--- |
| **Secret Management** | **SECURE** | No API keys, JWT secrets, or DB passwords committed to git. All credentials loaded via `process.env`. |
| **Timing Safe Verification** | **SECURE** | Webhook signature checks utilize `crypto.timingSafeEqual` (`secureTimingSafeCompare`) to prevent timing side-channel attacks. |
| **Price Authority** | **SECURE** | Frontend amounts are ignored on checkout creation; server strictly enforces backend price constants (`DETAILED_BOQ: 499`, `PREMIUM_BOQ: 1499`, `CONSULTATION: 1499`). |
| **SQL Injection** | **SECURE** | All customer and booking persistence operates via Prisma ORM parameterized queries. |
| **CORS Configuration** | **READY** | Production CORS whitelist configured to reject cross-origin requests from non-whitelisted domains. |
| **Rate Limiting** | **READY** | Rate limiter configured on lead generation, booking submissions, and auth endpoints to prevent denial-of-service or bot abuse. |

---

## 5. Deployment Authorization Protocol

In accordance with strict instructions:
1. **No git commit** has been made.
2. **No git push** has been executed.
3. **No production deployment** (Render or Vercel) has been triggered.
4. All work is preserved in the local working directory awaiting client review and explicit authorization.
