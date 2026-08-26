import React, { useState } from 'react';
import { Code2, Key, Copy, Check, Plus, Trash2, BookOpen, Globe, Shield } from 'lucide-react';
import { useSentinel } from '../../../context/SentinelContext';

export const IntegrationTab: React.FC = () => {
  const { selectedModel, apiKeys, createApiKey, revokeApiKey } = useSentinel();
  const [copiedSdk, setCopiedSdk] = useState(false);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [newKeyName, setNewKeyName] = useState('');

  if (!selectedModel) return null;

  const pythonSnippet = `pip install sentinel-sdk

import sentinel

# Initialize SENTINEL SDK for ${selectedModel.name}
client = sentinel.Client(
    api_key="sk_live_sentinel_8f9a2b4c...",
    model_name="${selectedModel.name}"
)

# Autonomous evaluation & logging wrapper
client.log(
    model="${selectedModel.model}",
    input=user_input,
    output=model_response,
    metadata={"environment": "production"}
)`;

  const handleCopySdk = () => {
    navigator.clipboard.writeText(pythonSnippet);
    setCopiedSdk(true);
    setTimeout(() => setCopiedSdk(false), 2000);
  };

  const handleCopyKey = (id: string, keyMasked: string) => {
    navigator.clipboard.writeText(keyMasked);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const handleCreateKey = () => {
    createApiKey(newKeyName.trim() || `${selectedModel.name} SDK Key`);
    setNewKeyName('');
  };

  return (
    <div className="space-y-6 select-none">
      {/* Header Banner */}
      <div className="sentinel-card p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Developer Integration & SDK</h2>
            <p className="text-xs text-zinc-400 mt-0.5 font-mono">
              Connect your application code directly to SENTINEL for model identity: {selectedModel.name}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="px-2.5 py-1 rounded bg-zinc-800 text-zinc-300 font-mono border border-zinc-700">
            API Endpoint: https://api.sentinel.dev/v1
          </span>
        </div>
      </div>

      {/* Grid: SDK Snippet & API Key Manager */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Python SDK Snippet */}
        <div className="sentinel-card p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-semibold text-white">Python SDK Integration</h3>
            </div>
            <button
              onClick={handleCopySdk}
              className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-mono rounded flex items-center space-x-1 border border-zinc-700"
            >
              {copiedSdk ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedSdk ? 'Copied' : 'Copy Code'}</span>
            </button>
          </div>

          <pre className="p-3.5 bg-[#09090b] border border-zinc-800 rounded text-xs text-emerald-300 font-mono overflow-x-auto leading-relaxed">
            <code>{pythonSnippet}</code>
          </pre>
        </div>

        {/* Right: API Keys Management */}
        <div className="sentinel-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center space-x-2">
              <Key className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-semibold text-white">API Keys Management</h3>
            </div>
            <span className="text-[10px] font-mono text-zinc-500">{apiKeys.length} active keys</span>
          </div>

          {/* Create Key Form */}
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Key description (e.g. Production Backend)"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              className="flex-1 px-3 py-1.5 bg-[#09090b] border border-zinc-700 rounded text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 font-sans"
            />
            <button
              onClick={handleCreateKey}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-medium transition-colors flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create API Key</span>
            </button>
          </div>

          {/* Keys List */}
          <div className="space-y-2 pt-1 font-mono text-xs">
            {apiKeys.map((k) => (
              <div
                key={k.id}
                className="p-3 bg-[#09090b] border border-zinc-800 rounded flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-white text-[11px]">{k.name}</div>
                  <div className="text-zinc-400 text-[11px] mt-0.5">{k.keyMasked}</div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleCopyKey(k.id, k.keyMasked)}
                    className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800"
                    title="Copy Key"
                  >
                    {copiedKeyId === k.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => revokeApiKey(k.id)}
                    className="p-1 rounded text-zinc-400 hover:text-red-400 hover:bg-zinc-800"
                    title="Revoke Key"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
