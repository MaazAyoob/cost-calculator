// ============================================================
// LIGHTWEIGHT FIRST-PARTY CALCULATOR ANALYTICS ENGINE
// Tracks user progression, step timing, package decisions, and estimate generation
// Failsafe non-blocking execution + Microsoft Clarity integration hook
// Strict timer accuracy: prevents double-counting, tracks page and step timing
// ============================================================

import { getApiUrl } from '../config/api';

export type CalculatorEventType =
  | 'calculator_started'
  | 'package_selected'
  | 'plot_configured'
  | 'bua_configured'
  | 'step_entered'
  | 'step_exited'
  | 'specification_changed'
  | 'comparison_opened'
  | 'package_switched'
  | 'estimate_generated'
  | 'report_generated'
  | 'calculator_completed';

export interface AnalyticsPayload {
  eventType: CalculatorEventType;
  stepName?: string;
  step?: number;
  packageTier?: string;
  city?: string;
  durationMs?: number;
  plotLength?: number;
  plotWidth?: number;
  builtUpArea?: number;
  estimatedCost?: number;
  costPerSqFt?: number;
  metadata?: Record<string, unknown>;
}

declare global {
  interface Window {
    clarity?: (...args: unknown[]) => void;
  }
}

class CalculatorAnalytics {
  private sessionId: string;
  private pageStartTime: number = Date.now();
  private activeStepName: string | null = null;
  private activeStepStartTime: number | null = null;
  private activeStepPackage: string | undefined;
  private activeStepCity: string | undefined;
  private isTabVisible: boolean = true;
  private pausedStepElapsed: number = 0;
  private isInitialized: boolean = false;

  constructor() {
    this.sessionId = this.getOrCreateSessionId();
    this.initVisibilityListeners();
  }

  private getOrCreateSessionId(): string {
    try {
      let id = sessionStorage.getItem('hutty_calc_session_id');
      if (!id) {
        id = `calc_sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        sessionStorage.setItem('hutty_calc_session_id', id);
      }
      return id;
    } catch {
      return `calc_sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }
  }

  public getSessionId(): string {
    return this.sessionId;
  }

  private initVisibilityListeners() {
    if (typeof window === 'undefined' || this.isInitialized) return;
    this.isInitialized = true;

    try {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          this.handleTabHidden();
        } else {
          this.handleTabVisible();
        }
      });

      window.addEventListener('beforeunload', () => {
        this.closeActiveStep();
      });
    } catch {
      // Non-blocking
    }
  }

  private handleTabHidden() {
    this.isTabVisible = false;
    if (this.activeStepStartTime) {
      this.pausedStepElapsed += Date.now() - this.activeStepStartTime;
      this.activeStepStartTime = null;
    }
  }

  private handleTabVisible() {
    this.isTabVisible = true;
    if (this.activeStepName && !this.activeStepStartTime) {
      this.activeStepStartTime = Date.now();
    }
  }

  /**
   * Closes any currently running step timer to guarantee no double-counting.
   */
  public closeActiveStep() {
    if (!this.activeStepName) return;

    let totalDuration = this.pausedStepElapsed;
    if (this.activeStepStartTime && this.isTabVisible) {
      totalDuration += Date.now() - this.activeStepStartTime;
    }

    const stepName = this.activeStepName;
    const pkg = this.activeStepPackage;
    const city = this.activeStepCity;

    // Reset step tracker
    this.activeStepName = null;
    this.activeStepStartTime = null;
    this.pausedStepElapsed = 0;

    // Fire exit event only if duration is meaningful (> 250ms)
    if (totalDuration >= 250) {
      this.trackEvent({
        eventType: 'step_exited',
        stepName,
        packageTier: pkg,
        city,
        durationMs: Math.min(totalDuration, 1800000), // Cap at 30 minutes to prevent background leaks
      });
    }
  }

  /**
   * Record entry into a wizard step.
   * Closes previous step cleanly first.
   */
  public recordStepEnter(stepName: string, packageTier?: string, city?: string, stepNum?: number) {
    if (this.activeStepName === stepName) return;

    // 1. Close active step before opening new one
    this.closeActiveStep();

    // 2. Open new step
    this.activeStepName = stepName;
    this.activeStepPackage = packageTier;
    this.activeStepCity = city;
    this.activeStepStartTime = Date.now();
    this.pausedStepElapsed = 0;

    this.trackEvent({
      eventType: 'step_entered',
      stepName,
      step: stepNum,
      packageTier,
      city,
    });
  }

  public recordStepExit(stepName: string, packageTier?: string, city?: string) {
    if (this.activeStepName === stepName) {
      this.closeActiveStep();
    }
  }

  public recordCalculatorCompleted(data?: { packageTier?: string; city?: string; cost?: number; bua?: number }) {
    this.closeActiveStep();

    const totalPageDuration = Date.now() - this.pageStartTime;
    this.trackEvent({
      eventType: 'calculator_completed',
      packageTier: data?.packageTier,
      city: data?.city,
      estimatedCost: data?.cost,
      builtUpArea: data?.bua,
      durationMs: totalPageDuration,
    });
  }

  public trackEvent(payload: AnalyticsPayload) {
    // Non-blocking try/catch failsafe: NEVER throw to caller or impact calculator
    try {
      // 1. Call Microsoft Clarity if available
      if (typeof window !== 'undefined' && typeof window.clarity === 'function') {
        try {
          window.clarity('event', payload.eventType);
          if (payload.stepName) window.clarity('set', 'stepName', payload.stepName);
          if (payload.packageTier) window.clarity('set', 'packageTier', payload.packageTier);
        } catch {
          // Ignore clarity errors
        }
      }

      // 2. Post to first-party server analytics endpoint asynchronously
      const body = {
        sessionId: this.sessionId,
        eventName: payload.eventType,
        stepName: payload.stepName,
        step: payload.step,
        packageTier: payload.packageTier,
        city: payload.city,
        durationMs: payload.durationMs,
        plotLength: payload.plotLength,
        plotWidth: payload.plotWidth,
        builtUpArea: payload.builtUpArea,
        estimatedCost: payload.estimatedCost,
        costPerSqFt: payload.costPerSqFt,
        metadata: payload.metadata || null,
      };

      // Fire and forget via fetch or sendBeacon
      const eventEndpoint = getApiUrl('/api/v1/admin/analytics/event');
      if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
        const blob = new Blob([JSON.stringify(body)], { type: 'application/json' });
        navigator.sendBeacon(eventEndpoint, blob);
      } else if (typeof fetch !== 'undefined') {
        fetch(eventEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          keepalive: true,
        }).catch(() => {
          // Silently absorb fetch error
        });
      }
    } catch {
      // Complete failsafe: never throw to caller or impact calculator execution
    }
  }
}

export const analytics = new CalculatorAnalytics();
