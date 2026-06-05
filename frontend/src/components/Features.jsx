import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, ShieldCheck, Zap, Clock, Download, Wand2, Code2, Globe } from 'lucide-react';
import BorderGlow from './BorderGlow';

const features = [
  {
    icon: <Zap className="w-5 h-5" />,
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10',
    border: 'border-yellow-400/20',
    title: 'Instant Generation',
    description: 'From prompt to production-ready Manifest V3 code in under 10 seconds. No boilerplate, no setup - just describe what you want',
  },
  {
    icon: <ShieldCheck className="w-5 h-5" />,
    color: 'text-green-400',
    bg: 'bg-green-400/10',
    border: 'border-green-400/20',
    title: 'Secure & Compliant',
    description: 'Built-in security guardrails ensure your extension requests the minimum necessary permissions and follows Chrome Web Store policies',
  },
  {
    icon: <Package className="w-5 h-5" />,
    color: 'text-purple-400',
    bg: 'bg-purple-400/10',
    border: 'border-purple-400/20',
    title: 'Auto-Packaged ZIP',
    description: 'Every extension is automatically zipped with a valid manifest.json, popup, content scripts - ready to drag-and-drop into Chrome',
  },
  {
    icon: <Wand2 className="w-5 h-5" />,
    color: 'text-pink-400',
    bg: 'bg-pink-400/10',
    border: 'border-pink-400/20',
    title: 'Smart Prompt Parser',
    description: 'Detects your intent - dark mode, ad blocker, tab manager, timer, notes - and builds the correct UI and logic automatically',
  },
  {
    icon: <Code2 className="w-5 h-5" />,
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
    border: 'border-blue-400/20',
    title: 'Real Code Output',
    description: 'No placeholders. Every download includes actual working JavaScript, HTML and a proper manifest.json you can inspect and modify',
  },
  {
    icon: <Clock className="w-5 h-5" />,
    color: 'text-orange-400',
    bg: 'bg-orange-400/10',
    border: 'border-orange-400/20',
    title: 'Version History',
    description: 'Every generation is saved to your workspace. Iterate, edit prompts and download any past version whenever you need it',
  },
];

const steps = [
  { n: '1', label: 'Describe', desc: 'Type what you want your extension to do in plain English' },
  { n: '2', label: 'Generate', desc: 'Our AI builds the popup, content scripts and manifest in seconds' },
  { n: '3', label: 'Download & Install', desc: 'Download the ZIP, drag into Chrome and your extension is live' },
];

export default function Features() {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });

  useEffect(() => {
    const handleThemeEvent = (e) => setIsDark(e.detail);
    window.addEventListener('theme-changed', handleThemeEvent);
    return () => window.removeEventListener('theme-changed', handleThemeEvent);
  }, []);

  return (
    <section className="w-full py-20 border-t border-black/5 dark:border-white/5 transition-colors duration-500" id="features">
      {/* Header */}
      <div className="text-center mb-16 px-4">
        <motion.p initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-primary text-sm font-semibold uppercase tracking-widest mb-3" >
          Why Extensio.ai
        </motion.p>
        <motion.h2 initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ color: isDark ? '#ffffff' : '#111827' }}
          className="text-3xl md:text-4xl font-bold mb-4 transition-colors duration-500">
          Everything you need to ship extensions
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          style={{ color: isDark ? '#9ca3af' : '#4b5563' }}
          className="max-w-2xl mx-auto transition-colors duration-500" >
          Our AI engine handles the complex architecture of browser extensions so you can focus entirely on the idea
        </motion.p>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 mb-20">
        {features.map((f, i) => (
          <motion.div key={f.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.07 }}
            className="hover:scale-[1.02] transition-transform">
            <BorderGlow
              edgeSensitivity={24}
              glowColor="40 80 80"
              borderRadius={50}
              glowRadius={80}
              glowIntensity={3}
              coneSpread={45}
              className="p-7 h-full w-full"
            >
              <div className="flex items-center gap-4 mb-5">
                <div className={`w-11 h-11 ${f.bg} ${f.border} border rounded-xl flex items-center justify-center shrink-0 ${f.color}`}>
                  {f.icon}
                </div>
                <h3 style={{ color: isDark ? '#ffffff' : '#111827' }} className="text-lg font-semibold transition-colors duration-500">{f.title}</h3>
              </div>
              <p style={{ color: isDark ? '#9ca3af' : '#4b5563' }} className="text-sm leading-relaxed transition-colors duration-500">{f.description}</p>
            </BorderGlow>
          </motion.div>
        ))}
      </div>

      {/* How It Works */}
      <div className="px-4" id="works">
        <div className="text-center mb-12">
          <h2 style={{ color: isDark ? '#ffffff' : '#111827' }} className="text-2xl md:text-3xl font-bold mb-2 transition-colors duration-500">How it works</h2>
          <p style={{ color: isDark ? '#9ca3af' : '#4b5563' }} className="text-sm transition-colors duration-500">Three steps from idea to installable Chrome extension.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto relative">
          {/* Connector line (desktop only) */}
          <div className="hidden md:block absolute top-10 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px bg-linear-to-r from-primary/30 via-purple-500/30 to-accent/30" />
          {steps.map(({ n, label, desc }, i) => (
            <motion.div key={n} initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}>
              <BorderGlow
                edgeSensitivity={24}
                glowColor="40 80 80"
                borderRadius={50}
                glowRadius={80}
                glowIntensity={3}
                coneSpread={45}
                className="flex flex-col p-8 h-full w-full items-start text-left"
              >
                <div className="flex items-center gap-4 mb-5 w-full">
                  <div className="w-14 h-14 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center text-primary font-bold text-lg shadow-[0_0_20px_rgba(99,102,241,0.2)] shrink-0">
                    {n}
                  </div>
                  <h3 style={{ color: isDark ? '#ffffff' : '#111827' }} className="font-semibold text-lg transition-colors duration-500">{label}</h3>
                </div>
                <p style={{ color: isDark ? '#9ca3af' : '#4b5563' }} className="text-sm transition-colors duration-500">{desc}</p>
              </BorderGlow>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
