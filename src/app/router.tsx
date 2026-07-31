import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { Loader } from '../components/common/Skeleton';
import { ErrorBoundary } from '../components/common/ErrorBoundary';

const LandingPage = lazy(() =>
  import('../features/landing/LandingPage').then((m) => ({ default: m.LandingPage }))
);
const PlannerPage = lazy(() =>
  import('../features/planner/PlannerPage').then((m) => ({ default: m.PlannerPage }))
);
const DashboardPage = lazy(() =>
  import('../features/dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage }))
);
const ReportPage = lazy(() =>
  import('../features/report/ReportPage').then((m) => ({ default: m.ReportPage }))
);
const SettingsPage = lazy(() =>
  import('../features/settings/SettingsPage').then((m) => ({ default: m.SettingsPage }))
);
const AdminPage = lazy(() =>
  import('../features/admin/AdminPage').then((m) => ({ default: m.AdminPage }))
);
const NotFoundPage = lazy(() =>
  import('../features/error/NotFoundPage').then((m) => ({ default: m.NotFoundPage }))
);

const PageFallback = () => (
  <div className="h-[70vh] flex flex-col items-center justify-center space-y-3">
    <Loader size={36} />
    <p className="text-xs text-slate-500 font-medium animate-pulse">Loading Cost Calculator Workspace...</p>
  </div>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: (
          <ErrorBoundary>
            <Suspense fallback={<PageFallback />}>
              <LandingPage />
            </Suspense>
          </ErrorBoundary>
        ),
      },
      {
        path: 'planner',
        element: (
          <ErrorBoundary>
            <Suspense fallback={<PageFallback />}>
              <PlannerPage />
            </Suspense>
          </ErrorBoundary>
        ),
      },
      {
        path: 'calculator',
        element: (
          <ErrorBoundary>
            <Suspense fallback={<PageFallback />}>
              <PlannerPage />
            </Suspense>
          </ErrorBoundary>
        ),
      },
      {
        path: 'dashboard',
        element: (
          <ErrorBoundary>
            <Suspense fallback={<PageFallback />}>
              <DashboardPage />
            </Suspense>
          </ErrorBoundary>
        ),
      },
      {
        path: 'report',
        element: (
          <ErrorBoundary>
            <Suspense fallback={<PageFallback />}>
              <ReportPage />
            </Suspense>
          </ErrorBoundary>
        ),
      },
      {
        path: 'reports',
        element: (
          <ErrorBoundary>
            <Suspense fallback={<PageFallback />}>
              <ReportPage />
            </Suspense>
          </ErrorBoundary>
        ),
      },
      {
        path: 'settings',
        element: (
          <ErrorBoundary>
            <Suspense fallback={<PageFallback />}>
              <SettingsPage />
            </Suspense>
          </ErrorBoundary>
        ),
      },
      {
        path: 'admin',
        element: (
          <ErrorBoundary>
            <Suspense fallback={<PageFallback />}>
              <AdminPage />
            </Suspense>
          </ErrorBoundary>
        ),
      },
      {
        path: '*',
        element: (
          <ErrorBoundary>
            <Suspense fallback={<PageFallback />}>
              <NotFoundPage />
            </Suspense>
          </ErrorBoundary>
        ),
      },
    ],
  },
]);
