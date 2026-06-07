import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Wand2, Zap, Users, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const stats = [
  { icon: <Zap className="w-3.5 h-3.5 text-yellow-400" />, label: '< 10s generation' },
  { icon: <Users className="w-3.5 h-3.5 text-blue-400" />, label: '12,000+ builders' },
  { icon: <Star className="w-3.5 h-3.5 text-purple-400" />, label: 'MV3 compliant' },
];

export default function Hero() {
  const navigate = useNavigate();
  const { user, openAuthModal } = useAuth();

  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });

  useEffect(() => {
    const handleThemeEvent = (e) => setIsDark(e.detail);
    window.addEventListener('theme-changed', handleThemeEvent);
    return () => window.removeEventListener('theme-changed', handleThemeEvent);
  }, []);

  const handleStart = () => user ? navigate('/workspace') : openAuthModal('register');

  return (
    <section className="mt-5 mb-8 flex flex-col items-center text-center max-w-5xl w-full px-4">
      {/* Live badge */}
      <motion.div initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.95)',
          color: isDark ? '#ffffff' : '#111827',
          borderColor: isDark ? 'rgba(99, 102, 241, 0.3)' : 'rgba(99, 102, 241, 0.2)'
        }}
        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border glass-panel shimmer-badge text-sm mb-8 transition-colors duration-500">
        <span className="pulse-dot" />
        <span className="font-medium">Extensio.ai Engine - Now Live</span>
      </motion.div>

      {/* Headline */}
      <motion.h1 initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        style={{ color: isDark ? '#ffffff' : '#111827' }}
        className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.08] mb-6 transition-colors duration-500">
        Turn Ideas into
        <br />
        <span className="gradient-text glow-text">Chrome Extensions</span>
        <br />
        Instantly
      </motion.h1>

      {/* Sub */}
      <motion.p initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        style={{ color: isDark ? '#9ca3af' : '#374151' }}
        className="text-lg md:text-xl mb-10 max-w-2xl leading-relaxed transition-colors duration-500">
        Describe your browser extension in plain English. Our AI builds a{' '}
        <span style={{ color: isDark ? '#ffffff' : '#111827' }} className="font-medium transition-colors duration-500">real, installable, Manifest V3</span>{' '}
        Chrome extension - packaged and ready for the Web Store in seconds
      </motion.p>

      {/* CTA Buttons */}
      <motion.div initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="flex flex-col sm:flex-row items-center gap-4 mb-12">
        <button onClick={handleStart}
          className="group bg-primary hover:bg-primary/90 text-white text-base font-semibold py-3.5 px-8 rounded-full transition-all flex items-center gap-2 shadow-[0_0_30px_rgba(99,102,241,0.5)] hover:shadow-[0_0_40px_rgba(99,102,241,0.7)] hover:scale-105">
          Start Building Free
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
        <a href="#works"
          style={{ 
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#ffffff',
            color: isDark ? '#d1d5db' : '#111827',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.2)'
          }}
          className="glass-panel text-base font-medium py-3.5 px-8 rounded-full transition-all duration-500 border hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/10">
          See How It Works
        </a>
      </motion.div>

      {/* Social proof stats */}
      <motion.div initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.45 }}
        style={{ color: isDark ? '#9ca3af' : '#374151' }}
        className="flex flex-wrap items-center justify-center gap-6 text-xs transition-colors duration-500">
        {stats.map(({ icon, label }) => (
          <span key={label} className="flex items-center gap-1.5">
            {icon} {label}
          </span>
        ))}
      </motion.div>
    </section>
  );
}
