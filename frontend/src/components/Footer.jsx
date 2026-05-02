import React from 'react';
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

function LinkList({ links }) {
  return (
    <ul className="space-y-3 text-sm text-gray-500">
      {links.map(({ label, href, to }) => (
        <li key={label}>
          {href
            ? <a href={href} className="hover:text-white transition-colors">{label}</a>
            : <Link to={to} className="hover:text-white transition-colors">{label}</Link>
          }
        </li>
      ))}
    </ul>
  );
}

export default function Footer() {
  const navigate = useNavigate();
  const { user, openAuthModal, logout } = useAuth();
  const handleStart = () => user ? navigate('/workspace') : openAuthModal('login');
  return (
    <footer className="w-full border-t border-white/5">
      {/* CTA Banner */}
      <div className="w-full bg-linear-to-r from-primary/10 via-purple-600/10 to-accent/10 border-b border-white/5 py-10 px-4">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <h3 className="text-xl font-bold mb-1">Ready to build your first extension?</h3>
            <p className="text-gray-400 text-sm">It's free, No credit card required. Takes less than 60 seconds</p>
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
              <span className="text-lg font-bold">Extensio.ai</span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
              Transform your ideas into production-ready Chrome extensions using Ai. No coding experience needed. Real MV3 output, every time
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-widest mb-4">Product</h4>
            <LinkList links={productLinks} />
          </div>

          {/* Company */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-widest mb-4">Company</h4>
            <LinkList links={companyLinks} />
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-widest mb-4">Legal</h4>
            <LinkList links={legalLinks} />
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} Extensio.ai - All rights reserved
          </p>
          <p className="text-xs text-gray-700">
            Built by Group 8 under internship at <br></br> Zaalima development pvt.ltd
          </p>
        </div>
      </div>
    </footer>
  );
}
