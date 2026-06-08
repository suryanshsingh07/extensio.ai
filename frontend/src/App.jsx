import React, { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthModal from './components/AuthModal';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Hero from './components/Hero';
import DashboardPreview from './components/DashboardPreview';
import Features from './components/Features';
import Pricing from './components/Pricing';
import FeedbackPortal from './components/FeedbackPortal';
import GridBackground from './components/GridBackground';
import { TermsOfService, PrivacyPolicy, Contact, Changelog, APIDocs, AboutUs, Blog, Careers, Security } from './components/FooterPages';
import ErrorBoundary from './components/ErrorBoundary';

const Dashboard = lazy(() => import('./components/Dashboard'));
const ValidationPreview = lazy(() => import('./components/ValidationPreview'));
const PublishingDashboard = lazy(() => import('./components/PublishingDashboard'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const OptimizationMetrics = lazy(() => import('./components/OptimizationMetrics'));
const LaunchDashboard = lazy(() => import('./components/LaunchDashboard'));
const EnterpriseDashboard = lazy(() => import('./components/EnterpriseDashboard'));
const EvolutionDashboard = lazy(() => import('./components/EvolutionDashboard'));
const Profile = lazy(() => import('./components/Profile'));
const EngineInsights = lazy(() => import('./components/EngineInsights'));

function Spinner() {
  return (
    <div className="w-full flex justify-center items-center py-32">
      <div className="w-8 h-8 border-2 border-white/10 border-t-primary rounded-full animate-spin" />
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { user, loading, openAuthModal } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      openAuthModal('login');
    }
  }, [loading, user, openAuthModal]);

  if (loading) return <Spinner />;

  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <Spinner />;

  if (!user || !user.isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function ScrollToHash() {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const element = document.getElementById(hash.replace('#', ''));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [hash]);

  return null;
}

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <h1 className="text-9xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-primary to-secondary animate-pulse">404</h1>
      <p className="mt-4 text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">Page Not Found</p>
      <p className="mt-2 text-base text-gray-400">Sorry, we couldn’t find the page you’re looking for.</p>
      <div className="mt-10">
        <a href="/" className="px-6 py-3 rounded-xl bg-linear-to-r from-primary to-secondary font-semibold hover:opacity-90 transition-opacity">
          Go back home
        </a>
      </div>
    </div>
  );
}

function LandingPage() {
  return (
    <>
      <Hero />
      <DashboardPreview />
      <Features />
      <Pricing />
      <FeedbackPortal />
    </>
  );
}

function WorkspacePage() {
  return (
    <Suspense fallback={<Spinner />}>
      <Dashboard />
      <ValidationPreview />
      <PublishingDashboard />
    </Suspense>
  );
}

function ProfilePage() {
  return (
    <Suspense fallback={<Spinner />}>
      <Profile />
    </Suspense>
  );
}

function InsightsPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <EngineInsights />
    </Suspense>
  );
}

function AdminPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <AdminDashboard />
      <OptimizationMetrics />
      <LaunchDashboard />
      <EnterpriseDashboard />
      <EvolutionDashboard />
    </Suspense>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <ScrollToHash />
          {/* Commented out original background wrapper */}
          {/* 
          <div className="min-h-screen bg-background text-white font-sans">
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden="true">
              <div className="absolute top-[-15%] left-[-8%] w-[55%] h-[55%] bg-primary/10 blur-[160px] rounded-full" />
              <div className="absolute bottom-[-20%] right-[-10%] w-[45%] h-[45%] bg-secondary/10 blur-[160px] rounded-full" />
              <div className="absolute top-[40%] left-[30%] w-[30%] h-[30%] bg-accent/5 blur-[120px] rounded-full" />
            </div> 
            */}

          <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white font-sans transition-colors duration-500">
            <GridBackground />
            <div className="relative z-10 flex flex-col items-center w-full min-h-screen">
              <Navbar />
              <AuthModal />
              <main className="w-full max-w-7xl px-4 sm:px-6 flex flex-col items-center flex-1">
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/workspace" element={<ProtectedRoute><WorkspacePage /></ProtectedRoute>} />
                  <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                  <Route path="/insights" element={<ProtectedRoute><InsightsPage /></ProtectedRoute>} />
                  <Route path="/terms" element={<TermsOfService />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/changelog" element={<Changelog />} />
                  <Route path="/apidocs" element={<APIDocs />} />
                  <Route path="/about" element={<AboutUs />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/careers" element={<Careers />} />
                  <Route path="/security" element={<Security />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}
