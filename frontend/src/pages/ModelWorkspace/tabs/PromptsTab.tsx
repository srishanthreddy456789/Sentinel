import React, { useState } from 'react';
import { FileCode, CheckCircle2, History, Plus, Edit3, Sparkles } from 'lucide-react';
import { useSentinel } from '../../../context/SentinelContext';
import { PromptVersion } from '../../../types/sentinel';

export const PromptsTab: React.FC = () => {
  const { selectedModel, promptsMap } = useSentinel();

  if (!selectedModel) return null;

  const promptList: PromptVersion[] =
    promptsMap[selectedModel.id] || promptsMap['model-2'] || [];

  const [activePrompt, setActivePrompt] = useState<PromptVersion>(
    promptList[0] || {
      id: 'P-104',
      modelId: selectedModel.id,
      version: 'v1.4',
      systemPrompt: 'You are an expert customer support agent. Rely STRICTLY on provided context chunks.',
      quality: 97.1,
      hallucination: 2.8,
      created: '2026-08-25',
      status: 'Active',
    }
  );

  return (
    <div className="space-y-6 select-none">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-white">Prompt Version Management</h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            System prompts registry for model identity: {selectedModel.name}
          </p>
        </div>

        <button className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-medium transition-colors flex items-center space-x-1.5 shadow-sm">
          <Plus className="w-3.5 h-3.5" />
          <span>New Version</span>
        </button>
      </div>

      {/* Grid: Versions Timeline List & Prompt Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column: Version History */}
        <div className="sentinel-card p-4 space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 border-b border-zinc-800 pb-2">
            VERSION REGISTRY
          </h3>

          <div className="space-y-2">
            {promptList.map((p) => {
              const isSelected = activePrompt.id === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setActivePrompt(p)}
                  className={`p-3 rounded-md border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-emerald-500/10 border-emerald-500/50 text-white'
                      : 'bg-[#09090b] border-zinc-800 text-zinc-300 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold">{p.version}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                        p.status === 'Active'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : p.status === 'Candidate'
                          ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-zinc-400">
                    <span>Quality: {p.quality}%</span>
                    <span>Hallucination: {p.hallucination}%</span>
                  </div>
                  <div className="text-[10px] text-zinc-500 font-mono mt-1">Created: {p.created}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Full System Prompt Editor */}
        <div className="sentinel-card p-5 lg:col-span-2 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center space-x-2">
                <FileCode className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-semibold text-white">SYSTEM PROMPT — {activePrompt.version}</h3>
              </div>
              <span className="text-xs font-mono text-emerald-400 font-semibold">
                Accuracy: {activePrompt.quality}%
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-zinc-500 uppercase">System Instructions</label>
              <textarea
                rows={8}
                value={activePrompt.systemPrompt}
                onChange={(e) => setActivePrompt({ ...activePrompt, systemPrompt: e.target.value })}
                className="w-full p-3.5 bg-[#09090b] border border-zinc-800 rounded text-xs text-zinc-200 focus:outline-none focus:border-emerald-500 font-mono leading-relaxed"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
            <span className="text-[11px] text-zinc-500 font-mono">Last modified: {activePrompt.created}</span>
            <div className="flex space-x-2">
              <button className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded text-xs font-medium">
                Compare Diff
              </button>
              <button className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-medium">
                Save & Deploy {activePrompt.version}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
