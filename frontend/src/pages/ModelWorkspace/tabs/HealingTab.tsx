import React, { useState } from 'react';
import { Zap, TrendingUp, CheckCircle2, RotateCcw, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';
import { useSentinel } from '../../../context/SentinelContext';
import { HealingRecord } from '../../../types/sentinel';

export const HealingTab: React.FC = () => {
  const { selectedModel, healingMap, promoteHealing } = useSentinel();

  if (!selectedModel) return null;

  const healingRecords: HealingRecord[] =
    healingMap[selectedModel.id] || healingMap['model-2'] || [];

  const [selectedHealing, setSelectedHealing] = useState<HealingRecord | null>(
    healingRecords[0] || null
  );

  const activeRecord = selectedHealing || healingRecords[0];

  const chartData = activeRecord
    ? [
        { stage: 'BEFORE Fix', quality: activeRecord.beforeQuality, fill: '#ef4444' },
        { stage: 'AFTER Self-Healing', quality: activeRecord.afterQuality, fill: '#10b981' },
      ]
    : [];

  return (
    <div className="space-y-6 select-none">
      {/* Top Healing Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="sentinel-card p-3.5">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">HEALING ATTEMPTS</span>
            <Zap className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-1 text-xl font-semibold font-mono text-white">42</div>
        </div>

        <div className="sentinel-card p-3.5">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">SUCCESSFUL FIXES</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-1 text-xl font-semibold font-mono text-emerald-400">33</div>
        </div>

        <div className="sentinel-card p-3.5">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">UNRESOLVED / REJECTED</span>
            <RotateCcw className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-1 text-xl font-semibold font-mono text-zinc-400">9</div>
        </div>

        <div className="sentinel-card p-3.5">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">SUCCESS RATE</span>
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-1 text-xl font-semibold font-mono text-purple-400">78.6%</div>
        </div>
      </div>

      {/* BEFORE vs AFTER Inspector Panel */}
      {activeRecord && (
        <div className="sentinel-card p-5 bg-gradient-to-r from-[#121215] via-[#121215] to-purple-950/20 border-purple-500/30 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold text-white">HEALING INSPECTOR — {activeRecord.id}</span>
                <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 font-mono text-[10px] border border-purple-500/20">
                  Target: {activeRecord.failureId}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5 font-mono">Action: {activeRecord.action}</p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => promoteHealing(activeRecord.id)}
                disabled={activeRecord.status === 'Promoted'}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                  activeRecord.status === 'Promoted'
                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs cursor-pointer'
                }`}
              >
                {activeRecord.status === 'Promoted' ? 'Promoted' : 'Promote Fix'}
              </button>
              <button className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-xs font-medium transition-colors border border-zinc-700">
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
          <div className="h-40 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} stroke="#71717a" fontSize={10} />
                <YAxis type="category" dataKey="stage" stroke="#71717a" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '6px', fontSize: '11px' }} />
                <Bar dataKey="quality" radius={[0, 4, 4, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Healing History Table */}
      <div className="sentinel-card overflow-hidden">
        <div className="px-5 py-3 border-b border-zinc-800 flex items-center justify-between bg-[#0c0c0e]">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">HEALING HISTORY LOG</h3>
            <p className="text-[11px] text-zinc-500">Autonomous resolution events for {selectedModel.name}</p>
          </div>
          <span className="text-[10px] font-mono text-purple-400">{healingRecords.length} records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-[#09090b] text-[10px] uppercase font-semibold text-zinc-500 border-b border-zinc-800 font-mono">
              <tr>
                <th className="px-5 py-2.5">Failure ID</th>
                <th className="px-4 py-2.5">Root Cause</th>
                <th className="px-4 py-2.5">Self-Healing Action</th>
                <th className="px-4 py-2.5 text-right">Before</th>
                <th className="px-4 py-2.5 text-right">After</th>
                <th className="px-4 py-2.5 text-right">Improvement</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-sans">
              {healingRecords.map((h) => (
                <tr
                  key={h.id}
                  onClick={() => setSelectedHealing(h)}
                  className={`hover:bg-zinc-800/40 cursor-pointer transition-colors ${
                    activeRecord?.id === h.id ? 'bg-zinc-800/60' : ''
                  }`}
                >
                  <td className="px-5 py-3 font-mono font-medium text-amber-400">{h.failureId}</td>
                  <td className="px-4 py-3 font-mono text-[11px] text-zinc-300">{h.rootCause}</td>
                  <td className="px-4 py-3 text-zinc-200 text-[11px] max-w-xs truncate">{h.action}</td>
                  <td className="px-4 py-3 text-right font-mono text-red-400">{h.beforeQuality}%</td>
                  <td className="px-4 py-3 text-right font-mono text-emerald-400">{h.afterQuality}%</td>
                  <td className="px-4 py-3 text-right font-mono font-semibold text-purple-400">
                    +{h.improvement}%
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                        h.status === 'Promoted'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                      }`}
                    >
                      {h.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button className="text-[11px] font-mono text-purple-400 hover:underline">Inspect</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
