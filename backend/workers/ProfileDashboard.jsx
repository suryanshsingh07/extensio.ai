import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Phone, Calendar, MapPin, Camera, Lock, Eye, EyeOff, 
  Bell, Globe, Moon, Clock, Download, ShieldAlert, Trash2, 
  CheckCircle, AlertCircle, Save, ChevronRight, LogIn, Settings
} from 'lucide-react';

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
  gender: 'non-binary',
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

export default function ProfileDashboard() {
  // State Management
  const [user, setUser] = useState(MOCK_USER);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const fileInputRef = useRef(null);

  // Forms State
  const [personalInfo, setPersonalInfo] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone,
    dob: user.dob,
    gender: user.gender,
    location: user.location
  });

  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    showPass: false
  });

  // Helper: Show Toast
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Handler: Profile Image Upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast('Image must be less than 2MB', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setUser(prev => ({ ...prev, avatar: reader.result }));
        showToast('Profile image updated');
      };
      reader.readAsDataURL(file);
    }
  };

  // Handler: Personal Info Save
  const handleSaveInfo = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    await new Promise(r => setTimeout(r, 1000));
    setUser(prev => ({ ...prev, ...personalInfo }));
    setLoading(false);
    showToast('Personal information saved');
  };

  // Handler: Password Update
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (security.newPassword !== security.confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setSecurity({ ...security, currentPassword: '', newPassword: '', confirmPassword: '' });
    setLoading(false);
    showToast('Password updated successfully');
  };

  // Password Strength Logic
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
    <div className="w-full py-8 space-y-8 animate-in fade-in duration-500">
      {/* Success Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-8 right-8 z-50 flex items-center gap-3 px-6 py-3 rounded-2xl shadow-2xl border ${
              toast.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-green-500/10 border-green-500/20 text-green-400'
            } backdrop-blur-xl`}
          >
            {toast.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
            <span className="font-medium">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Section */}
      <div className="relative overflow-hidden glass-panel p-8 rounded-[2rem] border border-white/10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -mr-32 -mt-32" />
        <div className="relative flex flex-col md:flex-row items-center gap-8">
          <div className="relative group">
            <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-white/5 shadow-2xl transition-transform group-hover:scale-[1.02]">
              <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
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
              <h1 className="text-3xl font-bold text-white">{user.name}</h1>
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold uppercase tracking-wider border border-primary/20">
                {user.role}
              </span>
            </div>
            <p className="text-gray-400 font-medium">{user.username} • {user.email}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-2">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                Joined {user.joinDate}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <MapPin className="w-4 h-4" />
                {user.location}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Personal & Security */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Personal Information */}
          <section className="glass-panel p-8 rounded-3xl border border-white/10 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                <User className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-white">Personal Information</h2>
            </div>
            
            <form onSubmit={handleSaveInfo} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Full Name</label>
                <input 
                  type="text" 
                  value={personalInfo.name}
                  onChange={e => setPersonalInfo({...personalInfo, name: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="Full Name"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Email Address</label>
                <input 
                  type="email" 
                  value={personalInfo.email}
                  onChange={e => setPersonalInfo({...personalInfo, email: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="email@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Mobile Number</label>
                <input 
                  type="tel" 
                  value={personalInfo.phone}
                  onChange={e => setPersonalInfo({...personalInfo, phone: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="+1 (000) 000-0000"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Location</label>
                <input 
                  type="text" 
                  value={personalInfo.location}
                  onChange={e => setPersonalInfo({...personalInfo, location: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="City, Country"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Date of Birth</label>
                <input 
                  type="date" 
                  value={personalInfo.dob}
                  onChange={e => setPersonalInfo({...personalInfo, dob: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all [color-scheme:dark]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Gender</label>
                <select 
                  value={personalInfo.gender}
                  onChange={e => setPersonalInfo({...personalInfo, gender: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
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
                  {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-5 h-5" />}
                  Save Changes
                </button>
              </div>
            </form>
          </section>

          {/* Security Settings */}
          <section className="glass-panel p-8 rounded-3xl border border-white/10 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-white">Security Settings</h2>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Current Password</label>
                  <div className="relative">
                    <input 
                      type={security.showPass ? "text" : "password"} 
                      value={security.currentPassword}
                      onChange={e => setSecurity({...security, currentPassword: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="••••••••"
                    />
                    <button 
                      type="button" 
                      onClick={() => setSecurity({...security, showPass: !security.showPass})}
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
                    onChange={e => setSecurity({...security, newPassword: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="••••••••"
                  />
                  {/* Strength Indicator */}
                  <div className="flex gap-1.5 px-1 pt-1">
                    {[1, 2, 3, 4].map((step) => (
                      <div 
                        key={step} 
                        className={`h-1.5 flex-1 rounded-full transition-colors ${
                          getPasswordStrength(security.newPassword) >= step 
                            ? (step <= 2 ? 'bg-red-500' : step === 3 ? 'bg-yellow-500' : 'bg-green-500')
                            : 'bg-white/10'
                        }`} 
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Confirm New Password</label>
                  <input 
                    type="password" 
                    value={security.confirmPassword}
                    onChange={e => setSecurity({...security, confirmPassword: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              
              <button 
                type="submit"
                disabled={loading || !security.newPassword}
                className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl border border-white/10 transition-all disabled:opacity-50"
              >
                Update Password
              </button>
            </form>
          </section>
        </div>

        {/* Right Column: Preferences & Activity */}
        <div className="space-y-8">
          
          {/* Notification Settings */}
          <section className="glass-panel p-6 rounded-3xl border border-white/10 space-y-5">
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                <Bell className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-white">Notifications</h2>
            </div>

            <div className="space-y-4">
              {Object.entries(user.notifications).map(([key, enabled]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-gray-300 capitalize">{key} Notifications</span>
                  <button 
                    onClick={() => setUser(prev => ({
                      ...prev, 
                      notifications: { ...prev.notifications, [key]: !enabled }
                    }))}
                    className={`relative w-11 h-6 rounded-full transition-colors ${enabled ? 'bg-primary' : 'bg-white/10'}`}
                  >
                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${enabled ? 'translate-x-5' : ''}`} />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Preferences */}
          <section className="glass-panel p-6 rounded-3xl border border-white/10 space-y-5">
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <Settings className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-white">Preferences</h2>
            </div>

            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Moon className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-300">Dark Mode</span>
                </div>
                <button 
                  className={`relative w-11 h-6 rounded-full transition-colors ${user.preferences.darkMode ? 'bg-primary' : 'bg-white/10'}`}
                  onClick={() => setUser(p => ({...p, preferences: {...p.preferences, darkMode: !p.preferences.darkMode}}))}
                >
                  <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${user.preferences.darkMode ? 'translate-x-5' : ''}`} />
                </button>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-xs text-gray-500 uppercase font-bold tracking-widest">
                  <Globe className="w-3.5 h-3.5" /> Language
                </div>
                <select className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none">
                  <option value="en">English (US)</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                </select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-3 text-xs text-gray-500 uppercase font-bold tracking-widest">
                  <Clock className="w-3.5 h-3.5" /> Timezone
                </div>
                <select className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none">
                  <option value="pst">PST (UTC-8)</option>
                  <option value="est">EST (UTC-5)</option>
                  <option value="gmt">GMT (UTC+0)</option>
                </select>
              </div>
            </div>
          </section>

          {/* Recent Activity */}
          <section className="glass-panel p-6 rounded-3xl border border-white/10 space-y-5">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-pink-500/10 text-pink-400">
                  <Clock className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-white">Activity</h2>
              </div>
            </div>

            <div className="space-y-6 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-px before:bg-white/5">
              {user.activity.map((item) => (
                <div key={item.id} className="relative flex gap-4 pl-1">
                  <div className="z-10 w-9 h-9 rounded-full bg-surface border border-white/10 flex items-center justify-center text-gray-400">
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{item.label}</p>
                    <p className="text-xs text-gray-500 truncate">{item.detail}</p>
                    <span className="text-[10px] text-gray-600 font-medium">{item.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Bottom Section: Management */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Download Data */}
        <section className="glass-panel p-8 rounded-3xl border border-white/10 flex items-center justify-between group hover:border-primary/30 transition-all">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              Download Data
              <Download className="w-4 h-4 text-primary" />
            </h3>
            <p className="text-sm text-gray-400">Get a copy of all your extension projects and settings.</p>
          </div>
          <button className="p-3 rounded-xl bg-white/5 group-hover:bg-primary group-hover:text-white transition-all text-gray-400">
            <ChevronRight className="w-6 h-6" />
          </button>
        </section>

        {/* Account Deletion */}
        <section className="glass-panel p-8 rounded-3xl border border-white/10 flex items-center justify-between group hover:border-red-500/30 transition-all">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              Danger Zone
              <ShieldAlert className="w-4 h-4 text-red-500" />
            </h3>
            <p className="text-sm text-gray-400">Permanently delete your account and all projects.</p>
          </div>
          <button 
            onClick={() => setIsDeleteModalOpen(true)}
            className="p-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all"
          >
            <Trash2 className="w-6 h-6" />
          </button>
        </section>
      </div>

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
              className="relative w-full max-w-md glass-panel p-8 rounded-[2.5rem] border border-red-500/20 shadow-[0_0_50px_rgba(239,68,68,0.1)] bg-surface/90 text-center"
            >
              <div className="w-20 h-20 rounded-3xl bg-red-500/10 flex items-center justify-center mx-auto mb-6 text-red-500">
                <Trash2 className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Delete Account?</h2>
              <p className="text-gray-400 mb-8 leading-relaxed">
                This action is irreversible. All your generated extensions, prompts, and personal data will be wiped from our servers forever.
              </p>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => {
                    showToast('Account successfully deleted', 'error');
                    setIsDeleteModalOpen(false);
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

/**
 * RECOMMENDED COMPONENT USAGE:
 * 
 * 1. Import this in your main App routing or Profile page.
 * 2. Ensure your parent container has a width restriction (like max-w-7xl).
 * 3. This component utilizes Tailwind CSS grid and flexbox for responsive behavior.
 */