import React, { useState } from 'react';
import { Zap, TrendingUp, CheckCircle2, RotateCcw, Sparkles, ArrowRight, ShieldCheck, Plus, X, RefreshCw } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';
import { useSentinel } from '../../../context/SentinelContext';
import { HealingRecord } from '../../../types/sentinel';

export const HealingTab: React.FC = () => {
  const { selectedModel, healingMap, promoteHealing, rollbackHealing, runPromptHealing } = useSentinel();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mutatePromptText, setMutatePromptText] = useState('You are an enterprise AI assistant.');
  const [failureType, setFailureType] = useState('FAITHFULNESS');
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  if (!selectedModel) return null;

  const healingRecords: HealingRecord[] = healingMap[selectedModel.id] || [];

  const totalAttempts = healingRecords.length;
  const successfulFixes = healingRecords.filter(r => r.status === 'Verified' || r.status === 'Promoted').length;
  const unresolvedFixes = totalAttempts - successfulFixes;
  const successRate = totalAttempts ? Number(((successfulFixes / totalAttempts) * 100).toFixed(1)) : 100.0;

  const [selectedHealingId, setSelectedHealingId] = useState<string | null>(null);

  const activeRecord = healingRecords.find(r => r.id === selectedHealingId) || healingRecords[0] || null;

  const chartData = activeRecord
    ? [
        { stage: 'BEFORE Quality', quality: activeRecord.beforeQuality, fill: '#ef4444' },
        { stage: 'AFTER Self-Healing', quality: activeRecord.afterQuality, fill: '#10b981' },
      ]
    : [];

  const handleSynthesizeMutation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mutatePromptText.trim()) return;

    setIsSynthesizing(true);
    try {
      const newRecord = await runPromptHealing(selectedModel.id, mutatePromptText, failureType);
      setSelectedHealingId(newRecord.id);
      setIsModalOpen(false);
    } finally {
      setIsSynthesizing(false);
    }
  };

  return (
    <div className="space-y-6 select-none">
      {/* Top Healing Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="sentinel-card p-3.5">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">HEALING ATTEMPTS</span>
            <Zap className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-1 text-xl font-semibold font-mono text-white">{totalAttempts}</div>
        </div>

        <div className="sentinel-card p-3.5">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">SUCCESSFUL FIXES</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-1 text-xl font-semibold font-mono text-emerald-400">{successfulFixes}</div>
        </div>

        <div className="sentinel-card p-3.5">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">UNRESOLVED / REJECTED</span>
            <RotateCcw className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-1 text-xl font-semibold font-mono text-zinc-400">{unresolvedFixes}</div>
        </div>

        <div className="sentinel-card p-3.5">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">RECOVERY SUCCESS RATE</span>
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-1 text-xl font-semibold font-mono text-purple-400">{successRate}%</div>
        </div>
      </div>

      {/* Top Action Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-white">Closed-Loop Self-Healing Mutations</h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Automatic prompt repair operator P' = M(P, F) for {selectedModel.name}
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>New Prompt Mutation</span>
        </button>
      </div>

      {/* BEFORE vs AFTER Inspector Panel */}
      {activeRecord ? (
        <div className="sentinel-card p-5 bg-gradient-to-r from-[#121215] via-[#121215] to-purple-950/20 border-purple-500/30 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold text-white">HEALING INSPECTOR — {activeRecord.id}</span>
                <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 font-mono text-[10px] border border-purple-500/20">
                  Root Cause: {activeRecord.rootCause}
                </span>
                <span className={`px-2 py-0.5 rounded font-mono text-[10px] ${
                  activeRecord.status === 'Promoted'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-zinc-800 text-zinc-400'
                }`}>
                  {activeRecord.status}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5 font-mono">Action: {activeRecord.action}</p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => promoteHealing(activeRecord.id)}
                disabled={activeRecord.status === 'Promoted'}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer ${
                  activeRecord.status === 'Promoted'
                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                }`}
              >
                {activeRecord.status === 'Promoted' ? 'Promoted to Active' : 'Promote Fix to Prompt'}
              </button>
              <button
                onClick={() => rollbackHealing(activeRecord.id)}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-xs font-medium transition-colors border border-zinc-700 cursor-pointer"
              >
                Rollback
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            {/* Before Score */}
            <div className="p-4 bg-[#09090b] border border-red-500/30 rounded text-center space-y-1">
              <span className="text-[10px] font-mono text-zinc-500 uppercase">BEFORE QUALITY</span>
              <div className="text-2xl font-bold font-mono text-red-400">{activeRecord.beforeQuality}%</div>
              <span className="text-[10px] text-zinc-400 block">Baseline Accuracy</span>
            </div>

            {/* Improvement delta */}
            <div className="p-4 bg-[#09090b] border border-purple-500/30 rounded text-center space-y-1">
              <span className="text-[10px] font-mono text-purple-400 uppercase">IMPROVEMENT</span>
              <div className="text-2xl font-bold font-mono text-purple-400">+{activeRecord.improvement}%</div>
              <span className="text-[10px] text-emerald-400 block font-mono font-semibold">Self-Healed Delta</span>
            </div>

            {/* After Score */}
            <div className="p-4 bg-[#09090b] border border-emerald-500/30 rounded text-center space-y-1">
              <span className="text-[10px] font-mono text-zinc-500 uppercase">AFTER QUALITY</span>
              <div className="text-2xl font-bold font-mono text-emerald-400">{activeRecord.afterQuality}%</div>
              <span className="text-[10px] text-zinc-400 block">Post-Healing Accuracy</span>
            </div>
          </div>

          {/* Bar Chart Visual Comparison */}
          <div className="h-36 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} stroke="#71717a" fontSize={10} />
                <YAxis type="category" dataKey="stage" stroke="#71717a" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '8px', fontSize: '11px', color: '#ffffff' }}
                  itemStyle={{ color: '#ffffff', fontWeight: 500 }}
                  labelStyle={{ color: '#ffffff', fontWeight: 600 }}
                />
                <Bar dataKey="quality" radius={[0, 4, 4, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="sentinel-card p-12 text-center space-y-3">
          <Zap className="w-10 h-10 text-purple-400 mx-auto" />
          <h3 className="text-sm font-semibold text-white">No Self-Healing Records Found</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            Click "New Prompt Mutation" or apply a diagnosis fix to synthesize candidate prompt patches.
          </p>
        </div>
      )}

      {/* Healing History Table */}
      <div className="sentinel-card overflow-hidden">
        <div className="px-5 py-3 border-b border-zinc-800 flex items-center justify-between bg-[#0c0c0e]">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">HEALING EVENT AUDIT TRAIL</h3>
          <span className="text-[10px] font-mono text-zinc-500">Showing {healingRecords.length} records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-[#09090b] text-[10px] uppercase font-semibold text-zinc-500 border-b border-zinc-800 font-mono">
              <tr>
                <th className="px-5 py-2.5">Healing ID</th>
                <th className="px-4 py-2.5">Root Cause</th>
                <th className="px-4 py-2.5">Action Applied</th>
                <th className="px-4 py-2.5 text-right">Before</th>
                <th className="px-4 py-2.5 text-right">After</th>
                <th className="px-4 py-2.5 text-right">Delta</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5 text-center">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-sans">
              {healingRecords.map((r) => (
                <tr
                  key={r.id}
                  onClick={() => setSelectedHealingId(r.id)}
                  className={`hover:bg-zinc-800/40 cursor-pointer transition-colors ${
                    activeRecord?.id === r.id ? 'bg-zinc-800/30' : ''
                  }`}
                >
                  <td className="px-5 py-3 font-mono font-medium text-purple-400">{r.id}</td>
                  <td className="px-4 py-3 font-medium text-white">{r.rootCause}</td>
                  <td className="px-4 py-3 font-mono text-[11px] text-zinc-400 max-w-xs truncate">{r.action}</td>
                  <td className="px-4 py-3 text-right font-mono text-red-400">{r.beforeQuality}%</td>
                  <td className="px-4 py-3 text-right font-mono text-emerald-400">{r.afterQuality}%</td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-purple-400">+{r.improvement}%</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                        r.status === 'Promoted'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button className="text-[11px] font-mono text-emerald-400 hover:underline">
                      Select
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: New Prompt Mutation */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <form
            onSubmit={handleSynthesizeMutation}
            className="w-full max-w-lg bg-[#121215] border border-zinc-700 rounded-lg overflow-hidden text-zinc-100 p-5 space-y-4 shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>Synthesize Self-Healing Prompt Mutation</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Executes Closed-Loop Mutation Operator P' = M(P, F) to synthesize prompt patches.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">Target Failure Taxonomy (F)</label>
                <select
                  value={failureType}
                  onChange={(e) => setFailureType(e.target.value)}
                  className="w-full bg-[#09090b] border border-zinc-800 rounded px-3 py-2 text-zinc-200 focus:outline-none focus:border-purple-500 font-mono"
                >
                  <option value="FAITHFULNESS">FAITHFULNESS — Inject Context Refusal Constraint</option>
                  <option value="HALLUCINATION">HALLUCINATION — Eliminate Speculation & Extrapolation</option>
                  <option value="CORRECTNESS">CORRECTNESS — Schema & Golden Reference Adherence</option>
                  <option value="SAFETY">SAFETY — Strict Ethical Preamble & Toxicity Refusal</option>
                  <option value="INSTRUCTION_BREAK">INSTRUCTION_BREAK — Enforce Pure JSON Response</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">Current Active Prompt (P)</label>
                <textarea
                  rows={3}
                  required
                  value={mutatePromptText}
                  onChange={(e) => setMutatePromptText(e.target.value)}
                  className="w-full bg-[#09090b] border border-zinc-800 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500 font-mono text-xs"
                />
              </div>

              <div className="p-3 bg-purple-500/5 border border-purple-500/20 rounded text-[11px] text-purple-300">
                <span>The Self-Healing Engine will inject verified heuristic repair directives ΔP(F) and assert verification against baseline test cases.</span>
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-800 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSynthesizing}
                className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs font-semibold cursor-pointer shadow-sm disabled:opacity-50 flex items-center space-x-1.5"
              >
                {isSynthesizing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Synthesizing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Synthesize & Apply</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
