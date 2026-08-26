import React, { useState } from 'react';
import { X, Cpu, Key, Globe, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useSentinel } from '../../context/SentinelContext';
import { ApiProvider } from '../../types/sentinel';

const PROVIDERS: { id: ApiProvider; name: string; icon: string; desc: string; requiresKey: boolean }[] = [
  { id: 'SENTINEL Free Local Model', name: 'SENTINEL Free Local Model', icon: '⚡', desc: 'Runs locally using Ollama on your device. No API key required.', requiresKey: false },
  { id: 'OpenAI', name: 'OpenAI', icon: '🟢', desc: 'GPT-4o, GPT-4o-mini, o1, o3-mini models.', requiresKey: true },
  { id: 'Anthropic', name: 'Anthropic', icon: '🟡', desc: 'Claude 3.5 Sonnet, Claude 3 Opus, Haiku.', requiresKey: true },
  { id: 'Google Gemini', name: 'Google Gemini', icon: '🟣', desc: 'Gemini 1.5 Pro, Gemini 1.5 Flash.', requiresKey: true },
  { id: 'Mistral', name: 'Mistral', icon: '🟠', desc: 'Mistral Large, Codestral, Mixtral.', requiresKey: true },
  { id: 'Ollama', name: 'Ollama', icon: '🦙', desc: 'Local Ollama endpoint integration.', requiresKey: false },
  { id: 'Hugging Face', name: 'Hugging Face', icon: '🤗', desc: 'Hugging Face Inference Endpoint API.', requiresKey: true },
  { id: 'Custom LLM API', name: 'Custom LLM API', icon: '⚙️', desc: 'Any OpenAI-compatible or REST custom LLM endpoint.', requiresKey: true },
];

export const AddApiModal: React.FC = () => {
  const { isAddApiModalOpen, closeAddApiModal, addModel } = useSentinel();

  const [name, setName] = useState('');
  const [provider, setProvider] = useState<ApiProvider>('OpenAI');
  const [modelName, setModelName] = useState('GPT-4o');
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [step, setStep] = useState<1 | 2>(1);

  if (!isAddApiModalOpen) return null;

  const handleProviderSelect = (p: ApiProvider) => {
    setProvider(p);
    if (p === 'OpenAI') setModelName('GPT-4o');
    else if (p === 'Anthropic') setModelName('Claude 3.5 Sonnet');
    else if (p === 'Google Gemini') setModelName('Gemini 1.5 Pro');
    else if (p === 'Ollama') setModelName('Llama 3.1 8B');
    else if (p === 'SENTINEL Free Local Model') setModelName('Llama 3.1 (SENTINEL Free)');
    else setModelName('Custom Model');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addModel({
      name: name.trim(), // EXACT name provided by user
      provider,
      model: modelName.trim() || 'Default Model',
      apiKey: apiKey.trim(),
      baseUrl: baseUrl.trim(),
    });

    // Reset form
    setName('');
    setApiKey('');
    setBaseUrl('');
    setStep(1);
  };

  return (
    <div className="fixed inset-[#000000] z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 select-none">
      <div className="w-full max-w-xl bg-[#121215] border border-zinc-700/80 rounded-lg shadow-2xl overflow-hidden flex flex-col text-zinc-100 animate-in fade-in zoom-in duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-[#0c0c0e]">
          <div>
            <h2 className="text-base font-semibold text-white tracking-tight">Connect an AI Model</h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Add a new API connection. The name you enter will be displayed exactly across SENTINEL.
            </p>
          </div>
          <button
            onClick={closeAddApiModal}
            className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto max-h-[75vh]">
          {step === 1 ? (
            <>
              {/* Step 1: Name Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-zinc-300">
                  API / Model Name <span className="text-emerald-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. My Customer Support Bot"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#09090b] border border-zinc-700 rounded-md text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors font-sans"
                />
                <p className="text-[11px] text-zinc-500 italic">
                  This custom display name will be used as the identifier everywhere in your workspace.
                </p>
              </div>

              {/* Step 2: Choose Provider */}
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-medium text-zinc-300">Choose Provider</label>
                <div className="grid grid-cols-2 gap-2">
                  {PROVIDERS.map((p) => {
                    const isSelected = provider === p.id;
                    return (
                      <div
                        key={p.id}
                        onClick={() => handleProviderSelect(p.id)}
                        className={`p-3 rounded-md border text-left cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-emerald-500/10 border-emerald-500/80 text-white'
                            : 'bg-[#09090b] border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800/40'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <span className="text-sm">{p.icon}</span>
                          <span className="text-xs font-medium truncate">{p.name}</span>
                        </div>
                        <p className="text-[10px] text-zinc-400 mt-1 line-clamp-2 leading-snug">{p.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  type="button"
                  disabled={!name.trim()}
                  onClick={() => setStep(2)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded text-xs font-medium transition-colors"
                >
                  Next: Connection Details →
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Step 3: Connection Details */}
              <div className="bg-[#09090b] border border-zinc-800 rounded-md p-3 mb-3 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-white">{name}</span>
                  <span className="text-xs text-zinc-400 font-mono ml-2">({provider})</span>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-emerald-400 hover:underline font-mono"
                >
                  Edit Provider
                </button>
              </div>

              {/* Model identifier */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-zinc-300">Model Name / ID</label>
                <input
                  type="text"
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  placeholder="e.g. gpt-4o or llama-3.1"
                  className="w-full px-3 py-2 bg-[#09090b] border border-zinc-700 rounded-md text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              {/* Provider specifics */}
              {provider === 'SENTINEL Free Local Model' ? (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-md text-xs text-emerald-300 space-y-1">
                  <div className="flex items-center space-x-2 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Runs locally using Ollama.</span>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    No remote API key or external cloud request is required. SENTINEL will route evaluations directly to your local Ollama daemon.
                  </p>
                </div>
              ) : provider === 'Ollama' ? (
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-zinc-300">Ollama Daemon URL</label>
                  <input
                    type="text"
                    value={baseUrl || 'http://localhost:11434'}
                    onChange={(e) => setBaseUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-[#09090b] border border-zinc-700 rounded-md text-xs text-white font-mono"
                  />
                </div>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-zinc-300">API Key</label>
                    <input
                      type="password"
                      placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxx"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="w-full px-3 py-2 bg-[#09090b] border border-zinc-700 rounded-md text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-zinc-300">Custom Base URL (Optional)</label>
                    <input
                      type="text"
                      placeholder="https://api.openai.com/v1"
                      value={baseUrl}
                      onChange={(e) => setBaseUrl(e.target.value)}
                      className="w-full px-3 py-2 bg-[#09090b] border border-zinc-700 rounded-md text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                </>
              )}

              {/* Action buttons */}
              <div className="pt-4 flex items-center justify-between border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-3 py-2 text-zinc-400 hover:text-white text-xs font-medium"
                >
                  ← Back
                </button>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={closeAddApiModal}
                    className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-xs font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-medium transition-colors"
                  >
                    Connect API
                  </button>
                </div>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};
