import React, { useState, useEffect } from 'react';
import { LineChart, TrendingUp, Users, CreditCard, Activity, ArrowUpRight } from 'lucide-react';

export default function LaunchDashboard() {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });

  useEffect(() => {
    const handleThemeEvent = (e) => setIsDark(e.detail);
    window.addEventListener('theme-changed', handleThemeEvent);
    return () => window.removeEventListener('theme-changed', handleThemeEvent);
  }, []);

  const kpis = [
    { label: 'Total MRR', value: '₹12,450', growth: '+14%', icon: <CreditCard className="w-5 h-5" />, color: 'green' },
    { label: 'Active Users', value: '3,204', growth: '+8%', icon: <Users className="w-5 h-5" />, color: 'blue' },
    { label: 'Total Apps Built', value: '18,992', growth: '+24%', icon: <LineChart className="w-5 h-5" />, color: 'purple' },
    { label: 'System Uptime', value: '99.99%', growth: 'Stable', icon: <Activity className="w-5 h-5" />, color: 'primary' }
  ];

  return (
    <section 
      style={{ borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' }}
      className="w-full max-w-7xl px-4 md:px-6 py-12 border-t transition-colors duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
        <div>
          <h2 style={{ color: isDark ? '#ffffff' : '#111827' }} className="text-3xl font-bold flex items-center gap-3 transition-colors duration-500">
            <TrendingUp className="w-8 h-8 text-primary" /> Executive Launch Board
          </h2>
          <p style={{ color: isDark ? '#9ca3af' : '#4b5563' }} className="mt-2 transition-colors duration-500">Post-launch growth, revenue and platform health metrics</p>
        </div>
        <div 
          style={{ 
            backgroundColor: isDark ? 'rgba(34, 197, 94, 0.1)' : 'rgba(22, 163, 74, 0.1)',
            borderColor: isDark ? 'rgba(34, 197, 94, 0.2)' : 'rgba(22, 163, 74, 0.2)',
            color: isDark ? '#4ade80' : '#16a34a'
          }}
          className="px-4 py-2 rounded-lg font-medium flex items-center gap-2 border transition-colors duration-500">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" /> Platform is Live
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpis.map((kpi, idx) => (
          <div key={idx} 
            style={{ 
              backgroundColor: isDark ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.4)',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
            }}
            className="glass-panel p-6 rounded-2xl border relative overflow-hidden group hover:border-primary/30 transition-all duration-500">
            <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 ${kpi.color === 'primary' ? 'bg-primary/10' : kpi.color === 'green' ? 'bg-green-500/10' : kpi.color === 'blue' ? 'bg-blue-500/10' : 'bg-purple-500/10'}`} />
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${kpi.color === 'primary' ? 'bg-primary/10 text-primary' : kpi.color === 'green' ? 'bg-green-500/10 text-green-400' : kpi.color === 'blue' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'}`}>
              {kpi.icon}
            </div>
            <h3 style={{ color: isDark ? '#9ca3af' : '#6b7280' }} className="text-sm font-medium mb-1 transition-colors duration-500">{kpi.label}</h3>
            <div className="flex items-end gap-3">
              <span style={{ color: isDark ? '#ffffff' : '#111827' }} className="text-3xl font-bold transition-colors duration-500">{kpi.value}</span>
              <span className={`text-xs font-medium mb-1 flex items-center ${kpi.growth === 'Stable' ? (isDark ? 'text-gray-400' : 'text-gray-500') : 'text-green-500'}`}>
                {kpi.growth !== 'Stable' && <ArrowUpRight className="w-3 h-3 mr-0.5" />} {kpi.growth}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div 
          style={{ 
            backgroundColor: isDark ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.4)',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
          }}
          className="lg:col-span-2 glass-panel p-6 rounded-2xl border h-80 flex flex-col transition-colors duration-500">
          <h3 style={{ color: isDark ? '#ffffff' : '#111827' }} className="font-semibold mb-6 transition-colors duration-500">User Acquisition & Generation Volume</h3>
          <div 
            style={{ 
              backgroundColor: isDark ? 'rgba(17, 17, 17, 0.3)' : 'rgba(243, 244, 246, 0.3)',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'
            }}
            className="flex-1 w-full rounded-xl border flex items-center justify-center relative overflow-hidden transition-colors duration-500">
            {/* Mock Chart Visualization */}
            <div className="absolute bottom-0 left-0 w-full h-[60%] bg-linear-to-t from-primary/20 to-transparent" />
            <svg className="absolute bottom-0 w-full h-[60%]" preserveAspectRatio="none" viewBox="0 0 100 100">
              <path d="M0,100 L0,50 Q25,80 50,40 T100,20 L100,100 Z" fill="rgba(99, 102, 241, 0.4)" />
              <path d="M0,50 Q25,80 50,40 T100,20" fill="none" stroke="#6366F1" strokeWidth="2" />
            </svg>
            <span style={{ color: isDark ? '#6b7280' : '#9ca3af' }} className="font-mono text-sm z-10 transition-colors duration-500">Chart rendering engine connected</span>
          </div>
        </div>
        <div 
          style={{ 
            backgroundColor: isDark ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.4)',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
          }}
          className="glass-panel p-6 rounded-2xl border h-80 flex flex-col transition-colors duration-500">
          <h3 style={{ color: isDark ? '#ffffff' : '#111827' }} className="font-semibold mb-6 transition-colors duration-500">Subscription Distribution</h3>
          <div className="flex-1 flex flex-col justify-center gap-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span style={{ color: isDark ? '#d1d5db' : '#4b5563' }} className="transition-colors duration-500">Free Tier</span>
                <span style={{ color: isDark ? '#9ca3af' : '#6b7280' }} className="transition-colors duration-500">65%</span>
              </div>
              <div style={{ backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)' }} className="w-full h-2 rounded-full overflow-hidden transition-colors duration-500">
                <div className="h-full bg-gray-500 w-[65%]" />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span style={{ color: isDark ? '#ffffff' : '#111827' }} className="font-medium transition-colors duration-500">Professional</span>
                <span className="text-primary font-medium">28%</span>
              </div>
              <div style={{ backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)' }} className="w-full h-2 rounded-full overflow-hidden transition-colors duration-500">
                <div className="h-full bg-primary w-[28%]" />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span style={{ color: isDark ? '#ffffff' : '#111827' }} className="font-medium transition-colors duration-500">Enterprise</span>
                <span className="text-green-400 font-medium">7%</span>
              </div>
              <div style={{ backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)' }} className="w-full h-2 rounded-full overflow-hidden transition-colors duration-500">
                <div className="h-full bg-green-400 w-[7%]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
