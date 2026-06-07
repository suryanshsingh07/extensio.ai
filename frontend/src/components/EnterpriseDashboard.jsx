import React, { useState, useEffect } from 'react';
import { Users, Shield, Plus, Building, Key, FolderGit2, Trash2 } from 'lucide-react';

export default function EnterpriseDashboard() {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });

  useEffect(() => {
    const handleThemeEvent = (e) => setIsDark(e.detail);
    window.addEventListener('theme-changed', handleThemeEvent);
    return () => window.removeEventListener('theme-changed', handleThemeEvent);
  }, []);

  const [members] = useState([
    { id: 1, name: 'Alex Director', email: 'alex@acmecorp.com', role: 'ADMIN', status: 'Active' },
    { id: 2, name: 'Sarah Developer', email: 'sarah@acmecorp.com', role: 'EDITOR', status: 'Active' },
    { id: 3, name: 'Mike Analyst', email: 'mike@acmecorp.com', role: 'VIEWER', status: 'Pending' },
  ]);

  return (
    <section 
      style={{ borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.1)' }}
      className="w-full max-w-7xl px-4 md:px-6 py-12 border-t mx-auto transition-colors duration-500" id="enterprise">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
        <div>
          <h2 style={{ color: isDark ? '#ffffff' : '#111827' }} className="text-2xl sm:text-3xl font-bold flex items-center gap-3 transition-colors duration-500">
            <Building className="w-7 h-7 sm:w-8 sm:h-8 text-green-400" /> Enterprise Workspace
          </h2>
          <p style={{ color: isDark ? '#9ca3af' : '#111827' }} className="mt-2 text-sm sm:text-base transition-colors duration-500">Manage teams, shared projects and organization security policies</p>
        </div>
        <button id="invite-member-btn" 
          style={{ 
            color: isDark ? '#4ade80' : '#16a34a', 
            borderColor: isDark ? 'rgba(74, 222, 128, 0.2)' : 'rgba(0, 0, 0, 0.1)',
            backgroundColor: isDark ? 'rgba(74, 222, 128, 0.1)' : 'rgba(22, 163, 74, 0.05)'
          }}
          className="border font-medium py-2 px-4 rounded-xl flex items-center gap-2 transition-all cursor-pointer hover:scale-105" onClick={() => alert("This facility is currently unavailable!")}>
          <Plus className="w-4 h-4" /> Invite Member
        </button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Left Column: Organization Settings */}
        <div className="space-y-6 lg:col-span-1">
          <div 
            style={{ backgroundColor: isDark ? 'rgba(0, 0, 0, 0.4)' : '#ffffff', borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.15)' }}
            className="glass-panel p-5 sm:p-6 rounded-2xl border transition-all duration-500">
            <h3 style={{ color: isDark ? '#ffffff' : '#111827' }} className="font-semibold mb-4 text-lg transition-colors duration-500">Acme Corp</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span style={{ color: isDark ? '#9ca3af' : '#4b5563' }}>Plan</span>
                <span className={`${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'} px-2 py-0.5 rounded font-medium text-xs sm:text-sm`}>Enterprise (5 Seats)</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span style={{ color: isDark ? '#9ca3af' : '#4b5563' }}>Seats Used</span>
                <span style={{ color: isDark ? '#ffffff' : '#111827' }} className="font-medium">3 / 5</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span style={{ color: isDark ? '#9ca3af' : '#4b5563' }}>Shared Projects</span>
                <span style={{ color: isDark ? '#ffffff' : '#111827' }} className="font-medium">12 Active</span>
              </div>
            </div>
            <button 
              style={{ 
                backgroundColor: isDark ? 'rgba(17, 17, 17, 0.8)' : 'rgba(0, 0, 0, 0.05)', 
                borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                color: isDark ? '#d1d5db' : '#374151'
              }}
              className="w-full mt-6 border py-2.5 rounded-lg text-sm transition-all hover:bg-white/5 cursor-pointer" onClick={() => alert("This facility is currently unavailable!")}>
              Manage Billing
            </button>
          </div>
          <div 
            style={{ backgroundColor: isDark ? 'rgba(0, 0, 0, 0.4)' : '#ffffff', borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.15)' }}
            className="glass-panel p-5 sm:p-6 rounded-2xl border transition-all duration-500">
            <h3 style={{ color: isDark ? '#ffffff' : '#111827' }} className="font-semibold mb-4 text-lg flex items-center gap-2 transition-colors duration-500">
              <Shield className="w-5 h-5 text-gray-400" /> Security Policies
            </h3>
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <div style={{ color: isDark ? '#ffffff' : '#111827' }} className="text-sm font-medium transition-colors duration-500">Enforce SSO</div>
                  <div className="text-xs text-gray-500">Require SAML authentication</div>
                </div>
                <div className="w-10 h-5 bg-green-500 rounded-full relative cursor-pointer" role="switch" aria-checked="true" onClick={() => alert("This facility is currently unavailable!")}>
                  <div className="absolute right-1 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div style={{ color: isDark ? '#ffffff' : '#111827' }} className="text-sm font-medium transition-colors duration-500">Public Sharing</div>
                  <div className="text-xs text-gray-500">Allow external link sharing</div>
                </div>
                <div style={{ backgroundColor: isDark ? '#111111' : '#d1d5db' }} className="w-10 h-5 border border-white/10 rounded-full relative cursor-pointer" role="switch" aria-checked="false" onClick={() => alert("This facility is currently unavailable!")}>
                  <div className="absolute left-1 top-0.5 w-4 h-4 bg-gray-500 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Right Column: Member Management */}
        <div className="lg:col-span-2 space-y-6">  
          <div 
            style={{ backgroundColor: isDark ? 'rgba(0, 0, 0, 0.4)' : '#ffffff', borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.15)' }}
            className="glass-panel rounded-2xl border overflow-hidden transition-all duration-500">
            <div style={{ borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)', backgroundColor: isDark ? 'rgba(17, 17, 17, 0.3)' : 'rgba(243, 244, 246, 0.3)' }} className="p-4 sm:p-5 border-b flex justify-between items-center transition-colors duration-500">
              <h3 style={{ color: isDark ? '#ffffff' : '#111827' }} className="font-semibold flex items-center gap-2 transition-colors duration-500">
                <Users className="w-5 h-5 text-gray-400" /> Team Members
              </h3>
            </div>
            <div style={{ borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' }} className="divide-y">
              {members.map(member => (
                <div key={member.id} className={`p-4 flex items-center justify-between transition-colors gap-4 ${isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'}`}>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-linear-to-br from-gray-700 to-gray-900 flex items-center justify-center font-bold border border-white/10 shadow-inner shrink-0">
                      {member.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-sm flex items-center gap-2 flex-wrap">
                        <span style={{ color: isDark ? '#ffffff' : '#111827' }} className="truncate transition-colors duration-500">{member.name}</span>
                        {member.status === 'Pending' && (
                          <span className="text-[10px] bg-yellow-500/10 text-yellow-400 px-1.5 py-0.5 rounded border border-yellow-500/20 shrink-0">Pending</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 truncate">{member.email}</div>
                    </div>
                  </div>   
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="hidden sm:flex items-center gap-1 text-xs">
                      <Key className="w-3 h-3 text-gray-500" />
                      <span className={`${member.role === 'ADMIN' ? 'text-green-400' : member.role === 'EDITOR' ? 'text-blue-400' : 'text-gray-400'}`}>
                        {member.role}
                      </span>
                    </div>
                    <button className={`p-2 text-gray-500 hover:text-red-400 transition-colors ${isDark ? 'bg-white/5' : 'bg-gray-50'} rounded-lg border border-white/5 hover:bg-red-500/10 hover:border-red-500/20 cursor-pointer`} aria-label={`Remove ${member.name}`} onClick={() => alert("This facility is currently unavailable!")}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div 
            style={{ backgroundColor: isDark ? 'rgba(0, 0, 0, 0.4)' : '#ffffff', borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.15)' }}
            className="glass-panel p-5 sm:p-6 rounded-2xl border flex flex-col sm:flex-row gap-5 items-center transition-all duration-500">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center shrink-0">
              <FolderGit2 className="w-7 h-7 sm:w-8 sm:h-8 text-indigo-400" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 style={{ color: isDark ? '#ffffff' : '#111827' }} className="font-semibold text-lg mb-1 transition-colors duration-500">Organization Prompt Library</h3>
              <p style={{ color: isDark ? '#9ca3af' : '#374151' }} className="text-sm mb-3 transition-colors duration-500">
                Create and share successful AI system prompts across your entire development team
              </p>
              <button className="text-sm bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg transition-colors font-medium cursor-pointer" onClick={() => alert("This facility is currently unavailable!")}>
                Open Shared Library
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
