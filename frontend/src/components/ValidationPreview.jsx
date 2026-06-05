import React, { useState, useEffect } from 'react';
import { ShieldAlert, ShieldCheck, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

export default function ValidationPreview({ report }) {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });

  useEffect(() => {
    const handleThemeEvent = (e) => setIsDark(e.detail);
    window.addEventListener('theme-changed', handleThemeEvent);
    return () => window.removeEventListener('theme-changed', handleThemeEvent);
  }, []);

  // Fallback for initial state or loading
  const validationReport = report || {
    isValid: true, filesChecked: 0, errors: [], warnings: []
  };

  const hasManifestError = validationReport.errors.some(e => e.includes('manifest.json'));
  const hasReferenceError = validationReport.errors.some(e => e.includes('Referenced file'));

  return (
    <section 
      style={{ borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' }}
      className="w-full max-w-7xl px-4 md:px-6 py-12 mt-12 border-t transition-colors duration-500">
      <div className="flex items-center gap-3 mb-8">
        <div className={`p-3 rounded-xl ${validationReport.isValid ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
          {validationReport.isValid ? <ShieldCheck className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
        </div>
        <div>
          <h2 style={{ color: isDark ? '#ffffff' : '#111827' }} className="text-3xl font-bold transition-colors duration-500">Pre-Flight Validation</h2>
          <p style={{ color: isDark ? '#9ca3af' : '#4b5563' }} className="transition-colors duration-500">Automated testing engine checking your extension before build.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status Card */}
        <div 
          style={{ backgroundColor: isDark ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.4)', borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }}
          className="glass-panel p-6 rounded-2xl border transition-colors duration-500">
          <h3 style={{ color: isDark ? '#ffffff' : '#111827' }} className="text-lg font-semibold mb-4 flex items-center gap-2 transition-colors duration-500">
            System Status
          </h3>
          <div className="flex flex-col gap-4">
            <div 
              style={{ backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)' }}
              className="flex justify-between items-center p-3 rounded-lg transition-colors duration-500">
              <span style={{ color: isDark ? '#9ca3af' : '#6b7280' }} className="text-sm transition-colors duration-500">Files Checked</span>
              <span style={{ color: isDark ? '#ffffff' : '#111827' }} className="font-mono transition-colors duration-500">{validationReport.filesChecked}</span>
            </div>
            <div 
              style={{ backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)' }}
              className="flex justify-between items-center p-3 rounded-lg transition-colors duration-500">
              <span style={{ color: isDark ? '#9ca3af' : '#6b7280' }} className="text-sm transition-colors duration-500">Manifest Syntax</span>
              {hasManifestError ? (
                <span className="flex items-center gap-1 text-red-400 text-sm"><XCircle className="w-4 h-4"/> Invalid</span>
              ) : (
                <span className="flex items-center gap-1 text-green-400 text-sm"><CheckCircle className="w-4 h-4"/> Valid</span>
              )}
            </div>
            <div 
              style={{ backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)' }}
              className="flex justify-between items-center p-3 rounded-lg transition-colors duration-500">
              <span style={{ color: isDark ? '#9ca3af' : '#6b7280' }} className="text-sm transition-colors duration-500">Dependency Links</span>
              {hasReferenceError ? (
                <span className="flex items-center gap-1 text-red-400 text-sm"><XCircle className="w-4 h-4"/> Broken</span>
              ) : (
                <span className="flex items-center gap-1 text-green-400 text-sm"><CheckCircle className="w-4 h-4"/> Healthy</span>
              )}
            </div>
          </div>
        </div>

        {/* Logs Card */}
        <div 
          style={{ backgroundColor: isDark ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.4)', borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }}
          className="glass-panel p-6 rounded-2xl border flex flex-col transition-colors duration-500">
          <h3 style={{ color: isDark ? '#ffffff' : '#111827' }} className="text-lg font-semibold mb-4 flex items-center gap-2 transition-colors duration-500">
            Inspection Logs
          </h3>
          <div 
            style={{ 
              backgroundColor: isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'
            }}
            className="flex-1 rounded-xl p-4 font-mono text-sm overflow-y-auto space-y-3 border max-h-62.5 transition-colors duration-500">
            {validationReport.errors.map((err, idx) => (
              <div key={idx} className="flex items-start gap-2 text-red-400">
                <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{err}</span>
              </div>
            ))}
            {validationReport.warnings.map((warn, idx) => (
              <div key={idx} className="flex items-start gap-2 text-yellow-400">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{warn}</span>
              </div>
            ))}
            {validationReport.errors.length === 0 && validationReport.warnings.length === 0 && (
              <div className="text-green-400 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> All checks passed successfully.
              </div>
            )}
          </div>
          {!validationReport.isValid && (
            <button 
              onClick={() => alert('Auto-repair engine is analyzing logs to fix referenced file gaps...')}
              className="mt-4 w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 font-medium py-3 rounded-lg border border-red-500/20 transition-all flex justify-center items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(239,68,68,0.2)]"
            >
              Trigger Auto-Repair Workflow
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
