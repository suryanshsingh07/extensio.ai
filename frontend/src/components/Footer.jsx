import React, { useState, useEffect } from 'react';
import { Sparkles, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const productLinks = [
  { label: 'Features', href: '/#features' },
  { label: 'Pricing', href: '/#pricing' },
  { to: '/changelog', label: 'Changelog' },
  { to: '/apidocs', label: 'API Docs' },
];

const companyLinks = [
  { to: '/about', label: 'About Us' },
  { to: '/blog', label: 'Blog' },
  { to: '/careers', label: 'Careers' },
  { to: '/contact', label: 'Contact' },
];

const legalLinks = [
  { to: '/privacy', label: 'Privacy Policy' },
  { to: '/terms', label: 'Terms of Service' },
  { to: '/security', label: 'Security' },
];

const socials = [
  { icon: <ExternalLink className="w-4 h-4" />, href: '#', label: 'GitHub' },
  { icon: <ExternalLink className="w-4 h-4" />, href: '#', label: 'Twitter' },
  { icon: <ExternalLink className="w-4 h-4" />, href: '#', label: 'LinkedIn' },
];

function LinkList({ links, isDark }) {
  return (
    <ul className="space-y-3 text-sm" style={{ color: isDark ? '#9ca3af' : '#4b5563' }}>
      {links.map(({ label, href, to }) => (
        <li key={label}>
          {href
            ? <a href={href} className={`transition-colors ${isDark ? 'hover:text-white' : 'hover:text-gray-900'}`}>{label}</a>
            : <Link to={to} className={`transition-colors ${isDark ? 'hover:text-white' : 'hover:text-gray-900'}`}>{label}</Link>
          }
        </li>
      ))}
    </ul>
  );
}

export default function Footer() {
  const navigate = useNavigate();
  const { user, openAuthModal, logout } = useAuth();

  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });

  useEffect(() => {
    const handleThemeEvent = (e) => setIsDark(e.detail);
    window.addEventListener('theme-changed', handleThemeEvent);
    return () => window.removeEventListener('theme-changed', handleThemeEvent);
  }, []);

  const handleStart = () => user ? navigate('/workspace') : openAuthModal('login');
  return (
    <footer className="w-full border-t transition-colors duration-500" style={{ borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' }}>
      {/* CTA Banner */}
      <div className="w-full bg-linear-to-r from-primary/10 via-purple-600/10 to-accent/10 border-b py-10 px-4 transition-colors duration-500" style={{ borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' }}>
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <h3 style={{ color: isDark ? '#ffffff' : '#111827' }} className="text-xl font-bold mb-1 transition-colors duration-500">Ready to build your first extension?</h3>
            <p style={{ color: isDark ? '#9ca3af' : '#4b5563' }} className="text-sm transition-colors duration-500">It's free, No credit card required. Takes less than 60 seconds</p>
          </div>
          <button onClick={handleStart}
            className="shrink-0 bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-7 rounded-full transition-all shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] text-sm">
            Start Building Free →
          </button>
        </div>
      </div>

      {/* Main Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <img src="/logo.png" className="h-10 w-10 object-contain"/>
              <span style={{ color: isDark ? '#ffffff' : '#111827' }} className="text-lg font-bold transition-colors duration-500">Extensio.ai</span>
            </div>
            <p style={{ color: isDark ? '#9ca3af' : '#4b5563' }} className="text-sm leading-relaxed max-w-xs transition-colors duration-500">
              Transform your ideas into production-ready Chrome extensions using Ai. No coding experience needed. Real MV3 output, every time
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 style={{ color: isDark ? '#ffffff' : '#111827' }} className="text-xs font-semibold uppercase tracking-widest mb-4 transition-colors duration-500">Product</h4>
            <LinkList links={productLinks} isDark={isDark} />
          </div>

          {/* Company */}
          <div>
            <h4 style={{ color: isDark ? '#ffffff' : '#111827' }} className="text-xs font-semibold uppercase tracking-widest mb-4 transition-colors duration-500">Company</h4>
            <LinkList links={companyLinks} isDark={isDark} />
          </div>

          {/* Legal */}
          <div>
            <h4 style={{ color: isDark ? '#ffffff' : '#111827' }} className="text-xs font-semibold uppercase tracking-widest mb-4 transition-colors duration-500">Legal</h4>
            <LinkList links={legalLinks} isDark={isDark} />
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 transition-colors duration-500" style={{ borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' }}>
          <p className="text-xs transition-colors duration-500" style={{ color: isDark ? '#4b5563' : '#6b7280' }}>
            © {new Date().getFullYear()} Extensio.ai - All rights reserved
          </p>
          <p className="text-xs transition-colors duration-500" style={{ color: isDark ? '#374151' : '#6b7280' }}>
            Built by Group 8 under internship at <br></br> Zaalima development pvt.ltd
          </p>
        </div>
      </div>
    </footer>
  );
}
