import React from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  Zap,
  Clock,
  Activity,
  FileCheck,
  ArrowRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useSentinel } from '../../../context/SentinelContext';

export const IndividualDashboardTab: React.FC = () => {
  const { selectedModel, failuresMap, selectFailureForDiagnosis } = useSentinel();

  if (!selectedModel) return null;

  const modelFailures = failuresMap[selectedModel.id] || failuresMap['model-2'] || [];

  const qualityOverTimeData = [
    { time: '00:00', quality: selectedModel.quality - 2.1 },
    { time: '04:00', quality: selectedModel.quality - 1.4 },
    { time: '08:00', quality: selectedModel.quality - 3.2 },
    { time: '12:00', quality: selectedModel.quality - 0.5 },
    { time: '16:00', quality: selectedModel.quality - 1.1 },
    { time: '20:00', quality: selectedModel.quality },
  ];

  const failureDistributionData = [
    { name: 'Retrieval Issue', value: 45, color: '#3b82f6' },
    { name: 'Hallucination', value: 25, color: '#eab308' },
    { name: 'Prompt Issue', value: 15, color: '#a855f7' },
    { name: 'Safety', value: 15, color: '#ef4444' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="sentinel-card p-3.5">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">QUALITY</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-semibold font-mono text-emerald-400">{selectedModel.quality}%</span>
            <p className="text-[10px] text-zinc-500 mt-0.5">Target: 95.0%</p>
          </div>
        </div>

        <div className="sentinel-card p-3.5">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">HALLUCINATION</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-semibold font-mono text-amber-400">2.8%</span>
            <p className="text-[10px] text-zinc-500 mt-0.5">Low risk threshold</p>
          </div>
        </div>

        <div className="sentinel-card p-3.5">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">FAITHFULNESS</span>
            <FileCheck className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-semibold font-mono text-blue-400">95.4%</span>
            <p className="text-[10px] text-zinc-500 mt-0.5">Context agreement</p>
          </div>
        </div>

        <div className="sentinel-card p-3.5">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">P95 LATENCY</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-semibold font-mono text-white">{selectedModel.latency}s</span>
            <p className="text-[10px] text-zinc-500 mt-0.5">Sub-2s SLA</p>
          </div>
        </div>

        <div className="sentinel-card p-3.5">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">HEALING SUCCESS</span>
            <Zap className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-semibold font-mono text-purple-400">84.0%</span>
            <p className="text-[10px] text-zinc-500 mt-0.5">Auto-recovered</p>
          </div>
        </div>

        <div className="sentinel-card p-3.5">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">TOTAL REQUESTS</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-semibold font-mono text-white">
              {selectedModel.requests.toLocaleString()}
            </span>
            <p className="text-[10px] text-zinc-500 mt-0.5">All time logged</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Quality Over Time Line Chart */}
        <div className="sentinel-card p-4 lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <div>
              <h3 className="text-xs font-semibold text-white">QUALITY OVER TIME</h3>
              <p className="text-[10px] text-zinc-500">Real-time accuracy trajectory (24 Hours)</p>
            </div>
            <span className="text-[10px] font-mono text-emerald-400">Avg {selectedModel.quality}%</span>
          </div>
          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={qualityOverTimeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="time" stroke="#71717a" fontSize={10} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={10} domain={[70, 100]} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '6px', fontSize: '11px' }} />
                <Line type="monotone" dataKey="quality" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3, fill: '#10b981' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Failure Distribution Donut Chart */}
        <div className="sentinel-card p-4 space-y-3">
          <div className="border-b border-zinc-800 pb-2">
            <h3 className="text-xs font-semibold text-white">FAILURE DISTRIBUTION</h3>
            <p className="text-[10px] text-zinc-500">Categorized root cause anomalies</p>
          </div>
          <div className="h-44 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={failureDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {failureDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '6px', fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px] font-mono">
            {failureDistributionData.map((item) => (
              <div key={item.name} className="flex items-center space-x-1.5 text-zinc-400">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="truncate">{item.name} ({item.value}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Failures Preview Table */}
      <div className="sentinel-card overflow-hidden">
        <div className="px-5 py-3 border-b border-zinc-800 flex items-center justify-between bg-[#0c0c0e]">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">RECENT FAILURES</h3>
            <p className="text-[11px] text-zinc-500">Click any failure to view deep-dive Diagnosis</p>
          </div>
          <span className="text-[10px] font-mono text-amber-400">{modelFailures.length} active logs</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-[#09090b] text-[10px] uppercase font-semibold text-zinc-500 border-b border-zinc-800">
              <tr>
                <th className="px-5 py-2.5">Time</th>
                <th className="px-4 py-2.5">Test Case</th>
                <th className="px-4 py-2.5">Failure Type</th>
                <th className="px-4 py-2.5">Severity</th>
                <th className="px-4 py-2.5">Diagnosis</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-sans">
              {modelFailures.slice(0, 4).map((f) => (
                <tr
                  key={f.id}
                  onClick={() => selectFailureForDiagnosis(f.id)}
                  className="hover:bg-zinc-800/40 cursor-pointer transition-colors group"
                >
                  <td className="px-5 py-3 font-mono text-[11px] text-zinc-400">{f.detectedTime}</td>
                  <td className="px-4 py-3 font-medium text-white group-hover:text-emerald-400 transition-colors">
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
                  <td className="px-4 py-3 text-zinc-400 text-[11px] max-w-xs truncate">{f.diagnosis}</td>
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
                    <button className="text-[11px] font-mono text-emerald-400 hover:underline flex items-center justify-center space-x-1">
                      <span>Diagnose</span>
                      <ArrowRight className="w-3 h-3" />
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
