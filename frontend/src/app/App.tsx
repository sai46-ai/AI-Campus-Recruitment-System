import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../shared/context/AuthContext';
import { Navbar } from '../shared/components/layout/Navbar';
import { Footer } from '../shared/components/layout/Footer';
import { ProtectedRoute } from '../shared/components/layout/ProtectedRoute';
import { AtmosphericBackground } from '../shared/components/background/AtmosphericBackground';
import { ContrastOverlay } from '../shared/components/layout/ContrastOverlay';

// Public pages loaded eagerly for immediate initial paint
import { LandingPage } from '../features/common/LandingPage';
import { Login } from '../features/auth/Login';
import { Register } from '../features/auth/Register';
import { NotFound } from '../features/common/NotFound';

// Role-specific and heavy pages lazy-loaded on demand
const ViewJobs = React.lazy(() => import('../features/jobs/ViewJobs').then((m) => ({ default: m.ViewJobs })));
const StudentDashboard = React.lazy(() => import('../features/student/StudentDashboard').then((m) => ({ default: m.StudentDashboard })));
const MyApplications = React.lazy(() => import('../features/student/MyApplications').then((m) => ({ default: m.MyApplications })));
const ResumeBuilder = React.lazy(() => import('../features/student/ResumeBuilder').then((m) => ({ default: m.ResumeBuilder })));
const RecruiterDashboard = React.lazy(() => import('../features/recruiter/RecruiterDashboard').then((m) => ({ default: m.RecruiterDashboard })));
const ViewApplicants = React.lazy(() => import('../features/recruiter/ViewApplicants').then((m) => ({ default: m.ViewApplicants })));
const PostJob = React.lazy(() => import('../features/recruiter/PostJob').then((m) => ({ default: m.PostJob })));
const MyJobs = React.lazy(() => import('../features/recruiter/MyJobs').then((m) => ({ default: m.MyJobs })));
const PlacementDashboard = React.lazy(() => import('../features/placement/PlacementDashboard').then((m) => ({ default: m.PlacementDashboard })));
const AdminDashboard = React.lazy(() => import('../features/admin/AdminDashboard').then((m) => ({ default: m.AdminDashboard })));
const Profile = React.lazy(() => import('../features/common/Profile').then((m) => ({ default: m.Profile })));
const Notifications = React.lazy(() => import('../features/common/Notifications').then((m) => ({ default: m.Notifications })));
const PrivacyPolicy = React.lazy(() => import('../features/common/PrivacyPolicy').then((m) => ({ default: m.PrivacyPolicy })));
const TermsOfService = React.lazy(() => import('../features/common/TermsOfService').then((m) => ({ default: m.TermsOfService })));

const PageLoadingFallback: React.FC = () => (
  <div className="min-h-[50vh] flex items-center justify-center" aria-live="polite">
    <div className="flex flex-col items-center space-y-3 p-6 rounded-2xl bg-tideglass-surface border border-[#D4DED3] backdrop-blur-md shadow-xl">
      <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" aria-label="Loading page..." />
      <span className="text-xs font-medium text-[#0A7D6E]">Loading workspace...</span>
    </div>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <div className="precision-editorial min-h-screen flex flex-col bg-transparent text-[#344942] selection:bg-[#0A7D6E] selection:text-white relative">
            {/* Centralized 5-Environment 3D WebGL Background */}
            <AtmosphericBackground />
            {/* Layered Contrast & Vignette Protection */}
            <ContrastOverlay />
            <Navbar />
            <main className="flex-1 relative z-10">
              <Suspense fallback={<PageLoadingFallback />}>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/jobs" element={<ViewJobs />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/terms" element={<TermsOfService />} />

                  {/* Authenticated Common Routes */}
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/notifications"
                    element={
                      <ProtectedRoute>
                        <Notifications />
                      </ProtectedRoute>
                    }
                  />

                  {/* Convenience Aliases & Redirects */}
                  <Route path="/signin" element={<Navigate to="/login" replace />} />
                  <Route path="/signup" element={<Navigate to="/register" replace />} />
                  <Route path="/dashboard" element={<Navigate to="/student-dashboard" replace />} />
                  <Route path="/student" element={<Navigate to="/student-dashboard" replace />} />
                  <Route path="/student/dashboard" element={<Navigate to="/student-dashboard" replace />} />
                  <Route path="/recruiter" element={<Navigate to="/recruiter-dashboard" replace />} />
                  <Route path="/placement" element={<Navigate to="/placement-dashboard" replace />} />
                  <Route path="/admin" element={<Navigate to="/admin-dashboard" replace />} />
                  <Route path="/applications" element={<Navigate to="/my-applications" replace />} />
                  <Route
                    path="/student-dashboard"
                    element={
                      <ProtectedRoute allowedRoles={['student']}>
                        <StudentDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/my-applications"
                    element={
                      <ProtectedRoute allowedRoles={['student']}>
                        <MyApplications />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/resume-builder"
                    element={
                      <ProtectedRoute allowedRoles={['student']}>
                        <ResumeBuilder />
                      </ProtectedRoute>
                    }
                  />

                  {/* Recruiter Routes */}
                  <Route
                    path="/recruiter-dashboard"
                    element={
                      <ProtectedRoute allowedRoles={['recruiter', 'admin', 'super_admin']}>
                        <RecruiterDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/post-job"
                    element={
                      <ProtectedRoute allowedRoles={['recruiter', 'admin', 'super_admin']}>
                        <PostJob />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/edit-job/:jobId"
                    element={
                      <ProtectedRoute allowedRoles={['recruiter', 'admin', 'super_admin']}>
                        <PostJob />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/my-jobs"
                    element={
                      <ProtectedRoute allowedRoles={['recruiter', 'admin', 'super_admin']}>
                        <MyJobs />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/applicants/:jobId"
                    element={
                      <ProtectedRoute allowedRoles={['recruiter', 'admin', 'super_admin', 'placement_officer']}>
                        <ViewApplicants />
                      </ProtectedRoute>
                    }
                  />

                  {/* Placement Officer Routes */}
                  <Route
                    path="/placement-dashboard"
                    element={
                      <ProtectedRoute allowedRoles={['placement_officer', 'admin', 'super_admin']}>
                        <PlacementDashboard />
                      </ProtectedRoute>
                    }
                  />

                  {/* Admin Routes */}
                  <Route
                    path="/admin-dashboard"
                    element={
                      <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />

                  {/* Catch-All 404 Route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </main>
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
