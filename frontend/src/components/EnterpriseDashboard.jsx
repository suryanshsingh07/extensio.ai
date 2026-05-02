import React, { useState } from 'react';
import { Users, Shield, Plus, Building, Key, FolderGit2, Trash2 } from 'lucide-react';

export default function EnterpriseDashboard() {
  const [members] = useState([
    { id: 1, name: 'Alex Director', email: 'alex@acmecorp.com', role: 'ADMIN', status: 'Active' },
    { id: 2, name: 'Sarah Developer', email: 'sarah@acmecorp.com', role: 'EDITOR', status: 'Active' },
    { id: 3, name: 'Mike Analyst', email: 'mike@acmecorp.com', role: 'VIEWER', status: 'Pending' },
  ]);

  return (
    <section className="w-full max-w-7xl px-4 md:px-6 py-12 border-t border-white/5 mx-auto" id="enterprise">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
            <Building className="w-7 h-7 sm:w-8 sm:h-8 text-green-400" /> Enterprise Workspace
          </h2>
          <p className="text-gray-400 mt-2 text-sm sm:text-base">Manage teams, shared projects and organization security policies</p>
        </div>
        <button id="invite-member-btn" className="bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-400 font-medium py-2 px-4 rounded-xl flex items-center gap-2 transition-all cursor-pointer" onClick={() => alert("This facility is currently unavailable!")}>
          <Plus className="w-4 h-4" /> Invite Member
        </button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Left Column: Organization Settings */}
        <div className="space-y-6 lg:col-span-1">
          <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-white/5">
            <h3 className="font-semibold mb-4 text-lg">Acme Corp</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Plan</span>
                <span className="bg-white/10 px-2 py-0.5 rounded text-white font-medium text-xs sm:text-sm">Enterprise (5 Seats)</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Seats Used</span>
                <span className="text-white font-medium">3 / 5</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Shared Projects</span>
                <span className="text-white font-medium">12 Active</span>
              </div>
            </div>
            <button className="w-full mt-6 bg-surface hover:bg-white/5 border border-white/5 py-2.5 rounded-lg text-sm transition-colors text-gray-300 cursor-pointer" onClick={() => alert("This facility is currently unavailable!")}>
              Manage Billing
            </button>
          </div>
          <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-white/5">
            <h3 className="font-semibold mb-4 text-lg flex items-center gap-2">
              <Shield className="w-5 h-5 text-gray-400" /> Security Policies
            </h3>
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-white">Enforce SSO</div>
                  <div className="text-xs text-gray-500">Require SAML authentication</div>
                </div>
                <div className="w-10 h-5 bg-green-500 rounded-full relative cursor-pointer" role="switch" aria-checked="true" onClick={() => alert("This facility is currently unavailable!")}>
                  <div className="absolute right-1 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-white">Public Sharing</div>
                  <div className="text-xs text-gray-500">Allow external link sharing</div>
                </div>
                <div className="w-10 h-5 bg-surface border border-white/10 rounded-full relative cursor-pointer" role="switch" aria-checked="false" onClick={() => alert("This facility is currently unavailable!")}>
                  <div className="absolute left-1 top-0.5 w-4 h-4 bg-gray-500 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Right Column: Member Management */}
        <div className="lg:col-span-2 space-y-6">  
          <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-white/5 bg-surface/30 flex justify-between items-center">
              <h3 className="font-semibold flex items-center gap-2">
                <Users className="w-5 h-5 text-gray-400" /> Team Members
              </h3>
            </div>
            <div className="divide-y divide-white/5">
              {members.map(member => (
                <div key={member.id} className="p-4 flex items-center justify-between hover:bg-white/10 transition-colors gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-linear-to-br from-gray-700 to-gray-900 flex items-center justify-center font-bold border border-white/10 shadow-inner shrink-0">
                      {member.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-sm flex items-center gap-2 flex-wrap">
                        <span className="truncate">{member.name}</span>
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
                    <button className="p-2 text-gray-500 hover:text-red-400 transition-colors bg-surface rounded-lg border border-white/5 hover:bg-red-500/10 hover:border-red-500/20 cursor-pointer" aria-label={`Remove ${member.name}`} onClick={() => alert("This facility is currently unavailable!")}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-white/5 flex flex-col sm:flex-row gap-5 items-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center shrink-0">
              <FolderGit2 className="w-7 h-7 sm:w-8 sm:h-8 text-indigo-400" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="font-semibold text-lg mb-1">Organization Prompt Library</h3>
              <p className="text-gray-400 text-sm mb-3">
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
