import React, { useState } from 'react';
import { FolderPlus, X, Sparkles, FileText, Cpu, Check } from 'lucide-react';
import { useSentinel } from '../../context/SentinelContext';

export const AddProjectModal: React.FC = () => {
  const {
    isAddProjectModalOpen,
    closeAddProjectModal,
    createProject,
    models,
    selectedModelId,
  } = useSentinel();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [systemInstructions, setSystemInstructions] = useState(
    'You are a helpful AI assistant. Rely strictly on provided project context documents.'
  );
  const [contextDocs, setContextDocs] = useState('');
  const [defaultModelId, setDefaultModelId] = useState(selectedModelId || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isAddProjectModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Project Name is required.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await createProject({
        name: name.trim(),
        description: description.trim() || undefined,
        systemInstructions: systemInstructions.trim() || undefined,
        contextDocs: contextDocs.trim() || undefined,
        defaultModelId: defaultModelId || selectedModelId || undefined,
      });

      // Reset and close
      setName('');
      setDescription('');
      setContextDocs('');
      closeAddProjectModal();
    } catch (err: any) {
      console.error('Error creating project:', err);
      setError(err.message || 'Failed to create project workspace');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 select-none">
      <div className="w-full max-w-xl bg-[#121215] border border-zinc-800 rounded-xl overflow-hidden text-zinc-100 shadow-2xl space-y-0">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between bg-[#0c0c0e]">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Create New Project Workspace</h3>
              <p className="text-[11px] text-zinc-400">
                Group multiple chat sessions under a shared system prompt & knowledge context
              </p>
            </div>
          </div>
          <button
            onClick={closeAddProjectModal}
            className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs font-sans">
          {error && (
            <div className="p-3 rounded bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
              {error}
            </div>
          )}

          {/* Project Name */}
          <div className="space-y-1.5">
            <label className="block text-zinc-300 font-semibold uppercase tracking-wider text-[10px]">
              Project Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Customer Care AI, Legal Compliance Bot, Code Review Workspace"
              className="w-full p-2.5 bg-[#09090b] border border-zinc-800 rounded text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="block text-zinc-300 font-semibold uppercase tracking-wider text-[10px]">
              Project Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Workspace for handling customer refunds, SLAs, and order queries."
              className="w-full p-2.5 bg-[#09090b] border border-zinc-800 rounded text-xs text-zinc-200 focus:outline-none focus:border-purple-500 font-mono"
            />
          </div>

          {/* Shared System Instructions */}
          <div className="space-y-1.5">
            <label className="block text-zinc-300 font-semibold uppercase tracking-wider text-[10px]">
              Shared System Instructions (Inherited by all chats in project)
            </label>
            <textarea
              rows={2}
              value={systemInstructions}
              onChange={(e) => setSystemInstructions(e.target.value)}
              className="w-full p-2.5 bg-[#09090b] border border-zinc-800 rounded text-xs text-zinc-200 focus:outline-none focus:border-purple-500 font-mono leading-relaxed"
            />
          </div>

          {/* Shared Context / Knowledge Docs */}
          <div className="space-y-1.5">
            <label className="block text-zinc-300 font-semibold uppercase tracking-wider text-[10px]">
              Shared Knowledge / Context Documents (RAG Grounding)
            </label>
            <textarea
              rows={3}
              value={contextDocs}
              onChange={(e) => setContextDocs(e.target.value)}
              placeholder="Paste company FAQs, refund guidelines, SLA documents, or reference data that all chats under this project can access..."
              className="w-full p-2.5 bg-[#09090b] border border-zinc-800 rounded text-xs text-zinc-200 focus:outline-none focus:border-purple-500 font-mono leading-relaxed"
            />
          </div>

          {/* Default Model Selection */}
          <div className="space-y-1.5">
            <label className="block text-zinc-300 font-semibold uppercase tracking-wider text-[10px]">
              Default Connected LLM Model
            </label>
            <select
              value={defaultModelId}
              onChange={(e) => setDefaultModelId(e.target.value)}
              className="w-full p-2.5 bg-[#09090b] border border-zinc-800 rounded text-xs text-zinc-200 focus:outline-none focus:border-purple-500 font-mono"
            >
              <option value="">Default (Active Workspace Model)</option>
              {models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.provider} - {m.model})
                </option>
              ))}
            </select>
          </div>

          {/* Buttons */}
          <div className="pt-3 border-t border-zinc-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={closeAddProjectModal}
              className="px-4 py-2 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="px-5 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded text-xs font-semibold transition-colors flex items-center space-x-1.5 shadow-sm"
            >
              {isSubmitting ? (
                <span>Creating Project...</span>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Create Project Workspace</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
