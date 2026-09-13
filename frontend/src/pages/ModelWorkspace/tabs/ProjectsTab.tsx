import React from 'react';
import { Layers, Plus, MessageSquare, Trash2, FileText, Check, ShieldCheck, Sparkles } from 'lucide-react';
import { useSentinel } from '../../../context/SentinelContext';

export const ProjectsTab: React.FC = () => {
  const {
    projects,
    activeProjectId,
    selectProject,
    openAddProjectModal,
    deleteProject,
    setActiveTab,
    selectedModel,
  } = useSentinel();

  return (
    <div className="space-y-6 select-none font-sans">
      {/* Top Header Card */}
      <div className="sentinel-card p-5 flex flex-wrap items-center justify-between gap-4 bg-[#0c0c0e]">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">ChatGPT-Style Project Workspaces</h2>
            <p className="text-xs text-zinc-400">
              Create projects to group multi-turn chat sessions with shared system instructions & context docs
            </p>
          </div>
        </div>

        <button
          onClick={openAddProjectModal}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-md text-xs font-semibold transition-colors flex items-center space-x-2 shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create New Project</span>
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((proj) => {
          const isSelected = activeProjectId === proj.id;
          return (
            <div
              key={proj.id}
              className={`sentinel-card p-5 space-y-4 flex flex-col justify-between transition-all ${
                isSelected
                  ? 'border-purple-500/50 bg-purple-950/10 shadow-lg shadow-purple-950/20'
                  : 'hover:border-zinc-700'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white flex items-center space-x-2">
                    <Layers className="w-4 h-4 text-purple-400" />
                    <span className="truncate max-w-[180px]">{proj.name}</span>
                  </span>
                  {isSelected && (
                    <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-mono border border-purple-500/40">
                      Active
                    </span>
                  )}
                </div>

                <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                  {proj.description || 'No description specified for this project workspace.'}
                </p>

                {/* System Instructions Preview */}
                {proj.systemInstructions && (
                  <div className="p-2.5 bg-[#09090b] border border-zinc-800 rounded space-y-1">
                    <span className="text-[10px] font-semibold uppercase text-zinc-500 tracking-wider flex items-center space-x-1">
                      <FileText className="w-3 h-3 text-emerald-400" />
                      <span>System Instructions</span>
                    </span>
                    <p className="text-[11px] font-mono text-zinc-300 line-clamp-2 leading-snug">
                      {proj.systemInstructions}
                    </p>
                  </div>
                )}

                {/* Context Docs Preview */}
                {proj.contextDocs && (
                  <div className="p-2.5 bg-[#09090b] border border-zinc-800 rounded space-y-1">
                    <span className="text-[10px] font-semibold uppercase text-zinc-500 tracking-wider flex items-center space-x-1">
                      <Sparkles className="w-3 h-3 text-purple-400" />
                      <span>Knowledge / Context Docs</span>
                    </span>
                    <p className="text-[11px] font-mono text-zinc-300 line-clamp-2 leading-snug">
                      {proj.contextDocs}
                    </p>
                  </div>
                )}
              </div>

              {/* Card Actions */}
              <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                <button
                  onClick={() => {
                    selectProject(proj.id);
                    setActiveTab('Chat');
                  }}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-medium transition-colors flex items-center space-x-1.5 cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Open Linked Chats</span>
                </button>

                {projects.length > 1 && (
                  <button
                    onClick={() => deleteProject(proj.id)}
                    className="p-1.5 rounded text-zinc-500 hover:text-red-400 hover:bg-red-950/20 transition-colors"
                    title="Delete Project Workspace"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
