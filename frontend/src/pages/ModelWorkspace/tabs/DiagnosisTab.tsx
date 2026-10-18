import React, { useState } from 'react';
import { SearchCode, CheckCircle2, ArrowDown, Sparkles, ShieldAlert, Cpu, Check, RefreshCw, Play, ArrowRight } from 'lucide-react';
import { useSentinel } from '../../../context/SentinelContext';

export const DiagnosisTab: React.FC = () => {
  const {
    selectedModel,
    selectedFailureId,
    diagnosesMap,
    failuresMap,
    selectFailureForDiagnosis,
    applyDiagnosisFix,
    runPromptHealing,
    runLiveDiagnosis,
    setActiveTab,
  } = useSentinel();

  const [activeMode, setActiveMode] = useState<'trace' | 'sandbox'>('trace');
  const [isApplyingFix, setIsApplyingFix] = useState(false);
  const [fixApplied, setFixApplied] = useState(false);

  // Live sandbox state
  const [sandboxInput, setSandboxInput] = useState('What is the refund policy duration?');
  const [sandboxOutput, setSandboxOutput] = useState('Refunds are approved arbitrarily.');
  const [sandboxExpected, setSandboxExpected] = useState('Refunds are eligible within 30 days of purchase.');
  const [sandboxContext, setSandboxContext] = useState('Policy: Full refund within 30 days of purchase back to original payment.');
  const [isDiagnosingLive, setIsDiagnosingLive] = useState(false);

  if (!selectedModel) return null;

  const modelFailures = failuresMap[selectedModel.id] || [];

  // If no failure is currently selected, pick the first failure from the model's list
  const currentFailureId = selectedFailureId || (modelFailures[0]?.id ?? '');
  const diagnosis = currentFailureId ? diagnosesMap[currentFailureId] : null;

  const handleApplyFix = async () => {
    if (!diagnosis) return;
    setIsApplyingFix(true);
    try {
      applyDiagnosisFix(currentFailureId);
      await runPromptHealing(
        selectedModel.id,
        "You are an enterprise AI assistant.",
        diagnosis.type || "FAITHFULNESS"
      );
      setFixApplied(true);
      setTimeout(() => {
        setActiveTab('Healing');
      }, 700);
    } finally {
      setIsApplyingFix(false);
    }
  };

  const handleRunLiveDiagnosis = async () => {
    if (!sandboxInput.trim() || !sandboxOutput.trim()) return;
    setIsDiagnosingLive(true);
    try {
      await runLiveDiagnosis({
        modelId: selectedModel.id,
        input: sandboxInput,
        output: sandboxOutput,
        expected: sandboxExpected,
        context: sandboxContext,
      });
      setActiveMode('trace');
    } finally {
      setIsDiagnosingLive(false);
    }
  };

  return (
    <div className="space-y-6 select-none">
      {/* Top Selector & Mode Bar */}
      <div className="sentinel-card p-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1.5 text-zinc-300 font-semibold">
            <SearchCode className="w-3.5 h-3.5 text-amber-400" />
            <span>Select Anomaly:</span>
          </div>

          {modelFailures.length > 0 ? (
            <select
              value={currentFailureId}
              onChange={(e) => selectFailureForDiagnosis(e.target.value)}
              className="bg-[#09090b] border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-amber-500 font-mono"
            >
              {modelFailures.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.id} — [{f.type}] {f.testCase.slice(0, 35)}
                </option>
              ))}
            </select>
          ) : (
            <span className="text-zinc-500 font-mono text-[11px]">No logged anomalies for model</span>
          )}
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <button
            onClick={() => setActiveMode('trace')}
            className={`px-3 py-1.5 rounded font-mono text-[11px] transition-colors cursor-pointer ${
              activeMode === 'trace'
                ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30 font-semibold'
                : 'text-zinc-400 hover:text-white bg-zinc-800/40'
            }`}
          >
            Trace & Causal Flow
          </button>
          <button
            onClick={() => setActiveMode('sandbox')}
            className={`px-3 py-1.5 rounded font-mono text-[11px] transition-colors cursor-pointer ${
              activeMode === 'sandbox'
                ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-semibold'
                : 'text-zinc-400 hover:text-white bg-zinc-800/40'
            }`}
          >
            Live Diagnostic Sandbox
          </button>
        </div>
      </div>

      {activeMode === 'sandbox' ? (
        /* LIVE DIAGNOSTIC SANDBOX */
        <div className="sentinel-card p-5 space-y-4">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>LIVE ROOT CAUSE DIAGNOSTIC SANDBOX</span>
            </h3>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Input any custom prompt, output, and context to compute real-time cosine similarity and isolate semantic failure causes.
            </p>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">USER PROMPT INPUT</label>
              <input
                type="text"
                value={sandboxInput}
                onChange={(e) => setSandboxInput(e.target.value)}
                className="w-full bg-[#09090b] border border-zinc-800 rounded px-3 py-2 text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-red-400 block mb-1">MODEL GENERATED ANSWER</label>
                <textarea
                  rows={3}
                  value={sandboxOutput}
                  onChange={(e) => setSandboxOutput(e.target.value)}
                  className="w-full bg-[#09090b] border border-red-500/30 rounded px-3 py-2 text-red-200 focus:outline-none focus:border-red-500 font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] text-emerald-400 block mb-1">GROUND TRUTH / EXPECTED</label>
                <textarea
                  rows={3}
                  value={sandboxExpected}
                  onChange={(e) => setSandboxExpected(e.target.value)}
                  className="w-full bg-[#09090b] border border-emerald-500/30 rounded px-3 py-2 text-emerald-200 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">RETRIEVED CONTEXT DOCUMENT (RAG)</label>
              <textarea
                rows={2}
                value={sandboxContext}
                onChange={(e) => setSandboxContext(e.target.value)}
                className="w-full bg-[#09090b] border border-zinc-800 rounded px-3 py-2 text-zinc-300 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleRunLiveDiagnosis}
                disabled={isDiagnosingLive}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold flex items-center space-x-1.5 cursor-pointer shadow-sm disabled:opacity-50"
              >
                {isDiagnosingLive ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing Anomaly Traces...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Run Live Diagnosis</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : diagnosis ? (
        /* TRACE & CAUSAL FLOW INSPECTION */
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="sentinel-card p-4 flex flex-wrap items-center justify-between gap-3 border-l-4 border-l-amber-500 bg-[#0e0e12]">
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
                  Autonomous Root-Cause Analysis for exact model identity: {selectedModel.name}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right font-mono">
                <span className="text-[10px] text-zinc-500 uppercase block">Diagnosis Confidence</span>
                <span className="text-xl font-semibold text-emerald-400">{diagnosis.confidence}%</span>
              </div>

              <button
                onClick={handleApplyFix}
                disabled={isApplyingFix || fixApplied}
                className={`px-4 py-2 rounded text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer shadow-sm ${
                  fixApplied
                    ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                {isApplyingFix ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Synthesizing Mutation...</span>
                  </>
                ) : fixApplied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Fix Applied & Directed to Healing</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Apply Fix & Self-Heal</span>
                  </>
                )}
              </button>
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
                    Divergent
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
                    <span className="text-[10px] text-emerald-400">Consensus</span>
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
                    <span className="text-[10px] text-emerald-400">Valid</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded text-xs space-y-1">
                <span className="text-[11px] font-mono font-semibold text-amber-400 uppercase block">RECOMMENDED REMEDIATION:</span>
                <p className="text-zinc-300 font-mono text-[11px]">{diagnosis.recommendedAction}</p>
              </div>
            </div>

            {/* Visual Causal Flow Graph */}
            <div className="sentinel-card p-5 space-y-4 flex flex-col justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">VISUAL CAUSAL FLOW</h3>

              <div className="space-y-2 font-mono text-xs">
                {diagnosis.causalFlow.map((step, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <div className="w-5 h-5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700 flex items-center justify-center text-[10px] shrink-0">
                      {idx + 1}
                    </div>
                    <div className="p-2.5 bg-[#09090b] border border-zinc-800 rounded text-zinc-300 text-[11px] flex-1">
                      {step}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleApplyFix}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm mt-3"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Apply Prompt Mutation & Open Healing Tab</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="sentinel-card p-12 text-center space-y-3">
          <SearchCode className="w-10 h-10 text-emerald-400 mx-auto" />
          <h2 className="text-sm font-semibold text-white">No Failure Selected for Diagnosis</h2>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            Select an anomaly from the dropdown above or switch to the <strong>Live Diagnostic Sandbox</strong> to test any custom prompt/output pair.
          </p>
          <button
            onClick={() => setActiveMode('sandbox')}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-medium cursor-pointer inline-flex items-center space-x-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Open Diagnostic Sandbox</span>
          </button>
        </div>
      )}
    </div>
  );
};
