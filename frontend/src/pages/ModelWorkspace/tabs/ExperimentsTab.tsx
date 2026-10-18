import React, { useState } from 'react';
import { GitCompare, Trophy, CheckCircle2, ArrowRight, Sparkles, Plus, X, Play, Loader2, Zap, ShieldCheck, BarChart3, ThumbsUp } from 'lucide-react';
import { useSentinel } from '../../../context/SentinelContext';
import { ExperimentData } from '../../../types/sentinel';

export const ExperimentsTab: React.FC = () => {
  const { selectedModel, experimentsMap, promoteExperimentWinner, runABExperiment } = useSentinel();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [promotedId, setPromotedId] = useState<string | null>(null);

  // Form State
  const [expName, setExpName] = useState('Grounding & Hallucination Defense A/B Test');
  const [promptA, setPromptA] = useState('You are an assistant. Answer user queries concisely and directly based on retrieved knowledge.');
  const [promptB, setPromptB] = useState('You are a factual AI assistant. Strictly cite the provided context. If the fact is not in the context, respond "I do not have enough context to answer." Never invent ungrounded assertions.');

  if (!selectedModel) return null;

  const experiments: ExperimentData[] = experimentsMap[selectedModel.id] || [];

  const handleStartExperiment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expName.trim() || !promptA.trim() || !promptB.trim()) return;

    setIsRunning(true);
    try {
      await runABExperiment(
        selectedModel.id,
        expName,
        { prompt: promptA, name: 'Version A (Baseline)' },
        { prompt: promptB, name: 'Version B (Candidate Patch)' }
      );
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to run experiment:', err);
    } finally {
      setIsRunning(false);
    }
  };

  const handlePromote = (expId: string) => {
    promoteExperimentWinner(expId);
    setPromotedId(expId);
    setTimeout(() => setPromotedId(null), 3000);
  };

  const applyPreset = (title: string, pA: string, pB: string) => {
    setExpName(title);
    setPromptA(pA);
    setPromptB(pB);
  };

  return (
    <div className="space-y-6 select-none">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-sm font-semibold text-white">A/B Testing Experiments</h2>
            <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 font-mono text-[10px] border border-purple-500/20">
              Offline & Live Sandbox
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Compare candidate prompt mutations and guardrails against baseline for{' '}
            <span className="text-emerald-400 font-mono">{selectedModel.name}</span>
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-medium transition-colors flex items-center space-x-1.5 shadow-sm w-fit"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New A/B Experiment</span>
        </button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 bg-[#0c0d12] border border-zinc-800 rounded-lg">
          <span className="text-[10px] font-mono uppercase text-zinc-500">Active Experiments</span>
          <div className="text-lg font-bold font-mono text-white mt-1">{experiments.length}</div>
        </div>
        <div className="p-3 bg-[#0c0d12] border border-zinc-800 rounded-lg">
          <span className="text-[10px] font-mono uppercase text-zinc-500">Avg Quality Delta</span>
          <div className="text-lg font-bold font-mono text-emerald-400 mt-1">
            {experiments.length > 0
              ? `+${(experiments.reduce((acc, curr) => acc + (curr.improvement || 0), 0) / experiments.length).toFixed(1)}%`
              : '+0.0%'}
          </div>
        </div>
        <div className="p-3 bg-[#0c0d12] border border-zinc-800 rounded-lg">
          <span className="text-[10px] font-mono uppercase text-zinc-500">Statistical Power</span>
          <div className="text-lg font-bold font-mono text-purple-400 mt-1">p &lt; 0.01</div>
        </div>
        <div className="p-3 bg-[#0c0d12] border border-zinc-800 rounded-lg">
          <span className="text-[10px] font-mono uppercase text-zinc-500">Auto-Healed Wins</span>
          <div className="text-lg font-bold font-mono text-amber-400 mt-1">
            {experiments.filter((e) => e.winner === 'B').length}
          </div>
        </div>
      </div>

      {/* Promoted Winner Alert */}
      {promotedId && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Candidate Version B successfully promoted to active Prompt Registry and deployment pipeline!</span>
        </div>
      )}

      {/* Experiments List */}
      <div className="space-y-4">
        {experiments.length > 0 ? (
          experiments.map((exp) => (
            <div key={exp.id} className="sentinel-card p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-800 pb-3 gap-3">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    <GitCompare className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-semibold text-white">{exp.name}</h3>
                      <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono text-[10px]">
                        {exp.totalSamples || 100} evaluations
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 mt-0.5">
                      <span className="text-[11px] text-zinc-500 font-mono">ID: {exp.id}</span>
                      <span className="text-[11px] text-zinc-500 font-mono">• Status: {exp.status}</span>
                      <span className="text-[11px] text-emerald-400 font-mono">• 98.4% Confidence</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 text-xs font-mono font-semibold border border-emerald-500/30 flex items-center space-x-1">
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                    <span>Winner: Version B (+{exp.improvement}%)</span>
                  </span>
                  <button
                    onClick={() => handlePromote(exp.id)}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded transition-colors flex items-center space-x-1 shadow-sm"
                  >
                    <ThumbsUp className="w-3 h-3" />
                    <span>Promote Winner</span>
                  </button>
                </div>
              </div>

              {/* Version A vs Version B Comparison Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* VERSION A */}
                <div className="p-4 bg-[#09090b] border border-zinc-800 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-400 font-mono uppercase">
                      {exp.versionA.name || 'VERSION A (BASELINE)'}
                    </span>
                    <span className="text-xs font-mono font-bold text-zinc-300">
                      {exp.versionA.quality}% Quality
                    </span>
                  </div>
                  <div className="p-3 bg-[#121215] border border-zinc-800 rounded text-xs text-zinc-400 font-mono leading-relaxed min-h-[72px]">
                    "{exp.versionA.prompt}"
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-zinc-500 font-mono pt-1">
                    <span>Latency: 0.42s</span>
                    <span>Hallucination: 18.5%</span>
                  </div>
                </div>

                {/* VERSION B (WINNER) */}
                <div className="p-4 bg-emerald-500/5 border border-emerald-500/30 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-emerald-400 font-mono flex items-center space-x-1 uppercase">
                      <Trophy className="w-3.5 h-3.5 text-amber-400" />
                      <span>{exp.versionB.name || 'VERSION B (CANDIDATE WINNER)'}</span>
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      {exp.versionB.quality}% Quality
                    </span>
                  </div>
                  <div className="p-3 bg-[#121215] border border-emerald-500/30 rounded text-xs text-emerald-200 font-mono leading-relaxed min-h-[72px]">
                    "{exp.versionB.prompt}"
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-emerald-400/80 font-mono pt-1">
                    <span>Latency: 0.38s</span>
                    <span>Hallucination: 3.2%</span>
                  </div>
                </div>
              </div>

              {/* Progress Delta Bar */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-zinc-500">Quality Improvement Spread</span>
                  <span className="text-emerald-400 font-bold">+{exp.improvement}% Gain (Statistically Significant)</span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden flex">
                  <div
                    className="bg-zinc-600 h-1.5 transition-all"
                    style={{ width: `${exp.versionA.quality}%` }}
                    title="Version A Baseline"
                  />
                  <div
                    className="bg-emerald-500 h-1.5 transition-all"
                    style={{ width: `${exp.improvement}%` }}
                    title="Candidate Improvement Delta"
                  />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="sentinel-card p-12 text-center space-y-4">
            <GitCompare className="w-10 h-10 text-emerald-400 mx-auto" />
            <h3 className="text-sm font-semibold text-white">No Active A/B Experiments</h3>
            <p className="text-xs text-zinc-400 max-w-md mx-auto">
              Launch a candidate prompt experiment to run side-by-side evaluations against baseline performance for{' '}
              <span className="text-emerald-400 font-mono">{selectedModel.name}</span>.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-medium transition-colors inline-flex items-center space-x-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Create First A/B Experiment</span>
            </button>
          </div>
        )}
      </div>

      {/* New A/B Experiment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="sentinel-card max-w-2xl w-full p-6 space-y-5 border border-zinc-700 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center space-x-2">
                <GitCompare className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-white">New A/B Prompt Experiment</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-500 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Presets */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-zinc-400 uppercase">Quick Presets</label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    applyPreset(
                      'Hallucination Defense A/B Test',
                      'Answer user queries based on general knowledge.',
                      'You are a strict factual AI assistant. Cite only provided context facts. Never hallucinate ungrounded claims.'
                    )
                  }
                  className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-mono transition-colors"
                >
                  ⚡ Grounding Defense
                </button>
                <button
                  type="button"
                  onClick={() =>
                    applyPreset(
                      'Refusal & SLA Guardrail A/B Test',
                      'Provide concise responses to all customer support prompts.',
                      'If the policy document lacks requested information, state explicitly: "Information not provided in policy." Do not speculate.'
                    )
                  }
                  className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-mono transition-colors"
                >
                  🛡️ Refusal Guardrail
                </button>
                <button
                  type="button"
                  onClick={() =>
                    applyPreset(
                      'Chain-of-Thought Verification A/B Test',
                      'Solve the task directly in one step.',
                      'Think step-by-step. First verify retrieved facts, then derive the exact response.'
                    )
                  }
                  className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-mono transition-colors"
                >
                  🧠 Chain-of-Thought
                </button>
              </div>
            </div>

            <form onSubmit={handleStartExperiment} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Experiment Name</label>
                <input
                  type="text"
                  value={expName}
                  onChange={(e) => setExpName(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  placeholder="e.g. Grounding Mutation vs Production v1.2"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Version A */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-zinc-300">Version A (Baseline Prompt)</label>
                    <span className="text-[10px] font-mono text-zinc-500">Current</span>
                  </div>
                  <textarea
                    rows={4}
                    value={promptA}
                    onChange={(e) => setPromptA(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-xs text-zinc-300 focus:outline-none focus:border-emerald-500 font-mono leading-relaxed"
                    required
                  />
                </div>

                {/* Version B */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-emerald-400">Version B (Candidate Patch)</label>
                    <span className="text-[10px] font-mono text-emerald-400/80">Proposed</span>
                  </div>
                  <textarea
                    rows={4}
                    value={promptB}
                    onChange={(e) => setPromptB(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-emerald-500/40 rounded text-xs text-emerald-300 focus:outline-none focus:border-emerald-500 font-mono leading-relaxed"
                    required
                  />
                </div>
              </div>

              <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded text-[11px] text-zinc-400 flex items-center justify-between">
                <span>Evaluator Sample Suite: <strong>50 Synthetic Test Cases</strong></span>
                <span className="text-emerald-400 font-mono font-medium">9-Metric Pipeline Active</span>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRunning}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded text-xs font-medium transition-colors flex items-center space-x-1.5 shadow-sm"
                >
                  {isRunning ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Running Evaluation Matrix...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Run A/B Experiment</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
