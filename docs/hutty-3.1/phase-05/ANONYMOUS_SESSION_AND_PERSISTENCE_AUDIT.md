# HUTTY 3.1 — PHASE 05: ANONYMOUS SESSION & PERSISTENCE AUDIT
**Document Reference:** `docs/hutty-3.1/phase-05/ANONYMOUS_SESSION_AND_PERSISTENCE_AUDIT.md`  
**Architecture:** Zero-Friction Anonymous Planning with Client-Side State Persistence  
**Verification Date:** November 1, 2026  
**Status:** FULLY COMPLIANT & AUDITED

---

## 1. Executive Summary & Design Principle

Conventional construction estimator tools often force users to provide personal contact information (phone number, email address) before revealing any estimate, leading to high bounce rates and customer frustration. 

**Hutty 3.1** adopts a strict **Anonymous First** design philosophy:
1. Complete anonymous access to all planning tools, setback calculations, 3D visualization, room planning, and preliminary cost estimates.
2. Robust local browser persistence via `localStorage` allowing users to leave and return without losing their configurations.
3. Contact information is requested strictly and exclusively when there is an authentic user need: saving the project to a permanent customer account, initiating a commercial report checkout, or scheduling an expert consultation.

---

## 2. Anonymous Access Verification

| User Journey Step | Authentication Required? | Paywall Gated? | Homeowner Capability |
|:---|:---:|:---:|:---|
| **Landing Page Exploration** | No | No | Access educational content, 13-stage roadmap, civil codes, and demo. |
| **Stage 1: Plot & Setbacks** | No | No | Input plot dimensions, road width, view BDA/BBMP setbacks in real time. |
| **Stage 2: Dream Home & Spaces** | No | No | Configure floors, parking, room distribution, and view built-up area. |
| **Stage 4: Buildable Footprint** | No | No | Inspect 2D/3D footprint envelope and municipal clearance dimensions. |
| **Stage 5: Core Materials** | No | No | Select steel, cement, masonry brands; inspect quantity transparency. |
| **Stage 6: Flooring & Finishes** | No | No | Select tiles, joinery, electrical circuits, sanitaryware, and metalwork. |
| **Stage 7: Estimate Review** | No | No | **View complete turnkey preliminary estimate**, material/labour splits. |
| **Stage 8: BOQ Schedule Preview** | No | No | View top 5 representative BOQ schedule line items. |
| **Report Download (₹99/₹499/₹1,499)** | Yes (Lead form) | Yes (₹99 / ₹499 / ₹1,499) | Full 60+ item BOQ schedule, payment schedules, and PDF downloads. |
| **Consultation Booking (₹1,499)** | Yes (Lead form) | Yes (₹1,499) | 1-on-1 private video review session with registered consultant. |

---

## 3. Storage Key & Persistence Schema

State is maintained in client memory and synchronized to `localStorage` under the canonical key:
`cost_calculator_wizard_state_v4`

Managed by Zustand's `persist` middleware in [`src/store/useWizardStore.ts`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/store/useWizardStore.ts):

```typescript
{
  "state": {
    "currentStep": 1,
    "plotLength": 40,
    "plotWidth": 30,
    "roadWidth": 30,
    "city": "Bangalore",
    "authority": "BBMP/BDA",
    "houseType": "Duplex",
    "floors": 2,
    "selectedPackage": "PREMIUM",
    "rooms": {
      "living": 1, "dining": 1, "kitchen": 1, "bedroom": 3, "bathroom": 3,
      "balcony": 2, "utility": 1, "puja": 1, "foyer": 1
    },
    "fabrication": {
      "staircaseRailing": "ss_glass",
      "balconyRailing": "ss_glass",
      "terraceRailing": "ms_pipe",
      "mainGate": "designer_cnc",
      "tankLadder": true,
      "skylight": true,
      "balconyDoor": "upvc_sliding",
      "elevationCladding": "hpl_wooden_stone"
    },
    "hasStartedSelection": true
  },
  "version": 4
}
```

### Migration Protection
If a user returns with an older state version ($< 4$), the `migrate` handler automatically backfills default room models and maps legacy package codes (`PREMIUM`, `LUXURY`) safely without resetting user measurements.

---

## 4. Contact Gating Enforcements

Contact information is strictly isolated to appropriate transaction checkpoints:
1. **Save Project Badge:** If an anonymous user clicks "Save Project" to keep their project across devices, an auth modal opens requesting email and password.
2. **Unlock Basic PDF (₹99):** [`UnlockBasicPdfModal.tsx`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/components/modals/UnlockBasicPdfModal.tsx) requests name, phone number, and email address to attach to the invoice and generated PDF deliverable.
3. **Unlock Detailed BOQ (₹499 / ₹1,499):** [`UnlockReportModal.tsx`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/components/modals/UnlockReportModal.tsx) captures customer details prior to Cashfree gateway initialization.
4. **Consultation Desk:** [`ConsultationBookingModal.tsx`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/features/consultation/components/ConsultationBookingModal.tsx) requests booking details and phone OTP verification to ensure consultant availability.

---

## 5. Automated Verification Test Suite

Test Suite: [`src/calculation-engine/__tests__/anonymous_persistence.test.ts`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/calculation-engine/__tests__/anonymous_persistence.test.ts)

```
 ✓ src/calculation-engine/__tests__/anonymous_persistence.test.ts (5 tests) 124ms
   ✓ 1. permits anonymous entry with unauthenticated customer state
   ✓ 2. enables full planning and customization without authentication credentials
   ✓ 3. serializes and persists accurately under the key cost_calculator_wizard_state_v4
   ✓ 4. calculates preliminary cost estimate in real time for anonymous user with zero login barrier
   ✓ 5. enforces report and full BOQ gating strictly at commercial boundaries
```

**Result:** 5/5 tests passing (100% pass rate).

