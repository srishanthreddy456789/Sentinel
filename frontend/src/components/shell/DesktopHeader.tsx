import React, { useState, useRef, useEffect } from 'react';
import { Shield, Bell, Search, Cpu, User, LogOut, Key, ChevronDown, Check } from 'lucide-react';
import { useSentinel } from '../../context/SentinelContext';
import { useAuth } from '../../context/AuthContext';

export const DesktopHeader: React.FC = () => {
  const { selectedModel, selectModel } = useSentinel();
  const { user, logout, isAuthenticated } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-11 bg-[#09090b] border-b border-zinc-800/80 flex items-center justify-between px-3 select-none text-xs text-zinc-400 z-30 relative">
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

        {/* User Account Dropdown Menu */}
        <div className="relative" ref={dropdownRef}>
          <div
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-2 bg-zinc-800/80 hover:bg-zinc-800 text-zinc-200 px-2.5 py-1 rounded cursor-pointer border border-zinc-700/60 transition-colors"
          >
            <User className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] font-medium max-w-[120px] truncate">
              {user ? (user.name || user.email.split('@')[0]) : 'Dev Engineer'}
            </span>
            <ChevronDown className="w-3 h-3 text-zinc-400" />
          </div>

          {/* Dropdown Menu Overlay */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-56 bg-[#121215] border border-zinc-800 rounded-xl shadow-2xl py-2 px-1.5 z-50 text-xs">
              <div className="px-2.5 py-2 border-b border-zinc-800/80 mb-1">
                <div className="font-semibold text-zinc-100 truncate">{user?.name || 'Developer'}</div>
                <div className="text-[11px] text-zinc-400 truncate">{user?.email || 'guest@sentinel-mlops.dev'}</div>
                <div className="mt-1.5 inline-flex items-center space-x-1 px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono">
                  <Check className="w-3 h-3" />
                  <span>{user?.tier?.toUpperCase() || 'PRO'} TIER ACTIVE</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  alert('Developer SDK API Key: sk_sentinel_8f9a2b4c1d3e5f7a');
                }}
                className="w-full text-left px-2.5 py-1.5 hover:bg-zinc-800 rounded-lg text-zinc-300 hover:text-white transition-colors flex items-center space-x-2"
              >
                <Key className="w-3.5 h-3.5 text-zinc-400" />
                <span>Copy SDK API Key</span>
              </button>

              <div className="h-px bg-zinc-800 my-1" />

              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  logout();
                }}
                className="w-full text-left px-2.5 py-1.5 hover:bg-red-500/10 hover:text-red-300 text-zinc-400 rounded-lg transition-colors flex items-center space-x-2"
              >
                <LogOut className="w-3.5 h-3.5 text-red-400" />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

