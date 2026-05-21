import React, { useState } from 'react';
import { Sparkles, Zap, BrainCircuit, Building } from 'lucide-react';
import OptimizationMetrics from './OptimizationMetrics';
import EvolutionDashboard from './EvolutionDashboard';
import EnterpriseDashboard from './EnterpriseDashboard';

export default function EngineInsights() {
  const [activeTab, setActiveTab] = useState('performance');

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
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-semibold text-primary tracking-wide uppercase mb-4 animate-pulse">
          <Sparkles className="w-3.5 h-3.5" /> Premium Analytics Engine
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-white via-indigo-200 to-primary">
          Engine Insights
        </h1>
        <p className="mt-4 text-base sm:text-lg text-gray-400 max-w-2xl mx-auto">
          Deep-dive telemetry, autonomous AI agent updates, and organization workspace monitoring.
        </p>
      </div>

      {/* Tabs Menu */}
      <div className="w-full flex justify-center mb-8">
        <div className="flex bg-surface/50 border border-white/5 p-1.5 rounded-2xl gap-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 sm:px-6 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 cursor-pointer ${
                  isActive
                    ? 'bg-linear-to-r from-primary to-secondary text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
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
