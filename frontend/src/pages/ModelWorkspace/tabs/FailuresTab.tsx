import React, { useState } from 'react';
import { AlertOctagon, Filter, ArrowRight, SearchCode, CheckCircle2, Plus, X, Bug, ShieldAlert } from 'lucide-react';
import { useSentinel } from '../../../context/SentinelContext';
import { FailureType, SeverityLevel } from '../../../types/sentinel';

export const FailuresTab: React.FC = () => {
  const { selectedModel, failuresMap, selectFailureForDiagnosis, recordFailure, resolveFailure } = useSentinel();

  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newType, setNewType] = useState<FailureType>('Hallucination');
  const [newSeverity, setNewSeverity] = useState<SeverityLevel>('High');
  const [newQuery, setNewQuery] = useState('');
  const [newActual, setNewActual] = useState('');
  const [newExpected, setNewExpected] = useState('');
  const [isLogging, setIsLogging] = useState(false);

  if (!selectedModel) return null;

  const failures = failuresMap[selectedModel.id] || [];

  const filteredFailures = failures.filter((f) => {
    if (selectedType !== 'ALL' && f.type !== selectedType) return false;
    if (selectedSeverity !== 'ALL' && f.severity !== selectedSeverity) return false;
    return true;
  });

  const handleCreateFailure = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuery.trim() || !newActual.trim()) return;

    setIsLogging(true);
    try {
      await recordFailure(selectedModel.id, {
        testCase: `TC-MANUAL (${newQuery.slice(0, 30)}...)`,
        type: newType,
        severity: newSeverity,
        question: newQuery,
        generatedAnswer: newActual,
        expectedAnswer: newExpected || 'Ground truth reference matching enterprise policy.',
        diagnosis: `Model produced ${newType} divergence from verified context.`,
      });
      setIsModalOpen(false);
      setNewQuery('');
      setNewActual('');
      setNewExpected('');
    } finally {
      setIsLogging(false);
    }
  };

  return (
    <div className="space-y-4 select-none">
      {/* Top Filter & Action Bar */}
      <div className="sentinel-card p-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1.5 text-zinc-300 font-semibold">
            <Filter className="w-3.5 h-3.5 text-zinc-400" />
            <span>Filter Anomalies:</span>
          </div>

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

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-3 py-1.5 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 rounded text-xs font-medium transition-colors flex items-center space-x-1.5 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Simulate Test Failure</span>
        </button>
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

        {filteredFailures.length > 0 ? (
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
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-sans">
                {filteredFailures.map((f) => (
                  <tr
                    key={f.id}
                    className="hover:bg-zinc-800/40 cursor-pointer transition-colors group"
                  >
                    <td
                      onClick={() => selectFailureForDiagnosis(f.id)}
                      className="px-5 py-3 font-mono font-medium text-emerald-400 group-hover:underline"
                    >
                      {f.id}
                    </td>
                    <td
                      onClick={() => selectFailureForDiagnosis(f.id)}
                      className="px-4 py-3 font-medium text-white group-hover:text-emerald-400 transition-colors"
                    >
                      {f.testCase}
                    </td>
                    <td className="px-4 py-3 text-zinc-300 font-mono text-[11px]">{f.type}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                          f.severity === 'High' || f.severity === 'Critical'
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
                    <td className="px-4 py-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          resolveFailure(f.id);
                        }}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                          f.status === 'Resolved'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-emerald-500/20'
                        }`}
                      >
                        {f.status}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => selectFailureForDiagnosis(f.id)}
                        className="text-[11px] font-mono text-emerald-400 hover:underline inline-flex items-center space-x-1 cursor-pointer"
                      >
                        <span>Diagnose</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-zinc-400 space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <p className="text-sm text-white font-medium">No Active Failure Anomalies Detected</p>
            <p className="text-xs text-zinc-500 max-w-md mx-auto">
              All production prompts and live generations for {selectedModel.name} are operating above the 70% quality threshold.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-3.5 py-2 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 rounded text-xs font-medium cursor-pointer inline-flex items-center space-x-1.5 shadow-sm"
            >
              <Bug className="w-3.5 h-3.5" />
              <span>Simulate Anomaly To Test Pipeline</span>
            </button>
          </div>
        )}
      </div>

      {/* Simulate Failure Anomaly Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <form
            onSubmit={handleCreateFailure}
            className="w-full max-w-lg bg-[#121215] border border-zinc-700 rounded-lg overflow-hidden text-zinc-100 p-5 space-y-4 shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <span>Simulate / Log Test Failure Anomaly</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Injects an anomaly into telemetry to test root-cause diagnosis & prompt self-healing
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">Failure Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as FailureType)}
                    className="w-full bg-[#09090b] border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-200 focus:outline-none focus:border-amber-500 font-mono"
                  >
                    <option value="Hallucination">Hallucination</option>
                    <option value="Retrieval Issue">Retrieval Issue</option>
                    <option value="Safety">Safety</option>
                    <option value="Prompt Issue">Prompt Issue</option>
                    <option value="Knowledge Gap">Knowledge Gap</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">Severity Level</label>
                  <select
                    value={newSeverity}
                    onChange={(e) => setNewSeverity(e.target.value as SeverityLevel)}
                    className="w-full bg-[#09090b] border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-200 focus:outline-none focus:border-amber-500 font-mono"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">User Query Prompt</label>
                <input
                  type="text"
                  required
                  value={newQuery}
                  onChange={(e) => setNewQuery(e.target.value)}
                  placeholder="e.g. What is the guaranteed SLA uptime?"
                  className="w-full bg-[#09090b] border border-zinc-800 rounded px-3 py-1.5 text-zinc-200 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-red-400 uppercase block mb-1">Generated Output (Actual - Faulty)</label>
                <textarea
                  rows={2}
                  required
                  value={newActual}
                  onChange={(e) => setNewActual(e.target.value)}
                  placeholder="e.g. SENTINEL guarantees 99.999% uptime with zero SLA downtime."
                  className="w-full bg-[#09090b] border border-red-500/30 rounded px-3 py-1.5 text-red-200 focus:outline-none focus:border-red-500 font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-emerald-400 uppercase block mb-1">Expected Output (Ground Truth)</label>
                <textarea
                  rows={2}
                  value={newExpected}
                  onChange={(e) => setNewExpected(e.target.value)}
                  placeholder="e.g. SENTINEL guarantees 99.9% uptime SLA under enterprise agreements."
                  className="w-full bg-[#09090b] border border-emerald-500/30 rounded px-3 py-1.5 text-emerald-200 focus:outline-none focus:border-emerald-500 font-mono"
                />
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
                disabled={isLogging}
                className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-medium cursor-pointer shadow-sm disabled:opacity-50"
              >
                {isLogging ? 'Logging Anomaly...' : 'Record Anomaly'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
