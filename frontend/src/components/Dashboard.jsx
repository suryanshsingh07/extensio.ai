import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Folder, Clock, Download, Edit3, Plus, Terminal, Cpu, Loader2, CheckCircle2, Trash2, Sparkles, AlertCircle, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';

function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border text-sm font-medium ${type === 'success'
          ? 'bg-surface border-green-500/30 text-green-400'
          : 'bg-surface border-red-500/30 text-red-400'
        }`}>
      {type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
      {message}
      <button onClick={onClose} className="ml-1 opacity-60 hover:opacity-100 transition-opacity"><X className="w-3.5 h-3.5" /></button>
    </motion.div>
  );
}

const TIPS = [
  '"Dark mode toggle for any website"',
  '"Block ads on YouTube"',
  '"Pomodoro timer in the toolbar"',
  '"Sticky notes that follow me across tabs"',
  '"Tab manager to group and save tabs"',
  '"Highlight text in any color"',
];

export default function Dashboard() {
  const { token, user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [jobStatus, setJobStatus] = useState(null);
  const [toast, setToast] = useState(null);
  const [tipIdx, setTipIdx] = useState(0);
  const pollIntervalRef = useRef(null);

  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });

  useEffect(() => {
    const handleThemeEvent = (e) => setIsDark(e.detail);
    window.addEventListener('theme-changed', handleThemeEvent);
    return () => window.removeEventListener('theme-changed', handleThemeEvent);
  }, []);

  useEffect(() => { fetchProjects(); }, [token]);

  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  // Rotate tips
  useEffect(() => {
    const t = setInterval(() => setTipIdx(i => (i + 1) % TIPS.length), 3000);
    return () => clearInterval(t);
  }, []);

  const showToast = (message, type = 'success') => setToast({ message, type });

  const fetchProjects = async () => {
    try {
      const res = await fetch(`${API_URL}/projects`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setProjects(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (projectId) => {
    if (!window.confirm('Delete this extension permanently?')) return;
    try {
      const res = await fetch(`${API_URL}/projects/${projectId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) { fetchProjects(); showToast('Extension deleted.'); }
      else showToast('Failed to delete.', 'error');
    } catch { showToast('Error deleting.', 'error'); }
  };

  const handleDownload = async (projectId) => {
    try {
      showToast('Preparing download...');
      const res = await fetch(`${API_URL}/downloads/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) {
        showToast('Failed to download extension.', 'error');
        return;
      }

      const blob = await res.blob();
      const contentDisposition = res.headers.get('content-disposition');
      let filename = 'extension.zip';
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (filenameMatch) filename = filenameMatch[1];
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      showToast('Download started successfully.');
    } catch (err) {
      console.error('Download error:', err);
      showToast('Download failed. Please try again.', 'error');
    }
  };

  const handleEdit = async (projectId) => {
    try {
      const res = await fetch(`${API_URL}/projects/${projectId}/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const history = await res.json();
        if (history?.length > 0) {
          setPrompt(history[0].prompt);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    } catch (err) { console.error(err); }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setJobStatus({ status: 'starting', progress: 0 });

    try {
      const res = await fetch(`${API_URL}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ prompt }),
      });

      if (res.ok) {
        const data = await res.json();
        pollJobStatus(data.jobId);
      } else {
        setIsGenerating(false);
        setJobStatus(null);
        showToast('Generation failed. Please try again.', 'error');
      }
    } catch {
      setIsGenerating(false);
      setJobStatus(null);
      showToast('Network error. Check your connection.', 'error');
    }
  };

  const pollJobStatus = (jobId) => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }

    pollIntervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/generate/status/${jobId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setJobStatus(data);
          if (data.status === 'completed') {
            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current);
              pollIntervalRef.current = null;
            }
            setIsGenerating(false);
            setPrompt('');
            fetchProjects();
            showToast('Extension generated! Download it below.');
          } else if (data.status === 'failed') {
            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current);
              pollIntervalRef.current = null;
            }
            setIsGenerating(false);
            showToast('Generation failed.', 'error');
          }
        }
      } catch (err) {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
        setIsGenerating(false);
      }
    }, 1000);
  };

  const statusLabel = {
    queued: 'Queued…',
    analyzing: 'Analyzing prompt…',
    generating_code: 'Writing extension code…',
    packaging: 'Packaging ZIP…',
    completed: 'Done!',
    failed: 'Failed',
  };

  return (
    <div className="w-full max-w-7xl px-4 md:px-6 py-10 border-t border-black/5 dark:border-white/5 transition-colors duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-3">
        <div className="transition-colors duration-500">
          <h2 style={{ color: isDark ? '#ffffff' : '#111827' }} className="text-3xl font-bold mb-1 flex items-center gap-2 transition-colors duration-500">
            <Sparkles className="w-6 h-6 text-primary" /> My Workspace
          </h2>
          <p style={{ color: isDark ? '#9ca3af' : '#4b5563' }} className="text-sm transition-colors duration-500">
            Welcome back, <span style={{ color: isDark ? '#ffffff' : '#111827' }} className="font-medium transition-colors duration-500">{user?.name}</span>. Generate, manage and download your Chrome extensions
          </p>
        </div>
        <div 
          style={{ 
            backgroundColor: isDark ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.95)',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.15)',
            color: isDark ? '#9ca3af' : '#4b5563'
          }}
          className="flex items-center gap-2 px-4 py-2 glass-panel rounded-full text-xs border transition-colors duration-500">
          <div className="pulse-dot" />
          <span>{projects.length} extension{projects.length !== 1 ? 's' : ''} created</span>
        </div>
      </div>
      {/* Generator Card */}
      <div 
        style={{ 
          backgroundColor: isDark ? 'rgba(0, 0, 0, 0.8)' : '#ffffff',
          borderColor: isDark ? 'rgba(99, 102, 241, 0.3)' : 'rgba(99, 102, 241, 0.2)'
        }}
        className="glass-panel p-6 rounded-2xl mb-10 border transition-all duration-500 dark:bg-linear-to-br dark:from-primary/5 dark:to-transparent">
        <h3 style={{ color: isDark ? '#ffffff' : '#111827' }} className="text-lg font-semibold mb-1 flex items-center gap-2 transition-colors duration-500">
          <Terminal className="w-5 h-5 text-primary" />
          Create New Extension
        </h3>
        <p style={{ color: isDark ? '#9ca3af' : '#6b7280' }} className="text-xs mb-4 transition-colors duration-500">
          Try: <AnimatePresence mode="wait">
            <motion.span key={tipIdx}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="italic">
              {TIPS[tipIdx]}
            </motion.span>
          </AnimatePresence>
        </p>
        <div className="flex flex-col md:flex-row gap-4">
          <textarea 
            style={{ 
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#ffffff',
              color: isDark ? '#ffffff' : '#111827',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.2)'
            }}
            className="flex-1 border rounded-xl p-4 text-sm placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 resize-none h-28 transition-all duration-500"
            placeholder="Describe your browser extension in plain English…"
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            disabled={isGenerating}
            onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleGenerate(); }}/>
          <div className="flex flex-col gap-3 min-w-190px">
            <button onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(99,102,241,0.35)] hover:shadow-[0_0_28px_rgba(99,102,241,0.55)] h-12">
              {isGenerating
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</>
                : <><Cpu className="w-4 h-4" /> Generate</>}
            </button>
            <p className="text-xs text-gray-600 text-center">⌘ + Enter to generate</p>
            {/* Progress */}
            {jobStatus && (
              <div className="text-xs">
                <div className="flex justify-between mb-1.5 text-gray-400">
                  <span>{statusLabel[jobStatus.status] || jobStatus.status}</span>
                  <span className="font-mono">{jobStatus.progress}%</span>
                </div>
                <div className="w-full bg-surface rounded-full h-1.5 overflow-hidden">
                  <motion.div
                    className="bg-linear-to-r from-primary to-purple-500 h-1.5 rounded-full"
                    animate={{ width: `${jobStatus.progress}%` }}
                    transition={{ duration: 0.4 }}/>
                </div>
                {jobStatus.status === 'completed' && (
                  <p className="text-green-400 mt-2 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Extension ready — scroll down to download!
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Projects Grid */}
      <div className="mb-6 flex items-center justify-between">
        <h3 style={{ color: isDark ? '#ffffff' : '#111827' }} className="text-lg font-semibold transition-colors duration-500">Your Extensions</h3>
        {projects.length > 0 && (
          <span className="text-xs text-gray-500 bg-white/5 px-3 py-1 rounded-full border border-white/5">
            {projects.length} total
          </span>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-16 flex flex-col items-center gap-3 text-gray-500">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <span className="text-sm">Loading your extensions…</span>
          </div>
        ) : projects.length === 0 ? (
          <div className="col-span-full py-16 flex flex-col items-center gap-4 border border-dashed border-white/10 rounded-2xl">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Plus className="w-7 h-7 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-gray-900 dark:text-white font-medium mb-1">No extensions yet</p>
              <p className="text-gray-500 text-sm">Generate your first one using the prompt above!</p>
            </div>
          </div>
        ) : (
          projects.map((project, idx) => (
            <motion.div key={project._id || project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.07 }}
              style={{ 
                backgroundColor: isDark ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.9)',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.15)'
              }}
              className="glow-card glass-panel p-6 rounded-2xl border hover:border-primary/30 transition-all group flex flex-col shadow-sm dark:shadow-none" >
              {/* Card header */}
              <div className="flex justify-between items-start mb-4">
                <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors">
                  <Folder className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${project.status === 'active' || !project.status
                      ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                      : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                    }`}>
                    {project.status || 'Active'}
                  </span>
                  <button onClick={() => handleDelete(project._id || project.id)}
                    className="p-1.5 text-gray-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                    title="Delete">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <h3 style={{ color: isDark ? '#ffffff' : '#111827' }} className="text-base font-semibold mb-1 group-hover:text-primary transition-colors line-clamp-1">
                {project.name}
              </h3>
              <p style={{ color: isDark ? '#9ca3af' : '#6b7280' }} className="text-xs mb-4 line-clamp-2 leading-relaxed transition-colors duration-500">
                {project.description || 'A custom Chrome extension generated by Extensio.ai.'}
              </p>
              <div className="mt-auto">
                <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(project.createdAt || Date.now()).toLocaleDateString()}
                  </span>
                  <span className="font-mono bg-primary/10 text-primary/80 px-2 py-0.5 rounded-md border border-primary/20">
                    v{project.latestVersion || 1}.0
                  </span>
                </div>
                <div style={{ borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }} className="flex gap-2 pt-3 border-t">
                  <button onClick={() => handleEdit(project._id || project.id)}
                    style={{ 
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                      color: isDark ? '#ffffff' : '#111827',
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                    }}
                    className="flex-1 hover:bg-gray-100 dark:hover:bg-white/5 text-xs font-medium py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all border">
                    <Edit3 className="w-3.5 h-3.5" /> Edit Prompt
                  </button>
                  <button onClick={() => handleDownload(project._id || project.id)}
                    className="flex-1 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-medium py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors border border-primary/20 hover:border-primary/40">
                    <Download className="w-3.5 h-3.5" /> Download .zip
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <Toast message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}/>
        )}
      </AnimatePresence>
    </div>
  );
}
