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
    <section 
      style={{ 
        borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
        backgroundColor: isDark ? 'rgba(69, 10, 10, 0.05)' : 'rgba(249, 250, 251, 0.5)'
      }}
      className="w-full max-w-7xl px-4 md:px-6 py-12 border-t rounded-3xl transition-colors duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-red-500/10 text-red-400">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h2 style={{ color: isDark ? '#ffffff' : '#111827' }} className="text-3xl font-bold transition-colors duration-500">Security & Admin Portal</h2>
            <p style={{ color: isDark ? '#9ca3af' : '#4b5563' }} className="transition-colors duration-500">Platform monitoring, threat detection and system health</p>
          </div>
        </div>
        <div 
          style={{ 
            backgroundColor: isDark ? 'rgba(0, 0, 0, 0.4)' : '#ffffff',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.1)'
          }}
          className="flex items-center gap-3 p-2 rounded-lg border transition-colors duration-500">
          <span className={`flex items-center gap-2 text-sm px-3 py-1 bg-green-500/10 ${isDark ? 'text-green-400' : 'text-green-600'} rounded-md`}>
            <Activity className="w-4 h-4" /> System Healthy
          </span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Active Users', value: stats.activeUsers.toLocaleString(), icon: Users, color: 'gray' },
          { label: 'Generations', value: stats.totalGenerations.toLocaleString(), icon: Database, color: 'gray' },
          { label: 'Blocked Threats', value: stats.blockedThreats.toLocaleString(), icon: AlertOctagon, color: 'red' },
          { label: 'API Errors', value: `${stats.apiErrors}%`, icon: ServerCrash, color: 'yellow' }
        ].map((item, idx) => (
          <div key={idx}
            style={{ 
              backgroundColor: isDark ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.4)',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.1)'
            }}
            className="glass-panel p-5 rounded-xl border flex flex-col transition-colors duration-500">
            <span style={{ color: isDark ? '#9ca3af' : '#6b7280' }} className="text-sm flex items-center gap-2 mb-2 transition-colors duration-500">
              <item.icon className={`w-4 h-4 ${item.color === 'red' ? 'text-red-400' : item.color === 'yellow' ? 'text-yellow-400' : ''}`}/> {item.label}
            </span>
            <span style={{ color: isDark ? (item.color === 'red' ? '#f87171' : item.color === 'yellow' ? '#facc15' : '#ffffff') : (item.color === 'red' ? '#b91c1c' : item.color === 'yellow' ? '#a16207' : '#111827') }} className="text-3xl font-bold transition-colors duration-500">{item.value}</span>
          </div>
        ))}
      </div>
      <div 
        style={{ 
          backgroundColor: isDark ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.4)',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.1)'
        }}
        className="glass-panel rounded-2xl border overflow-hidden transition-colors duration-500">
        <div 
          style={{ 
            borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
            backgroundColor: isDark ? 'rgba(17, 17, 17, 0.3)' : 'rgba(243, 244, 246, 0.3)'
          }}
          className="p-5 border-b transition-colors duration-500">
          <h3 style={{ color: isDark ? '#ffffff' : '#111827' }} className="font-semibold flex items-center gap-2 transition-colors duration-500">Active Security Alerts</h3>
        </div>
        <div style={{ borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' }} className="divide-y transition-colors duration-500">
          {alerts.length === 0 ? (
            <div className="p-8 text-center text-gray-500 flex flex-col items-center">
              <CheckCircle2 className="w-8 h-8 text-green-400 mb-2 opacity-50" />
              <span style={{ color: isDark ? '#9ca3af' : '#6b7280' }} className="transition-colors duration-500">No active alerts. All systems secure.</span>
            </div>
          ) : alerts.map((alert) => (
            <div key={alert.id} 
              className={`p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${isDark ? 'hover:bg-white/5' : 'hover:bg-black/5'}`}>
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-lg mt-1 shrink-0 ${alert.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400' : alert.severity === 'HIGH' ? 'bg-orange-500/20 text-orange-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                  <AlertOctagon className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span style={{ color: isDark ? '#ffffff' : '#111827' }} className="font-semibold transition-colors duration-500">{alert.type}</span>
                    <span style={{ backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)', color: isDark ? '#d1d5db' : '#4b5563' }} className="text-xs px-2 py-0.5 rounded transition-colors duration-500">{alert.user}</span>
                    <span style={{ color: isDark ? '#6b7280' : '#9ca3af' }} className="text-xs transition-colors duration-500">{new Date(alert.time).toLocaleTimeString()}</span>
                  </div>
                  <p style={{ color: isDark ? '#9ca3af' : '#4b5563' }} className="text-sm transition-colors duration-500">{alert.details}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 md:shrink-0 pl-14 md:pl-0">
                <button 
                  style={{ 
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(243, 244, 246, 0.8)',
                    color: isDark ? '#d1d5db' : '#374151',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#000000'
                  }}
                  className="text-xs hover:bg-gray-200 dark:hover:bg-white/10 px-3 py-2 rounded-lg transition-colors border cursor-pointer transition-all duration-500">
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
