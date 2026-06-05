import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, Menu, X, LayoutDashboard, ShieldCheck, User, LogOut, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isLanding = location.pathname === '/';

  const { user, openAuthModal, logout } = useAuth();

  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return true; // Default to dark (Black Theme)
  });

  useEffect(() => {
    // Sync across tabs and other components
    const handleStorage = (e) => {
      if (e.key === 'theme') {
        const newDark = e.newValue === 'dark';
        setIsDark(newDark);
        window.dispatchEvent(new CustomEvent('theme-changed', { detail: newDark }));
      }
    };
    const handleThemeEvent = (e) => setIsDark(e.detail);

    window.addEventListener('storage', handleStorage);
    window.addEventListener('theme-changed', handleThemeEvent);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('theme-changed', handleThemeEvent);
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    if (isDark) {
      root.classList.add('dark');
      body.style.backgroundColor = '#000000';
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      body.style.backgroundColor = '#ffffff';
      localStorage.setItem('theme', 'light');
    }

    // Apply transition only after initial theme set to prevent white-to-dark flash on load
    const transitionTimeout = setTimeout(() => {
      body.style.transition = 'background-color 0.5s ease-in-out';
    }, 100);

    return () => clearTimeout(transitionTimeout);
  }, [isDark]);

  const setThemeMode = (dark) => {
    if (dark === isDark) return;
    setIsDark(dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
    window.dispatchEvent(new CustomEvent('theme-changed', { detail: dark }));
  };

  const toggleTheme = () => setThemeMode(!isDark);

  // Dynamic navigation items based on authentication status and user role
  const navItems = user
    ? [
      { label: 'Workspace', to: '/workspace', icon: <LayoutDashboard className="w-4 h-4" /> },
      { label: 'Insights', to: '/insights', icon: <Sparkles className="w-4 h-4" /> },
      ...(user.isAdmin ? [{ label: 'Admin', to: '/admin', icon: <ShieldCheck className="w-4 h-4" /> }] : []),
      { label: 'Features', to: '/#features' },
      { label: 'Pricing', to: '/#pricing' }
    ]
    : [
      { label: 'Features', to: '/#features' },
      { label: 'Pricing', to: '/#pricing' }
    ];

  return (
    <nav id="main-nav" className="w-full max-w-7xl px-4 sm:px-6 py-5 flex items-center justify-between z-50 relative">
      {/* Brand */}
      <Link to="/" 
        style={{ color: isDark ? '#ffffff' : '#111827' }}
        className="flex items-center gap-2.5 group transition-colors duration-500" id="brand-logo">
        <img src="/logo.png" className="h-10 w-10 object-contain" />
        <span className="text-xl font-bold tracking-wide">Extensio.ai</span>
      </Link>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center gap-6 text-sm font-medium">
        {navItems.map(link => (
          <Link key={link.label}
            to={link.to}
            style={{ color: isDark ? 'rgba(255, 255, 255, 0.7)' : '#4b5563' }}
            className={`flex items-center gap-1.5 transition-colors duration-500 ${isDark ? "hover:text-white" : "hover:text-gray-900"} ${location.pathname === link.to ? 'text-primary' : ''}`}>
            {link.icon} {link.label}
          </Link>
        ))}
      </div>

      {/* Desktop CTA */}
      <div className="hidden md:flex items-center gap-3">
        {/* Single Theme Toggle */}
        <button onClick={toggleTheme}
          style={{ borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)' }}
          className={`p-2 rounded-full border transition-all cursor-pointer mr-2 shadow-sm ${isDark ? "hover:bg-white/20" : "hover:bg-black/10"}`}          
          title={isDark ? "Switch to White Theme" : "Switch to Black Theme"}>
          {isDark ? <Sun className="w-4 h-4 text-yellow-500" /> : <Moon className="w-4 h-4 text-blue-500" />}
        </button>

        {user ? (
          <div className="flex items-center gap-4">
            <Link to="/profile" 
              style={{ backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)', borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }}
              className="flex items-center gap-2 px-3 py-1.5 border rounded-full hover:bg-gray-200 dark:hover:bg-white/5 transition-colors cursor-pointer">
              <div className="w-6 h-6 bg-primary/20 text-primary rounded-full flex items-center justify-center">
                <User className="w-3.5 h-3.5" />
              </div>
              <span 
                style={{ color: isDark ? '#ffffff' : '#111827' }}
                className="text-sm font-medium transition-colors duration-500">
                {user.name}
              </span>
            </Link>
            <button onClick={logout}
              className="text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors p-2"
              title="Logout">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            <button onClick={() => openAuthModal('login')}
              style={{ 
                color: isDark ? '#ffffff' : '#111827',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : '#000000'
              }}
              className="bg-transparent hover:bg-black/5 dark:hover:bg-white/5 border text-sm font-semibold py-2.5 px-6 rounded-full transition-all">
              Log In
            </button>
            <button onClick={() => openAuthModal('register')}
              id="get-started-btn"
              className="bg-primary hover:bg-primary/90 text-white text-sm font-semibold py-2.5 px-6 rounded-full transition-all shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)]">
              Get Started
            </button>
          </>
        )}
      </div>

      {/* Mobile Menu Toggle */}
      <button id="mobile-menu-toggle"
        className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Toggle navigation menu">
        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div 
          style={{ 
            backgroundColor: isDark ? 'rgba(0, 0, 0, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
          }}
          className="absolute top-full left-0 right-0 glass-panel border-t p-4 flex flex-col gap-1 md:hidden z-50 mx-4 rounded-2xl mt-2 shadow-2xl transition-all duration-500">
          {navItems.map(link => (
            <Link key={link.label}
              to={link.to}
              onClick={() => setIsMobileMenuOpen(false)}
              style={{ color: isDark ? '#d1d5db' : '#4b5563' }}
              className={`flex items-center gap-2 py-3 px-4 rounded-xl transition-all text-sm font-medium ${location.pathname === link.to ? 'text-primary bg-primary/10' : 'hover:bg-gray-100 dark:hover:bg-white/5'}`}>
              {link.icon} {link.label}
            </Link>
          ))}

          <div style={{ color: isDark ? '#d1d5db' : '#4b5563' }} className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-all text-sm font-medium">
            <span>Theme</span>
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg bg-black border border-white/10 text-gray-300 cursor-pointer"
            >
              {isDark ? <Sun className="w-4 h-4 text-yellow-500" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

          <div style={{ borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }} className="border-t pt-3 mt-2 flex flex-col gap-2">
            {user ? (
              <>
                <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} 
                  className={`flex items-center gap-3 py-3 px-4 text-sm font-medium ${isDark ? 'text-white hover:bg-white/5' : 'text-gray-900 hover:bg-gray-100'} rounded-xl transition-all`}>
                  <User className="w-4 h-4 text-primary" />
                  {user.email}
                </Link>
                <button onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                  className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-red-500/10 text-red-400 transition-all text-sm font-medium text-left">
                  <LogOut className="w-4 h-4" />
                  Log out
                </button>
              </>
            ) : (
              <>
                <button onClick={() => { openAuthModal('login'); setIsMobileMenuOpen(false); }}
                  className="bg-primary hover:bg-primary/90 text-white text-sm font-semibold py-3 px-6 rounded-xl transition-all w-full text-center">
                  Log In
                </button>
                <button
                  onClick={() => { openAuthModal('register'); setIsMobileMenuOpen(false); }}
                  className="bg-primary hover:bg-primary/90 text-white text-sm font-semibold py-3 px-6 rounded-xl transition-all w-full text-center">
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
