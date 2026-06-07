import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Terminal, Code, Cpu, CheckCircle2, Download } from 'lucide-react';

const CODE_LINES = [
  { t: 'comment', text: '// manifest.json — Manifest V3' },
  { t: 'brace', text: '{' },
  { t: 'key', text: '  "manifest_version":', val: ' 3,' },
  { t: 'key', text: '  "name":', val: ' "Dark Mode Toggle",' },
  { t: 'key', text: '  "version":', val: ' "1.0.0",' },
  { t: 'key', text: '  "permissions":', val: ' ["activeTab", "scripting"],' },
  { t: 'key', text: '  "action":', val: ' { "default_popup": "popup.html" }' },
  { t: 'brace', text: '}' },
  { t: 'blank', text: '' },
  { t: 'comment', text: '// content.js — injected into every page' },
  { t: 'code', text: 'document.addEventListener("DOMContentLoaded", () => {' },
  { t: 'code', text: '  const style = document.createElement("style");' },
  { t: 'string', text: '  style.textContent = "html { filter: invert(1) hue-rotate(180deg) }";' },
  { t: 'code', text: '  document.head.appendChild(style);' },
  { t: 'code', text: '});' },
];

function TypedLine({ text, delay, type, isDark }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <motion.div initial={{ opacity: 0, x: -4 }}
      animate={visible ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.2 }}
      style={{ color: colorFor(type, isDark) }}
      className="font-mono text-xs leading-5">
      {text || '\u00A0'}
    </motion.div>
  );
}

const colorFor = (t, isDark) => {
  if (t === 'comment') return '#6b7280';
  if (t === 'brace') return isDark ? '#d1d5db' : '#1f2937';
  if (t === 'key') return isDark ? '#93c5fd' : '#2563eb';
  if (t === 'string') return isDark ? '#4ade80' : '#16a34a';
  if (t === 'blank') return '';
  return isDark ? '#d1d5db' : '#1f2937';
};

export default function DashboardPreview() {
  const [step, setStep] = useState(0); // 0=input, 1=generating, 2=done

  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });

  useEffect(() => {
    const handleThemeEvent = (e) => setIsDark(e.detail);
    window.addEventListener('theme-changed', handleThemeEvent);
    return () => window.removeEventListener('theme-changed', handleThemeEvent);
  }, []);

  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 1800);
    const t2 = setTimeout(() => setStep(2), 4500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.45 }}
      className="w-full max-w-5xl my-10">
      {/* Browser chrome frame */}
      <div 
        style={{ 
          backgroundColor: isDark ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.95)',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.15)'
        }}
        className="glass-panel rounded-2xl border shadow-[0_0_60px_rgba(99,102,241,0.12)] overflow-hidden transition-colors duration-500">
        {/* Title bar */}
        <div 
          style={{ 
            backgroundColor: isDark ? 'rgba(17, 17, 17, 0.6)' : 'rgba(243, 244, 246, 0.9)',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.1)'
          }}
          className="flex items-center gap-3 px-5 py-3 border-b transition-colors duration-500">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/70" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
            <div className="w-3 h-3 rounded-full bg-green-500/70" />
          </div>
          <div className="flex-1 flex justify-center">
            <div 
              style={{ backgroundColor: isDark ? 'rgba(0, 0, 0, 0.6)' : '#ffffff', borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.2)' }}
              className="border rounded-full px-4 py-1 text-xs text-gray-500 font-mono transition-colors duration-500">
              app.extensio.ai/workspace
            </div>
          </div>
        </div>
        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-0 min-h-380px">
          {/* Left panel — prompt input */}
          <div 
            style={{ backgroundColor: isDark ? 'rgba(17, 17, 17, 0.2)' : 'rgba(243, 244, 246, 0.5)', borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.1)' }}
            className="md:col-span-2 border-r p-5 flex flex-col gap-4 transition-colors duration-500">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5" /> Prompt
            </h3>
            <div 
              style={{ 
                backgroundColor: isDark ? 'rgba(0, 0, 0, 0.7)' : '#ffffff',
                color: isDark ? '#d1d5db' : '#111827',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.2)'
              }}
              className="rounded-xl p-4 text-sm font-mono border flex-1 leading-relaxed transition-colors duration-500">
              "Dark mode toggle for any website"
            </div>
            <motion.button whileTap={{ scale: 0.96 }}
              className={`w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                step === 0
                  ? 'bg-primary text-white shadow-[0_0_18px_rgba(99,102,241,0.4)]'
                  : step === 1
                  ? 'bg-primary/60 text-white cursor-wait'
                  : 'bg-green-500/20 border border-green-500/30 text-green-400'
              }`} >
              {step === 0 && <><Cpu className="w-4 h-4" /> Generate</>}
              {step === 1 && <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Generating…</>}
              {step === 2 && <><CheckCircle2 className="w-4 h-4" /> Done!</>}
            </motion.button>
            {step === 2 && (
              <motion.button initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full py-2.5 rounded-xl text-sm font-medium border border-primary/30 text-primary hover:bg-primary/10 flex items-center justify-center gap-2 transition-all">
                <Download className="w-4 h-4" /> Download .zip
              </motion.button>
            )}
            {/* Progress */}
            {step === 1 && (
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                  <span>Writing extension code…</span>
                  <span>60%</span>
                </div>
                <div 
                  style={{ backgroundColor: isDark ? '#111111' : '#e5e7eb' }}
                  className="w-full rounded-full h-1 overflow-hidden transition-colors duration-500">
                  <motion.div className="bg-linear-to-r from-primary to-purple-500 h-1 rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: '60%' }}
                    transition={{ duration: 2.5, ease: 'easeOut' }}/>
                </div>
              </div>
            )}
          </div>
          {/* Right panel — generated code */}
          <div 
            style={{ backgroundColor: isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(249, 250, 251, 0.8)' }}
            className="md:col-span-3 p-5 flex flex-col transition-colors duration-500">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-4">
              <Code className="w-3.5 h-3.5" /> Generated Output
            </h3>
            <div 
              style={{ backgroundColor: isDark ? 'rgba(0, 0, 0, 0.8)' : '#ffffff', borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.15)' }}
              className="rounded-xl p-4 border flex-1 overflow-hidden transition-colors duration-500">
              {/* Line numbers + code */}
              <div className="flex gap-3">
                <div className="flex flex-col text-right select-none">
                  {CODE_LINES.map((_, i) => (
                    <span key={i} style={{ color: isDark ? '#374151' : '#9ca3af' }} className="font-mono text-xs leading-5 transition-colors duration-500">{i + 1}</span>
                  ))}
                </div>
                <div className="flex flex-col flex-1 overflow-hidden">
                  {CODE_LINES.map((line, i) => (
                    <TypedLine key={i}
                      text={line.t === 'key' ? line.text + (line.val || '') : line.text}
                      delay={step >= 1 ? i * 120 : 99999}
                      type={line.t}
                      isDark={isDark} />
                  ))}
                </div>
              </div>
            </div>
            {step === 2 && (
              <motion.div initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-3 flex items-center gap-2 text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-4 py-2.5 rounded-xl">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                Extension packaged — manifest.json + popup.html + content.js ready!
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
