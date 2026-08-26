import React from 'react';
import {
  LayoutDashboard,
  Sparkles,
  ClipboardCheck,
  AlertOctagon,
  SearchCode,
  Zap,
  Activity,
  GitCompare,
  FileCode,
  Code2,
  Sliders,
} from 'lucide-react';
import { useSentinel } from '../../context/SentinelContext';
import { WorkspaceTab } from '../../types/sentinel';

const TABS: { id: WorkspaceTab; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'Dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'Playground', label: 'Playground', icon: Sparkles },
  { id: 'Evaluations', label: 'Evaluations', icon: ClipboardCheck },
  { id: 'Failures', label: 'Failures', icon: AlertOctagon },
  { id: 'Diagnosis', label: 'Diagnosis', icon: SearchCode },
  { id: 'Healing', label: 'Healing', icon: Zap },
  { id: 'Requests', label: 'Requests', icon: Activity },
  { id: 'Experiments', label: 'Experiments', icon: GitCompare },
  { id: 'Prompts', label: 'Prompts', icon: FileCode },
  { id: 'Integration', label: 'Integration', icon: Code2 },
  { id: 'Settings', label: 'Settings', icon: Sliders },
];

export const ModelWorkspaceNav: React.FC = () => {
  const { activeTab, setActiveTab } = useSentinel();

  return (
    <div className="bg-[#09090b] border-b border-zinc-800 px-6 flex items-center space-x-1 overflow-x-auto select-none">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-3 py-2.5 border-b-2 text-xs font-medium transition-all whitespace-nowrap ${
              isActive
                ? 'border-emerald-500 text-emerald-400 font-semibold bg-emerald-500/5'
                : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-zinc-500'}`} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};
