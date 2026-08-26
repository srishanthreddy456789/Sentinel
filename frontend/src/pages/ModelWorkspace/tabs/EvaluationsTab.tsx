import React, { useState } from 'react';
import { ClipboardCheck, CheckCircle2, XCircle, AlertTriangle, Clock, Play, ArrowRight, X } from 'lucide-react';
import { useSentinel } from '../../../context/SentinelContext';
import { EvaluationRun } from '../../../types/sentinel';

export const EvaluationsTab: React.FC = () => {
  const { selectedModel, evaluationsMap } = useSentinel();
  const [selectedRun, setSelectedRun] = useState<EvaluationRun | null>(null);

  if (!selectedModel) return null;

  const runs: EvaluationRun[] =
    evaluationsMap[selectedModel.id] ||
    evaluationsMap['model-2'] || [];

  const totalEvaluations = runs.length;
  const totalTestCases = runs.reduce((acc, r) => acc + r.testCases, 0);
  const totalPassed = runs.reduce((acc, r) => acc + r.passed, 0);
  const avgPassRate = totalTestCases ? Number(((totalPassed / totalTestCases) * 100).toFixed(1)) : 94.2;

  return (
    <div className="space-y-6 select-none">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="sentinel-card p-3.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">TOTAL EVALUATIONS</span>
          <div className="mt-1 text-xl font-semibold font-mono text-white">{totalEvaluations}</div>
        </div>

        <div className="sentinel-card p-3.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">TOTAL TEST CASES</span>
          <div className="mt-1 text-xl font-semibold font-mono text-white">{totalTestCases.toLocaleString()}</div>
        </div>

        <div className="sentinel-card p-3.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">AVERAGE PASS RATE</span>
          <div className="mt-1 text-xl font-semibold font-mono text-emerald-400">{avgPassRate}%</div>
        </div>

        <div className="sentinel-card p-3.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">MODEL QUALITY SCORE</span>
          <div className="mt-1 text-xl font-semibold font-mono text-emerald-400">{selectedModel.quality}%</div>
        </div>
      </div>

      {/* Evaluations Table */}
      <div className="sentinel-card overflow-hidden">
        <div className="px-5 py-3 border-b border-zinc-800 flex items-center justify-between bg-[#0c0c0e]">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">EVALUATION HISTORY</h3>
            <p className="text-[11px] text-zinc-500">Filtered for {selectedModel.name}</p>
          </div>
          <button className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-medium transition-colors flex items-center space-x-1">
            <Play className="w-3 h-3 fill-current" />
            <span>New Evaluation Run</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-[#09090b] text-[10px] uppercase font-semibold text-zinc-500 border-b border-zinc-800 font-mono">
              <tr>
                <th className="px-5 py-2.5">Run ID</th>
                <th className="px-4 py-2.5">Prompt Version</th>
                <th className="px-4 py-2.5 text-right">Test Cases</th>
                <th className="px-4 py-2.5 text-right">Passed</th>
                <th className="px-4 py-2.5 text-right">Failed</th>
                <th className="px-4 py-2.5 text-right">Quality</th>
                <th className="px-4 py-2.5">Duration</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-sans">
              {runs.map((run) => (
                <tr
                  key={run.id}
                  onClick={() => setSelectedRun(run)}
                  className="hover:bg-zinc-800/40 cursor-pointer transition-colors group"
                >
                  <td className="px-5 py-3 font-mono font-medium text-emerald-400 group-hover:underline">
                    {run.id}
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] text-zinc-400">{run.promptVersion}</td>
                  <td className="px-4 py-3 text-right font-mono text-zinc-200">{run.testCases}</td>
                  <td className="px-4 py-3 text-right font-mono text-emerald-400">{run.passed}</td>
                  <td className="px-4 py-3 text-right font-mono text-red-400">{run.failed}</td>
                  <td className="px-4 py-3 text-right font-mono font-semibold text-emerald-400">
                    {run.quality}%
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] text-zinc-400">{run.duration}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                        run.status === 'Passed'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : run.status === 'Warning'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}
                    >
                      {run.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-[11px] font-mono text-zinc-400 group-hover:text-white flex items-center justify-center space-x-1">
                      <span>View</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal for Selected Evaluation Run */}
      {selectedRun && (
        <div className="fixed inset-[#000000] z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl bg-[#121215] border border-zinc-700 rounded-lg overflow-hidden text-zinc-100 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="text-sm font-semibold text-white">Evaluation Details — {selectedRun.id}</h3>
                <p className="text-xs text-zinc-400 font-mono mt-0.5">
                  Target Model: {selectedModel.name} ({selectedRun.promptVersion})
                </p>
              </div>
              <button
                onClick={() => setSelectedRun(null)}
                className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2 font-mono text-xs text-center">
              <div className="p-2 bg-[#09090b] rounded border border-zinc-800">
                <span className="text-[10px] text-zinc-500 uppercase block">Total Cases</span>
                <span className="text-sm font-semibold text-white">{selectedRun.testCases}</span>
              </div>
              <div className="p-2 bg-[#09090b] rounded border border-emerald-500/30">
                <span className="text-[10px] text-emerald-500 uppercase block">Passed</span>
                <span className="text-sm font-semibold text-emerald-400">{selectedRun.passed}</span>
              </div>
              <div className="p-2 bg-[#09090b] rounded border border-red-500/30">
                <span className="text-[10px] text-red-500 uppercase block">Failed</span>
                <span className="text-sm font-semibold text-red-400">{selectedRun.failed}</span>
              </div>
              <div className="p-2 bg-[#09090b] rounded border border-zinc-800">
                <span className="text-[10px] text-zinc-500 uppercase block">Duration</span>
                <span className="text-sm font-semibold text-zinc-300">{selectedRun.duration}</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-zinc-300">Sample Test Case Breakdown</h4>
              <div className="space-y-1.5 font-mono text-xs">
                <div className="p-2 bg-[#09090b] rounded border border-zinc-800 flex items-center justify-between">
                  <span className="text-zinc-300">TC-001 (Refund Policy Duration match)</span>
                  <span className="text-emerald-400 font-semibold">✓ PASSED (1.12s)</span>
                </div>
                <div className="p-2 bg-[#09090b] rounded border border-zinc-800 flex items-center justify-between">
                  <span className="text-zinc-300">TC-002 (Enterprise Pricing seat discount)</span>
                  <span className="text-red-400 font-semibold">✗ FAILED (1.45s)</span>
                </div>
                <div className="p-2 bg-[#09090b] rounded border border-zinc-800 flex items-center justify-between">
                  <span className="text-zinc-300">TC-003 (System Status SLA verification)</span>
                  <span className="text-emerald-400 font-semibold">✓ PASSED (0.98s)</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-800 flex justify-end">
              <button
                onClick={() => setSelectedRun(null)}
                className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded text-xs font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
