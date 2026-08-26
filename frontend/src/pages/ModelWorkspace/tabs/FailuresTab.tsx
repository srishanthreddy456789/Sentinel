import React, { useState } from 'react';
import { AlertOctagon, Filter, ArrowRight, SearchCode, CheckCircle2 } from 'lucide-react';
import { useSentinel } from '../../../context/SentinelContext';
import { FailureType, SeverityLevel } from '../../../types/sentinel';

export const FailuresTab: React.FC = () => {
  const { selectedModel, failuresMap, selectFailureForDiagnosis } = useSentinel();

  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');

  if (!selectedModel) return null;

  const failures = failuresMap[selectedModel.id] || failuresMap['model-2'] || [];

  const filteredFailures = failures.filter((f) => {
    if (selectedType !== 'ALL' && f.type !== selectedType) return false;
    if (selectedSeverity !== 'ALL' && f.severity !== selectedSeverity) return false;
    return true;
  });

  return (
    <div className="space-y-4 select-none">
      {/* Top Filter Bar */}
      <div className="sentinel-card p-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-zinc-400" />
          <span className="font-semibold text-zinc-300">Filter Anomalies</span>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          {/* Type Filter */}
          <div className="flex items-center space-x-1.5">
            <span className="text-zinc-500 text-[11px]">Type:</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-[#09090b] border border-zinc-800 rounded px-2 py-1 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500 font-mono"
            >
              <option value="ALL">All Types</option>
              <option value="Hallucination">Hallucination</option>
              <option value="Prompt Issue">Prompt Issue</option>
              <option value="Retrieval Issue">Retrieval Issue</option>
              <option value="Knowledge Gap">Knowledge Gap</option>
              <option value="Model Weakness">Model Weakness</option>
              <option value="Safety">Safety</option>
              <option value="Latency">Latency</option>
              <option value="Consistency">Consistency</option>
            </select>
          </div>

          {/* Severity Filter */}
          <div className="flex items-center space-x-1.5">
            <span className="text-zinc-500 text-[11px]">Severity:</span>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="bg-[#09090b] border border-zinc-800 rounded px-2 py-1 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500 font-mono"
            >
              <option value="ALL">All Severities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Failures Table */}
      <div className="sentinel-card overflow-hidden">
        <div className="px-5 py-3 border-b border-zinc-800 flex items-center justify-between bg-[#0c0c0e]">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              FAILURE LOGS & ANOMALIES
            </h3>
            <p className="text-[11px] text-zinc-500">
              Filtered for exact model identity: {selectedModel.name}
            </p>
          </div>
          <span className="text-[10px] font-mono text-zinc-400">
            Showing {filteredFailures.length} of {failures.length} records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-[#09090b] text-[10px] uppercase font-semibold text-zinc-500 border-b border-zinc-800 font-mono">
              <tr>
                <th className="px-5 py-2.5">Failure ID</th>
                <th className="px-4 py-2.5">Test Case</th>
                <th className="px-4 py-2.5">Type</th>
                <th className="px-4 py-2.5">Severity</th>
                <th className="px-4 py-2.5">Detected</th>
                <th className="px-4 py-2.5">Diagnosis</th>
                <th className="px-4 py-2.5">Healing</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-sans">
              {filteredFailures.map((f) => (
                <tr
                  key={f.id}
                  onClick={() => selectFailureForDiagnosis(f.id)}
                  className="hover:bg-zinc-800/40 cursor-pointer transition-colors group"
                >
                  <td className="px-5 py-3 font-mono font-medium text-amber-400 group-hover:underline">
                    {f.id}
                  </td>
                  <td className="px-4 py-3 font-medium text-white group-hover:text-emerald-400 transition-colors">
                    {f.testCase}
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] text-zinc-300">{f.type}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                        f.severity === 'Critical' || f.severity === 'High'
                          ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                          : f.severity === 'Medium'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {f.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] text-zinc-400">{f.detectedTime}</td>
                  <td className="px-4 py-3 text-zinc-400 text-[11px] max-w-xs truncate">{f.diagnosis}</td>
                  <td className="px-4 py-3 font-mono text-[11px]">
                    <span className={f.healingState === 'Resolved' ? 'text-emerald-400' : 'text-purple-400'}>
                      {f.healingState}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                        f.status === 'Resolved'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-purple-500/10 text-purple-400 border border-purple-500/20 animate-pulse-purple'
                      }`}
                    >
                      {f.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-emerald-400 text-[11px] font-mono rounded flex items-center justify-center space-x-1">
                      <SearchCode className="w-3 h-3" />
                      <span>Diagnose</span>
                    </button>
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
