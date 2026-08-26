import React from 'react';
import { ArrowLeft, Play, Settings as SettingsIcon, Shield, Sparkles, Activity } from 'lucide-react';
import { useSentinel } from '../../context/SentinelContext';
import { ModelHealth } from '../../types/sentinel';

export const ModelWorkspaceHeader: React.FC = () => {
  const { selectedModel, selectModel, setActiveTab } = useSentinel();

  if (!selectedModel) return null;

  const getHealthBadge = (health: ModelHealth) => {
    switch (health) {
      case 'Healthy':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>● Healthy</span>
          </span>
        );
      case 'Degraded':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            <span>⚠ Degraded</span>
          </span>
        );
      case 'Healing':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20 animate-pulse-purple">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
            <span>🟣 Healing</span>
          </span>
        );
      case 'Critical':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-500/10 text-red-400 border border-red-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
            <span>🔴 Critical</span>
          </span>
        );
    }
  };

  return (
    <div className="bg-[#0c0c0e] border-b border-zinc-800 px-6 py-3 select-none">
      <div className="flex items-center justify-between">
        {/* Left: Back button & Exact User Name Header */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => selectModel(null)}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/80 transition-colors text-xs font-mono"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>

          <div className="h-4 w-px bg-zinc-800" />

          <div>
            <div className="flex items-center space-x-3">
              {/* EXACT USER DISPLAY NAME */}
              <h1 className="text-base font-semibold text-white tracking-tight">
                {selectedModel.name}
              </h1>
              <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 text-[10px] font-mono border border-zinc-700">
                {selectedModel.provider} • {selectedModel.model}
              </span>
              {getHealthBadge(selectedModel.health)}
            </div>
          </div>
        </div>

        {/* Right: Quick Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('Evaluations')}
            className="px-3 py-1.5 bg-emerald-600/90 hover:bg-emerald-500 text-white rounded text-xs font-medium transition-colors flex items-center space-x-1.5 shadow-xs"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Run Evaluation</span>
          </button>

          <button
            onClick={() => setActiveTab('Playground')}
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded text-xs font-medium transition-colors border border-zinc-700/80 flex items-center space-x-1.5"
          >
            <Sparkles className="w-3 h-3 text-purple-400" />
            <span>Test</span>
          </button>

          <button
            onClick={() => setActiveTab('Settings')}
            className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded text-xs transition-colors border border-zinc-700/80"
            title="Model Settings"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
