import React, { useState, useEffect } from 'react';
import { BrainCircuit, Cpu, Lightbulb, ArrowRight, Activity, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const COLOR_MAP = {
  blue: {
    badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  },
  purple: {
    badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  },
  green: {
    badge: 'bg-green-500/10 text-green-400 border-green-500/20',
  },
};

export default function EvolutionDashboard() {
  const navigate = useNavigate();

  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });

  useEffect(() => {
    const handleThemeEvent = (e) => setIsDark(e.detail);
    window.addEventListener('theme-changed', handleThemeEvent);
    return () => window.removeEventListener('theme-changed', handleThemeEvent);
  }, []);

  const [insights] = useState([
    { 
      id: 1, 
      type: 'TREND_PREDICTION', 
      title: 'Surge in Web Scraper Demand', 
      desc: '40% of recent prompts request DOM extraction. Recommend creating dedicated scraping templates',
      confidence: 94,
      color: 'blue'
    },
    { 
      id: 2, 
      type: 'TEMPLATE_RECOMMENDATION', 
      title: 'Optimize Manifest V3 Messaging', 
      desc: 'Found a 12% failure rate in background.js generation. Ai suggests updating the core prompt to explicitly define service worker communication',
      confidence: 88,
      color: 'purple'
    },
    { 
      id: 3, 
      type: 'PRICING_OPTIMIZATION', 
      title: 'High Enterprise Upgrade Intent', 
      desc: 'Frequent "Seat Limit Reached" errors in mid-sized teams. Recommend introducing an intermediate "Agency" tier at ₹299/mon',
      confidence: 82,
      color: 'green'
    }
  ]);

  return (
    <section 
      style={{ borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' }}
      className="w-full max-w-7xl px-4 md:px-6 py-12 border-t mx-auto transition-colors duration-500" id="evolution">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
        <div>
          <h2 style={{ color: isDark ? '#ffffff' : '#111827' }} className="text-2xl sm:text-3xl font-bold flex items-center gap-3 transition-colors duration-500">
            <BrainCircuit className="w-7 h-7 sm:w-8 sm:h-8 text-primary" /> Autonomous Evolution
          </h2>
          <p style={{ color: isDark ? '#9ca3af' : '#374151' }} className="mt-2 text-sm sm:text-base transition-colors duration-500">Ai-driven strategic intelligence, market trend predictions and platform self-optimization</p>
        </div>
        <div 
          style={{ 
            backgroundColor: isDark ? 'rgba(17, 17, 17, 0.5)' : 'rgba(243, 244, 246, 0.5)', 
            borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)', 
            color: isDark ? '#d1d5db' : '#374151' 
          }}
          className="border px-3 sm:px-4 py-2 rounded-lg font-medium flex items-center gap-2 text-xs sm:text-sm transition-all duration-500">
          <Activity className="w-4 h-4 text-primary" /> Core Intelligence: Online
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">     
        {/* Left Column: Platform Autonomous Actions */}
        <div className="lg:col-span-1 space-y-6">
          <div 
            style={{ backgroundColor: isDark ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.4)', borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }}
            className="glass-panel p-5 sm:p-6 rounded-2xl border bg-linear-to-br from-surface to-background relative overflow-hidden transition-all duration-500">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <h3 style={{ color: isDark ? '#ffffff' : '#111827' }} className="font-semibold mb-4 text-lg flex items-center gap-2 relative z-10 transition-colors duration-500">
              <Cpu className="w-5 h-5 text-primary" /> System Auto-Refinement
            </h3>
            <p style={{ color: isDark ? '#9ca3af' : '#4b5563' }} className="text-sm mb-6 relative z-10 transition-colors duration-500">
              Extensio.ai actively learns from generation failures to patch its own core prompts and templates without human intervention
            </p>
            <div className="space-y-4 relative z-10">
              <div 
                style={{ backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)', borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' }}
                className="p-4 rounded-xl border border-l-2 border-l-green-500 transition-colors duration-500">
                <div className="flex items-center justify-between mb-1 gap-2">
                  <span style={{ color: isDark ? '#ffffff' : '#111827' }} className="text-sm font-medium transition-colors duration-500">Auto-Patched Template</span>
                  <span style={{ color: isDark ? '#6b7280' : '#9ca3af' }} className="text-xs shrink-0 transition-colors duration-500">2 hours ago</span>
                </div>
                <p style={{ color: isDark ? '#9ca3af' : '#4b5563' }} className="text-xs transition-colors duration-500">Injected strict CSP rules into Manifest generation to prevent Chrome Store rejections</p>
              </div>
              <div 
                style={{ backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)', borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' }}
                className="p-4 rounded-xl border border-l-2 border-l-blue-500 transition-colors duration-500">
                <div className="flex items-center justify-between mb-1 gap-2">
                  <span style={{ color: isDark ? '#ffffff' : '#111827' }} className="text-sm font-medium transition-colors duration-500">LLM Context Optimized</span>
                  <span style={{ color: isDark ? '#6b7280' : '#9ca3af' }} className="text-xs shrink-0 transition-colors duration-500">Yesterday</span>
                </div>
                <p style={{ color: isDark ? '#9ca3af' : '#4b5563' }} className="text-xs transition-colors duration-500">Reduced token usage by 15% by abstracting common React UI components into a shared system library</p>
              </div>
            </div>
          </div>
        </div>
        {/* Right Column: AI Strategic Insights */}
        <div 
          style={{ backgroundColor: isDark ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.4)', borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }}
          className="lg:col-span-2 glass-panel p-5 sm:p-6 rounded-2xl border transition-all duration-500">
          <div className="flex justify-between items-center mb-6">
            <h3 style={{ color: isDark ? '#ffffff' : '#111827' }} className="font-semibold text-lg flex items-center gap-2 transition-colors duration-500">
              <Lightbulb className="w-5 h-5 text-yellow-400" /> Strategic Intelligence
            </h3>
            <span className="text-xs bg-yellow-500/10 text-yellow-400 px-2 py-1 rounded border border-yellow-500/20 flex items-center gap-1">
              <Zap className="w-3 h-3" /> Live
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map(insight => (
              <div key={insight.id} 
                style={{ backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)', borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' }}
                className="p-4 sm:p-5 rounded-xl border hover:bg-white/10 transition-all duration-500 flex flex-col h-full group">
                <div className="flex justify-between items-start mb-3">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border ${COLOR_MAP[insight.color]?.badge || ''}`}>
                    {insight.type.replaceAll('_', ' ')}
                  </span>
                  <div className="flex flex-col items-end">
                    <span style={{ color: isDark ? '#ffffff' : '#111827' }} className="text-lg font-bold transition-colors duration-500">{insight.confidence}%</span>
                    <span style={{ color: isDark ? '#6b7280' : '#9ca3af' }} className="text-[10px] transition-colors duration-500">Ai Confidence</span>
                  </div>
                </div>
                <h4 style={{ color: isDark ? '#ffffff' : '#111827' }} className="font-medium mb-2 transition-colors duration-500">{insight.title}</h4>
                <p style={{ color: isDark ? '#9ca3af' : '#4b5563' }} className="text-sm flex-1 mb-4 transition-colors duration-500">{insight.desc}</p>
                <button className="text-sm text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all w-fit mt-auto cursor-pointer" onClick={() => navigate('/contact')}>
                  Review & Apply <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
            {/* Loading next insight */}
            <div className="bg-surface/10 p-5 rounded-xl border border-white/5 border-dashed flex flex-col items-center justify-center text-center h-full min-h-200px">
              <div className="w-8 h-8 border-2 border-white/10 border-t-primary rounded-full animate-spin mb-3" />
              <span className="text-sm text-gray-400">Analyzing new market data . . .</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
