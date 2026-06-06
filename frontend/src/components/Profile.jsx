import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Phone, Calendar, MapPin, Camera, Lock, Eye, EyeOff,
  Bell, Globe, Moon, Sun, Clock, Download, ShieldAlert, Trash2,
  CheckCircle, AlertCircle, Save, ChevronRight, LogIn, LogOut, Settings, 
  Loader2, X, Smartphone, Monitor
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';

// Mock Initial Data
const MOCK_USER = {
  name: 'Alex Rivera',
  username: '@arivera_dev',
  email: 'alex.rivera@extensio.ai',
  role: 'Premium Creator',
  joinDate: 'March 12, 2024',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&h=200&auto=format&fit=crop',
  phone: '+1 (555) 012-3456',
  dob: '1992-05-15',
  gender: 'prefer-not-to-say',
  location: 'San Francisco, CA',
  preferences: {
    darkMode: true,
    language: 'English (US)',
    timezone: 'PST (UTC-8)'
  },
  notifications: {
    email: true,
    sms: false,
    marketing: true,
    push: true
  },
  activity: [
    { id: 1, type: 'login', label: 'Successful Login', detail: 'Chrome on macOS (192.168.1.1)', time: '2 hours ago', icon: <LogIn className="w-4 h-4" /> },
    { id: 2, type: 'security', label: 'Password Changed', detail: 'Account security updated successfully', time: '3 days ago', icon: <Lock className="w-4 h-4" /> },
    { id: 3, type: 'action', label: 'Project Exported', detail: 'Extension "Dark Reader Lite" zipped', time: '1 week ago', icon: <Download className="w-4 h-4" /> }
  ]
};

