import React, { useState, useEffect } from 'react';
import { Shield, AlertOctagon, Activity, Users, Database, ServerCrash, CheckCircle2, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';

export default function AdminDashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState({
    activeUsers: 0,
    totalGenerations: 0,
    blockedThreats: 0,
    apiErrors: 0
  });
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, [token]);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setAlerts(data.alerts);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resolveAlert = async (id) => {
    try {
      const res = await fetch(`${API_URL}/admin/alerts/${id}/resolve`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setAlerts(alerts.filter(a => a.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-7xl px-4 md:px-6 py-32 flex justify-center items-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <section className="w-full max-w-7xl px-4 md:px-6 py-12 border-t border-white/5 bg-red-950/5 rounded-3xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-red-500/10 text-red-400">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-3xl font-bold">Security & Admin Portal</h2>
            <p className="text-gray-400">Platform monitoring, threat detection and system health</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-surface p-2 rounded-lg border border-white/5">
          <span className="flex items-center gap-2 text-sm px-3 py-1 bg-green-500/10 text-green-400 rounded-md">
            <Activity className="w-4 h-4" /> System Healthy
          </span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="glass-panel p-5 rounded-xl border border-white/5 flex flex-col">
          <span className="text-gray-400 text-sm flex items-center gap-2 mb-2"><Users className="w-4 h-4"/> Active Users</span>
          <span className="text-3xl font-bold">{stats.activeUsers.toLocaleString()}</span>
        </div>
        <div className="glass-panel p-5 rounded-xl border border-white/5 flex flex-col">
          <span className="text-gray-400 text-sm flex items-center gap-2 mb-2"><Database className="w-4 h-4"/> Generations</span>
          <span className="text-3xl font-bold">{stats.totalGenerations.toLocaleString()}</span>
        </div>
        <div className="glass-panel p-5 rounded-xl border border-white/5 flex flex-col">
          <span className="text-gray-400 text-sm flex items-center gap-2 mb-2"><AlertOctagon className="w-4 h-4 text-red-400"/> Blocked Threats</span>
          <span className="text-3xl font-bold text-red-400">{stats.blockedThreats.toLocaleString()}</span>
        </div>
        <div className="glass-panel p-5 rounded-xl border border-white/5 flex flex-col">
          <span className="text-gray-400 text-sm flex items-center gap-2 mb-2"><ServerCrash className="w-4 h-4 text-yellow-400"/> API Errors</span>
          <span className="text-3xl font-bold text-yellow-400">{stats.apiErrors}%</span>
        </div>
      </div>
      <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden">
        <div className="p-5 border-b border-white/5 bg-surface/30">
          <h3 className="font-semibold flex items-center gap-2">Active Security Alerts</h3>
        </div>
        <div className="divide-y divide-white/5">
          {alerts.length === 0 ? (
            <div className="p-8 text-center text-gray-500 flex flex-col items-center">
              <CheckCircle2 className="w-8 h-8 text-green-400 mb-2 opacity-50" />
              <span>No active alerts. All systems secure.</span>
            </div>
          ) : alerts.map((alert) => (
            <div key={alert.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/10 transition-colors">
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-lg mt-1 shrink-0 ${alert.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400' : alert.severity === 'HIGH' ? 'bg-orange-500/20 text-orange-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                  <AlertOctagon className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-white">{alert.type}</span>
                    <span className="text-xs bg-white/10 px-2 py-0.5 rounded text-gray-300">{alert.user}</span>
                    <span className="text-xs text-gray-500">{new Date(alert.time).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-sm text-gray-400">{alert.details}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 md:shrink-0 pl-14 md:pl-0">
                <button className="text-xs bg-surface hover:bg-white/10 px-3 py-2 rounded-lg transition-colors border border-white/5 cursor-pointer">
                  View Logs
                </button>
                <button onClick={() => resolveAlert(alert.id)}
                  className="text-xs bg-green-500/10 hover:bg-green-500/20 text-green-400 px-3 py-2 rounded-lg transition-colors border border-green-500/20 cursor-pointer">
                  Resolve
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
