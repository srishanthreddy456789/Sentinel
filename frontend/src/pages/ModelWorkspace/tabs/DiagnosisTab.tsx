import React, { useState } from 'react';
import { SearchCode, CheckCircle2, ArrowDown, Sparkles, ShieldAlert, Cpu, Check, RefreshCw } from 'lucide-react';
import { useSentinel } from '../../../context/SentinelContext';

export const DiagnosisTab: React.FC = () => {
  const { selectedModel, selectedFailureId, diagnosesMap, applyDiagnosisFix } = useSentinel();
  const [isApplyingFix, setIsApplyingFix] = useState(false);
  const [fixApplied, setFixApplied] = useState(false);

  if (!selectedModel) return null;

  const currentFailureId = selectedFailureId || 'FAIL-0832';
  const diagnosis = diagnosesMap[currentFailureId] || diagnosesMap['FAIL-0832'];

  const handleApplyFix = () => {
    setIsApplyingFix(true);
    setTimeout(() => {
      setIsApplyingFix(false);
      setFixApplied(true);
      applyDiagnosisFix(currentFailureId);
    }, 1000);
  };

  return (
    <div className="space-y-6 select-none">
      {/* Header Banner */}
      <div className="sentinel-card p-4 flex items-center justify-between border-l-4 border-l-amber-500 bg-[#0e0e12]">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <SearchCode className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-semibold text-white">Failure Diagnosis — {diagnosis.failureId}</h2>
              <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-mono text-[10px] border border-amber-500/20">
                Root Cause: {diagnosis.type}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              SENTINEL Autonomous Root-Cause Analysis for exact model identity: {selectedModel.name}
            </p>
          </div>
        </div>

        <div className="text-right font-mono">
          <span className="text-[10px] text-zinc-500 uppercase block">Diagnosis Confidence</span>
          <span className="text-xl font-semibold text-emerald-400">{diagnosis.confidence}%</span>
        </div>
      </div>

      {/* Question vs Generated vs Expected Comparison */}
      <div className="sentinel-card p-5 space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          ANOMALY INSPECTION & TRACE
        </h3>

        {/* User Question */}
        <div className="space-y-1">
          <label className="text-[11px] font-mono text-zinc-500 uppercase">User Question</label>
          <div className="p-3 bg-[#09090b] border border-zinc-800 rounded text-xs text-white font-mono">
            "{diagnosis.question}"
          </div>
        </div>

        {/* Generated vs Expected Answer Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* Generated Answer (Failed) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] font-mono text-red-400">
              <span>GENERATED ANSWER (ACTUAL)</span>
              <span className="text-[10px] bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20">
                Incorrect
              </span>
            </div>
            <div className="p-3 bg-red-500/5 border border-red-500/30 rounded text-xs text-red-200 font-mono leading-relaxed">
              "{diagnosis.generatedAnswer}"
            </div>
          </div>

          {/* Expected Answer (Ground Truth) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] font-mono text-emerald-400">
              <span>EXPECTED ANSWER (GROUND TRUTH)</span>
              <span className="text-[10px] bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                Verified
              </span>
            </div>
            <div className="p-3 bg-emerald-500/5 border border-emerald-500/30 rounded text-xs text-emerald-200 font-mono leading-relaxed">
              "{diagnosis.expectedAnswer}"
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Evidence Metrics & Visual Causal Flow Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Evidence Metrics */}
        <div className="sentinel-card p-5 space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">EVIDENCE BREAKDOWN</h3>

          <div className="grid grid-cols-2 gap-3 font-mono">
            <div className="p-3 bg-[#09090b] border border-zinc-800 rounded">
              <span className="text-[10px] text-zinc-500 uppercase block">Model Agreement</span>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-lg font-semibold text-white">{diagnosis.evidence.modelAgreement}%</span>
                <span className="text-[10px] text-emerald-400">High Consensus</span>
              </div>
            </div>

            <div className="p-3 bg-[#09090b] border border-amber-500/30 rounded bg-amber-500/5">
              <span className="text-[10px] text-amber-500 uppercase block">Retrieval Coverage</span>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-lg font-semibold text-amber-400">{diagnosis.evidence.retrievalCoverage}%</span>
                <span className="text-[10px] text-amber-400">Low Coverage</span>
              </div>
            </div>

            <div className="p-3 bg-[#09090b] border border-zinc-800 rounded">
              <span className="text-[10px] text-zinc-500 uppercase block">Historical Failure Rate</span>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-lg font-semibold text-white">{diagnosis.evidence.historicalFailureRate}%</span>
                <span className="text-[10px] text-zinc-400">Baseline</span>
              </div>
            </div>

            <div className="p-3 bg-[#09090b] border border-zinc-800 rounded">
              <span className="text-[10px] text-zinc-500 uppercase block">Prompt Quality</span>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-lg font-semibold text-emerald-400">{diagnosis.evidence.promptQuality}%</span>
                <span className="text-[10px] text-emerald-400">Valid Schema</span>
              </div>
            </div>
          </div>
        </div>

        {/* Visual Causal Flow Graph */}
        <div className="sentinel-card p-5 space-y-4 flex flex-col justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">VISUAL CAUSAL FLOW</h3>

          <div className="space-y-2 py-2 font-mono text-xs">
            {diagnosis.causalFlow.map((step, idx) => (
              <React.Fragment key={idx}>
                <div
                  className={`p-2.5 rounded border text-center font-medium ${
                    idx === 0
                      ? 'bg-red-500/10 border-red-500/30 text-red-400'
                      : idx === diagnosis.causalFlow.length - 1
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 font-bold'
                      : 'bg-[#09090b] border-zinc-800 text-zinc-300'
                  }`}
                >
                  {step}
                </div>
                {idx < diagnosis.causalFlow.length - 1 && (
                  <div className="flex justify-center text-zinc-600">
                    <ArrowDown className="w-3.5 h-3.5" />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Recommended Action & Apply Fix Button */}
      <div className="sentinel-card p-5 bg-gradient-to-r from-emerald-950/30 via-[#121215] to-[#121215] border-emerald-500/40 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-emerald-400">
            <Sparkles className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">RECOMMENDED AUTONOMOUS ACTION</span>
          </div>
          {fixApplied && (
            <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-xs font-mono border border-emerald-500/40 flex items-center space-x-1">
              <Check className="w-3.5 h-3.5" />
              <span>Fix Applied & Promoted</span>
            </span>
          )}
        </div>

        <p className="text-xs text-zinc-200 font-mono leading-relaxed">{diagnosis.recommendedAction}</p>

        <div className="pt-2 flex justify-end">
          <button
            onClick={handleApplyFix}
            disabled={isApplyingFix || fixApplied}
            className={`px-5 py-2 rounded text-xs font-medium transition-all flex items-center space-x-2 ${
              fixApplied
                ? 'bg-zinc-800 text-zinc-400 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950 cursor-pointer'
            }`}
          >
            {isApplyingFix ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Executing Self-Healing Pipeline...</span>
              </>
            ) : fixApplied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Self-Healing Applied</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Apply Fix & Rerank</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
