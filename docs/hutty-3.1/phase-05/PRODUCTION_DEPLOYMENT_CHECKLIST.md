# HUTTY 3.1 — PHASE 05: PRODUCTION DEPLOYMENT & GO-LIVE CHECKLIST
**Document Reference:** `docs/hutty-3.1/phase-05/PRODUCTION_DEPLOYMENT_CHECKLIST.md`  
**Target Audience:** Founder, Lead Engineer, DevOps Infrastructure Team  
**Release Target:** Hutty 3.1 Production Deployment  
**Date Prepared:** November 1, 2026  
**Status:** READY FOR STAGING & PRODUCTION PROVISIONING

---

## 1. Pre-Deployment Configuration & Secrets

Ensure the production environment file (`.env.production`) on the host server contains all required cryptographic keys and production service URLs:

| Environment Variable | Production Requirement | Purpose |
|:---|:---|:---|
| `NODE_ENV` | `production` | Enables production optimizations, disables dev bypasses |
| `PORT` | `4000` | Internal backend server port |
| `FRONTEND_URL` | `https://hutty.in` | CORS allowed origin & callback target |
| `DATABASE_URL` | `postgresql://user:pass@host:5432/hutty_prod?sslmode=require` | PostgreSQL production database connection |
| `JWT_SECRET` | Minimum 64-character random hex string | Signs customer & admin session tokens |
| `CASHFREE_APP_ID` | Production Merchant App ID from Cashfree Dashboard | Live payment initialization |
| `CASHFREE_SECRET_KEY` | Production Secret Key from Cashfree Dashboard | Live HMAC signature calculation |
| `CASHFREE_ENVIRONMENT` | `PROD` | Switches SDK and API endpoints to live gateway |
| `VITE_API_URL` | `https://api.hutty.in` (or relative `/api`) | Frontend API base URL |
| `VITE_CLARITY_PROJECT_ID`| Client Clarity Project ID | Microsoft Clarity session tracking |

---

## 2. Database Provisioning & Migration

Execute the following sequential deployment commands in the server directory:

1. **Verify Database Connectivity:**
   ```bash
   cd server
   npm run db:check
   ```
2. **Apply Prisma Schema & Relations:**
   ```bash
   npm run prisma:generate
   npx prisma db push --skip-generate
   ```
3. **Verify Database Tables & Indexes:**
   - Confirm existence of `User`, `Project`, `PurchaseOrder`, `ConsultationBooking`, `Lead`, `RateMaster`, and `Entitlement` tables.
4. **Seed Baseline Admin Credentials & Rate Master Defaults:**
   ```bash
   npm run prisma:seed
   ```

---

## 3. Cashfree Gateway Merchant Configuration

In the [Cashfree Merchant Dashboard](https://merchant.cashfree.com/):
1. **API Keys:** Generate live Production API credentials (`App ID` & `Secret Key`).
2. **Webhook Registration:**
   - **Endpoint URL:** `https://api.hutty.in/api/v1/payments/cashfree/webhook`
   - **Events Subscribed:**
     - `PAYMENT_SUCCESS_WEBHOOK`
     - `PAYMENT_FAILED_WEBHOOK`
     - `PAYMENT_USER_DROPPED_WEBHOOK`
3. **Return URL Whitelist:** Add `https://hutty.in/payment/status` to permitted redirect domains.
4. **Payment Modes:** Enable UPI (Google Pay, PhonePe, Paytm, BHIM), Net Banking (top 30 Indian banks), and RuPay/Visa/Mastercard Credit/Debit cards.

---

## 4. Reverse Proxy & Security Headers (Nginx)

Ensure the Nginx configuration terminates SSL and supplies recommended HTTP security headers:

```nginx
# SSL Configuration
ssl_certificate /etc/letsencrypt/live/hutty.in/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/hutty.in/privkey.pem;
ssl_protocols TLSv1.2 TLSv1.3;

# Security Headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self' https: data: blob: 'unsafe-inline' 'unsafe-eval' https://sdk.cashfree.com https://api.cashfree.com https://www.clarity.ms;" always;

# Frontend Static Assets
location /assets/ {
    root /var/www/hutty/dist;
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# Frontend SPA Fallback
location / {
    root /var/www/hutty/dist;
    try_files $uri $uri/ /index.html;
}

# Backend API Proxy
location /api/ {
    proxy_pass http://127.0.0.1:4000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

---

## 5. Post-Deployment Smoke Test Protocol

Immediately after deployment to production, perform the following verification:

1. [ ] **Landing Page:** Visit `https://hutty.in` and confirm all 4 hero images render without 404s.
2. [ ] **Anonymous Calculation:** Enter calculator at `/plan`, adjust dimensions to 30×40, verify live preliminary cost estimate displays immediately.
3. [ ] **BOQ Preview:** Navigate to Stage 8, verify first 5 rows render cleanly and locked counter displays.
4. [ ] **₹99 Basic PDF Unlock:** Initiate checkout in test mode or with small live transaction, confirm PDF generates and downloads cleanly.
5. [ ] **Consultation Page:** Visit `https://hutty.in/consult`, confirm booking modal opens and expert profiles load.
6. [ ] **Admin Dashboard:** Log in to `https://hutty.in/admin` with master credentials, verify analytics funnel charts and order logs display live events.

