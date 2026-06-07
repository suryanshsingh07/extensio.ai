import React, { useState, useEffect } from 'react';
import { Sparkles, Zap, BrainCircuit, Building } from 'lucide-react';
import OptimizationMetrics from './OptimizationMetrics';
import EvolutionDashboard from './EvolutionDashboard';
import EnterpriseDashboard from './EnterpriseDashboard';

export default function EngineInsights() {
  const [activeTab, setActiveTab] = useState('performance');

  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });

  useEffect(() => {
    const handleThemeEvent = (e) => setIsDark(e.detail);
    window.addEventListener('theme-changed', handleThemeEvent);
    return () => window.removeEventListener('theme-changed', handleThemeEvent);
  }, []);

  const tabs = [
    { id: 'performance', label: 'Performance & Scaling', icon: <Zap className="w-4 h-4" /> },
    { id: 'strategic', label: 'Strategic AI Insights', icon: <BrainCircuit className="w-4 h-4" /> },
    { id: 'enterprise', label: 'Team Workspace', icon: <Building className="w-4 h-4" /> },
  ];

  return (
    <div className="w-full py-10 flex flex-col items-center">
      {/* Premium Page Header */}
      <div className="w-full text-center mb-12 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-linear-to-r from-primary/10 to-secondary/10 rounded-full blur-[100px] pointer-events-none" />
        <div 
          style={{ 
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(99, 102, 241, 0.1)', 
            borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(99, 102, 241, 0.2)' 
          }}
          className="inline-flex items-center gap-2 px-3 py-1 border rounded-full text-xs font-semibold text-primary tracking-wide uppercase mb-4 animate-pulse transition-colors duration-500">
          <Sparkles className="w-3.5 h-3.5" /> Premium Analytics Engine
        </div>
        <h1 className={`text-4xl sm:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-linear-to-r transition-all duration-500 ${
          isDark ? 'from-white via-indigo-200 to-primary' : 'from-gray-900 via-indigo-600 to-primary'
        }`}>
          Engine Insights
        </h1>
        <p style={{ color: isDark ? '#9ca3af' : '#111827' }} className="mt-4 text-base sm:text-lg max-w-2xl mx-auto transition-colors duration-500">
          Deep-dive telemetry, autonomous AI agent updates, and organization workspace monitoring.
        </p>
      </div>

      {/* Tabs Menu */}
      <div className="w-full flex justify-center mb-8">
        <div 
          style={{ 
            backgroundColor: isDark ? 'rgba(17, 17, 17, 0.5)' : '#ffffff', 
            borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.15)' 
          }}
          className="flex border p-1.5 rounded-2xl gap-1 transition-all duration-500 shadow-sm">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={!isActive ? { color: isDark ? '#9ca3af' : '#1f2937' } : {}}
                className={`flex items-center gap-2 px-4 sm:px-6 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 cursor-pointer ${
                  isActive
                    ? 'bg-linear-to-r from-primary to-secondary text-white shadow-lg'
                    : isDark ? 'hover:text-white hover:bg-white/5' : 'hover:text-black hover:bg-black/5'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Contents */}
      <div className="w-full transition-opacity duration-300">
        {activeTab === 'performance' && (
          <div className="animate-fadeIn">
            <OptimizationMetrics />
          </div>
        )}
        {activeTab === 'strategic' && (
          <div className="animate-fadeIn">
            <EvolutionDashboard />
          </div>
        )}
        {activeTab === 'enterprise' && (
          <div className="animate-fadeIn">
            <EnterpriseDashboard />
          </div>
        )}
      </div>
    </div>
  );
}
