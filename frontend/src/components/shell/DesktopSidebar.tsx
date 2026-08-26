import React from 'react';
import {
  LayoutDashboard,
  Plus,
  Settings,
  HelpCircle,
  Cpu,
  Bot,
  Activity,
  Zap,
  Sparkles,
  Layers,
} from 'lucide-react';
import { useSentinel } from '../../context/SentinelContext';
import { ModelHealth } from '../../types/sentinel';

export const DesktopSidebar: React.FC = () => {
  const { models, selectedModelId, selectModel, openAddApiModal } = useSentinel();

  const getHealthIndicator = (health: ModelHealth) => {
    switch (health) {
      case 'Healthy':
        return <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50 inline-block" />;
      case 'Degraded':
        return <span className="w-2 h-2 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50 inline-block" />;
      case 'Healing':
        return <span className="w-2 h-2 rounded-full bg-purple-500 shadow-sm shadow-purple-500/50 animate-pulse-purple inline-block" />;
      case 'Critical':
        return <span className="w-2 h-2 rounded-full bg-red-500 shadow-sm shadow-red-500/50 inline-block" />;
      default:
        return <span className="w-2 h-2 rounded-full bg-zinc-500 inline-block" />;
    }
  };

  return (
    <aside className="w-60 bg-[#0c0c0e] border-r border-zinc-800/80 flex flex-col justify-between select-none h-full text-xs">
      <div className="flex-1 flex flex-col overflow-y-auto px-2 py-3">
        {/* Main Header / Global Dashboard Link */}
        <div className="mb-4">
          <button
            onClick={() => selectModel(null)}
            className={`w-full flex items-center space-x-2.5 px-2.5 py-2 rounded-md transition-all font-medium ${
              selectedModelId === null
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold'
                : 'text-zinc-300 hover:bg-zinc-800/60 hover:text-white'
            }`}
          >
            <LayoutDashboard className={`w-4 h-4 ${selectedModelId === null ? 'text-emerald-400' : 'text-zinc-400'}`} />
            <span>Dashboard</span>
          </button>
        </div>

        {/* MY APIs / MODELS Section Header */}
        <div className="px-2.5 mb-2 flex items-center justify-between">
          <span className="text-[10px] font-semibold tracking-wider text-zinc-500 uppercase">
            MY APIs / MODELS
          </span>
          <span className="text-[10px] font-mono bg-zinc-800 text-zinc-400 px-1.5 py-0.2 rounded">
            {models.length}
          </span>
        </div>

        {/* Connected Models List */}
        <div className="space-y-1 mb-3">
          {models.map((model) => {
            const isSelected = selectedModelId === model.id;
            return (
              <button
                key={model.id}
                onClick={() => selectModel(model.id)}
                className={`w-full flex items-start space-x-2.5 px-2.5 py-2 rounded-md transition-all text-left group ${
                  isSelected
                    ? 'bg-zinc-800/90 text-white border border-zinc-700/80 font-medium'
                    : 'text-zinc-300 hover:bg-zinc-800/40 hover:text-white'
                }`}
              >
                <div className="mt-1 flex-shrink-0">{getHealthIndicator(model.health)}</div>

                <div className="flex-1 min-w-0">
                  {/* EXACT User Provided Name */}
                  <div className={`truncate text-xs ${isSelected ? 'text-white font-medium' : 'text-zinc-200 group-hover:text-white'}`}>
                    {model.name}
                  </div>
                  {/* Provider & Model Subtitle */}
                  <div className="truncate text-[10px] text-zinc-500 group-hover:text-zinc-400 font-mono mt-0.5">
                    {model.model}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* + Add API Action */}
        <button
          onClick={openAddApiModal}
          className="w-full flex items-center space-x-2 px-2.5 py-2 rounded-md border border-dashed border-zinc-700/80 text-zinc-400 hover:text-emerald-400 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all text-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Add API</span>
        </button>
      </div>

      {/* Bottom Footer Section */}
      <div className="p-2 border-t border-zinc-800/80 space-y-1">
        <button
          onClick={() => {
            if (selectedModelId) {
              selectModel(selectedModelId);
            }
          }}
          className="w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 transition-colors"
        >
          <Settings className="w-3.5 h-3.5 text-zinc-400" />
          <span>Settings</span>
        </button>

        <button className="w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 transition-colors">
          <HelpCircle className="w-3.5 h-3.5 text-zinc-400" />
          <span>Help & Docs</span>
        </button>

        <div className="pt-2 px-2.5 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
          <span>Sentinel OS</span>
          <span className="text-emerald-500">Online</span>
        </div>
      </div>
    </aside>
  );
};
