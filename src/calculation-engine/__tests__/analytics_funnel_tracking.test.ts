import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { analytics } from '../../utils/analytics';

describe('Canonical Analytics & Conversion Funnel (10 Events)', () => {
  let capturedPayloads: any[] = [];

  beforeEach(() => {
    capturedPayloads = [];

    // Spy on trackEvent directly to inspect outgoing payload
    vi.spyOn(analytics, 'trackEvent').mockImplementation((payload) => {
      capturedPayloads.push(payload);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('1. tracks landing_view with deviceCategory dimension', () => {
    analytics.trackLandingView();
    const event = capturedPayloads.find((p) => p.eventType === 'landing_view');
    expect(event).toBeDefined();
    expect(event?.metadata?.deviceCategory).toBeDefined();
  });

  it('2. tracks calculator_start with starting stage', () => {
    analytics.trackCalculatorStart(1);
    const event = capturedPayloads.find((p) => p.eventType === 'calculator_start');
    expect(event).toBeDefined();
    expect(event?.step).toBe(1);
  });

  it('3. tracks chapter_started with chapter details', () => {
    analytics.trackChapterStarted(2, 'Your Home');
    const event = capturedPayloads.find((p) => p.eventType === 'chapter_started');
    expect(event).toBeDefined();
    expect(event?.step).toBe(2);
    expect(event?.stepName).toBe('Your Home');
  });

  it('4. tracks chapter_completed with durationMs and metadata', () => {
    analytics.trackChapterCompleted(2, 'Your Home', 15200);
    const event = capturedPayloads.find((p) => p.eventType === 'chapter_completed');
    expect(event).toBeDefined();
    expect(event?.step).toBe(2);
    expect(event?.durationMs).toBe(15200);
    expect(event?.metadata?.chapterName).toBe('Your Home');
  });

  it('5. tracks estimate_generated with financial dimensions', () => {
    analytics.trackEstimateGenerated(4500000, 2200, 2045, 'Premium');
    const event = capturedPayloads.find((p) => p.eventType === 'estimate_generated');
    expect(event).toBeDefined();
    expect(event?.estimatedCost).toBe(4500000);
    expect(event?.builtUpArea).toBe(2200);
    expect(event?.costPerSqFt).toBe(2045);
    expect(event?.packageTier).toBe('Premium');
  });

  it('6. tracks boq_preview_viewed with preview count', () => {
    analytics.trackBoqPreviewViewed(5);
    const event = capturedPayloads.find((p) => p.eventType === 'boq_preview_viewed');
    expect(event).toBeDefined();
    expect(event?.metadata?.previewItemsCount).toBe(5);
  });

  it('7. tracks checkout_started with plan, amount, and gateway', () => {
    analytics.trackCheckoutStarted('DETAILED_ESTIMATE_499', 499, 'CASHFREE');
    const event = capturedPayloads.find((p) => p.eventType === 'checkout_started');
    expect(event).toBeDefined();
    expect(event?.packageTier).toBe('DETAILED_ESTIMATE_499');
    expect(event?.estimatedCost).toBe(499);
    expect(event?.metadata?.gateway).toBe('CASHFREE');
  });

  it('8. tracks payment_success with verified transaction metadata', () => {
    analytics.trackPaymentSuccess('DETAILED_ESTIMATE_499', 'cf_order_98765', 499, 'CASHFREE');
    const event = capturedPayloads.find((p) => p.eventType === 'payment_success');
    expect(event).toBeDefined();
    expect(event?.packageTier).toBe('DETAILED_ESTIMATE_499');
    expect(event?.estimatedCost).toBe(499);
    expect(event?.metadata?.orderId).toBe('cf_order_98765');
    expect(event?.metadata?.verifiedAt).toBeDefined();
  });

  it('9. tracks payment_failed with failure category and reason', () => {
    analytics.trackPaymentFailed('PREMIUM_1499', 'User closed checkout popup', 'USER_CANCELLED', 'CASHFREE');
    const event = capturedPayloads.find((p) => p.eventType === 'payment_failed');
    expect(event).toBeDefined();
    expect(event?.packageTier).toBe('PREMIUM_1499');
    expect(event?.metadata?.failureCategory).toBe('USER_CANCELLED');
    expect(event?.metadata?.reason).toBe('User closed checkout popup');
  });

  it('10. tracks report_downloaded with format and timestamp', () => {
    analytics.trackReportDownloaded('DETAILED_ESTIMATE_499', 'PDF');
    const event = capturedPayloads.find((p) => p.eventType === 'report_downloaded');
    expect(event).toBeDefined();
    expect(event?.packageTier).toBe('DETAILED_ESTIMATE_499');
    expect(event?.metadata?.reportFormat).toBe('PDF');
    expect(event?.metadata?.downloadedAt).toBeDefined();
  });

  it('correctly maps viewport categories', () => {
    const category = analytics.getDeviceCategory();
    expect(['desktop', 'tablet', 'mobile']).toContain(category);
  });
});
