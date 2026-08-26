import React, { useState, useEffect } from 'react';
import { Sliders, Save, Trash2, CheckCircle2, ShieldAlert, Cpu, AlertTriangle } from 'lucide-react';
import { useSentinel } from '../../../context/SentinelContext';

export const SettingsTab: React.FC = () => {
  const { selectedModel, updateModelName, updateModelSettings, deleteModel } = useSentinel();

  const [displayName, setDisplayName] = useState(selectedModel?.name || '');
  const [modelId, setModelId] = useState(selectedModel?.model || '');
  const [baseUrl, setBaseUrl] = useState(selectedModel?.baseUrl || '');
  const [qualityThreshold, setQualityThreshold] = useState('95.0');
  const [autoHealing, setAutoHealing] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (selectedModel) {
      setDisplayName(selectedModel.name);
      setModelId(selectedModel.model);
      setBaseUrl(selectedModel.baseUrl || '');
    }
  }, [selectedModel]);

  if (!selectedModel) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;

    // Save exact user-provided display name (updates everywhere immediately!)
    updateModelName(selectedModel.id, displayName.trim());

    updateModelSettings(selectedModel.id, {
      model: modelId.trim(),
      baseUrl: baseUrl.trim(),
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 select-none max-w-4xl">
      {/* Header Banner */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div>
          <h2 className="text-sm font-semibold text-white">Model Workspace Settings</h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Configure parameters for exact model identity: <span className="text-emerald-400 font-mono">{selectedModel.name}</span>
          </p>
        </div>

        {savedSuccess && (
          <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-mono rounded flex items-center space-x-1.5 animate-in fade-in">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Settings saved live across workspace!</span>
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Identity & Display Name */}
        <div className="sentinel-card p-5 space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 border-b border-zinc-800 pb-2">
            MODEL IDENTITY
          </h3>

          <div className="space-y-2">
            <label className="block text-xs font-medium text-zinc-300">
              Display Name <span className="text-emerald-400">*</span>
            </label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3 py-2 bg-[#09090b] border border-zinc-700 rounded text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 font-sans"
            />
            <p className="text-[11px] text-zinc-500 italic">
              Renaming this model will instantly update its display name in the sidebar, global dashboard tables, headers, and traces.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-zinc-300">Provider</label>
              <input
                type="text"
                disabled
                value={selectedModel.provider}
                className="w-full px-3 py-2 bg-[#09090b]/60 border border-zinc-800 rounded text-xs text-zinc-400 font-mono cursor-not-allowed"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-zinc-300">Model Identifier</label>
              <input
                type="text"
                value={modelId}
                onChange={(e) => setModelId(e.target.value)}
                className="w-full px-3 py-2 bg-[#09090b] border border-zinc-700 rounded text-xs text-white font-mono"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Evaluation & Healing Settings */}
        <div className="sentinel-card p-5 space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 border-b border-zinc-800 pb-2">
            EVALUATION & SELF-HEALING THRESHOLDS
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-zinc-300">Quality Target SLA (%)</label>
              <input
                type="text"
                value={qualityThreshold}
                onChange={(e) => setQualityThreshold(e.target.value)}
                className="w-full px-3 py-2 bg-[#09090b] border border-zinc-700 rounded text-xs text-white font-mono"
              />
            </div>

            <div className="space-y-1.5 flex flex-col justify-center">
              <label className="block text-xs font-medium text-zinc-300">Autonomous Self-Healing</label>
              <div className="flex items-center space-x-3 pt-1">
                <button
                  type="button"
                  onClick={() => setAutoHealing(!autoHealing)}
                  className={`w-10 h-5 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                    autoHealing ? 'bg-emerald-600' : 'bg-zinc-800'
                  }`}
                >
                  <div
                    className={`bg-white w-3.5 h-3.5 rounded-full shadow-md transform transition-transform ${
                      autoHealing ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
                <span className="text-xs text-zinc-300 font-mono">
                  {autoHealing ? 'Enabled (Auto Rerank & Prompt Fix)' : 'Disabled'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Save Actions */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => deleteModel(selectedModel.id)}
            className="px-3.5 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded text-xs font-medium transition-colors flex items-center space-x-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Remove Model Connection</span>
          </button>

          <button
            type="submit"
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-medium transition-colors flex items-center space-x-1.5 shadow-sm cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
