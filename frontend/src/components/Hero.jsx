import React from 'react';
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

  const handleStart = () => user ? navigate('/workspace') : openAuthModal('register');

  return (
    <section className="mt-5 mb-8 flex flex-col items-center text-center max-w-5xl w-full px-4">
      {/* Live badge */}
      <motion.div initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel text-sm text-primary mb-8 border border-primary/20 shimmer-badge">
        <span className="pulse-dot" />
        <span className="font-medium">Extensio.ai Engine - Now Live</span>
      </motion.div>

      {/* Headline */}
      <motion.h1 initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.08] mb-6">
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
        className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl leading-relaxed">
        Describe your browser extension in plain English. Our AI builds a{' '}
        <span className="text-white font-medium">real, installable, Manifest V3</span>{' '}
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
          className="glass-panel text-gray-300 hover:text-white text-base font-medium py-3.5 px-8 rounded-full transition-all hover:bg-white/5 border border-white/10">
          See How It Works
        </a>
      </motion.div>

      {/* Social proof stats */}
      <motion.div initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.45 }}
        className="flex flex-wrap items-center justify-center gap-6 text-xs text-gray-500">
        {stats.map(({ icon, label }) => (
          <span key={label} className="flex items-center gap-1.5">
            {icon} {label}
          </span>
        ))}
      </motion.div>
    </section>
  );
}
