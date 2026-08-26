import React from 'react';
import { Shield, Bell, Search, Terminal, Cpu, User } from 'lucide-react';
import { useSentinel } from '../../context/SentinelContext';

export const DesktopHeader: React.FC = () => {
  const { selectedModel, selectModel } = useSentinel();

  return (
    <header className="h-11 bg-[#09090b] border-b border-zinc-800/80 flex items-center justify-between px-3 select-none text-xs text-zinc-400">
      {/* Left section: Logo & App Status */}
      <div className="flex items-center space-x-3">
        {/* Desktop window control dots */}
        <div className="flex items-center space-x-1.5 mr-1">
          <div className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-500 cursor-pointer" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80 hover:bg-yellow-500 cursor-pointer" />
          <div className="w-3 h-3 rounded-full bg-green-500/80 hover:bg-green-500 cursor-pointer" />
        </div>

        <div
          onClick={() => selectModel(null)}
          className="flex items-center space-x-2 cursor-pointer hover:text-white transition-colors"
        >
          <div className="w-5 h-5 rounded bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Shield className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold text-zinc-100 tracking-wide text-xs">SENTINEL</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">v2.4.0</span>
        </div>

        <div className="h-3.5 w-px bg-zinc-800" />

        {/* Engine status indicator */}
        <div className="flex items-center space-x-1.5 text-zinc-400 font-mono text-[11px]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-zinc-300">Local Self-Healing Engine Active</span>
        </div>
      </div>

      {/* Center section: Global Command / Search Palette Bar */}
      <div className="hidden md:flex items-center space-x-2 bg-[#121215] border border-zinc-800 rounded-md px-2.5 py-1 w-72 text-zinc-400 hover:border-zinc-700 transition-all cursor-pointer">
        <Search className="w-3.5 h-3.5 text-zinc-500" />
        <span className="text-zinc-500 text-[11px] flex-1">
          {selectedModel ? `Search ${selectedModel.name}...` : 'Search models, failures, tests...'}
        </span>
        <kbd className="text-[9px] font-mono bg-zinc-800 text-zinc-400 px-1 py-0.5 rounded border border-zinc-700">⌘K</kbd>
      </div>

      {/* Right section: Quick stats & Actions */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-1 text-zinc-400 hover:text-zinc-200 cursor-pointer font-mono text-[11px]">
          <Cpu className="w-3.5 h-3.5 text-emerald-400" />
          <span>RAM: 1.4GB</span>
        </div>

        <div className="h-3.5 w-px bg-zinc-800" />

        <button className="relative p-1 text-zinc-400 hover:text-zinc-200 transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
        </button>

        <div className="flex items-center space-x-1.5 bg-zinc-800/80 hover:bg-zinc-800 text-zinc-200 px-2 py-0.5 rounded cursor-pointer border border-zinc-700/60">
          <User className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-[11px] font-medium">Dev Engineer</span>
        </div>
      </div>
    </header>
  );
};
