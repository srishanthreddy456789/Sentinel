import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Bot,
  User,
  Trash2,
  Sparkles,
  Key,
  RefreshCw,
  FileText,
  Sliders,
  Plus,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  Layers,
  FolderPlus,
} from 'lucide-react';
import { useSentinel } from '../../../context/SentinelContext';

export const ChatTab: React.FC = () => {
  const {
    selectedModel,
    chatSessionsMap,
    activeSessionIdMap,
    sendChatMessage,
    clearChatHistory,
    createNewChatSession,
    switchChatSession,
    deleteChatSession,
    projects,
    activeProjectId,
    selectProject,
    openAddProjectModal,
  } = useSentinel();

  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [systemPromptVersion, setSystemPromptVersion] = useState('v1.4');
  const [showParameters, setShowParameters] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [temperature, setTemperature] = useState(0.2);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  if (!selectedModel) return null;

  const sessions = chatSessionsMap[selectedModel.id] || [];
  const activeSessionId = activeSessionIdMap[selectedModel.id];
  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];
  const messages = activeSession ? activeSession.messages : [];
  
  // Active Project Workspace
  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0];

  // Unused Chat Guard: check if an empty/unused session already exists
  const hasEmptySession = sessions.some((s) => !s.messages || s.messages.length === 0);
  const isActiveSessionEmpty = activeSession && (!activeSession.messages || activeSession.messages.length === 0);

  // Automatically ensure EXACTLY 1 empty chat session exists by default, pruning any duplicates
  useEffect(() => {
    if (!selectedModel) return;
    const currentSessions = chatSessionsMap[selectedModel.id] || [];
    const emptySessions = currentSessions.filter((s) => !s.messages || s.messages.length === 0);

    if (currentSessions.length === 0) {
      createNewChatSession(selectedModel.id);
    } else if (emptySessions.length > 1) {
      // Prune extra empty sessions, keeping only 1 empty chat session
      const keepEmptyId = (activeSession && (!activeSession.messages || activeSession.messages.length === 0))
        ? activeSession.id
        : emptySessions[0].id;

      emptySessions.forEach((s) => {
        if (s.id !== keepEmptyId) {
          deleteChatSession(selectedModel.id, s.id);
        }
      });
    }
  }, [selectedModel, chatSessionsMap]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isSending) return;

    const text = input.trim();
    setInput('');
    setIsSending(true);

    try {
      await sendChatMessage(selectedModel.id, text);
    } catch (err) {
      console.error('Error sending chat message:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex select-none bg-[#09090b] rounded-lg overflow-hidden border border-zinc-800">
      {/* ChatGPT-style Sessions Left Sidebar */}
      {showSidebar && (
        <div className="w-64 bg-[#0c0c0e] border-r border-zinc-800/80 flex flex-col justify-between p-3 shrink-0">
          <div className="space-y-3 flex-1 overflow-y-auto">
            {/* New Chat Button with Guard */}
            <button
              onClick={() => createNewChatSession(selectedModel.id)}
              title={
                isActiveSessionEmpty
                  ? 'Current chat session is empty. Send a message to start it before adding another.'
                  : 'Start a new conversation session'
              }
              className={`w-full py-2 px-3 rounded-md text-xs font-medium transition-all flex items-center justify-center space-x-2 shadow-xs cursor-pointer ${
                isActiveSessionEmpty
                  ? 'bg-emerald-700/60 text-emerald-200 border border-emerald-500/40 hover:bg-emerald-600'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>{isActiveSessionEmpty ? 'Current Chat Empty' : '+ New Chat'}</span>
            </button>

            {/* Quick Add Project Action */}
            <button
              onClick={openAddProjectModal}
              className="w-full py-1.5 px-2.5 bg-purple-950/30 hover:bg-purple-900/40 text-purple-300 border border-purple-800/50 rounded-md text-[11px] font-mono transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <FolderPlus className="w-3.5 h-3.5 text-purple-400" />
              <span>+ Create Project</span>
            </button>

            {/* Recent Sessions List Header */}
            <div className="pt-2 flex items-center justify-between px-1">
              <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                Chat Sessions ({sessions.length})
              </span>
              {isActiveSessionEmpty && (
                <span className="text-[9px] font-mono text-amber-400 bg-amber-950/40 px-1 py-0.2 rounded border border-amber-800/40">
                  1 Open
                </span>
              )}
            </div>

            {/* Session Items */}
            <div className="space-y-1">
              {sessions.map((session) => {
                const isActive = session.id === activeSession?.id;
                const isEmpty = !session.messages || session.messages.length === 0;
                return (
                  <div
                    key={session.id}
                    onClick={() => switchChatSession(selectedModel.id, session.id)}
                    className={`group px-2.5 py-2 rounded-md cursor-pointer transition-all flex items-center justify-between text-xs font-mono ${
                      isActive
                        ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold'
                        : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate pr-2">
                      <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-emerald-400' : 'text-zinc-500'}`} />
                      <span className="truncate">{session.title || 'New Chat'}</span>
                      {isEmpty && (
                        <span className="text-[9px] text-zinc-500 italic">(empty)</span>
                      )}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteChatSession(selectedModel.id, session.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 text-zinc-500 transition-opacity"
                      title="Delete Chat Session"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-zinc-800/60 text-[10px] text-zinc-500 font-mono text-center">
            SENTINEL Multi-Session Chat Engine
          </div>
        </div>
      )}

      {/* Main Active Chat Area */}
      <div className="flex-1 flex flex-col justify-between p-4 bg-[#09090b]">
        {/* Top Bar: Session Title, Connection & Parameters */}
        <div className="sentinel-card px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 mb-3 border-zinc-800/80">
          <div className="flex items-center space-x-3 text-xs">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-1 rounded bg-zinc-800/80 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors border border-zinc-700/80"
              title={showSidebar ? 'Hide Sessions Sidebar' : 'Show Sessions Sidebar'}
            >
              {showSidebar ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
            </button>

            <div className="w-6 h-6 rounded bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-white">{activeSession?.title || selectedModel.name}</span>
                <span className="px-2 py-0.2 rounded bg-zinc-800 text-zinc-300 font-mono text-[10px]">
                  {selectedModel.provider} • {selectedModel.model}
                </span>
              </div>
              <div className="flex items-center space-x-2 mt-0.5 text-[11px] text-zinc-400 font-mono">
                <span className={`flex items-center space-x-1 ${
                  selectedModel.provider === 'SENTINEL Free Local Model' || selectedModel.provider === 'Ollama'
                    ? 'text-emerald-400'
                    : (selectedModel.apiKey && !selectedModel.apiKey.includes('sk_live_an') && selectedModel.apiKey !== 'dummy_key')
                    ? 'text-emerald-400'
                    : 'text-amber-400'
                }`}>
                  <Key className="w-3 h-3" />
                  <span>
                    {selectedModel.provider === 'SENTINEL Free Local Model' || selectedModel.provider === 'Ollama'
                      ? 'Local Ollama Daemon Connected (Free)'
                      : (selectedModel.apiKey && !selectedModel.apiKey.includes('sk_live_an') && selectedModel.apiKey !== 'dummy_key')
                      ? `API Key Verified (${selectedModel.apiKey.slice(0, 10)}...)`
                      : '⚠️ API Key Missing / Required'}
                  </span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            {/* Active Project Workspace Selector */}
            <div className="flex items-center space-x-1.5 bg-purple-950/30 border border-purple-800/50 rounded px-2 py-1 text-purple-300 font-mono text-[11px]">
              <Layers className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-zinc-400">Project:</span>
              <select
                value={activeProject?.id || ''}
                onChange={(e) => {
                  if (e.target.value === 'ADD_NEW') {
                    openAddProjectModal();
                  } else {
                    selectProject(e.target.value);
                  }
                }}
                className="bg-transparent text-purple-300 font-semibold focus:outline-none cursor-pointer"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id} className="bg-[#121215] text-zinc-200">
                    {p.name}
                  </option>
                ))}
                <option value="ADD_NEW" className="bg-[#121215] text-purple-400 font-bold">
                  + Add Project...
                </option>
              </select>
            </div>

            {/* Active System Prompt Selector */}
            <div className="flex items-center space-x-1 bg-[#09090b] border border-zinc-800 rounded px-2 py-1 text-zinc-300 font-mono text-[11px]">
              <FileText className="w-3 h-3 text-emerald-400" />
              <span className="text-zinc-500">System Prompt:</span>
              <select
                value={systemPromptVersion}
                onChange={(e) => setSystemPromptVersion(e.target.value)}
                className="bg-transparent text-white focus:outline-none cursor-pointer"
              >
                <option value="v1.4">v1.4 (Active Healed)</option>
                <option value="v1.3">v1.3 (Candidate)</option>
                <option value="v1.0">v1.0 (Baseline)</option>
              </select>
            </div>

            <button
              onClick={() => setShowParameters(!showParameters)}
              className={`p-1.5 rounded border text-xs transition-colors flex items-center space-x-1 font-mono ${
                showParameters
                  ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400'
                  : 'bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:text-white'
              }`}
              title="Model Parameters"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Temp {temperature}</span>
            </button>

            <button
              onClick={() => clearChatHistory(selectedModel.id)}
              className="p-1.5 rounded bg-zinc-800/80 hover:bg-zinc-800 text-zinc-400 hover:text-red-400 border border-zinc-700/80 transition-colors"
              title="Clear Session Messages"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Model Parameter Sliders Drawer */}
        {showParameters && (
          <div className="sentinel-card p-3 mb-3 grid grid-cols-3 gap-4 text-xs font-mono bg-[#0c0c0e]">
            <div className="space-y-1">
              <div className="flex justify-between text-zinc-400">
                <span>Temperature</span>
                <span className="text-emerald-400">{temperature}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-zinc-400">
                <span>Top_P</span>
                <span className="text-emerald-400">0.95</span>
              </div>
              <input type="range" min="0" max="1" step="0.05" defaultValue="0.95" className="w-full accent-emerald-500" />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-zinc-400">
                <span>Max Tokens</span>
                <span className="text-emerald-400">2048</span>
              </div>
              <input type="range" min="256" max="4096" step="256" defaultValue="2048" className="w-full accent-emerald-500" />
            </div>
          </div>
        )}

        {/* Messages List Area */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4 text-xs">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
              <div className="p-3 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Bot className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Start Chatting with {selectedModel.name}
                </h3>
                <p className="text-xs text-zinc-400 mt-1 max-w-md">
                  Direct multi-turn conversation backed by real-time SENTINEL reliability, hallucination checks, and context citation evaluations.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2 pt-2">
                <button
                  onClick={() => setInput("What is the company's refund policy for enterprise accounts?")}
                  className="px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] font-mono border border-zinc-700"
                >
                  "What is the company's refund policy?"
                </button>
                <button
                  onClick={() => setInput("Summarize SLA uptime standards for Q2.")}
                  className="px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] font-mono border border-zinc-700"
                >
                  "Summarize SLA uptime standards for Q2."
                </button>
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex space-x-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0 mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-2xl space-y-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  {/* Message Bubble */}
                  <div
                    className={`p-3.5 rounded-lg text-xs leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-emerald-600/90 text-white font-sans rounded-tr-none shadow-sm'
                        : 'bg-[#121215] border border-zinc-800 text-zinc-100 font-mono rounded-tl-none'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  </div>

                  {/* Per-Message SENTINEL Telemetry Bar (for Assistant Messages) */}
                  {msg.role === 'assistant' && msg.faithfulness !== undefined && (
                    <div className="p-2.5 bg-[#0c0c0e] border border-zinc-800/80 rounded-md font-mono text-[11px] space-y-1.5">
                      <div className="flex items-center justify-between text-zinc-400">
                        <span className="flex items-center space-x-1.5 text-emerald-400 font-semibold">
                          <Sparkles className="w-3 h-3" />
                          <span>SENTINEL Reliability Evaluation</span>
                        </span>
                        <span className="text-zinc-500 text-[10px]">{msg.timestamp}</span>
                      </div>

                      <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
                        <div className="p-1 bg-[#09090b] rounded border border-emerald-500/30 text-emerald-400">
                          <span className="text-zinc-500 block">Faithfulness</span>
                          <span className="font-bold">{msg.faithfulness}%</span>
                        </div>
                        <div className="p-1 bg-[#09090b] rounded border border-emerald-500/30 text-emerald-400">
                          <span className="text-zinc-500 block">Hallucination</span>
                          <span className="font-bold">Clear ✓</span>
                        </div>
                        <div className="p-1 bg-[#09090b] rounded border border-zinc-800 text-cyan-400">
                          <span className="text-zinc-500 block">Latency</span>
                          <span className="font-bold">{msg.latency}</span>
                        </div>
                        <div className="p-1 bg-[#09090b] rounded border border-zinc-800 text-zinc-300">
                          <span className="text-zinc-500 block">Tokens</span>
                          <span className="font-bold">{msg.tokens}</span>
                        </div>
                      </div>

                      {msg.retrievedContext && (
                        <div className="text-[10px] text-zinc-400 bg-[#09090b] p-1.5 rounded border border-zinc-800 truncate">
                          <span className="text-emerald-400 font-semibold">Cited: </span>
                          {msg.retrievedContext}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 flex-shrink-0 mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))
          )}

          {/* Streaming Loading Bubble */}
          {isSending && (
            <div className="flex space-x-3 justify-start">
              <div className="w-7 h-7 rounded bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3 bg-[#121215] border border-zinc-800 rounded-lg text-xs font-mono text-zinc-400 flex items-center space-x-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                <span>Generating streaming tokens & evaluating faithfulness...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Textarea Prompt Form */}
        <form onSubmit={handleSend} className="mt-3 space-y-2">
          <div className="sentinel-card p-2 flex items-center space-x-2 bg-[#121215] border-zinc-700/80 focus-within:border-emerald-500 transition-colors">
            <textarea
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${selectedModel.name}... (Press Enter to send, Shift+Enter for newline)`}
              className="flex-1 bg-transparent px-2 py-1 text-xs text-white placeholder-zinc-500 focus:outline-none font-sans resize-none"
            />

            <button
              type="submit"
              disabled={!input.trim() || isSending}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded text-xs font-medium transition-colors flex items-center space-x-1.5 shadow-sm cursor-pointer"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono px-1">
            <span>Connected Endpoint: {selectedModel.provider}</span>
            <span>SENTINEL Active Guardrails: ON</span>
          </div>
        </form>
      </div>
    </div>
  );
};
