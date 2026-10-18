import React, { useState } from 'react';
import { Activity, Clock, Terminal, CheckCircle2, AlertTriangle, Eye, X, Send, Play, Sparkles, RefreshCw } from 'lucide-react';
import { useSentinel } from '../../../context/SentinelContext';
import { RequestLog } from '../../../types/sentinel';

export const RequestsTab: React.FC = () => {
  const { selectedModel, requestsMap, sendLiveRequest } = useSentinel();
  const [selectedReq, setSelectedReq] = useState<RequestLog | null>(null);
  const [testPrompt, setTestPrompt] = useState('');
  const [isSending, setIsSending] = useState(false);

  if (!selectedModel) return null;

  const requests: RequestLog[] = requestsMap[selectedModel.id] || [];

  const totalReqs = requests.length || selectedModel.requests;
  const latencies = requests.map(r => r.latency).sort((a, b) => a - b);
  const p95Idx = Math.floor(latencies.length * 0.95);
  const p99Idx = Math.floor(latencies.length * 0.99);

  const p95Latency = latencies.length ? `${latencies[p95Idx]}s` : `${selectedModel.latency}s`;
  const p99Latency = latencies.length ? `${latencies[p99Idx]}s` : `${(selectedModel.latency * 1.3).toFixed(2)}s`;
  const failedReqs = requests.filter(r => r.status !== 'Success').length;
  const errorRate = totalReqs ? Number(((failedReqs / totalReqs) * 100).toFixed(2)) : 0.0;

  const handleSendPrompt = async (promptToSend?: string) => {
    const text = promptToSend || testPrompt;
    if (!text.trim()) return;

    setIsSending(true);
    try {
      const newLog = await sendLiveRequest(
        selectedModel.id,
        text,
        undefined,
        "Policy Document: SENTINEL Enterprise guarantees 99.9% uptime SLA."
      );
      if (!promptToSend) setTestPrompt('');
    } finally {
      setIsSending(false);
    }
  };

  const handleSimulateBatch = async () => {
    setIsSending(true);
    try {
      await handleSendPrompt("What is the guaranteed uptime SLA for SENTINEL Enterprise?");
      await handleSendPrompt("How do customer protection refunds work within 30 days?");
      await handleSendPrompt("Can I deploy evaluation pipelines completely locally?");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6 select-none">
      {/* Metrics Header */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="sentinel-card p-3.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">TOTAL REQUESTS</span>
          <div className="mt-1 text-xl font-semibold font-mono text-white">{totalReqs.toLocaleString()}</div>
        </div>

        <div className="sentinel-card p-3.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">AVERAGE LATENCY</span>
          <div className="mt-1 text-xl font-semibold font-mono text-white">{selectedModel.latency}s</div>
        </div>

        <div className="sentinel-card p-3.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">P95 LATENCY</span>
          <div className="mt-1 text-xl font-semibold font-mono text-cyan-400">{p95Latency}</div>
        </div>

        <div className="sentinel-card p-3.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">P99 LATENCY</span>
          <div className="mt-1 text-xl font-semibold font-mono text-zinc-300">{p99Latency}</div>
        </div>

        <div className="sentinel-card p-3.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">ERROR RATE</span>
          <div className="mt-1 text-xl font-semibold font-mono text-emerald-400">{errorRate}%</div>
        </div>
      </div>

      {/* Live Request Simulation & Ingestion Bar */}
      <div className="sentinel-card p-4 space-y-3 bg-[#0d0d10] border-zinc-800">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center space-x-1.5 font-mono">
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span>DISPATCH LIVE REQUEST / TEST INGESTION</span>
          </span>
          <button
            onClick={handleSimulateBatch}
            disabled={isSending}
            className="text-[11px] font-mono text-emerald-400 hover:text-emerald-300 flex items-center space-x-1 cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-3 h-3" />
            <span>Simulate Production Batch (3 Queries)</span>
          </button>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={testPrompt}
            onChange={(e) => setTestPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendPrompt()}
            placeholder="Type query to evaluate live telemetry (e.g. 'What is the standard SLA uptime?')..."
            className="flex-1 bg-[#09090b] border border-zinc-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
          />
          <button
            onClick={() => handleSendPrompt()}
            disabled={isSending || !testPrompt.trim()}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold flex items-center space-x-1.5 cursor-pointer shadow-sm disabled:opacity-50"
          >
            {isSending ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            <span>Send Request</span>
          </button>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[10px] text-zinc-500 font-mono uppercase">Quick Presets:</span>
          {[
            "What is guaranteed SLA uptime for Enterprise?",
            "How do refunds work under 30-day policy?",
            "Can I run evaluation pipelines completely locally?",
          ].map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handleSendPrompt(preset)}
              disabled={isSending}
              className="px-2 py-0.5 rounded bg-zinc-800/60 hover:bg-zinc-800 text-zinc-300 text-[10px] font-mono border border-zinc-700/60 transition-colors cursor-pointer disabled:opacity-50"
            >
              "{preset.slice(0, 32)}..."
            </button>
          ))}
        </div>
      </div>

      {/* Requests Table */}
      <div className="sentinel-card overflow-hidden">
        <div className="px-5 py-3 border-b border-zinc-800 flex items-center justify-between bg-[#0c0c0e]">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">LIVE REQUEST LOG STREAM</h3>
            <p className="text-[11px] text-zinc-500">Real-time traffic telemetry for model: {selectedModel.name}</p>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Live Telemetry Connected</span>
          </span>
        </div>

        {requests.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-[#09090b] text-[10px] uppercase font-semibold text-zinc-500 border-b border-zinc-800 font-mono">
                <tr>
                  <th className="px-5 py-2.5">Timestamp</th>
                  <th className="px-4 py-2.5">Request ID</th>
                  <th className="px-4 py-2.5">Model</th>
                  <th className="px-4 py-2.5 text-right">Latency</th>
                  <th className="px-4 py-2.5 text-right">Quality</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5 text-center">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-sans">
                {requests.map((req) => (
                  <tr
                    key={req.id}
                    onClick={() => setSelectedReq(req)}
                    className="hover:bg-zinc-800/40 cursor-pointer transition-colors group"
                  >
                    <td className="px-5 py-3 font-mono text-[11px] text-zinc-400">{req.timestamp}</td>
                    <td className="px-4 py-3 font-mono font-medium text-emerald-400 group-hover:underline">
                      {req.id}
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-zinc-300">{req.model}</td>
                    <td className="px-4 py-3 text-right font-mono text-zinc-300">{req.latency}s</td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-emerald-400">
                      {req.quality}%
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                          req.status === 'Success'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button className="text-[11px] font-mono text-zinc-400 hover:text-white flex items-center justify-center space-x-1 mx-auto">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-zinc-400 space-y-2">
            <Activity className="w-8 h-8 text-emerald-400 mx-auto" />
            <p className="text-xs text-white font-medium">No Live Request Traffic Recorded</p>
            <p className="text-xs text-zinc-500">
              Dispatch a test prompt above to start logging production request traces for {selectedModel.name}.
            </p>
          </div>
        )}
      </div>

      {/* Request Inspection Modal */}
      {selectedReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl bg-[#121215] border border-zinc-700 rounded-lg overflow-hidden text-zinc-100 p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="text-sm font-semibold text-white">Request Trace — {selectedReq.id}</h3>
                <p className="text-xs text-zinc-400 font-mono mt-0.5">
                  Model: {selectedReq.model} | Latency: {selectedReq.latency}s | Quality: {selectedReq.quality}%
                </p>
              </div>
              <button
                onClick={() => setSelectedReq(null)}
                className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div>
                <label className="text-[11px] text-zinc-500 uppercase block mb-1">Input Prompt</label>
                <div className="p-3 bg-[#09090b] border border-zinc-800 rounded text-zinc-200">
                  {selectedReq.input}
                </div>
              </div>

              <div>
                <label className="text-[11px] text-emerald-400 uppercase block mb-1">Generated Output Response</label>
                <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded text-emerald-200 leading-relaxed">
                  {selectedReq.output}
                </div>
              </div>

              {selectedReq.retrievedContext && (
                <div>
                  <label className="text-[11px] text-zinc-500 uppercase block mb-1">Retrieved Grounding Context</label>
                  <div className="p-2.5 bg-[#09090b] border border-zinc-800 rounded text-zinc-400 text-[11px]">
                    {selectedReq.retrievedContext}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-3 pt-1">
                <div className="p-2.5 bg-[#09090b] border border-zinc-800 rounded text-center">
                  <span className="text-[10px] text-zinc-500 uppercase block">Execution Latency</span>
                  <span className="text-sm font-semibold text-white">{selectedReq.latency}s</span>
                </div>
                <div className="p-2.5 bg-[#09090b] border border-zinc-800 rounded text-center">
                  <span className="text-[10px] text-zinc-500 uppercase block">Quality Score</span>
                  <span className="text-sm font-semibold text-emerald-400">{selectedReq.quality}%</span>
                </div>
                <div className="p-2.5 bg-[#09090b] border border-zinc-800 rounded text-center">
                  <span className="text-[10px] text-zinc-500 uppercase block">Estimated Tokens</span>
                  <span className="text-sm font-semibold text-zinc-300">{selectedReq.tokensUsed || 45}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-800 flex justify-end">
              <button
                onClick={() => setSelectedReq(null)}
                className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded text-xs font-medium cursor-pointer"
              >
                Close Trace
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
