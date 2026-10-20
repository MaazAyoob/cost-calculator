import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { Loader } from '../components/common/Skeleton';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { AuthGuard } from '../components/auth/AuthGuard';

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
const ConsultationPage = lazy(() =>
  import('../features/consultation/ConsultationPage').then((m) => ({ default: m.ConsultationPage }))
);
const ConsultantProfilePage = lazy(() =>
  import('../features/consultation/ConsultantProfilePage').then((m) => ({ default: m.ConsultantProfilePage }))
);
const ProfessionalJoinPage = lazy(() =>
  import('../features/consultation/ProfessionalJoinPage').then((m) => ({ default: m.ProfessionalJoinPage }))
);
const PricingPage = lazy(() =>
  import('../features/pricing/PricingPage').then((m) => ({ default: m.PricingPage }))
);
const LoginPage = lazy(() =>
  import('../features/auth/LoginPage').then((m) => ({ default: m.LoginPage }))
);
const SignupPage = lazy(() =>
  import('../features/auth/SignupPage').then((m) => ({ default: m.SignupPage }))
);
const ForgotPasswordPage = lazy(() =>
  import('../features/auth/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage }))
);
const AccountDashboardPage = lazy(() =>
  import('../features/account/AccountDashboardPage').then((m) => ({ default: m.AccountDashboardPage }))
);
const NotFoundPage = lazy(() =>
  import('../features/error/NotFoundPage').then((m) => ({ default: m.NotFoundPage }))
);
const PaymentStatusPage = lazy(() =>
  import('../features/payment/PaymentStatusPage').then((m) => ({ default: m.PaymentStatusPage }))
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
      // Public Authentication Pages
      {
        path: 'login',
        element: (
          <ErrorBoundary>
            <Suspense fallback={<PageFallback />}>
              <LoginPage />
            </Suspense>
          </ErrorBoundary>
        ),
      },
      {
        path: 'signup',
        element: (
          <ErrorBoundary>
            <Suspense fallback={<PageFallback />}>
              <SignupPage />
            </Suspense>
          </ErrorBoundary>
        ),
      },
      {
        path: 'forgot-password',
        element: (
          <ErrorBoundary>
            <Suspense fallback={<PageFallback />}>
              <ForgotPasswordPage />
            </Suspense>
          </ErrorBoundary>
        ),
      },
      {
        path: 'reset-password',
        element: (
          <ErrorBoundary>
            <Suspense fallback={<PageFallback />}>
              <ForgotPasswordPage />
            </Suspense>
          </ErrorBoundary>
        ),
      },

      // Login-Gated Calculator & Planner Routes
      {
        path: 'planner',
        element: (
          <ErrorBoundary>
            <Suspense fallback={<PageFallback />}>
              <AuthGuard>
                <PlannerPage />
              </AuthGuard>
            </Suspense>
          </ErrorBoundary>
        ),
      },
      {
        path: 'calculator',
        element: (
          <ErrorBoundary>
            <Suspense fallback={<PageFallback />}>
              <AuthGuard>
                <PlannerPage />
              </AuthGuard>
            </Suspense>
          </ErrorBoundary>
        ),
      },

      // Customer Account Dashboard
      {
        path: 'account',
        element: (
          <ErrorBoundary>
            <Suspense fallback={<PageFallback />}>
              <AuthGuard>
                <AccountDashboardPage />
              </AuthGuard>
            </Suspense>
          </ErrorBoundary>
        ),
      },
      {
        path: 'account/*',
        element: (
          <ErrorBoundary>
            <Suspense fallback={<PageFallback />}>
              <AuthGuard>
                <AccountDashboardPage />
              </AuthGuard>
            </Suspense>
          </ErrorBoundary>
        ),
      },

      // Existing App Features
      {
        path: 'dashboard',
        element: (
          <ErrorBoundary>
            <Suspense fallback={<PageFallback />}>
              <AuthGuard>
                <DashboardPage />
              </AuthGuard>
            </Suspense>
          </ErrorBoundary>
        ),
      },
      {
        path: 'report',
        element: (
          <ErrorBoundary>
            <Suspense fallback={<PageFallback />}>
              <AuthGuard>
                <ReportPage />
              </AuthGuard>
            </Suspense>
          </ErrorBoundary>
        ),
      },
      {
        path: 'reports',
        element: (
          <ErrorBoundary>
            <Suspense fallback={<PageFallback />}>
              <AuthGuard>
                <ReportPage />
              </AuthGuard>
            </Suspense>
          </ErrorBoundary>
        ),
      },
      {
        path: 'settings',
        element: (
          <ErrorBoundary>
            <Suspense fallback={<PageFallback />}>
              <AuthGuard>
                <SettingsPage />
              </AuthGuard>
            </Suspense>
          </ErrorBoundary>
        ),
      },

      // Admin Management
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
        path: 'admin/*',
        element: (
          <ErrorBoundary>
            <Suspense fallback={<PageFallback />}>
              <AdminPage />
            </Suspense>
          </ErrorBoundary>
        ),
      },

      // Public Consultations & Marketing
      {
        path: 'consult',
        element: (
          <ErrorBoundary>
            <Suspense fallback={<PageFallback />}>
              <ConsultationPage />
            </Suspense>
          </ErrorBoundary>
        ),
      },
      {
        path: 'consult/:slug',
        element: (
          <ErrorBoundary>
            <Suspense fallback={<PageFallback />}>
              <ConsultantProfilePage />
            </Suspense>
          </ErrorBoundary>
        ),
      },
      {
        path: 'professionals/join',
        element: (
          <ErrorBoundary>
            <Suspense fallback={<PageFallback />}>
              <ProfessionalJoinPage />
            </Suspense>
          </ErrorBoundary>
        ),
      },
      {
        path: 'professionals',
        element: (
          <ErrorBoundary>
            <Suspense fallback={<PageFallback />}>
              <ProfessionalJoinPage />
            </Suspense>
          </ErrorBoundary>
        ),
      },
      {
        path: 'pricing',
        element: (
          <ErrorBoundary>
            <Suspense fallback={<PageFallback />}>
              <PricingPage />
            </Suspense>
          </ErrorBoundary>
        ),
      },
      {
        path: 'payment/status',
        element: (
          <ErrorBoundary>
            <Suspense fallback={<PageFallback />}>
              <PaymentStatusPage />
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
