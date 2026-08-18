import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';

// Layouts
import { LandingLayout } from './layouts/LandingLayout';
import { AuthLayout } from './layouts/AuthLayout';
import { DashboardLayout } from './layouts/DashboardLayout';

// Lazy Loaded Pages to optimize bundle chunking
const LandingPage = lazy(() => import('./features/landing/LandingPage').then(m => ({ default: m.LandingPage })));
const LoginPage = lazy(() => import('./features/auth/LoginPage').then(m => ({ default: m.LoginPage })));
const SignupPage = lazy(() => import('./features/auth/SignupPage').then(m => ({ default: m.SignupPage })));
const ForgotPasswordPage = lazy(() => import('./features/auth/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import('./features/auth/ResetPasswordPage').then(m => ({ default: m.ResetPasswordPage })));
const VerifyEmailPage = lazy(() => import('./features/auth/VerifyEmailPage').then(m => ({ default: m.VerifyEmailPage })));
const OnboardingWizard = lazy(() => import('./features/onboarding/OnboardingWizard').then(m => ({ default: m.OnboardingWizard })));
const StudentDashboard = lazy(() => import('./features/dashboard/StudentDashboard').then(m => ({ default: m.StudentDashboard })));
const AIProfileView = lazy(() => import('./features/dashboard/AIProfileView').then(m => ({ default: m.AIProfileView })));
const CareerComparison = lazy(() => import('./features/dashboard/CareerComparison').then(m => ({ default: m.CareerComparison })));
const RoadmapView = lazy(() => import('./features/dashboard/RoadmapView').then(m => ({ default: m.RoadmapView })));
const AdminPanel = lazy(() => import('./features/dashboard/AdminPanel').then(m => ({ default: m.AdminPanel })));
const ProjectRecommendationsView = lazy(() => import('./features/dashboard/ProjectRecommendationsView').then(m => ({ default: m.ProjectRecommendationsView })));
const CodeReviewView = lazy(() => import('./features/dashboard/CodeReviewView').then(m => ({ default: m.CodeReviewView })));
const MockInterviewView = lazy(() => import('./features/dashboard/MockInterviewView').then(m => ({ default: m.MockInterviewView })));
const PlacementReadinessView = lazy(() => import('./features/dashboard/PlacementReadinessView').then(m => ({ default: m.PlacementReadinessView })));
const StudyPlannerView = lazy(() => import('./features/dashboard/StudyPlannerView').then(m => ({ default: m.StudyPlannerView })));
const CodingAnalyticsView = lazy(() => import('./features/dashboard/CodingAnalyticsView').then(m => ({ default: m.CodingAnalyticsView })));
const AIAssistantView = lazy(() => import('./features/dashboard/AIAssistantView').then(m => ({ default: m.AIAssistantView })));
const CommunityView = lazy(() => import('./features/dashboard/CommunityView').then(m => ({ default: m.CommunityView })));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Premium glassmorphism loading skeleton
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background text-foreground bg-grid">
    <div className="flex flex-col items-center gap-3">
      <svg className="animate-spin h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
      <span className="text-xs text-slate-400">Loading learning companion...</span>
    </div>
  </div>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <BrowserRouter>
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
                  {/* Public Landing Pages */}
                  <Route
                    path="/"
                    element={
                      <LandingLayout>
                        <LandingPage />
                      </LandingLayout>
                    }
                  />

                  {/* Auth Pages (using AuthLayout) */}
                  <Route
                    path="/login"
                    element={
                      <AuthLayout>
                        <LoginPage />
                      </AuthLayout>
                    }
                  />
                  <Route
                    path="/signup"
                    element={
                      <AuthLayout>
                        <SignupPage />
                      </AuthLayout>
                    }
                  />
                  <Route
                    path="/forgot-password"
                    element={
                      <AuthLayout>
                        <ForgotPasswordPage />
                      </AuthLayout>
                    }
                  />
                  <Route
                    path="/reset-password"
                    element={
                      <AuthLayout>
                        <ResetPasswordPage />
                      </AuthLayout>
                    }
                  />
                  <Route
                    path="/verify-email"
                    element={
                      <AuthLayout>
                        <VerifyEmailPage />
                      </AuthLayout>
                    }
                  />

                  {/* Onboarding Wizard (Dedicated Full Page Route) */}
                  <Route path="/onboarding" element={<OnboardingWizard />} />

                  {/* Protected Dashboard Pages */}
                  <Route
                    path="/dashboard"
                    element={
                      <DashboardLayout>
                        <StudentDashboard />
                      </DashboardLayout>
                    }
                  />
                  <Route
                    path="/profile-analysis"
                    element={
                      <DashboardLayout>
                        <AIProfileView />
                      </DashboardLayout>
                    }
                  />
                  <Route
                    path="/career"
                    element={
                      <DashboardLayout>
                        <CareerComparison />
                      </DashboardLayout>
                    }
                  />
                  <Route
                    path="/roadmaps"
                    element={
                      <DashboardLayout>
                        <RoadmapView />
                      </DashboardLayout>
                    }
                  />
                  <Route
                    path="/projects"
                    element={
                      <DashboardLayout>
                        <ProjectRecommendationsView />
                      </DashboardLayout>
                    }
                  />
                  <Route
                    path="/code-review"
                    element={
                      <DashboardLayout>
                        <CodeReviewView />
                      </DashboardLayout>
                    }
                  />
                  <Route
                    path="/interviews"
                    element={
                      <DashboardLayout>
                        <MockInterviewView />
                      </DashboardLayout>
                    }
                  />
                  <Route
                    path="/readiness"
                    element={
                      <DashboardLayout>
                        <PlacementReadinessView />
                      </DashboardLayout>
                    }
                  />
                  <Route
                    path="/planner"
                    element={
                      <DashboardLayout>
                        <StudyPlannerView />
                      </DashboardLayout>
                    }
                  />
                  <Route
                    path="/coding"
                    element={
                      <DashboardLayout>
                        <CodingAnalyticsView />
                      </DashboardLayout>
                    }
                  />
                  <Route
                    path="/assistant"
                    element={
                      <DashboardLayout>
                        <AIAssistantView />
                      </DashboardLayout>
                    }
                  />
                  <Route
                    path="/community"
                    element={
                      <DashboardLayout>
                        <CommunityView />
                      </DashboardLayout>
                    }
                  />
                  <Route
                    path="/admin"
                    element={
                      <DashboardLayout>
                        <AdminPanel />
                      </DashboardLayout>
                    }
                  />

                  {/* Fallback Route */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
