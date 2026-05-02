import React from 'react';
import { ShieldAlert, ShieldCheck, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

export default function ValidationPreview() {
  const validationReport = {
    isValid: false,
    filesChecked: 4,
    errors: [
      'CRITICAL: Referenced file "popup.js" is missing from the generated project.',
      'SECURITY: Unsafe \'eval()\' usage detected in content.js.'
    ],
    warnings: [
      'Warning: \'document.write\' used in content.js. This is generally discouraged.'
    ]
  };

  return (
    <section className="w-full max-w-7xl px-4 md:px-6 py-12 mt-12 border-t border-white/5">
      <div className="flex items-center gap-3 mb-8">
        <div className={`p-3 rounded-xl ${validationReport.isValid ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
          {validationReport.isValid ? <ShieldCheck className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
        </div>
        <div>
          <h2 className="text-3xl font-bold">Pre-Flight Validation</h2>
          <p className="text-gray-400">Automated testing engine checking your extension before build.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status Card */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            System Status
          </h3>
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center p-3 bg-surface rounded-lg">
              <span className="text-sm text-gray-400">Files Checked</span>
              <span className="font-mono text-white">{validationReport.filesChecked}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-surface rounded-lg">
              <span className="text-sm text-gray-400">Manifest Syntax</span>
              <span className="flex items-center gap-1 text-green-400 text-sm"><CheckCircle className="w-4 h-4"/> Valid</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-surface rounded-lg">
              <span className="text-sm text-gray-400">Dependency Links</span>
              <span className="flex items-center gap-1 text-red-400 text-sm"><XCircle className="w-4 h-4"/> Broken</span>
            </div>
          </div>
        </div>

        {/* Logs Card */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            Inspection Logs
          </h3>
          <div className="flex-1 bg-background rounded-xl p-4 font-mono text-sm overflow-y-auto space-y-3 border border-white/5 max-h-250px">
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
            <button className="mt-4 w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 font-medium py-3 rounded-lg border border-red-500/20 transition-all flex justify-center items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(239,68,68,0.2)]">
              Trigger Auto-Repair Workflow
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
