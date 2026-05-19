import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, lazy, Suspense } from 'react';
import { AnimatePresence } from 'framer-motion';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import Ultra3DNavigation from './components/Ultra3DNavigation';
import PageTransition from './components/PageTransition';
import ErrorBoundary from './components/ErrorBoundary';

// Animation utilities
import { initPageAnimations } from './utils/ScrollAnimations';

import './index.css';
import './App.css';

// Enhanced 3D Background Component
import Scene3DManager from './components/Scene3DManager';

// Critical pages (not lazy loaded)
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';

// Lazy loaded pages for code splitting
const StudentDashboard = lazy(() => import('./pages/StudentDashboard'));
const RecruiterDashboard = lazy(() => import('./pages/RecruiterDashboard'));
const ViewJobs = lazy(() => import('./pages/ViewJobs'));
const MyApplications = lazy(() => import('./pages/MyApplications'));
const PostJob = lazy(() => import('./pages/PostJob'));
const MyJobs = lazy(() => import('./pages/MyJobs'));
const ViewApplicants = lazy(() => import('./pages/ViewApplicants'));
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const Notifications = lazy(() => import('./pages/Notifications'));

// Loading component
const PageLoader = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #020b18 0%, #041c2c 100%)',
    color: '#4dd0e1',
    fontSize: '1.5rem'
  }}>
    Loading...
  </div>
);

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
        <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />

        {/* Common (any authenticated user) */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <PageTransition><Profile /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <PageTransition><Settings /></PageTransition>
            </ProtectedRoute>
          }
        />

        {/* Student Routes */}
        <Route
          path="/notifications"
          element={
            <ProtectedRoute allowedRoles={['student', 'recruiter', 'admin']}>
              <PageTransition><Notifications /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student-dashboard"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <PageTransition><StudentDashboard /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/jobs"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <PageTransition><ViewJobs /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/applications"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <PageTransition><MyApplications /></PageTransition>
            </ProtectedRoute>
          }
        />

        {/* Recruiter Routes */}
        <Route
          path="/recruiter-dashboard"
          element={
            <ProtectedRoute allowedRoles={['recruiter']}>
              <PageTransition><RecruiterDashboard /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/post-job"
          element={
            <ProtectedRoute allowedRoles={['recruiter']}>
              <PageTransition><PostJob /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-jobs"
          element={
            <ProtectedRoute allowedRoles={['recruiter']}>
              <PageTransition><MyJobs /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/applicants/:jobId"
          element={
            <ProtectedRoute allowedRoles={['recruiter']}>
              <PageTransition><ViewApplicants /></PageTransition>
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <PageTransition><AdminDashboard /></PageTransition>
            </ProtectedRoute>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  // Initialize GSAP scroll animations on mount
  useEffect(() => {
    initPageAnimations();
  }, []);

  return (
    <ErrorBoundary>
      <Router>
        {/* Enhanced Immersive 3D WebGL Background with Scroll Sync */}
        <Scene3DManager 
          scrollIntensity={1.5} 
          enableScrollSync={true}
          enableMouseInteraction={true}
        />
        
        {/* Ultra 3D Navigation System */}
        <Ultra3DNavigation />
        
        {/* Main App Content */}
        <div className="app-content">
          <Suspense fallback={<PageLoader />}>
            <AnimatedRoutes />
          </Suspense>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
