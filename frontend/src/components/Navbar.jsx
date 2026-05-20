import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, Menu, X, LayoutDashboard, ShieldCheck, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isLanding = location.pathname === '/';
  
  const { user, openAuthModal, logout } = useAuth();

  const landingLinks = [
    { label: 'Features', href: '/#features' },
    { label: 'Pricing', href: '/#pricing' },
  ];

  const appLinks = [
    { label: 'Workspace', to: '/workspace', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'Insights', to: '/insights', icon: <Sparkles className="w-4 h-4" /> }
  ];

  if (user?.isAdmin) {
    appLinks.push({ label: 'Admin', to: '/admin', icon: <ShieldCheck className="w-4 h-4" /> });
  }

  return (
    <nav id="main-nav" className="w-full max-w-7xl px-4 sm:px-6 py-5 flex items-center justify-between z-50 relative">
      {/* Brand */}
      <Link to="/" className="flex items-center gap-2.5 group" id="brand-logo">
        <img src="/logo.png" className="h-10 w-10 object-contain"/>
        <span className="text-xl font-bold tracking-wide">Extensio.ai</span>
      </Link>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-400">
        {isLanding ? (
          landingLinks.map(link => (
            <a key={link.label} href={link.href} className="hover:text-white transition-colors">
              {link.label}
            </a>
          ))
        ) : (
          appLinks.map(link => (
            <Link key={link.label}
              to={link.to}
              className={`flex items-center gap-1.5 hover:text-white transition-colors ${location.pathname === link.to ? 'text-white' : ''}`}>
              {link.icon} {link.label}
            </Link>
          ))
        )}
      </div>

      {/* Desktop CTA */}
      <div className="hidden md:flex items-center gap-3">
        {user ? (
          <div className="flex items-center gap-4">
            {!isLanding && (
              <Link to="/" className="text-sm font-medium text-gray-300 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-white/5">
                ← Back to Home
              </Link>
            )}
            <Link to="/profile" className="flex items-center gap-2 px-3 py-1.5 bg-surface border border-white/5 rounded-full hover:bg-white/5 transition-colors cursor-pointer">
              <div className="w-6 h-6 bg-primary/20 text-primary rounded-full flex items-center justify-center">
                <User className="w-3.5 h-3.5" />
              </div>
              <span className="text-sm font-medium">{user.name}</span>
            </Link>
            <button onClick={logout}
              className="text-gray-400 hover:text-red-400 transition-colors p-2"
              title="Logout">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            <button onClick={() => openAuthModal('login')} 
              className="bg-primary hover:bg-primary/90 text-white text-sm font-semibold py-2.5 px-6 rounded-full transition-all shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)]">
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
        className="md:hidden p-2 text-gray-300 hover:text-white transition-colors cursor-pointer"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Toggle navigation menu">
        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 glass-panel border-t border-white/5 p-4 flex flex-col gap-1 md:hidden z-50 mx-4 rounded-2xl mt-2 shadow-2xl">
          {isLanding ? (
            landingLinks.map(link => (
              <a key={link.label}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-300 hover:text-white py-3 px-4 rounded-xl hover:bg-white/5 transition-all text-sm font-medium">
                {link.label}
              </a>
            ))
          ) : (
            appLinks.map(link => (
              <Link key={link.label}
                to={link.to}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-2 py-3 px-4 rounded-xl hover:bg-white/5 transition-all text-sm font-medium ${location.pathname === link.to ? 'text-white bg-white/5' : 'text-gray-300 hover:text-white'}`}>
                {link.icon} {link.label}
              </Link>
            ))
          )}
          
          <div className="border-t border-white/5 pt-3 mt-2 flex flex-col gap-2">
            {user ? (
              <>
                <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 py-3 px-4 text-sm font-medium text-white hover:bg-white/5 rounded-xl transition-all">
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
