import React, { useState, useRef, useEffect } from 'react';
import {
  Shield,
  Bell,
  Search,
  Cpu,
  User,
  LogOut,
  Key,
  ChevronDown,
  Check,
  X,
  Layers,
  Zap,
  AlertTriangle,
  FileText,
  SlidersHorizontal,
  ArrowRight,
} from 'lucide-react';
import { useSentinel } from '../../context/SentinelContext';
import { useAuth } from '../../context/AuthContext';
import { WorkspaceTab } from '../../types/sentinel';
import { dashboardService } from '../../services/api';

export const DesktopHeader: React.FC = () => {
  const { models, selectedModel, selectModel, setActiveTab, globalMetrics } = useSentinel();
  const { user, logout } = useAuth();
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [ramDisplay, setRamDisplay] = useState<string>('1.4GB');
  const [ramTooltip, setRamTooltip] = useState<string>('Fetching real system RAM metrics...');

  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Poll real system RAM metrics from backend
  useEffect(() => {
    const fetchRamMetrics = async () => {
      try {
        const metrics = await dashboardService.getSystemMetrics();
        if (metrics && metrics.display) {
          setRamDisplay(metrics.display);
          setRamTooltip(`System Memory: ${metrics.ram_used_gb}GB used of ${metrics.ram_total_gb}GB total (${metrics.ram_percent}%)`);
        }
      } catch (err) {
        // Fallback simulation when backend is starting
        setRamDisplay('1.4GB');
      }
    };

    fetchRamMetrics();
    const intervalId = setInterval(fetchRamMetrics, 4000);
    return () => clearInterval(intervalId);
  }, []);

  // Close overlays on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut listener (Cmd+K / Ctrl+K / Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsNotificationsOpen(false);
        setIsDropdownOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auto-focus search input when palette opens
  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    } else {
      setSearchQuery('');
    }
  }, [isSearchOpen]);

  const tabsList: { name: WorkspaceTab; icon: any; description: string }[] = [
    { name: 'Dashboard', icon: Layers, description: 'Model workspace health & performance overview' },
    { name: 'Chat', icon: Shield, description: 'Interactive multi-turn chat with guardrails' },
    { name: 'Playground', icon: SlidersHorizontal, description: 'Test prompt inputs and multi-metric evaluations' },
    { name: 'Evaluations', icon: Check, description: 'Run regression test suites & benchmark runs' },
    { name: 'Failures', icon: AlertTriangle, description: 'Investigate quality anomalies and hallucinations' },
    { name: 'Diagnosis', icon: Shield, description: 'Explainable root cause diagnosis with confidence evidence' },
    { name: 'Healing', icon: Zap, description: 'Verifiable self-healing prompt & RAG query experiments' },
    { name: 'Prompts', icon: FileText, description: 'Prompt versioning, hashing, and version comparison' },
  ];

  const filteredModels = models.filter((m) =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.model.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTabs = tabsList.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <header className="h-11 bg-[#09090b] border-b border-zinc-800/80 flex items-center justify-between px-3 select-none text-xs text-zinc-400 z-30 relative">
      {/* Left Section: Logo & Status Indicator */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-1.5 mr-1">
          <div
            onClick={() => selectModel(null)}
            title="Return to Global Dashboard"
            className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-500 cursor-pointer transition-colors"
          />
          <div
            onClick={() => setIsSearchOpen(true)}
            title="Quick Search (Ctrl+K)"
            className="w-3 h-3 rounded-full bg-yellow-500/80 hover:bg-yellow-500 cursor-pointer transition-colors"
          />
          <div
            onClick={() => selectModel(models[0]?.id || null)}
            title="Switch Model"
            className="w-3 h-3 rounded-full bg-green-500/80 hover:bg-green-500 cursor-pointer transition-colors"
          />
        </div>

        <div
          onClick={() => selectModel(null)}
          className="flex items-center space-x-2 cursor-pointer hover:text-white transition-colors group"
        >
          <div className="w-5 h-5 rounded bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:border-emerald-400 transition-colors">
            <Shield className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold text-zinc-100 tracking-wide text-xs">SENTINEL</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">v3.0.0</span>
        </div>

        <div className="h-3.5 w-px bg-zinc-800" />

        <div className="flex items-center space-x-1.5 text-zinc-400 font-mono text-[11px]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-zinc-300">Local Self-Healing Engine Active</span>
        </div>
      </div>

      {/* Center Section: Search Bar & Command Palette Trigger */}
      <div
        onClick={() => setIsSearchOpen(true)}
        className="hidden md:flex items-center space-x-2 bg-[#121215] border border-zinc-800 hover:border-zinc-700 rounded-md px-2.5 py-1 w-72 text-zinc-400 transition-all cursor-pointer group"
      >
        <Search className="w-3.5 h-3.5 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
        <span className="text-zinc-500 text-[11px] flex-1 group-hover:text-zinc-300 transition-colors">
          {selectedModel ? `Search ${selectedModel.name}...` : 'Search models, failures, tests...'}
        </span>
        <kbd className="text-[9px] font-mono bg-zinc-800 text-zinc-400 px-1 py-0.5 rounded border border-zinc-700">Ctrl+K</kbd>
      </div>

      {/* Right Section: System Stats, Notifications, User Menu */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-1 text-zinc-400 hover:text-zinc-200 cursor-pointer font-mono text-[11px]" title={ramTooltip}>
          <Cpu className="w-3.5 h-3.5 text-emerald-400" />
          <span>RAM: {ramDisplay}</span>
        </div>

        <div className="h-3.5 w-px bg-zinc-800" />

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative p-1 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
            title="System Alerts & Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-[#121215] border border-zinc-800 rounded-xl shadow-2xl py-2 px-2 z-50 text-xs space-y-2">
              <div className="flex items-center justify-between px-2 pb-1.5 border-b border-zinc-800">
                <span className="font-semibold text-zinc-200 flex items-center space-x-1.5">
                  <Bell className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Alerts & Activity</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">3 Live</span>
              </div>

              <div className="space-y-1.5 max-h-64 overflow-y-auto">
                <div className="p-2 rounded bg-zinc-900/80 border border-purple-500/30 text-[11px] space-y-0.5">
                  <div className="flex items-center justify-between text-purple-400 font-semibold">
                    <span>⚡ Prompt Self-Healing Promoted</span>
                    <span className="text-[9px] text-zinc-500">2m ago</span>
                  </div>
                  <p className="text-zinc-300">Prompt v1.4 (+6.7% quality improvement) promoted after golden suite verification.</p>
                </div>

                <div className="p-2 rounded bg-zinc-900/80 border border-emerald-500/30 text-[11px] space-y-0.5">
                  <div className="flex items-center justify-between text-emerald-400 font-semibold">
                    <span>✓ Ollama Daemon Active</span>
                    <span className="text-[9px] text-zinc-500">12m ago</span>
                  </div>
                  <p className="text-zinc-300">Connected to local execution server at http://localhost:11434.</p>
                </div>

                <div className="p-2 rounded bg-zinc-900/80 border border-amber-500/30 text-[11px] space-y-0.5">
                  <div className="flex items-center justify-between text-amber-400 font-semibold">
                    <span>⚠ Latency Spike Warning</span>
                    <span className="text-[9px] text-zinc-500">1h ago</span>
                  </div>
                  <p className="text-zinc-300">P95 Latency reached 1.82s on Customer Support Bot connection.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Account Dropdown */}
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

          {isDropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-56 bg-[#121215] border border-zinc-800 rounded-xl shadow-2xl py-2 px-1.5 z-50 text-xs">
              <div className="px-2.5 py-2 border-b border-zinc-800/80 mb-1">
                <div className="font-semibold text-zinc-100 truncate">{user?.name || 'Srishanth Reddy'}</div>
                <div className="text-[11px] text-zinc-400 truncate">{user?.email || 'srishanth@sentinel-mlops.dev'}</div>
                <div className="mt-1.5 inline-flex items-center space-x-1 px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono">
                  <Check className="w-3 h-3" />
                  <span>PRO ENTERPRISE TIER</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  navigator.clipboard.writeText('sk_sentinel_8f9a2b4c1d3e5f7a');
                  alert('Developer SDK API Key copied to clipboard!');
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

      {/* Global Interactive Command Palette Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-start justify-center pt-20 px-4">
          <div className="bg-[#121215] border border-zinc-800 w-full max-w-xl rounded-xl shadow-2xl overflow-hidden text-xs">
            {/* Search Bar Input */}
            <div className="flex items-center px-4 py-3 border-b border-zinc-800 bg-[#09090b]">
              <Search className="w-4 h-4 text-emerald-400 mr-2.5" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search models, navigation tabs, evaluations..."
                className="flex-1 bg-transparent text-white placeholder-zinc-500 focus:outline-none font-mono text-xs"
              />
              <button
                onClick={() => setIsSearchOpen(false)}
                className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Results List */}
            <div className="p-2 max-h-96 overflow-y-auto space-y-3">
              {/* Connected Models */}
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 px-2.5 py-1">
                  Connected Models ({filteredModels.length})
                </div>
                {filteredModels.length === 0 ? (
                  <div className="px-2.5 py-2 text-zinc-500 text-[11px]">No models found matching query</div>
                ) : (
                  filteredModels.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => {
                        selectModel(m.id);
                        setIsSearchOpen(false);
                      }}
                      className="px-2.5 py-2 hover:bg-zinc-800/80 rounded-lg cursor-pointer flex items-center justify-between group transition-colors"
                    >
                      <div className="flex items-center space-x-2">
                        <Shield className="w-4 h-4 text-emerald-400" />
                        <div>
                          <span className="font-medium text-white group-hover:text-emerald-400 transition-colors">{m.name}</span>
                          <span className="text-[10px] font-mono text-zinc-500 ml-2">{m.provider} • {m.model}</span>
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-white transition-colors" />
                    </div>
                  ))
                )}
              </div>

              {/* Navigation Tabs */}
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 px-2.5 py-1">
                  Workspace Sections
                </div>
                {filteredTabs.map((t) => {
                  const Icon = t.icon;
                  return (
                    <div
                      key={t.name}
                      onClick={() => {
                        if (!selectedModel && models.length > 0) {
                          selectModel(models[0].id);
                        }
                        setActiveTab(t.name);
                        setIsSearchOpen(false);
                      }}
                      className="px-2.5 py-2 hover:bg-zinc-800/80 rounded-lg cursor-pointer flex items-center justify-between group transition-colors"
                    >
                      <div className="flex items-center space-x-2">
                        <Icon className="w-4 h-4 text-purple-400" />
                        <div>
                          <span className="font-medium text-zinc-200 group-hover:text-white transition-colors">{t.name}</span>
                          <span className="text-[10px] text-zinc-500 ml-2">{t.description}</span>
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-white transition-colors" />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="px-4 py-2 bg-[#09090b] border-t border-zinc-800 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
              <span>Use ↑↓ keys to navigate</span>
              <span>ESC to close</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