export default function Profile() {
  const { user, setUser, token, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLogoutSessionModalOpen, setIsLogoutSessionModalOpen] = useState(false);
  const [sessionToLogout, setSessionToLogout] = useState(null);
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return true;
  });
  const fileInputRef = useRef(null);
  
  // Mock fallback for data not yet in DB
  const [activeSessions, setActiveSessions] = useState([]);

  // Forms State initialized from Auth Context
  const [personalInfo, setPersonalInfo] = useState({
    name: '',
    email: '',
    phone: '',
    dob: '',
    gender: 'prefer-not-to-say',
    location: ''
  });

  // Theme Toggle Effect
  useEffect(() => {
    const handleThemeEvent = (e) => setIsDark(e.detail);
    window.addEventListener('theme-changed', handleThemeEvent);
    return () => window.removeEventListener('theme-changed', handleThemeEvent);
  }, []);

  const setThemeMode = (dark) => {
    if (dark === isDark) return;
    setIsDark(dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
    window.dispatchEvent(new CustomEvent('theme-changed', { detail: dark }));
  };

  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    showPass: false,
    showNewPass: false,
    showConfirmPass: false
  });

  useEffect(() => {
    if (!isPasswordModalOpen) {
      setSecurity({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        showPass: false,
        showNewPass: false,
        showConfirmPass: false
      });
    }
  }, [isPasswordModalOpen]);

  useEffect(() => {
    if (user) {
      setPersonalInfo({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        dob: user.dob || '',
        gender: user.gender || 'prefer-not-to-say',
        location: user.location || ''
      });
    }
  }, [user]);

  // Fetch Active Sessions (Simulated real-time tracking)
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await fetch(`${API_URL}/auth/sessions`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setActiveSessions(data.sessions || []);
        }
      } catch (err) {
        console.error("Failed to fetch sessions:", err);
      }
    };
    if (token) {
      fetchSessions();
      const interval = setInterval(fetchSessions, 30000); // Poll every 30s
      return () => clearInterval(interval);
    }
  }, [token]);

  // Helper: Show Toast
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Handler: Profile Image Upload (Simulated)
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast('Image must be less than 2MB', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        // In a real app, you'd upload this to a server
        setUser({ ...user, avatar: reader.result });
        showToast('Profile image updated locally');
      };
      reader.readAsDataURL(file);
    }
  };

  // Handler: Dynamic Personal Info Save
  const handleSaveInfo = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(personalInfo),
      });

      const data = await res.json();

      if (res.ok) {
        showToast('Profile updated successfully!');
        setUser(data);
      } else {
        showToast(data.message || 'Failed to update profile.', 'error');
      }
    } catch (err) {
      showToast('An error occurred while saving.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handler: Password Update
  const handleUpdatePassword = async (e) => {
    e.preventDefault();

    // Check for empty fields
    if (!security.currentPassword.trim() || !security.newPassword.trim() || !security.confirmPassword.trim()) {
      showToast('Each field is required and cannot be empty', 'error');
      return;
    }

    if (security.newPassword !== security.confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    setLoading(true);

    try {
      // Simulated password update endpoint
      await new Promise(r => setTimeout(r, 1200));

      setSecurity({ ...security, currentPassword: '', newPassword: '', confirmPassword: '' });
      setIsPasswordModalOpen(false);
      showToast('Password updated successfully');
    } catch (err) {
      showToast('Current password is incorrect', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handler: Session Logout
  const handleLogoutSession = async () => {
    if (!sessionToLogout) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/sessions/${sessionToLogout.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        setActiveSessions(prev => prev.filter(s => s.id !== sessionToLogout.id));
        showToast(`${sessionToLogout.deviceName} has been logged out.`);
        setIsLogoutSessionModalOpen(false);
        setSessionToLogout(null);
      } else {
        showToast('Failed to logout session.', 'error');
      }
    } catch (err) {
      showToast('Failed to logout session.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (pass) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length > 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  return (
    <div className="w-full max-w-7xl px-4 md:px-6 py-12 mt-8 mx-auto space-y-8 animate-in fade-in duration-500 text-gray-900 dark:text-white transition-colors duration-500">
      {/* Success/Error Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            style={{ 
              backgroundColor: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.98)',
              borderColor: toast.type === 'error' ? 'rgba(239, 68, 68, 0.5)' : 'rgba(34, 197, 94, 0.5)',
              color: toast.type === 'error' ? (isDark ? '#f87171' : '#b91c1c') : (isDark ? '#4ade80' : '#15803d')
            }}
            className="fixed bottom-8 right-8 z-110 flex items-center gap-3 px-6 py-3 rounded-2xl shadow-2xl border backdrop-blur-xl transition-all duration-300"
          >
            {toast.type === 'error' ? <AlertCircle className="w-5 h-5 shrink-0" /> : <CheckCircle className="w-5 h-5 shrink-0" />}
            <span className="font-semibold text-sm">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Section */}
      <div
        style={{
          backgroundColor: isDark ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.4)',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        }}
        className="relative overflow-hidden glass-panel p-8 rounded-4xl border transition-colors duration-500">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -mr-32 -mt-32" />
        <div className="relative flex flex-col md:flex-row items-center gap-8">
          <div className="relative group">
            <div
              style={{ borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)', backgroundColor: isDark ? '#27272a' : '#f9fafb' }}
              className="w-32 h-32 rounded-3xl overflow-hidden border-4 shadow-2xl transition-transform group-hover:scale-[1.02]">
              {user?.avatar ? (
                <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-primary/40">
                  <User className="w-12 h-12" />
                </div>
              )}
            </div>
            <button
              onClick={() => fileInputRef.current.click()}
              className="absolute -bottom-2 -right-2 p-2.5 bg-primary text-white rounded-xl shadow-lg hover:scale-110 transition-all active:scale-95"
            >
              <Camera className="w-5 h-5" />
            </button>
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
          </div>

          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <h1 style={{ color: isDark ? '#ffffff' : '#111827' }} className="text-3xl font-bold transition-colors duration-500">{user?.name || 'User Profile'}</h1>
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold uppercase tracking-wider border border-primary/20">
                {user?.isAdmin ? 'Administrator' : 'Creator'}
              </span>
            </div>
            <p style={{ color: isDark ? '#9ca3af' : '#4b5563' }} className="font-medium transition-colors duration-500">{user?.email}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-2">
              <div style={{ color: isDark ? '#9ca3af' : '#4b5563' }} className="flex items-center gap-2 text-sm transition-colors duration-500">
                <Calendar className="w-4 h-4" />
                Joined March 2024
              </div>
              {personalInfo.location && (
                <div style={{ color: isDark ? '#9ca3af' : '#4b5563' }} className="flex items-center gap-2 text-sm transition-colors duration-500">
                  <MapPin className="w-4 h-4" />
                  {personalInfo.location}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Personal & Security */}
        <div className="lg:col-span-2">

          {/* Personal Information */}
          <section
            style={{
              backgroundColor: isDark ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.4)',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
            }}
            className="glass-panel p-8 rounded-3xl border space-y-6 transition-colors duration-500">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                <User className="w-5 h-5" />
              </div>
              <h2 style={{ color: isDark ? '#ffffff' : '#111827' }} className="text-xl font-bold transition-colors duration-500">Personal Information</h2>
            </div>

            <form onSubmit={handleSaveInfo} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label style={{ color: isDark ? '#9ca3af' : '#4b5563' }} className="text-xs font-semibold uppercase tracking-wider ml-1 transition-colors duration-500">Full Name</label>
                <input
                  type="text"
                  value={personalInfo.name}
                  onChange={e => setPersonalInfo({ ...personalInfo, name: e.target.value })}
                  style={{
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                    color: isDark ? '#ffffff' : '#111827'
                  }}
                  className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-500"
                  placeholder="Full Name"
                  required
                />
              </div>
              <div className="space-y-2">
                <label style={{ color: isDark ? '#9ca3af' : '#4b5563' }} className="text-xs font-semibold uppercase tracking-wider ml-1 transition-colors duration-500">Email Address</label>
                <input
                  type="email"
                  value={personalInfo.email}
                  onChange={e => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                  style={{
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                    color: isDark ? '#ffffff' : '#111827'
                  }}
                  className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-500"
                  placeholder="email@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <label style={{ color: isDark ? '#9ca3af' : '#4b5563' }} className="text-xs font-semibold uppercase tracking-wider ml-1 transition-colors duration-500">Mobile Number</label>
                <input
                  type="tel"
                  value={personalInfo.phone}
                  onChange={e => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                  style={{
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                    color: isDark ? '#ffffff' : '#111827'
                  }}
                  className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-500"
                  placeholder="+1 (000) 000-0000"
                />
              </div>
              <div className="space-y-2">
                <label style={{ color: isDark ? '#9ca3af' : '#4b5563' }} className="text-xs font-semibold uppercase tracking-wider ml-1 transition-colors duration-500">Location</label>
                <input
                  type="text"
                  value={personalInfo.location}
                  onChange={e => setPersonalInfo({ ...personalInfo, location: e.target.value })}
                  style={{
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                    color: isDark ? '#ffffff' : '#111827'
                  }}
                  className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-500"
                  placeholder="City, Country"
                />
              </div>
              <div className="space-y-2">
                <label style={{ color: isDark ? '#9ca3af' : '#4b5563' }} className="text-xs font-semibold uppercase tracking-wider ml-1 transition-colors duration-500">Date of Birth</label>
                <input
                  type="date"
                  value={personalInfo.dob}
                  onChange={e => setPersonalInfo({ ...personalInfo, dob: e.target.value })}
                  style={{
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                    color: isDark ? '#ffffff' : '#111827'
                  }}
                  className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-500 scheme:dark"
                />
              </div>
              <div className="space-y-2">
                <label style={{ color: isDark ? '#9ca3af' : '#4b5563' }} className="text-xs font-semibold uppercase tracking-wider ml-1 transition-colors duration-500">Gender</label>
                <select
                  value={personalInfo.gender}
                  onChange={e => setPersonalInfo({ ...personalInfo, gender: e.target.value })}
                  style={{
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                    color: isDark ? '#ffffff' : '#111827'
                  }}
                  className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-500"
                >
                  <option value="male" style={{ backgroundColor: isDark ? '#000000' : '#ffffff', color: isDark ? '#ffffff' : '#111827' }}>Male</option>
                  <option value="female" style={{ backgroundColor: isDark ? '#000000' : '#ffffff', color: isDark ? '#ffffff' : '#111827' }}>Female</option>
                  <option value="non-binary" style={{ backgroundColor: isDark ? '#000000' : '#ffffff', color: isDark ? '#ffffff' : '#111827' }}>Non-binary</option>
                  <option value="prefer-not-to-say" style={{ backgroundColor: isDark ? '#000000' : '#ffffff', color: isDark ? '#ffffff' : '#111827' }}>Prefer not to say</option>
                </select>
              </div>
              <div className="md:col-span-2 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center justify-center gap-2 w-full md:w-auto px-8 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] disabled:opacity-50"
                >
                  {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-5 h-5" />}
                  Save Changes
                </button>
              </div>
            </form>
          </section>

          {/* Security Overview (Dialog Trigger) - Shifted below Profile Details */}
          <section
            style={{
              backgroundColor: isDark ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.4)',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
            }}
            className="glass-panel p-8 rounded-3xl border space-y-5 mt-8 transition-colors duration-500">
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400">
                <Lock className="w-5 h-5" />
              </div>
              <h2 style={{ color: isDark ? '#ffffff' : '#111827' }} className="text-xl font-bold transition-colors duration-500">Security</h2>
            </div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="max-w-md">
                <p style={{ color: isDark ? '#9ca3af' : '#4b5563' }} className="text-sm leading-relaxed transition-colors duration-500">
                  Protect your account and managed projects by keeping your credentials updated. We recommend using a strong, unique password for enhanced security.
                </p>
              </div>
              <button
                onClick={() => setIsPasswordModalOpen(true)}
                style={{
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                  color: isDark ? '#ffffff' : '#111827'
                }}
                className="w-full md:w-auto px-8 py-3 font-bold rounded-xl border transition-all flex items-center justify-center gap-2 shrink-0 shadow-lg hover:bg-gray-200 dark:hover:bg-white/10"
              >
                <Settings className="w-4 h-4" /> Manage Password
              </button>
            </div>
          </section>
        </div>

        {/* Right Column: Preferences & Activity */}
        <div className="space-y-8">

          {/* Preferences */}
          <section
            style={{
              backgroundColor: isDark ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.4)',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
            }}
            className="glass-panel p-6 rounded-3xl border space-y-5 transition-colors duration-500">
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <Settings className="w-5 h-5" />
              </div>
              <h2 style={{ color: isDark ? '#ffffff' : '#111827' }} className="text-lg font-bold transition-colors duration-500">Preferences</h2>
            </div>

            <div className="space-y-5">

              <div className="space-y-2">
                <div style={{ color: isDark ? '#6b7280' : '#9ca3af' }} className="flex items-center gap-3 text-xs uppercase font-bold tracking-widest transition-colors duration-500">
                  <Globe className="w-3.5 h-3.5" /> Language
                </div>
                <select
                  style={{
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                    color: isDark ? '#ffffff' : '#111827'
                  }}
                  className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none transition-all duration-500"
                >
                  <option value="en-US" style={{ backgroundColor: isDark ? '#000000' : '#ffffff', color: isDark ? '#ffffff' : '#111827' }}>English (US)</option>
                  <option value="en-GB" style={{ backgroundColor: isDark ? '#000000' : '#ffffff', color: isDark ? '#ffffff' : '#111827' }}>English (UK)</option>
                  <option value="hi" style={{ backgroundColor: isDark ? '#000000' : '#ffffff', color: isDark ? '#ffffff' : '#111827' }}>Hindi (हिन्दी)</option>
                  <option value="bn" style={{ backgroundColor: isDark ? '#000000' : '#ffffff', color: isDark ? '#ffffff' : '#111827' }}>Bengali (বাংলা)</option>
                  <option value="es" style={{ backgroundColor: isDark ? '#000000' : '#ffffff', color: isDark ? '#ffffff' : '#111827' }}>Español</option>
                  <option value="fr" style={{ backgroundColor: isDark ? '#000000' : '#ffffff', color: isDark ? '#ffffff' : '#111827' }}>Français</option>
                  <option value="de" style={{ backgroundColor: isDark ? '#000000' : '#ffffff', color: isDark ? '#ffffff' : '#111827' }}>Deutsch</option>
                  <option value="it" style={{ backgroundColor: isDark ? '#000000' : '#ffffff', color: isDark ? '#ffffff' : '#111827' }}>Italiano</option>
                  <option value="zh" style={{ backgroundColor: isDark ? '#000000' : '#ffffff', color: isDark ? '#ffffff' : '#111827' }}>Chinese (中文)</option>
                  <option value="ja" style={{ backgroundColor: isDark ? '#000000' : '#ffffff', color: isDark ? '#ffffff' : '#111827' }}>Japanese (日本語)</option>
                  <option value="ko" style={{ backgroundColor: isDark ? '#000000' : '#ffffff', color: isDark ? '#ffffff' : '#111827' }}>Korean (한국어)</option>
                  <option value="ru" style={{ backgroundColor: isDark ? '#000000' : '#ffffff', color: isDark ? '#ffffff' : '#111827' }}>Russian (Русский)</option>
                  <option value="ar" style={{ backgroundColor: isDark ? '#000000' : '#ffffff', color: isDark ? '#ffffff' : '#111827' }}>Arabic (العربية)</option>
                  <option value="pt" style={{ backgroundColor: isDark ? '#000000' : '#ffffff', color: isDark ? '#ffffff' : '#111827' }}>Portuguese</option>
                  <option value="tr" style={{ backgroundColor: isDark ? '#000000' : '#ffffff', color: isDark ? '#ffffff' : '#111827' }}>Turkish (Türkçe)</option>
                  <option value="vi" style={{ backgroundColor: isDark ? '#000000' : '#ffffff', color: isDark ? '#ffffff' : '#111827' }}>Vietnamese (Tiếng Việt)</option>
                </select>
              </div>

              <div className="space-y-2">
                <div style={{ color: isDark ? '#9ca3af' : '#4b5563' }} className="flex items-center gap-3 text-xs uppercase font-bold tracking-widest transition-colors duration-500">
                  <Clock className="w-3.5 h-3.5" /> Timezone
                </div>
                <select
                  style={{
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                    color: isDark ? '#ffffff' : '#111827'
                  }}
                  className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none transition-all duration-500"
                >
                  <option value="UTC-08" style={{ backgroundColor: isDark ? '#000000' : '#ffffff', color: isDark ? '#ffffff' : '#111827' }}>(GMT-08:00) Los Angeles / Vancouver</option>
                  <option value="UTC-07" style={{ backgroundColor: isDark ? '#000000' : '#ffffff', color: isDark ? '#ffffff' : '#111827' }}>(GMT-07:00) Denver / Phoenix</option>
                  <option value="UTC-06" style={{ backgroundColor: isDark ? '#000000' : '#ffffff', color: isDark ? '#ffffff' : '#111827' }}>(GMT-06:00) Chicago / Mexico City</option>
                  <option value="UTC-05" style={{ backgroundColor: isDark ? '#000000' : '#ffffff', color: isDark ? '#ffffff' : '#111827' }}>(GMT-05:00) New York / Toronto</option>
                  <option value="UTC+00" style={{ backgroundColor: isDark ? '#000000' : '#ffffff', color: isDark ? '#ffffff' : '#111827' }}>(GMT+00:00) London / Lisbon</option>
                  <option value="UTC+01" style={{ backgroundColor: isDark ? '#000000' : '#ffffff', color: isDark ? '#ffffff' : '#111827' }}>(GMT+01:00) Paris / Berlin / Rome</option>
                  <option value="UTC+02" style={{ backgroundColor: isDark ? '#000000' : '#ffffff', color: isDark ? '#ffffff' : '#111827' }}>(GMT+02:00) Cairo / Johannesburg</option>
                  <option value="UTC+03" style={{ backgroundColor: isDark ? '#000000' : '#ffffff', color: isDark ? '#ffffff' : '#111827' }}>(GMT+03:00) Moscow / Istanbul / Riyadh</option>
                  <option value="UTC+04" style={{ backgroundColor: isDark ? '#000000' : '#ffffff', color: isDark ? '#ffffff' : '#111827' }}>(GMT+04:00) Dubai / Baku</option>
                  <option value="UTC+05.5" style={{ backgroundColor: isDark ? '#000000' : '#ffffff', color: isDark ? '#ffffff' : '#111827' }}>(GMT+05:30) Mumbai / Delhi / Kolkata</option>
                  <option value="UTC+07" style={{ backgroundColor: isDark ? '#000000' : '#ffffff', color: isDark ? '#ffffff' : '#111827' }}>(GMT+07:00) Bangkok / Jakarta</option>
                  <option value="UTC+08" style={{ backgroundColor: isDark ? '#000000' : '#ffffff', color: isDark ? '#ffffff' : '#111827' }}>(GMT+08:00) Singapore / Beijing / Perth</option>
                  <option value="UTC+09" style={{ backgroundColor: isDark ? '#000000' : '#ffffff', color: isDark ? '#ffffff' : '#111827' }}>(GMT+09:00) Tokyo / Seoul</option>
                  <option value="UTC+10" style={{ backgroundColor: isDark ? '#000000' : '#ffffff', color: isDark ? '#ffffff' : '#111827' }}>(GMT+10:00) Sydney / Melbourne / Guam</option>
                  <option value="UTC+12" style={{ backgroundColor: isDark ? '#000000' : '#ffffff', color: isDark ? '#ffffff' : '#111827' }}>(GMT+12:00) Auckland / Fiji</option>
                </select>
              </div>
            </div>
          </section>

          {/* Active Sessions / Logged in Devices */}
          <section
            style={{
              backgroundColor: isDark ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.4)',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
            }}
            className="glass-panel p-6 rounded-3xl border space-y-5 transition-colors duration-500">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-pink-500/10 text-pink-400">
                  <Smartphone className="w-5 h-5" />
                </div>
                <h2 style={{ color: isDark ? '#ffffff' : '#111827' }} className="text-lg font-bold transition-colors duration-500">Logged in Devices</h2>
              </div>
              <span style={{ color: isDark ? '#9ca3af' : '#4b5563' }} className="text-[10px] uppercase font-bold tracking-widest transition-colors duration-500">{activeSessions.length} Active</span>
            </div>

            <div className="space-y-4">
              {activeSessions.length > 0 ? (
                activeSessions.map((session) => (
                    <div key={session.id}
                      style={{
                        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                        borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                      }}
                      className="flex items-center justify-between p-3 rounded-xl border group hover:border-primary/20 transition-all duration-500">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          style={{ backgroundColor: isDark ? '#27272a' : '#ffffff', borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }}
                          className="p-2 rounded-lg border text-gray-400 group-hover:text-primary transition-colors duration-500">
                          {session.deviceType === 'mobile' ? <Smartphone className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
                        </div>
                        <div className="min-w-0">
                          <p style={{ color: isDark ? '#ffffff' : '#111827' }} className="text-sm font-bold truncate flex items-center gap-2 transition-colors duration-500">
                            {session.deviceName}
                            {session.isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-2">
                          <span style={{ color: isDark ? '#9ca3af' : '#6b7280' }} className="text-[10px] transition-colors duration-500">{session.lastActive}</span>
                          {!session.isCurrent && (
                            <button 
                              onClick={() => { setSessionToLogout(session); setIsLogoutSessionModalOpen(true); }}
                              className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all cursor-pointer"
                              title="Logout Device"
                            >
                              <LogOut className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                        {session.isCurrent && (
                          <span className="text-[10px] text-primary font-bold">Current</span>
                        )}
                      </div>
                    </div>
                  ))
              ) : (
                <div style={{ color: isDark ? '#9ca3af' : '#6b7280' }} className="flex flex-col items-center py-6 gap-2 transition-colors duration-500">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-xs text-center">Identifying active sessions...</span>
                </div>
              )}
            </div>
          </section>

        </div>
      </div>

      {/* Bottom Section: Management */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Deactivate Account */}
        <section
          onClick={() => setIsDeactivateModalOpen(true)}
          style={{
            backgroundColor: isDark ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.4)',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
          }}
          className="glass-panel p-8 rounded-3xl border flex items-center justify-between group hover:border-yellow-500/30 transition-all duration-500 cursor-pointer"
        >
          <div className="space-y-1">
            <h3 style={{ color: isDark ? '#ffffff' : '#111827' }} className="text-lg font-bold flex items-center gap-2 transition-colors duration-500">
              Deactivate Account
              <ShieldAlert className="w-4 h-4 text-yellow-500" />
            </h3>
            <p style={{ color: isDark ? '#9ca3af' : '#4b5563' }} className="text-sm transition-colors duration-500">Temporarily disable your profile and hide your public extensions.</p>
          </div>
          <div
            style={{ backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)', color: isDark ? '#9ca3af' : '#4b5563' }}
            className="p-3 rounded-xl group-hover:bg-yellow-500 group-hover:text-white transition-all duration-500"
          >
            <ChevronRight className="w-6 h-6" />
          </div>
        </section>

        {/* Account Deletion */}
        <section
          style={{
            backgroundColor: isDark ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.4)',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
          }}
          className="glass-panel p-8 rounded-3xl border flex items-center justify-between group hover:border-red-500/30 transition-all duration-500 cursor-pointer">
          <div className="space-y-1">
            <h3 style={{ color: isDark ? '#ffffff' : '#111827' }} className="text-lg font-bold flex items-center gap-2 transition-colors duration-500">
              Danger Zone
              <ShieldAlert className="w-4 h-4 text-red-500" />
            </h3>
            <p style={{ color: isDark ? '#9ca3af' : '#4b5563' }} className="text-sm transition-colors duration-500">Permanently delete your account and all projects.</p>
          </div>
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="p-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all"
          >
            <Trash2 className="w-6 h-6" />
          </button>
        </section>
      </div>

      {/* Password Change Special Dialogue Box */}
      <AnimatePresence>
        {isPasswordModalOpen && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsPasswordModalOpen(false)}
              style={{ backgroundColor: isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)' }}
              className="absolute inset-0 backdrop-blur-md transition-colors duration-500"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              style={{
                backgroundColor: isDark ? 'rgba(0, 0, 0, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
              }}
              className="relative w-full max-w-lg glass-panel p-8 rounded-[2.5rem] border shadow-2xl transition-colors duration-500"
            >
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/20 text-primary">
                    <Lock className="w-5 h-5" />
                  </div>
                  <h2 style={{ color: isDark ? '#ffffff' : '#111827' }} className="text-2xl font-bold transition-colors duration-500">Update Security</h2>
                </div>
                <button onClick={() => setIsPasswordModalOpen(false)} className="text-gray-400 hover:text-primary transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleUpdatePassword} className="space-y-6">
                <div className="space-y-2">
                  <label style={{ color: isDark ? '#9ca3af' : '#4b5563' }} className="text-xs font-semibold uppercase tracking-wider ml-1 transition-colors duration-500">Current Password</label>
                  <div className="relative">
                    <input
                      type={security.showPass ? "text" : "password"}
                      value={security.currentPassword}
                      onChange={e => setSecurity({ ...security, currentPassword: e.target.value })}
                      style={{
                        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                        borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                        color: isDark ? '#ffffff' : '#111827'
                      }}
                      className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-hidden [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setSecurity({ ...security, showPass: !security.showPass })}
                      style={{ color: isDark ? '#ffffff' : '#6b7280' }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 hover:text-primary transition-colors cursor-pointer"
                    >
                      {security.showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label style={{ color: isDark ? '#9ca3af' : '#4b5563' }} className="text-xs font-semibold uppercase tracking-wider ml-1 transition-colors duration-500">New Password</label>
                  <div className="relative">
                    <input
                      type={security.showNewPass ? "text" : "password"}
                      value={security.newPassword}
                      onChange={e => setSecurity({ ...security, newPassword: e.target.value })}
                      style={{
                        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                        borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                        color: isDark ? '#ffffff' : '#111827'
                      }}
                      className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-hidden [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setSecurity({ ...security, showNewPass: !security.showNewPass })}
                      style={{ color: isDark ? '#ffffff' : '#6b7280' }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 hover:text-primary transition-colors cursor-pointer"
                    >
                      {security.showNewPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <div className="flex gap-1.5 px-1 pt-1">
                    {[1, 2, 3, 4].map((step) => (
                      <div key={step}
                        className={`h-1.5 flex-1 rounded-full transition-colors ${
                          getPasswordStrength(security.newPassword) >= step
                            ? (step <= 2 ? 'bg-red-500' : step === 3 ? 'bg-yellow-500' : 'bg-green-500')
                            : isDark ? 'bg-white/10' : 'bg-gray-200'
                        }`} />
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label style={{ color: isDark ? '#9ca3af' : '#4b5563' }} className="text-xs font-semibold uppercase tracking-wider ml-1 transition-colors duration-500">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={security.showConfirmPass ? "text" : "password"}
                      value={security.confirmPassword}
                      onChange={e => setSecurity({ ...security, confirmPassword: e.target.value })}
                      style={{
                        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                        borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                        color: isDark ? '#ffffff' : '#111827'
                      }}
                      className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-hidden [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setSecurity({ ...security, showConfirmPass: !security.showConfirmPass })}
                      style={{ color: isDark ? '#ffffff' : '#6b7280' }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 hover:text-primary transition-colors cursor-pointer"
                    >
                      {security.showConfirmPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={loading || !security.newPassword} className="w-full py-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-2xl transition-all shadow-lg flex justify-center items-center gap-2">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  Save New Password
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Session Logout Confirmation Modal */}
      <AnimatePresence>
        {isLogoutSessionModalOpen && (
          <div className="fixed inset-0 z-110 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsLogoutSessionModalOpen(false)}
              style={{ backgroundColor: isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)' }}
              className="absolute inset-0 backdrop-blur-md transition-colors duration-500" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              style={{
                backgroundColor: isDark ? 'rgba(0, 0, 0, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
              }}
              className="relative w-full max-w-md glass-panel p-8 rounded-[2.5rem] border border-red-500/20 shadow-2xl text-center transition-colors duration-500">
              <div className="w-20 h-20 rounded-3xl bg-red-500/10 flex items-center justify-center mx-auto mb-6 text-red-500">
                <LogOut className="w-10 h-10" />
              </div>
              <h2 style={{ color: isDark ? '#ffffff' : '#111827' }} className="text-2xl font-bold mb-2 transition-colors duration-500">Log Out Device?</h2>
              <p style={{ color: isDark ? '#9ca3af' : '#4b5563' }} className="mb-8 leading-relaxed transition-colors duration-500">
                Are you sure you want to log out of <span className="font-bold text-primary">{sessionToLogout?.deviceName}</span>? You will need to sign in again on that device to access your workspace.
              </p>
              <div className="flex flex-col gap-3">
                <button onClick={handleLogoutSession} disabled={loading} className="w-full py-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Yes, Log Out'}
                </button>
                <button
                  onClick={() => setIsLogoutSessionModalOpen(false)}
                  style={{
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(243, 244, 246, 0.8)',
                    color: isDark ? '#ffffff' : '#374151',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#000000'
                  }}
                  className="w-full py-4 font-bold rounded-2xl transition-all border hover:scale-105"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Deactivation Modal */}
      <AnimatePresence>
        {isDeactivateModalOpen && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsDeactivateModalOpen(false)}
              style={{ backgroundColor: isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)' }}
              className="absolute inset-0 backdrop-blur-md transition-colors duration-500" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              style={{
                backgroundColor: isDark ? 'rgba(0, 0, 0, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
              }}
              className="relative w-full max-w-md glass-panel p-8 rounded-[2.5rem] border border-yellow-500/20 shadow-2xl text-center transition-colors duration-500">
              <div className="w-20 h-20 rounded-3xl bg-yellow-500/10 flex items-center justify-center mx-auto mb-6 text-yellow-500">
                <ShieldAlert className="w-10 h-10" />
              </div>
              <h2 style={{ color: isDark ? '#ffffff' : '#111827' }} className="text-2xl font-bold mb-2 transition-colors duration-500">Deactivate Account?</h2>
              <p style={{ color: isDark ? '#9ca3af' : '#4b5563' }} className="mb-8 leading-relaxed transition-colors duration-500">Your data will be preserved, but your extensions will go offline and your profile will be hidden until you log back in.</p>
              <div className="flex flex-col gap-3">
                <button onClick={() => { showToast('Account deactivated successfully', 'success'); setIsDeactivateModalOpen(false); setTimeout(logout, 1000); }} className="w-full py-4 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-2xl transition-all">Yes, Deactivate</button>
                <button
                  onClick={() => setIsDeactivateModalOpen(false)}
                  style={{
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(243, 244, 246, 0.8)',
                    color: isDark ? '#ffffff' : '#374151',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#000000'
                  }}
                  className="w-full py-4 font-bold rounded-2xl transition-all border hover:scale-105"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeleteModalOpen(false)}
              style={{ backgroundColor: isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)' }}
              className="absolute inset-0 backdrop-blur-md transition-colors duration-500"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              style={{
                backgroundColor: isDark ? 'rgba(0, 0, 0, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                borderColor: isDark ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.5)'
              }}
              className="relative w-full max-w-md glass-panel p-8 rounded-[2.5rem] border shadow-[0_0_50px_rgba(239,68,68,0.1)] text-center transition-all duration-500"
            >
              <div className="w-20 h-20 rounded-3xl bg-red-500/10 flex items-center justify-center mx-auto mb-6 text-red-500">
                <Trash2 className="w-10 h-10" />
              </div>
              <h2 style={{ color: isDark ? '#ffffff' : '#111827' }} className="text-2xl font-bold mb-2 transition-colors duration-500">Delete Account?</h2>
              <p style={{ color: isDark ? '#9ca3af' : '#4b5563' }} className="mb-8 leading-relaxed transition-colors duration-500">
                This action is irreversible. All your generated extensions and personal data will be wiped from our servers forever.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    showToast('Simulating account deletion...', 'error');
                    setTimeout(logout, 1500);
                  }}
                  className="w-full py-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-2xl shadow-xl shadow-red-500/20 transition-all active:scale-95"
                >
                  Yes, Delete My Account
                </button>
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  style={{
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(243, 244, 246, 0.8)',
                    color: isDark ? '#ffffff' : '#374151',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#000000'
                  }}
                  className="w-full py-4 font-bold rounded-2xl transition-all border hover:scale-105"
                >
                  No, Keep It
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}