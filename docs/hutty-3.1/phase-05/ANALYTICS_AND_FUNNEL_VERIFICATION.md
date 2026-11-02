# HUTTY 3.1 — PHASE 05: ANALYTICS & CONVERSION FUNNEL VERIFICATION
**Document Reference:** `docs/hutty-3.1/phase-05/ANALYTICS_AND_FUNNEL_VERIFICATION.md`  
**Standard:** 10 Canonical Homeowner Conversion Funnel Events & Contextual Dimensions  
**Verification Date:** November 1, 2026  
**Status:** FULLY INTEGRATED & VERIFIED

---

## 1. Funnel Architecture Overview

To provide complete visibility into customer acquisition, planning engagement, drop-off points, and report monetization, the analytics engine in [`src/utils/analytics.ts`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/utils/analytics.ts) was updated with a standardized 10-event canonical funnel taxonomy while preserving legacy diagnostic telemetry for admin dashboard compatibility.

All analytics operations execute asynchronously in a non-blocking `try/catch` wrapper, ensuring zero possibility of interfering with calculation performance, UI rendering, or payment checkout.

---

## 2. Canonical Funnel Events & Telemetry Schema

| Funnel Step | Event Name | Trigger Condition | Mandatory Payload / Dimensions | Component Integration |
|:---:|:---|:---|:---|:---|
| **01** | `landing_view` | Homeowner visits the landing page (`/`) | `deviceCategory` ('desktop' \| 'tablet' \| 'mobile') | [`LandingPage.tsx`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/features/landing/LandingPage.tsx) |
| **02** | `calculator_start` | Homeowner launches the calculator (`/plan`) | `step` (starting chapter), `deviceCategory` | [`PlannerPage.tsx`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/features/planner/PlannerPage.tsx) |
| **03** | `chapter_started` | User enters any chapter (1 through 8) | `step`, `stepName`, `deviceCategory` | [`PlannerPage.tsx`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/features/planner/PlannerPage.tsx) |
| **04** | `chapter_completed` | User advances from one chapter to another | `step`, `stepName`, `durationMs`, `deviceCategory` | [`PlannerPage.tsx`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/features/planner/PlannerPage.tsx) |
| **05** | `estimate_generated` | Turnkey preliminary estimate calculated | `estimatedCost`, `builtUpArea`, `costPerSqFt`, `packageTier`, `deviceCategory` | [`PlannerPage.tsx`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/features/planner/PlannerPage.tsx) |
| **06** | `boq_preview_viewed` | User views the Stage 8 / Chapter 7 BOQ table | `previewItemsCount` (5), `deviceCategory` | [`Chapter7ReviewCommercial.tsx`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/features/planner/chapters/Chapter7ReviewCommercial.tsx) |
| **07** | `checkout_started` | User opens purchase modal for any report tier | `packageTier` ('BASIC_ESTIMATE_PDF' \| 'DETAILED_ESTIMATE_499' \| 'PREMIUM_1499'), `estimatedCost`, `gateway` ('CASHFREE') | [`Chapter7ReviewCommercial.tsx`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/features/planner/chapters/Chapter7ReviewCommercial.tsx) |
| **08** | `payment_success` | Cashfree transaction verified by server | `packageTier`, `orderId`, `estimatedCost`, `gateway`, `verifiedAt` | [`UnlockReportModal.tsx`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/components/modals/UnlockReportModal.tsx), [`UnlockBasicPdfModal.tsx`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/components/modals/UnlockBasicPdfModal.tsx) |
| **09** | `payment_failed` | User cancels checkout or gateway rejects card | `packageTier`, `reason`, `failureCategory` ('USER_CANCELLED' \| 'GATEWAY_ERROR' \| 'VERIFICATION_FAILED') | [`UnlockReportModal.tsx`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/components/modals/UnlockReportModal.tsx), [`UnlockBasicPdfModal.tsx`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/components/modals/UnlockBasicPdfModal.tsx) |
| **10** | `report_downloaded` | Homeowner downloads generated PDF report | `packageTier`, `reportFormat` ('PDF'), `downloadedAt` | [`Chapter7ReviewCommercial.tsx`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/features/planner/chapters/Chapter7ReviewCommercial.tsx) |

---

## 3. Dimension Capture & Device Profiling

The helper method `getDeviceCategory()` inspects window viewport dimensions to classify homeowner traffic:
- **`mobile`:** Viewport width $< 768\text{px}$
- **`tablet`:** Viewport width $\ge 768\text{px}$ and $< 1024\text{px}$
- **`desktop`:** Viewport width $\ge 1024\text{px}$

This dimension is injected automatically into every analytics event payload, enabling device-segmented funnel drop-off analysis.

---

## 4. Dual Dispatch & Failsafe Execution

Each tracking call dispatches across two channels:
1. **Microsoft Clarity:** If `window.clarity` is loaded, calls `window.clarity('event', payload.eventType)` for session replay correlation.
2. **First-Party Analytics API:** Posts JSON to `/api/v1/admin/analytics/event`. Uses `navigator.sendBeacon` for zero-lag background transmission, falling back to `fetch` with `keepalive: true`.

---

## 5. Automated Test Suite Results

Test Suite: [`src/calculation-engine/__tests__/analytics_funnel_tracking.test.ts`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/calculation-engine/__tests__/analytics_funnel_tracking.test.ts)

```
 ✓ src/calculation-engine/__tests__/analytics_funnel_tracking.test.ts (11 tests) 51ms
   ✓ 1. tracks landing_view with deviceCategory dimension
   ✓ 2. tracks calculator_start with starting stage
   ✓ 3. tracks chapter_started with chapter details
   ✓ 4. tracks chapter_completed with durationMs and metadata
   ✓ 5. tracks estimate_generated with financial dimensions
   ✓ 6. tracks boq_preview_viewed with preview count
   ✓ 7. tracks checkout_started with plan, amount, and gateway
   ✓ 8. tracks payment_success with verified transaction metadata
   ✓ 9. tracks payment_failed with failure category and reason
   ✓ 10. tracks report_downloaded with format and timestamp
   ✓ 11. correctly maps viewport categories
```

**Result:** 11/11 tests passing (100% pass rate).

