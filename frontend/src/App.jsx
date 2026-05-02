import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AuthModal from './components/AuthModal';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Hero from './components/Hero';
import DashboardPreview from './components/DashboardPreview';
import Features from './components/Features';
import Pricing from './components/Pricing';
import FeedbackPortal from './components/FeedbackPortal';
import {TermsOfService, PrivacyPolicy, Contact, Changelog, APIDocs, AboutUs, Blog, Careers, Security} from './components/FooterPages';

const Dashboard= lazy(() => import('./components/Dashboard'));
const ValidationPreview= lazy(() => import('./components/ValidationPreview'));
const PublishingDashboard = lazy(() => import('./components/PublishingDashboard'));
const AdminDashboard= lazy(() => import('./components/AdminDashboard'));
const OptimizationMetrics = lazy(() => import('./components/OptimizationMetrics'));
const LaunchDashboard = lazy(() => import('./components/LaunchDashboard'));
const EnterpriseDashboard = lazy(() => import('./components/EnterpriseDashboard'));
const EvolutionDashboard = lazy(() => import('./components/EvolutionDashboard'));
const Profile= lazy(() => import('./components/Profile'));

function Spinner() {
  return (
    <div className="w-full flex justify-center items-center py-32">
      <div className="w-8 h-8 border-2 border-white/10 border-t-primary rounded-full animate-spin" />
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
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-background text-white font-sans">
          <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden="true">
            <div className="absolute top-[-15%] left-[-8%] w-[55%] h-[55%] bg-primary/10 blur-[160px] rounded-full" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[45%] h-[45%] bg-secondary/10 blur-[160px] rounded-full" />
            <div className="absolute top-[40%] left-[30%] w-[30%] h-[30%] bg-accent/5 blur-[120px] rounded-full" />
          </div>
          <div className="relative z-10 flex flex-col items-center w-full min-h-screen">
            <Navbar />
            <AuthModal />
            <main className="w-full max-w-7xl px-4 sm:px-6 flex flex-col items-center flex-1">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/workspace" element={<WorkspacePage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/profile" element={<Suspense fallback={<Spinner />}><Profile /></Suspense>} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/changelog" element={<Changelog />} />
                <Route path="/apidocs" element={<APIDocs />} />
                <Route path="/about" element={<AboutUs />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/careers" element={<Careers />} />
                <Route path="/security" element={<Security />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}
