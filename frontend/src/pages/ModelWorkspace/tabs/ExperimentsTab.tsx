import React from 'react';
import { GitCompare, Trophy, CheckCircle2, ArrowRight, Sparkles, Plus } from 'lucide-react';
import { useSentinel } from '../../../context/SentinelContext';
import { ExperimentData } from '../../../types/sentinel';

export const ExperimentsTab: React.FC = () => {
  const { selectedModel, experimentsMap, promoteExperimentWinner } = useSentinel();

  if (!selectedModel) return null;

  const experiments: ExperimentData[] =
    experimentsMap[selectedModel.id] || experimentsMap['model-2'] || [];

  return (
    <div className="space-y-6 select-none">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-white">A/B Testing Experiments</h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Compare candidate prompt & model variants for exact model: {selectedModel.name}
          </p>
        </div>

        <button className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-medium transition-colors flex items-center space-x-1.5 shadow-sm">
          <Plus className="w-3.5 h-3.5" />
          <span>New A/B Experiment</span>
        </button>
      </div>

      {/* Experiments List */}
      <div className="space-y-4">
        {experiments.map((exp) => (
          <div key={exp.id} className="sentinel-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <GitCompare className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-semibold text-white">{exp.name}</h3>
                    <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono text-[10px]">
                      {exp.totalSamples} evaluations
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-500 font-mono">Status: {exp.status}</span>
                </div>
              </div>

              {exp.winner === 'B' ? (
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 text-xs font-mono font-semibold border border-emerald-500/30 flex items-center space-x-1">
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                    <span>Winner: Version B (+{exp.improvement}%)</span>
                  </span>
                  <button
                    onClick={() => promoteExperimentWinner(exp.id)}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded transition-colors"
                  >
                    Promote Winner
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => promoteExperimentWinner(exp.id)}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded transition-colors"
                >
                  Promote Winner (Version B)
                </button>
              )}
            </div>

            {/* Version A vs Version B Comparison Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* VERSION A */}
              <div className="p-4 bg-[#09090b] border border-zinc-800 rounded space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-300 font-mono">VERSION A</span>
                  <span className="text-xs font-mono font-bold text-zinc-400">{exp.versionA.quality}% Quality</span>
                </div>
                <div className="p-2.5 bg-[#121215] border border-zinc-800 rounded text-xs text-zinc-400 font-mono leading-relaxed">
                  "{exp.versionA.prompt}"
                </div>
              </div>

              {/* VERSION B (WINNER) */}
              <div className="p-4 bg-emerald-500/5 border border-emerald-500/30 rounded space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-400 font-mono flex items-center space-x-1">
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                    <span>VERSION B (HEALED WINNER)</span>
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-400">{exp.versionB.quality}% Quality</span>
                </div>
                <div className="p-2.5 bg-[#121215] border border-emerald-500/30 rounded text-xs text-emerald-200 font-mono leading-relaxed">
                  "{exp.versionB.prompt}"
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
