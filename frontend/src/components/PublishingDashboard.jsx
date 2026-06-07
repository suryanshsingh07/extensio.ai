import React, { useState, useEffect } from 'react';
import { Rocket, Globe, DownloadCloud, Activity, CheckCircle, RefreshCw, Archive } from 'lucide-react';

export default function PublishingDashboard() {
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployments] = useState([
    { id: 'dep-03', version: 3, type: 'extension', status: 'Live', date: 'Just now', link: '/downloads/v3.zip' },
    { id: 'dep-02', version: 2, type: 'extension', status: 'Archived', date: '2 days ago', link: '/downloads/v2.zip' },
    { id: 'dep-01', version: 1, type: 'extension', status: 'Archived', date: '1 week ago', link: '/downloads/v1.zip' },
  ]);

  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });

  useEffect(() => {
    const handleThemeEvent = (e) => setIsDark(e.detail);
    window.addEventListener('theme-changed', handleThemeEvent);
    return () => window.removeEventListener('theme-changed', handleThemeEvent);
  }, []);

  const handlePublish = () => {
    setIsDeploying(true);
    setTimeout(() => setIsDeploying(false), 3000);
  };

  return (
    <section 
      style={{ borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' }}
      className="w-full max-w-7xl px-4 md:px-6 py-12 mt-12 border-t mb-24 transition-colors duration-500" id="publishing">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            <Rocket className="w-6 h-6" />
          </div>
          <div>
            <h2 style={{ color: isDark ? '#ffffff' : '#111827' }} className="text-2xl sm:text-3xl font-bold transition-colors duration-500">Deployment & Publishing</h2>
            <p style={{ color: isDark ? '#9ca3af' : '#374151' }} className="text-sm sm:text-base transition-colors duration-500">Launch your generated applications to the world instantly.</p>
          </div>
        </div>
        <button 
          onClick={handlePublish}
          disabled={isDeploying}
          id="publish-btn"
          className={`bg-primary hover:bg-primary/90 text-white font-medium py-2.5 px-6 rounded-xl flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(99,102,241,0.4)] cursor-pointer ${isDeploying ? 'opacity-70 cursor-not-allowed' : ''}`}>
          {isDeploying ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Rocket className="w-5 h-5" />}
          {isDeploying ? 'Publishing...' : 'Publish Latest Version'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Environment Status */}
        <div 
          style={{ 
            backgroundColor: isDark ? 'rgba(0, 0, 0, 0.4)' : '#ffffff',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.2)'
          }}
          className="glass-panel p-5 sm:p-6 rounded-2xl border lg:col-span-1 h-fit transition-colors duration-500">
          <h3 style={{ color: isDark ? '#ffffff' : '#111827' }} className="text-lg font-semibold mb-6 flex items-center gap-2 transition-colors duration-500">
            <Activity className="w-5 h-5 text-gray-400" /> Active Environments
          </h3>
          
          <div className="space-y-4">
            <div 
              style={{ backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)', borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.15)' }}
              className="p-4 rounded-xl border transition-colors duration-500">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <DownloadCloud className="w-4 h-4 text-purple-400" />
                  <span className="font-medium text-sm sm:text-base">Chrome Store Build</span>
                </div>
                <span className="flex items-center gap-1 text-green-400 text-xs bg-green-500/10 px-2 py-0.5 rounded-full">
                  <CheckCircle className="w-3 h-3" /> Ready
                </span>
              </div>
              <p style={{ color: isDark ? '#9ca3af' : '#4b5563' }} className="text-xs font-mono transition-colors duration-500">v3.0.0 (Production ZIP)</p>
            </div>

            <div 
              style={{ backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.01)', borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' }}
              className="p-4 rounded-xl border opacity-50 transition-colors duration-500">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-400" />
                  <span className="font-medium text-sm sm:text-base">Web App Hosting</span>
                </div>
                <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">Not Configured</span>
              </div>
              <p className="text-xs text-gray-500">Coming soon for React/Next.js output</p>
            </div>
          </div>
        </div>

        {/* Release History */}
        <div 
          style={{ 
            backgroundColor: isDark ? 'rgba(0, 0, 0, 0.4)' : '#ffffff',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.2)'
          }}
          className="glass-panel p-5 sm:p-6 rounded-2xl border lg:col-span-2 transition-colors duration-500">
          <h3 style={{ color: isDark ? '#ffffff' : '#111827' }} className="text-lg font-semibold mb-6 transition-colors duration-500">Release History</h3>
          <div className="space-y-4">
            {deployments.map((dep) => (
              <div key={dep.id} 
                style={{ backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)', borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.1)' }}
                className="flex items-start gap-4 p-4 rounded-xl border hover:border-primary/30 transition-all duration-500">
                <div 
                  style={{ backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)', borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }}
                  className="flex items-center justify-center w-10 h-10 rounded-full border-2 text-gray-400 shrink-0">
                  {dep.status === 'Live' ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Archive className="w-4 h-4" />}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1 gap-2">
                    <span className="font-bold text-primary">Version {dep.version}.0</span>
                    <span style={{ color: isDark ? '#9ca3af' : '#4b5563' }} className="text-xs shrink-0 transition-colors duration-500">{dep.date}</span>
                  </div>
                  <div style={{ color: isDark ? '#d1d5db' : '#374151' }} className="text-sm mb-3 transition-colors duration-500">Published production-ready ZIP archive.</div>
                  <button 
                    style={{ 
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(243, 244, 246, 0.8)',
                      color: isDark ? '#d1d5db' : '#111827',
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#000000'
                    }}
                    className="text-xs hover:bg-gray-200 dark:hover:bg-white/10 px-3 py-1.5 rounded flex items-center gap-1 border transition-all duration-500 cursor-pointer">
                    <DownloadCloud className="w-3 h-3" /> Get Artifact
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
