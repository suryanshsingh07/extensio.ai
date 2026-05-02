import React from 'react';
import { LineChart, TrendingUp, Users, CreditCard, Activity, ArrowUpRight } from 'lucide-react';

export default function LaunchDashboard() {
  const kpis = [
    { label: 'Total MRR', value: '₹12,450', growth: '+14%', icon: <CreditCard className="w-5 h-5" />, color: 'green' },
    { label: 'Active Users', value: '3,204', growth: '+8%', icon: <Users className="w-5 h-5" />, color: 'blue' },
    { label: 'Total Apps Built', value: '18,992', growth: '+24%', icon: <LineChart className="w-5 h-5" />, color: 'purple' },
    { label: 'System Uptime', value: '99.99%', growth: 'Stable', icon: <Activity className="w-5 h-5" />, color: 'primary' }
  ];

  return (
    <section className="w-full max-w-7xl px-4 md:px-6 py-12 border-t border-white/5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-primary" /> Executive Launch Board
          </h2>
          <p className="text-gray-400 mt-2">Post-launch growth, revenue and platform health metrics</p>
        </div>
        <div className="bg-green-500/10 text-green-400 border border-green-500/20 px-4 py-2 rounded-lg font-medium flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" /> Platform is Live
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="glass-panel p-6 rounded-2xl border border-white/5 relative overflow-hidden group hover:border-white/10 transition-colors">
            <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 ${kpi.color === 'primary' ? 'bg-primary/10' : kpi.color === 'green' ? 'bg-green-500/10' : kpi.color === 'blue' ? 'bg-blue-500/10' : 'bg-purple-500/10'}`} />
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${kpi.color === 'primary' ? 'bg-primary/10 text-primary' : kpi.color === 'green' ? 'bg-green-500/10 text-green-400' : kpi.color === 'blue' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'}`}>
              {kpi.icon}
            </div>
            <h3 className="text-gray-400 text-sm font-medium mb-1">{kpi.label}</h3>
            <div className="flex items-end gap-3">
              <span className="text-3xl font-bold">{kpi.value}</span>
              <span className={`text-xs font-medium mb-1 flex items-center ${kpi.growth === 'Stable' ? 'text-gray-400' : 'text-green-400'}`}>
                {kpi.growth !== 'Stable' && <ArrowUpRight className="w-3 h-3 mr-0.5" />} {kpi.growth}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-white/5 h-80 flex flex-col">
          <h3 className="font-semibold mb-6">User Acquisition & Generation Volume</h3>
          <div className="flex-1 w-full bg-surface/30 rounded-xl border border-white/5 flex items-center justify-center relative overflow-hidden">
            {/* Mock Chart Visualization */}
            <div className="absolute bottom-0 left-0 w-full h-[60%] bg-linear-to-t from-primary/20 to-transparent" />
            <svg className="absolute bottom-0 w-full h-[60%]" preserveAspectRatio="none" viewBox="0 0 100 100">
              <path d="M0,100 L0,50 Q25,80 50,40 T100,20 L100,100 Z" fill="rgba(99, 102, 241, 0.4)" />
              <path d="M0,50 Q25,80 50,40 T100,20" fill="none" stroke="#6366F1" strokeWidth="2" />
            </svg>
            <span className="text-gray-500 font-mono text-sm z-10">Chart rendering engine connected</span>
          </div>
        </div>
        <div className="glass-panel p-6 rounded-2xl border border-white/5 h-80 flex flex-col">
          <h3 className="font-semibold mb-6">Subscription Distribution</h3>
          <div className="flex-1 flex flex-col justify-center gap-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-300">Free Tier</span>
                <span className="text-gray-400">65%</span>
              </div>
              <div className="w-full h-2 bg-surface rounded-full overflow-hidden">
                <div className="h-full bg-gray-500 w-[65%]" />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-white font-medium">Professional</span>
                <span className="text-primary font-medium">28%</span>
              </div>
              <div className="w-full h-2 bg-surface rounded-full overflow-hidden">
                <div className="h-full bg-primary w-[28%]" />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-white font-medium">Enterprise</span>
                <span className="text-green-400 font-medium">7%</span>
              </div>
              <div className="w-full h-2 bg-surface rounded-full overflow-hidden">
                <div className="h-full bg-green-400 w-[7%]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
