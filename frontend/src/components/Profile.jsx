import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Phone, Calendar, MapPin, Camera, Lock, Eye, EyeOff,
  Bell, Globe, Moon, Sun, Clock, Download, ShieldAlert, Trash2,
  CheckCircle, AlertCircle, Save, ChevronRight, LogIn, Settings,
  Loader2, X, Smartphone, Monitor
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';

export default function Profile() {
  const { user, setUser, token, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return true;
  });
  const fileInputRef = useRef(null);
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
    const handleStorage = (e) => {
      if (e.key === 'theme') {
        const newDark = e.newValue === 'dark';
        setDarkMode(newDark);
        window.dispatchEvent(new CustomEvent('theme-changed', { detail: newDark }));
      }
    };
    const handleThemeEvent = (e) => setDarkMode(e.detail);
    window.addEventListener('storage', handleStorage);
    window.addEventListener('theme-changed', handleThemeEvent);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('theme-changed', handleThemeEvent);
    };
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#000000';
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '#ffffff';
      localStorage.setItem('theme', 'light');
    }

    const transitionTimeout = setTimeout(() => {
      document.body.style.transition = 'background-color 0.5s ease-in-out';
    }, 100);
    return () => clearTimeout(transitionTimeout);
  }, [darkMode]);

  const setThemeMode = (dark) => {
    if (dark === darkMode) return;
    setDarkMode(dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
    window.dispatchEvent(new CustomEvent('theme-changed', { detail: dark }));
  };

  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    showPass: false
  });

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
          setActiveSessions(data);
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
    if (security.newPassword !== security.confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }
    setLoading(true);
    // Simulated password update endpoint
    await new Promise(r => setTimeout(r, 1200));
    setSecurity({ ...security, currentPassword: '', newPassword: '', confirmPassword: '' });
    setIsPasswordModalOpen(false);
    setLoading(false);
    showToast('Password updated successfully');
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
            className={`fixed bottom-8 right-8 z-50 flex items-center gap-3 px-6 py-3 rounded-2xl shadow-2xl border ${toast.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-green-500/10 border-green-500/20 text-green-400'
              } backdrop-blur-xl`}
          >
            {toast.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
            <span className="font-medium">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Section */}
      <div className="relative overflow-hidden bg-white dark:bg-black glass-panel p-8 rounded-[2rem] border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -mr-32 -mt-32" />
        <div className="relative flex flex-col md:flex-row items-center gap-8">
          <div className="relative group">
            <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-gray-100 dark:border-white/5 shadow-2xl transition-transform group-hover:scale-[1.02] bg-gray-50 dark:bg-zinc-900">
              {user?.avatar ? (
                <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-primary/40 bg-gray-100 dark:bg-transparent">
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
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{user?.name || 'User Profile'}</h1>
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold uppercase tracking-wider border border-primary/20">
                {user?.isAdmin ? 'Administrator' : 'Creator'}
              </span>
            </div>
            <p className="text-gray-500 dark:text-white/80 font-medium">{user?.email}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-2">
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-white/60">
                <Calendar className="w-4 h-4" />
                Joined March 2024
              </div>
              {personalInfo.location && (
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-white/60">
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
          <section className="bg-white dark:bg-black glass-panel p-8 rounded-3xl border border-gray-200 dark:border-white/10 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                <User className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold">Personal Information</h2>
            </div>

            <form onSubmit={handleSaveInfo} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Full Name</label>
                <input
                  type="text"
                  value={personalInfo.name}
                  onChange={e => setPersonalInfo({ ...personalInfo, name: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-hidden"
                  placeholder="Full Name"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Email Address</label>
                <input
                  type="email"
                  value={personalInfo.email}
                  onChange={e => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-hidden"
                  placeholder="email@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Mobile Number</label>
                <input
                  type="tel"
                  value={personalInfo.phone}
                  onChange={e => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-hidden"
                  placeholder="+1 (000) 000-0000"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Location</label>
                <input
                  type="text"
                  value={personalInfo.location}
                  onChange={e => setPersonalInfo({ ...personalInfo, location: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-hidden"
                  placeholder="City, Country"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Date of Birth</label>
                <input
                  type="date"
                  value={personalInfo.dob}
                  onChange={e => setPersonalInfo({ ...personalInfo, dob: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent transition-all dark:[color-scheme:dark] outline-hidden"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Gender</label>
                <select
                  value={personalInfo.gender}
                  onChange={e => setPersonalInfo({ ...personalInfo, gender: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-hidden"
                >
                  <option value="male" className="bg-background">Male</option>
                  <option value="female" className="bg-background">Female</option>
                  <option value="non-binary" className="bg-background">Non-binary</option>
                  <option value="prefer-not-to-say" className="bg-background">Prefer not to say</option>
                </select>
              </div>
              <div className="md:col-span-2 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center justify-center gap-2 w-full md:w-auto px-8 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  Save Changes
                </button>
              </div>
            </form>
          </section>

          {/* Security Overview (Dialog Trigger) - Shifted below Profile Details */}
          <section className="bg-white dark:bg-black glass-panel p-8 rounded-3xl border border-gray-200 dark:border-white/10 space-y-5 mt-8">
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400">
                <Lock className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold">Security</h2>
            </div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="max-w-md">
                <p className="text-sm text-gray-500 dark:text-white/70 leading-relaxed">
                  Protect your account and managed projects by keeping your credentials updated. We recommend using a strong, unique password for enhanced security.
                </p>
              </div>
              <button
                onClick={() => setIsPasswordModalOpen(true)}
                className="w-full md:w-auto px-8 py-3 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 font-bold rounded-xl border border-gray-200 dark:border-white/10 transition-all flex items-center justify-center gap-2 shrink-0 shadow-lg"
              >
                <Settings className="w-4 h-4" /> Manage Password
              </button>
            </div>
          </section>
        </div>

        {/* Right Column: Preferences & Activity */}
        <div className="space-y-8">

          {/* Preferences */}
          <section className="bg-white dark:bg-black glass-panel p-6 rounded-3xl border border-gray-200 dark:border-white/10 space-y-5">
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <Settings className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold">Preferences</h2>
            </div>

            <div className="space-y-5">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  {darkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-gray-400" />}
                  <span className="text-sm font-medium">Theme Mode</span>
                </div>
                <button onClick={() => setThemeMode(!darkMode)}
                  className="p-2 rounded-full bg-black border border-white/10 hover:bg-zinc-900 transition-all cursor-pointer shadow-lg"
                  title={darkMode ? "Switch to White Theme" : "Switch to Black Theme"}>
                  {darkMode ? <Sun className="w-4 h-4 text-yellow-500" /> : <Moon className="w-4 h-4 text-gray-300" />}
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-3 text-xs text-gray-500 uppercase font-bold tracking-widest">
                  <Globe className="w-3.5 h-3.5" /> Language
                </div>
                <select className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none">
                  <option value="en-US" className="bg-white dark:bg-surface">English (US)</option>
                  <option value="en-GB" className="bg-white dark:bg-surface">English (UK)</option>
                  <option value="hi" className="bg-white dark:bg-surface">Hindi (हिन्दी)</option>
                  <option value="bn" className="bg-white dark:bg-surface">Bengali (বাংলা)</option>
                  <option value="es" className="bg-white dark:bg-surface">Español</option>
                  <option value="fr" className="bg-white dark:bg-surface">Français</option>
                  <option value="de" className="bg-white dark:bg-surface">Deutsch</option>
                  <option value="it" className="bg-white dark:bg-surface">Italiano</option>
                  <option value="zh" className="bg-white dark:bg-surface">Chinese (中文)</option>
                  <option value="ja" className="bg-white dark:bg-surface">Japanese (日本語)</option>
                  <option value="ko" className="bg-white dark:bg-surface">Korean (한국어)</option>
                  <option value="ru" className="bg-white dark:bg-surface">Russian (Русский)</option>
                  <option value="ar" className="bg-white dark:bg-surface">Arabic (العربية)</option>
                  <option value="pt" className="bg-white dark:bg-surface">Portuguese</option>
                  <option value="tr" className="bg-white dark:bg-surface">Turkish (Türkçe)</option>
                  <option value="vi" className="bg-white dark:bg-surface">Vietnamese (Tiếng Việt)</option>
                </select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-3 text-xs text-gray-500 uppercase font-bold tracking-widest">
                  <Clock className="w-3.5 h-3.5" /> Timezone
                </div>
                <select className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none">
                  <option value="UTC-08" className="bg-white dark:bg-surface">(GMT-08:00) Los Angeles / Vancouver</option>
                  <option value="UTC-07" className="bg-white dark:bg-surface">(GMT-07:00) Denver / Phoenix</option>
                  <option value="UTC-06" className="bg-white dark:bg-surface">(GMT-06:00) Chicago / Mexico City</option>
                  <option value="UTC-05" className="bg-white dark:bg-surface">(GMT-05:00) New York / Toronto</option>
                  <option value="UTC+00" className="bg-white dark:bg-surface">(GMT+00:00) London / Lisbon</option>
                  <option value="UTC+01" className="bg-white dark:bg-surface">(GMT+01:00) Paris / Berlin / Rome</option>
                  <option value="UTC+02" className="bg-white dark:bg-surface">(GMT+02:00) Cairo / Johannesburg</option>
                  <option value="UTC+03" className="bg-white dark:bg-surface">(GMT+03:00) Moscow / Istanbul / Riyadh</option>
                  <option value="UTC+04" className="bg-white dark:bg-surface">(GMT+04:00) Dubai / Baku</option>
                  <option value="UTC+05.5" className="bg-white dark:bg-surface">(GMT+05:30) Mumbai / Delhi / Kolkata</option>
                  <option value="UTC+07" className="bg-white dark:bg-surface">(GMT+07:00) Bangkok / Jakarta</option>
                  <option value="UTC+08" className="bg-white dark:bg-surface">(GMT+08:00) Singapore / Beijing / Perth</option>
                  <option value="UTC+09" className="bg-white dark:bg-surface">(GMT+09:00) Tokyo / Seoul</option>
                  <option value="UTC+10" className="bg-white dark:bg-surface">(GMT+10:00) Sydney / Melbourne / Guam</option>
                  <option value="UTC+12" className="bg-white dark:bg-surface">(GMT+12:00) Auckland / Fiji</option>
                </select>
              </div>
            </div>
          </section>

          {/* Active Sessions / Logged in Devices */}
          <section className="bg-white dark:bg-black glass-panel p-6 rounded-3xl border border-gray-200 dark:border-white/10 space-y-5">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-pink-500/10 text-pink-400">
                  <Smartphone className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold">Logged in Devices</h2>
              </div>
              <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">{activeSessions.length} Active</span>
            </div>

            <div className="space-y-4">
              {activeSessions.length > 0 ? (
                activeSessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 group hover:border-primary/20 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 text-gray-400 group-hover:text-primary transition-colors">
                        {session.deviceType === 'mobile' ? <Smartphone className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold truncate flex items-center gap-2">
                          {session.deviceName}
                          {session.isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />}
                        </p>
                        <p className="text-[10px] text-gray-500 truncate">{session.location} • {session.ip}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[10px] text-gray-400">{session.lastActive}</span>
                      {session.isCurrent && (
                        <span className="text-[10px] text-primary font-bold">Current</span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center py-6 text-gray-500 gap-2">
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
          className="bg-white dark:bg-black glass-panel p-8 rounded-3xl border border-gray-200 dark:border-white/10 flex items-center justify-between group hover:border-yellow-500/30 transition-all cursor-pointer shadow-sm dark:shadow-none"
        >
          <div className="space-y-1">
            <h3 className="text-lg font-bold flex items-center gap-2">
              Deactivate Account
              <ShieldAlert className="w-4 h-4 text-yellow-500" />
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Temporarily disable your profile and hide your public extensions.</p>
          </div>
          <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/5 group-hover:bg-yellow-500 group-hover:text-white transition-all text-gray-400">
            <ChevronRight className="w-6 h-6" />
          </div>
        </section>

        <section className="bg-white dark:bg-black glass-panel p-8 rounded-3xl border border-gray-200 dark:border-white/10 flex items-center justify-between group hover:border-red-500/30 transition-all cursor-pointer shadow-sm dark:shadow-none">
          <div className="space-y-1">
            <h3 className="text-lg font-bold flex items-center gap-2">
              Danger Zone
              <ShieldAlert className="w-4 h-4 text-red-500" />
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Permanently delete your account and all projects.</p>
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
              className="absolute inset-0 bg-background/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-black glass-panel p-8 rounded-[2.5rem] border border-gray-200 dark:border-white/10 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/20 text-primary">
                    <Lock className="w-5 h-5" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Update Security</h2>
                </div>
                <button onClick={() => setIsPasswordModalOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleUpdatePassword} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Current Password</label>
                  <div className="relative">
                    <input
                      type={security.showPass ? "text" : "password"}
                      value={security.currentPassword}
                      onChange={e => setSecurity({ ...security, currentPassword: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-hidden"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setSecurity({ ...security, showPass: !security.showPass })}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                    >
                      {security.showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">New Password</label>
                  <input
                    type="password"
                    value={security.newPassword}
                    onChange={e => setSecurity({ ...security, newPassword: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-hidden"
                    placeholder="••••••••"
                  />
                  <div className="flex gap-1.5 px-1 pt-1">
                    {[1, 2, 3, 4].map((step) => (
                      <div key={step} className={`h-1.5 flex-1 rounded-full transition-colors ${getPasswordStrength(security.newPassword) >= step ? (step <= 2 ? 'bg-red-500' : step === 3 ? 'bg-yellow-500' : 'bg-green-500') : 'bg-white/10'}`} />
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={security.confirmPassword}
                    onChange={e => setSecurity({ ...security, confirmPassword: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-hidden"
                    placeholder="••••••••"
                  />
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

      {/* Deactivation Modal */}
      <AnimatePresence>
        {isDeactivateModalOpen && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsDeactivateModalOpen(false)} className="absolute inset-0 bg-background/80 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-md bg-white dark:bg-black glass-panel p-8 rounded-[2.5rem] border border-yellow-500/20 shadow-2xl text-center">
              <div className="w-20 h-20 rounded-3xl bg-yellow-500/10 flex items-center justify-center mx-auto mb-6 text-yellow-500">
                <ShieldAlert className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Deactivate Account?</h2>
              <p className="text-gray-400 mb-8 leading-relaxed">Your data will be preserved, but your extensions will go offline and your profile will be hidden until you log back in.</p>
              <div className="flex flex-col gap-3">
                <button onClick={() => { showToast('Account deactivated successfully', 'success'); setIsDeactivateModalOpen(false); setTimeout(logout, 1000); }} className="w-full py-4 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-2xl transition-all">Yes, Deactivate</button>
                <button onClick={() => setIsDeactivateModalOpen(false)} className="w-full py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl transition-all">Cancel</button>
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
              className="absolute inset-0 bg-background/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-black glass-panel p-8 rounded-[2.5rem] border border-red-500/20 shadow-[0_0_50px_rgba(239,68,68,0.1)] text-center"
            >
              <div className="w-20 h-20 rounded-3xl bg-red-500/10 flex items-center justify-center mx-auto mb-6 text-red-500">
                <Trash2 className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Delete Account?</h2>
              <p className="text-gray-400 mb-8 leading-relaxed">
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
                  className="w-full py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl transition-all"
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
