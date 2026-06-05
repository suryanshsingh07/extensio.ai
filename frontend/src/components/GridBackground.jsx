import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Soft Floating Animation Presets
const floatTransition = (duration, delay = 0) => ({
  duration,
  ease: 'easeInOut',
  repeat: Infinity,
  repeatType: 'reverse',
  delay,
});

export default function GridBackground() {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true; // Default to dark (Sun)
  });

  useEffect(() => {
    const handleThemeEvent = (e) => setIsDark(e.detail);
    window.addEventListener('theme-changed', handleThemeEvent);
    return () => window.removeEventListener('theme-changed', handleThemeEvent);
  }, []);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Deep Dark background base */}
      <div 
        className="absolute inset-0 transition-colors duration-500" 
        style={{ backgroundColor: isDark ? '#000000' : '#ffffff' }}
      />

      {/* Grid Pattern with subtle radial mask to fade at edges */}
      <div 
        className="absolute inset-0 opacity-[0.15] dark:opacity-[0.25]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(99, 102, 241, 0.15) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(99, 102, 241, 0.15) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          maskImage: 'radial-gradient(ellipse at 50% 50%, black 60%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 50% 50%, black 60%, transparent 100%)',
        }}
      />

      {/* Giant Ambient Glows */}
      <div className="absolute top-[-10%] left-[20%] w-[60%] h-[40%] bg-indigo-500/5 dark:bg-indigo-500/10 blur-[130px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[10%] w-[45%] h-[45%] bg-purple-500/5 dark:bg-purple-500/10 blur-[130px] rounded-full" />
      <div className="absolute top-[30%] left-[-10%] w-[35%] h-[45%] bg-sky-500/0 dark:bg-sky-500/5 blur-[120px] rounded-full" />

      {/* Floating Blueprint Wireframes */}
      <div className="absolute inset-0 w-full h-full max-w-7xl mx-auto px-4 sm:px-6">

        {/* 1. TOP-LEFT: Isometric Browser Window / Chrome Extension Popup Wireframe */}
        <motion.div 
          className="absolute top-[12%] left-[3%] w-45 h-37.5 opacity-40 xl:opacity-60 hidden md:block"
          animate={{ y: [0, -10, 0], x: [0, 4, 0], rotate: [-2, 0, -2] }}
          transition={floatTransition(8, 0)}
        >
          <svg viewBox="0 0 200 180" className="w-full h-full filter drop-shadow-[0_0_15px_rgba(99,102,241,0.2)]">
            <defs>
              <linearGradient id="grad-indigo" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#818cf8" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0.1" />
              </linearGradient>
              <linearGradient id="grad-cyan" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#0284c7" stopOpacity="0.1" />
              </linearGradient>
            </defs>

            {/* Browser Main Frame (Isometric view) */}
            {/* Top Surface */}
            <path d="M 100,20 L 170,55 L 70,105 L 0,70 Z" fill={isDark ? "rgba(19, 19, 31, 0.4)" : "rgba(0, 0, 0, 0.03)"} stroke="#6366f1" strokeWidth="1" strokeDasharray="3 2" />
            
            {/* Browser Depth/Sides */}
            <path d="M 0,70 L 0,85 L 70,120 L 70,105 Z" fill={isDark ? "rgba(19, 19, 31, 0.5)" : "rgba(0, 0, 0, 0.05)"} stroke="#6366f1" strokeWidth="1" />
            <path d="M 70,105 L 70,120 L 170,70 L 170,55 Z" fill={isDark ? "rgba(19, 19, 31, 0.3)" : "rgba(0, 0, 0, 0.02)"} stroke="#6366f1" strokeWidth="1" />

            {/* Window controls on title bar */}
            <circle cx="25" cy="63" r="2.5" fill="none" stroke="#ef4444" strokeWidth="1" />
            <circle cx="35" cy="68" r="2.5" fill="none" stroke="#eab308" strokeWidth="1" />
            <circle cx="45" cy="73" r="2.5" fill="none" stroke="#22c55e" strokeWidth="1" />

            {/* Browser Content Layout Lines */}
            <line x1="60" y1="80" x2="140" y2="40" stroke="#4b5563" strokeWidth="1.5" strokeDasharray="2 1" />
            <line x1="45" y1="88" x2="125" y2="48" stroke="#4b5563" strokeWidth="1.5" />
            <line x1="30" y1="95" x2="110" y2="55" stroke="#4b5563" strokeWidth="1.5" />

            {/* Floating Chrome Extension Popup Overlay (stands out in Cyan) */}
            <g transform="translate(45, -25)">
              {/* Connector beam */}
              <line x1="85" y1="110" x2="85" y2="60" stroke="#38bdf8" strokeWidth="1" strokeDasharray="2 2" />
              
              {/* Popup Top */}
              <path d="M 85,25 L 125,45 L 85,65 L 45,45 Z" fill="rgba(56, 189, 248, 0.15)" stroke="#38bdf8" strokeWidth="1.5" />
              {/* Popup Sides */}
              <path d="M 45,45 L 45,75 L 85,95 L 85,65 Z" fill="rgba(56, 189, 248, 0.2)" stroke="#38bdf8" strokeWidth="1.5" />
              <path d="M 85,65 L 85,95 L 125,75 L 125,45 Z" fill="rgba(56, 189, 248, 0.1)" stroke="#38bdf8" strokeWidth="1" />

              {/* Popup Content representation */}
              <line x1="60" y1="50" x2="110" y2="75" stroke="#38bdf8" strokeWidth="1.5" />
              <circle cx="85" cy="62" r="3" fill="none" stroke="#38bdf8" strokeWidth="1.5" />
            </g>
          </svg>
        </motion.div>

        {/* 2. MIDDLE-LEFT: Glowing Isometric Puzzle Piece (Representing Extension/Plugin) */}
        <motion.div 
          className="absolute top-[48%] left-[1.5%] w-32.5 h-32.5 opacity-35 xl:opacity-55 hidden lg:block"
          animate={{ y: [0, 8, 0], x: [0, -3, 0], rotate: [0, 3, 0] }}
          transition={floatTransition(7, 1.5)}
        >
          <svg viewBox="0 0 160 160" className="w-full h-full filter drop-shadow-[0_0_12px_rgba(56,189,248,0.2)]">
            <defs>
              <linearGradient id="puzzle-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#a855f7" stopOpacity="0.2" />
              </linearGradient>
            </defs>
            {/* Isometric Puzzle Piece Wireframe */}
            {/* Top Plane */}
            <path d="M 80,20 L 120,40 L 105,48 C 112,55 110,65 100,60 L 80,70 L 60,60 C 50,65 48,55 55,48 L 40,40 Z" 
              fill="rgba(56, 189, 248, 0.05)" stroke="url(#puzzle-grad)" strokeWidth="1.5" />
            
            {/* Depth Walls */}
            <path d="M 40,40 L 40,80 L 55,88 L 55,48 Z" fill="rgba(56, 189, 248, 0.1)" stroke="#38bdf8" strokeWidth="1" />
            <path d="M 55,88 L 60,95 L 60,60 L 55,48 Z" fill="rgba(56, 189, 248, 0.05)" stroke="#38bdf8" strokeWidth="1" />
            
            {/* Front Isometric Right wall */}
            <path d="M 80,70 L 80,110 L 100,100 L 100,60 Z" fill="rgba(168, 85, 247, 0.1)" stroke="#a855f7" strokeWidth="1.5" />
            <path d="M 100,100 C 110,105 112,95 105,88 L 120,80 L 120,40 L 100,50" fill="rgba(168, 85, 247, 0.05)" stroke="#a855f7" strokeWidth="1" />

            {/* Glowing Blueprint Inner Grid Lines */}
            <line x1="80" y1="20" x2="80" y2="70" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="40" y1="40" x2="120" y2="80" stroke="#a855f7" strokeWidth="1" strokeDasharray="2 2" />
          </svg>
        </motion.div>

        {/* 3. BOTTOM-LEFT: Glowing Cybernetic Database / Isometric Stacked Node */}
        <motion.div 
          className="absolute bottom-[10%] left-[5%] w-37.5 h-40 opacity-30 xl:opacity-50 hidden md:block"
          animate={{ y: [0, -8, 0], x: [0, -2, 0], rotate: [-1, 2, -1] }}
          transition={floatTransition(9, 3)}
        >
          <svg viewBox="0 0 160 180" className="w-full h-full filter drop-shadow-[0_0_15px_rgba(168,85,247,0.15)]">
            <defs>
              <linearGradient id="cylinder-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#a855f7" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0.05" />
              </linearGradient>
            </defs>

            {/* Cylinder Bottom Ring */}
            <ellipse cx="80" cy="140" rx="50" ry="20" fill="none" stroke="#6366f1" strokeWidth="1" strokeDasharray="2 2" />
            
            {/* Cylinder Sides */}
            <line x1="30" y1="40" x2="30" y2="140" stroke="#6366f1" strokeWidth="1" />
            <line x1="130" y1="40" x2="130" y2="140" stroke="#a855f7" strokeWidth="1" />

            {/* Stacked Disk Layers */}
            {/* Layer 1 (Bottom) */}
            <g transform="translate(0, 40)">
              <ellipse cx="80" cy="80" rx="50" ry="20" fill="rgba(168, 85, 247, 0.05)" stroke="#a855f7" strokeWidth="1.5" />
              <line x1="80" y1="80" x2="80" y2="100" stroke="#a855f7" strokeWidth="1" strokeDasharray="3 3" />
            </g>

            {/* Layer 2 (Middle) */}
            <g transform="translate(0, 10)">
              <ellipse cx="80" cy="80" rx="50" ry="20" fill="rgba(168, 85, 247, 0.08)" stroke="#a855f7" strokeWidth="1.5" />
              <line x1="45" y1="88" x2="115" y2="72" stroke="#a855f7" strokeWidth="1" />
              <line x1="50" y1="75" x2="110" y2="85" stroke="#38bdf8" strokeWidth="1" strokeDasharray="2 1" />
            </g>

            {/* Layer 3 (Top Surface) */}
            <g transform="translate(0, -20)">
              <ellipse cx="80" cy="80" rx="50" ry="20" fill="rgba(56, 189, 248, 0.15)" stroke="#38bdf8" strokeWidth="2" />
              {/* Tech/AI circular designs inside the top */}
              <ellipse cx="80" cy="80" rx="30" ry="12" fill="none" stroke="#38bdf8" strokeWidth="1" strokeDasharray="4 2" />
              <ellipse cx="80" cy="80" rx="15" ry="6" fill="rgba(56, 189, 248, 0.2)" stroke="#38bdf8" strokeWidth="1" />
              
              {/* Rising Laser/Blueprint beams */}
              <line x1="80" y1="80" x2="80" y2="30" stroke="#38bdf8" strokeWidth="1" strokeDasharray="2 2" />
              <line x1="55" y1="75" x2="55" y2="15" stroke="#38bdf8" strokeWidth="0.75" strokeDasharray="2 2" />
              <line x1="105" y1="85" x2="105" y2="25" stroke="#a855f7" strokeWidth="0.75" strokeDasharray="2 2" />
            </g>
          </svg>
        </motion.div>

        {/* 4. TOP-RIGHT: Premium Isometric Chrome Logo Wireframe */}
        <motion.div 
          className="absolute top-[8%] right-[3%] w-50 h-50 opacity-40 xl:opacity-60 hidden md:block"
          animate={{ y: [0, -12, 0], x: [0, -4, 0], rotate: [0, -2, 0] }}
          transition={floatTransition(10, 0.5)}
        >
          <svg viewBox="0 0 200 200" className="w-full h-full filter drop-shadow-[0_0_15px_rgba(99,102,241,0.2)]">
            <defs>
              <linearGradient id="wireframe-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#a855f7" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.2" />
              </linearGradient>
            </defs>

            {/* Outer Ring representing Chrome logo in isometric projection */}
            <ellipse cx="100" cy="100" rx="80" ry="40" fill="none" stroke="url(#wireframe-grad)" strokeWidth="1.5" />
            <ellipse cx="100" cy="100" rx="72" ry="36" fill="none" stroke="#6366f1" strokeWidth="0.75" strokeDasharray="3 3" />

            {/* Inner Core Circle */}
            <ellipse cx="100" cy="100" rx="35" ry="17.5" fill="rgba(99, 102, 241, 0.05)" stroke="#6366f1" strokeWidth="1.5" />
            <ellipse cx="100" cy="100" rx="30" ry="15" fill="none" stroke="#38bdf8" strokeWidth="0.5" />
            
            {/* Center Core dot */}
            <ellipse cx="100" cy="100" rx="10" ry="5" fill="rgba(56, 189, 248, 0.2)" stroke="#38bdf8" strokeWidth="1" />

            {/* Segment dividing lines mimicking Chrome's design but in isometric blueprint style */}
            {/* Segment 1 */}
            <line x1="100" y1="82.5" x2="140" y2="80" stroke="#38bdf8" strokeWidth="1" />
            <line x1="100" y1="82.5" x2="155" y2="70" stroke="#38bdf8" strokeWidth="0.75" strokeDasharray="2 2" />

            {/* Segment 2 */}
            <line x1="82.5" y1="108.7" x2="60" y2="135" stroke="#a855f7" strokeWidth="1" />
            <line x1="82.5" y1="108.7" x2="40" y2="120" stroke="#a855f7" strokeWidth="0.75" strokeDasharray="2 2" />

            {/* Segment 3 */}
            <line x1="117.5" y1="108.7" x2="100" y2="140" stroke="#6366f1" strokeWidth="1" />
            
            {/* Holographic vertical blueprint guides */}
            <line x1="100" y1="20" x2="100" y2="180" stroke={isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)"} strokeWidth="0.5" strokeDasharray="5 5" />
            <line x1="20" y1="100" x2="180" y2="100" stroke={isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)"} strokeWidth="0.5" strokeDasharray="5 5" />

            {/* Outer satellite ticks */}
            <path d="M 180,100 L 190,105" stroke="#38bdf8" strokeWidth="1" />
            <path d="M 20,100 L 10,95" stroke="#a855f7" strokeWidth="1" />
            <circle cx="180" cy="100" r="2.5" fill="#38bdf8" />
            <circle cx="20" cy="100" r="2.5" fill="#a855f7" />
          </svg>
        </motion.div>

        {/* 5. MIDDLE-RIGHT: Rotating Engineering Automation Gear Wireframe */}
        <motion.div 
          className="absolute top-[44%] right-[1%] w-35 h-35 opacity-35 xl:opacity-55 hidden lg:block"
          animate={{ y: [0, -8, 0], x: [0, 3, 0] }}
          transition={floatTransition(7.5, 2)}
        >
          <motion.svg 
            viewBox="0 0 160 160" 
            className="w-full h-full filter drop-shadow-[0_0_12px_rgba(168,85,247,0.2)]"
            animate={{ rotate: 360 }}
            transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
          >
            <defs>
              <linearGradient id="gear-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a855f7" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#ec4899" stopOpacity="0.2" />
              </linearGradient>
            </defs>

            {/* Center hub */}
            <circle cx="80" cy="80" r="14" fill="none" stroke="#a855f7" strokeWidth="1.5" />
            <circle cx="80" cy="80" r="6" fill="rgba(168, 85, 247, 0.1)" stroke="#ec4899" strokeWidth="1" />

            {/* Inner Ring */}
            <circle cx="80" cy="80" r="32" fill="none" stroke="#a855f7" strokeWidth="1" strokeDasharray="3 2" />

            {/* Gear spokes */}
            <line x1="80" y1="14" x2="80" y2="146" stroke="#a855f7" strokeWidth="1" />
            <line x1="14" y1="80" x2="146" y2="80" stroke="#a855f7" strokeWidth="1" />
            <line x1="33" y1="33" x2="127" y2="127" stroke="rgba(168, 85, 247, 0.4)" strokeWidth="0.75" />
            <line x1="33" y1="127" x2="127" y2="33" stroke="rgba(168, 85, 247, 0.4)" strokeWidth="0.75" />

            {/* Outer gear body */}
            <circle cx="80" cy="80" r="48" fill="none" stroke="url(#gear-grad)" strokeWidth="2" />

            {/* Gear Teeth (Vector representation) */}
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle) => {
              const rad = (angle * Math.PI) / 180;
              const x1 = 80 + Math.cos(rad) * 48;
              const y1 = 80 + Math.sin(rad) * 48;
              const x2 = 80 + Math.cos(rad) * 58;
              const y2 = 80 + Math.sin(rad) * 58;
              const wX1 = 80 + Math.cos(rad - 0.08) * 48;
              const wY1 = 80 + Math.sin(rad - 0.08) * 48;
              const wX2 = 80 + Math.cos(rad + 0.08) * 48;
              const wY2 = 80 + Math.sin(rad + 0.08) * 48;

              return (
                <g key={angle}>
                  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#a855f7" strokeWidth="1.5" />
                  <line x1={x2 - Math.sin(rad)*3} y1={y2 + Math.cos(rad)*3} x2={x2 + Math.sin(rad)*3} y2={y2 - Math.cos(rad)*3} stroke="#ec4899" strokeWidth="1" />
                </g>
              );
            })}
          </motion.svg>
        </motion.div>

        {/* 6. BOTTOM-RIGHT: Glowing Cybernetic Code Nodes */}
        <motion.div 
          className="absolute bottom-[12%] right-[5%] w-40 h-37.5 opacity-35 xl:opacity-55 hidden md:block"
          animate={{ y: [0, 10, 0], x: [0, 2, 0], rotate: [0, -3, 0] }}
          transition={floatTransition(8.5, 1.2)}
        >
          <svg viewBox="0 0 160 160" className="w-full h-full filter drop-shadow-[0_0_12px_rgba(99,102,241,0.2)]">
            {/* Isometric nodes connected by lines */}
            {/* Node 1 (Center Top) */}
            <g transform="translate(80, 40)">
              <path d="M 0,-10 L 15,0 L 0,10 L -15,0 Z" fill="rgba(99, 102, 241, 0.2)" stroke="#6366f1" strokeWidth="1.5" />
              <line x1="0" y1="10" x2="0" y2="25" stroke="#6366f1" strokeWidth="1" strokeDasharray="2 2" />
            </g>

            {/* Node 2 (Left Bottom) */}
            <g transform="translate(40, 90)">
              <path d="M 0,-10 L 15,0 L 0,10 L -15,0 Z" fill="rgba(56, 189, 248, 0.15)" stroke="#38bdf8" strokeWidth="1.5" />
            </g>

            {/* Node 3 (Right Bottom) */}
            <g transform="translate(120, 90)">
              <path d="M 0,-10 L 15,0 L 0,10 L -15,0 Z" fill="rgba(168, 85, 247, 0.15)" stroke="#a855f7" strokeWidth="1.5" />
            </g>

            {/* Connections */}
            {/* Top Node to Left Node */}
            <path d="M 80,40 L 40,90" fill="none" stroke="#6366f1" strokeWidth="1" />
            {/* Top Node to Right Node */}
            <path d="M 80,40 L 120,90" fill="none" stroke="#6366f1" strokeWidth="1" />
            {/* Left Node to Right Node */}
            <path d="M 40,90 L 120,90" fill="none" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3 3" />

            {/* Glowing floating code tags inside isometrics */}
            <text x="40" y="120" fill="#38bdf8" fontSize="8" fontFamily="monospace" textAnchor="middle">&lt;manifest&gt;</text>
            <text x="120" y="120" fill="#a855f7" fontSize="8" fontFamily="monospace" textAnchor="middle">v3_compliant</text>
            <text x="80" y="20" fill="#6366f1" fontSize="8" fontFamily="monospace" textAnchor="middle">compile_ai</text>
          </svg>
        </motion.div>
      </div>
    </div>
  );
}
