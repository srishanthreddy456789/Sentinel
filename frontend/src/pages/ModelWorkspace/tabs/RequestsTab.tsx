import React, { useState } from 'react';
import { Activity, Clock, Terminal, CheckCircle2, AlertTriangle, Eye, X } from 'lucide-react';
import { useSentinel } from '../../../context/SentinelContext';
import { RequestLog } from '../../../types/sentinel';

export const RequestsTab: React.FC = () => {
  const { selectedModel, requestsMap } = useSentinel();
  const [selectedReq, setSelectedReq] = useState<RequestLog | null>(null);

  if (!selectedModel) return null;

  const requests: RequestLog[] =
    requestsMap[selectedModel.id] || requestsMap['model-2'] || [];

  return (
    <div className="space-y-6 select-none">
      {/* Metrics Header */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="sentinel-card p-3.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">TOTAL REQUESTS</span>
          <div className="mt-1 text-xl font-semibold font-mono text-white">{selectedModel.requests.toLocaleString()}</div>
        </div>

        <div className="sentinel-card p-3.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">AVERAGE LATENCY</span>
          <div className="mt-1 text-xl font-semibold font-mono text-white">{selectedModel.latency}s</div>
        </div>

        <div className="sentinel-card p-3.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">P95 LATENCY</span>
          <div className="mt-1 text-xl font-semibold font-mono text-cyan-400">1.82s</div>
        </div>

        <div className="sentinel-card p-3.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">P99 LATENCY</span>
          <div className="mt-1 text-xl font-semibold font-mono text-zinc-300">2.41s</div>
        </div>

        <div className="sentinel-card p-3.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">ERROR RATE</span>
          <div className="mt-1 text-xl font-semibold font-mono text-emerald-400">0.12%</div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="sentinel-card overflow-hidden">
        <div className="px-5 py-3 border-b border-zinc-800 flex items-center justify-between bg-[#0c0c0e]">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">LIVE REQUEST LOG STREAM</h3>
            <p className="text-[11px] text-zinc-500">Traffic for model: {selectedModel.name}</p>
          </div>
          <span className="text-[10px] font-mono text-emerald-400">● Streaming</span>
        </div>

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
      </div>

      {/* Request Inspection Modal */}
      {selectedReq && (
        <div className="fixed inset-[#000000] z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl bg-[#121215] border border-zinc-700 rounded-lg overflow-hidden text-zinc-100 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="text-sm font-semibold text-white">Request Trace — {selectedReq.id}</h3>
                <p className="text-xs text-zinc-400 font-mono mt-0.5">
                  Model: {selectedReq.model} | Latency: {selectedReq.latency}s | Quality: {selectedReq.quality}%
                </p>
              </div>
              <button
                onClick={() => setSelectedReq(null)}
                className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500 uppercase">Input Payload</label>
                <div className="p-3 bg-[#09090b] border border-zinc-800 rounded text-zinc-200">
                  {selectedReq.input}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500 uppercase">Generated Output</label>
                <div className="p-3 bg-[#09090b] border border-zinc-800 rounded text-emerald-300">
                  {selectedReq.output}
                </div>
              </div>

              {selectedReq.retrievedContext && (
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-500 uppercase">Retrieved Context Chunk</label>
                  <div className="p-2.5 bg-[#09090b] border border-zinc-800 rounded text-zinc-400 text-[11px]">
                    {selectedReq.retrievedContext}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-zinc-800 flex justify-end">
              <button
                onClick={() => setSelectedReq(null)}
                className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded text-xs font-medium"
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
