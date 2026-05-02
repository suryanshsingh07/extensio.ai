import React, { useState, useEffect } from 'react';
import { Cpu, Zap, Database, Server, RefreshCw } from 'lucide-react';

export default function OptimizationMetrics() {
  const [metrics, setMetrics] = useState({
    apiLatency: 42, 
    cacheHitRate: 86,
    activeWorkers: 14,
    dbQueryTime: 12
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        apiLatency: Math.max(20, Math.min(100, prev.apiLatency + (Math.random() * 10 - 5))),
        cacheHitRate: Math.max(60, Math.min(99, prev.cacheHitRate + (Math.random() * 4 - 2))),
        activeWorkers: Math.floor(Math.random() * 5) + 12,
        dbQueryTime: Math.max(5, Math.min(30, prev.dbQueryTime + (Math.random() * 4 - 2)))
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="w-full max-w-7xl px-4 md:px-6 py-12 mt-12 border-t border-white/5 mb-16">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-3xl font-bold">Scaling & Performance</h2>
            <p className="text-gray-400">Real-time optimization metrics and background worker status</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400 bg-surface px-4 py-2 rounded-lg border border-white/5">
          <RefreshCw className="w-4 h-4 animate-spin text-primary" /> Live Updates Active
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-xl border border-white/5 flex flex-col justify-between h-32 relative overflow-hidden group hover:border-blue-500/30 transition-all">
          <div className="absolute right-0 top-0 w-24 h-24 bg-blue-500/10 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2" />
          <span className="text-gray-400 text-sm flex items-center gap-2"><Server className="w-4 h-4"/> API Latency</span>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-white">{metrics.apiLatency.toFixed(0)}</span>
            <span className="text-gray-500 text-sm">ms</span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-xl border border-white/5 flex flex-col justify-between h-32 relative overflow-hidden group hover:border-purple-500/30 transition-all">
          <div className="absolute right-0 top-0 w-24 h-24 bg-purple-500/10 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2" />
          <span className="text-gray-400 text-sm flex items-center gap-2"><Database className="w-4 h-4"/> DB Query Time</span>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-white">{metrics.dbQueryTime.toFixed(0)}</span>
            <span className="text-gray-500 text-sm">ms</span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-xl border border-white/5 flex flex-col justify-between h-32 relative overflow-hidden group hover:border-green-500/30 transition-all">
          <div className="absolute right-0 top-0 w-24 h-24 bg-green-500/10 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2" />
          <span className="text-gray-400 text-sm flex items-center gap-2"><Zap className="w-4 h-4"/> Cache Hit Rate</span>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-white">{metrics.cacheHitRate.toFixed(1)}</span>
            <span className="text-gray-500 text-sm">%</span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-xl border border-white/5 flex flex-col justify-between h-32 relative overflow-hidden group hover:border-orange-500/30 transition-all">
          <div className="absolute right-0 top-0 w-24 h-24 bg-orange-500/10 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2" />
          <span className="text-gray-400 text-sm flex items-center gap-2"><Cpu className="w-4 h-4"/> Active BG Workers</span>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-white">{metrics.activeWorkers}</span>
            <span className="text-gray-500 text-sm">jobs</span>
          </div>
        </div>
      </div>
    </section>
  );
}
