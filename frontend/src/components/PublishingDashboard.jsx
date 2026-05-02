import React, { useState } from 'react';
import { Rocket, Globe, DownloadCloud, Activity, CheckCircle, RefreshCw, Archive } from 'lucide-react';

export default function PublishingDashboard() {
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployments] = useState([
    { id: 'dep-03', version: 3, type: 'extension', status: 'Live', date: 'Just now', link: '/downloads/v3.zip' },
    { id: 'dep-02', version: 2, type: 'extension', status: 'Archived', date: '2 days ago', link: '/downloads/v2.zip' },
    { id: 'dep-01', version: 1, type: 'extension', status: 'Archived', date: '1 week ago', link: '/downloads/v1.zip' },
  ]);

  const handlePublish = () => {
    setIsDeploying(true);
    setTimeout(() => setIsDeploying(false), 3000);
  };

  return (
    <section className="w-full max-w-7xl px-4 md:px-6 py-12 mt-12 border-t border-white/5 mb-24" id="publishing">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            <Rocket className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold">Deployment & Publishing</h2>
            <p className="text-gray-400 text-sm sm:text-base">Launch your generated applications to the world instantly.</p>
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
        <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-white/5 lg:col-span-1 h-fit">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-gray-400" /> Active Environments
          </h3>
          
          <div className="space-y-4">
            <div className="bg-surface/50 p-4 rounded-xl border border-white/5">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <DownloadCloud className="w-4 h-4 text-purple-400" />
                  <span className="font-medium text-sm sm:text-base">Chrome Store Build</span>
                </div>
                <span className="flex items-center gap-1 text-green-400 text-xs bg-green-500/10 px-2 py-0.5 rounded-full">
                  <CheckCircle className="w-3 h-3" /> Ready
                </span>
              </div>
              <p className="text-xs text-gray-400 font-mono">v3.0.0 (Production ZIP)</p>
            </div>

            <div className="bg-surface/50 p-4 rounded-xl border border-white/5 opacity-50">
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
        <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-white/5 lg:col-span-2">
          <h3 className="text-lg font-semibold mb-6">Release History</h3>
          <div className="space-y-4">
            {deployments.map((dep) => (
              <div key={dep.id} className="flex items-start gap-4 p-4 rounded-xl bg-surface/30 border border-white/5 hover:border-primary/30 transition-colors">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-white/10 bg-surface text-gray-400 shrink-0">
                  {dep.status === 'Live' ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Archive className="w-4 h-4" />}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1 gap-2">
                    <span className="font-bold text-primary">Version {dep.version}.0</span>
                    <span className="text-xs text-gray-400 shrink-0">{dep.date}</span>
                  </div>
                  <div className="text-sm text-gray-300 mb-3">Published production-ready ZIP archive.</div>
                  <button className="text-xs bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded flex items-center gap-1 transition-colors cursor-pointer">
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
