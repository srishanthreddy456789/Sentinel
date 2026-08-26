import React from 'react';
import {
  Activity,
  Layers,
  ShieldCheck,
  AlertTriangle,
  Zap,
  Clock,
  ArrowUpRight,
  TrendingUp,
  BarChart3,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  Cell,
} from 'recharts';
import { useSentinel } from '../../context/SentinelContext';
import { ConnectedModel, ModelHealth } from '../../types/sentinel';
import { GLOBAL_QUALITY_SERIES, GLOBAL_REQUEST_SERIES } from '../../data/mockData';

export const GlobalDashboard: React.FC = () => {
  const { models, globalMetrics, selectModel, openAddApiModal } = useSentinel();

  const getHealthBadge = (health: ModelHealth) => {
    switch (health) {
      case 'Healthy':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>● Healthy</span>
          </span>
        );
      case 'Degraded':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            <span>⚠ Degraded</span>
          </span>
        );
      case 'Healing':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20 animate-pulse-purple">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
            <span>🟣 Healing</span>
          </span>
        );
      case 'Critical':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-red-500/10 text-red-400 border border-red-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
            <span>🔴 Critical</span>
          </span>
        );
    }
  };

  // Model comparison charts data
  const qualityChartData = models.map((m) => ({
    name: m.name,
    quality: m.quality,
    color: m.quality >= 95 ? '#10b981' : m.quality >= 85 ? '#eab308' : '#ef4444',
  }));

  const failureChartData = models.map((m) => ({
    name: m.name,
    failures: m.failures,
    color: m.failures > 100 ? '#ef4444' : m.failures > 50 ? '#eab308' : '#10b981',
  }));

  const latencyChartData = models.map((m) => ({
    name: m.name,
    latency: m.latency,
  }));

  return (
    <div className="flex-1 overflow-y-auto bg-[#09090b] p-6 space-y-6 select-none">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white tracking-tight">Dashboard</h1>
          <p className="text-xs text-zinc-400 mt-0.5">Overview of all your connected AI models</p>
        </div>
        <button
          onClick={openAddApiModal}
          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-xs font-medium transition-colors flex items-center space-x-1.5 shadow-sm"
        >
          <span>+ Connect Model</span>
        </button>
      </div>

      {/* Global Metrics Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="sentinel-card p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">TOTAL MODELS</span>
            <Layers className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-semibold font-mono text-white">{globalMetrics.totalModels}</span>
            <span className="text-[10px] font-mono text-emerald-400">Active</span>
          </div>
        </div>

        <div className="sentinel-card p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">TOTAL REQUESTS</span>
            <Activity className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-semibold font-mono text-white">
              {globalMetrics.totalRequests.toLocaleString()}
            </span>
            <span className="text-[10px] font-mono text-emerald-400">+12%</span>
          </div>
        </div>

        <div className="sentinel-card p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">OVERALL QUALITY</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-semibold font-mono text-emerald-400">{globalMetrics.overallQuality}%</span>
            <span className="text-[10px] font-mono text-emerald-400">High</span>
          </div>
        </div>

        <div className="sentinel-card p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">TOTAL FAILURES</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-semibold font-mono text-amber-400">{globalMetrics.totalFailures}</span>
            <span className="text-[10px] font-mono text-zinc-400">0.38% rate</span>
          </div>
        </div>

        <div className="sentinel-card p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">HEALING SUCCESS</span>
            <Zap className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-semibold font-mono text-purple-400">{globalMetrics.healingSuccessRate}%</span>
            <span className="text-[10px] font-mono text-purple-400">Auto-fixed</span>
          </div>
        </div>

        <div className="sentinel-card p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">AVERAGE LATENCY</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-semibold font-mono text-white">{globalMetrics.averageLatency}s</span>
            <span className="text-[10px] font-mono text-emerald-400">P95 1.8s</span>
          </div>
        </div>
      </div>

      {/* Model Health Unified Table */}
      <div className="sentinel-card overflow-hidden">
        <div className="px-5 py-3 border-b border-zinc-800 flex items-center justify-between bg-[#0c0c0e]">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">MODEL HEALTH</h2>
            <p className="text-[11px] text-zinc-500 mt-0.5">Click any row to open that API/model workspace</p>
          </div>
          <span className="text-[10px] font-mono text-zinc-500">{models.length} connected endpoints</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-[#09090b] text-[10px] uppercase font-semibold text-zinc-500 border-b border-zinc-800">
              <tr>
                <th className="px-5 py-2.5">Name</th>
                <th className="px-4 py-2.5">Provider</th>
                <th className="px-4 py-2.5">Model</th>
                <th className="px-4 py-2.5">Health</th>
                <th className="px-4 py-2.5 text-right">Quality</th>
                <th className="px-4 py-2.5 text-right">Requests</th>
                <th className="px-4 py-2.5 text-right">Failures</th>
                <th className="px-4 py-2.5 text-right">Latency</th>
                <th className="px-4 py-2.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-sans">
              {models.map((model) => (
                <tr
                  key={model.id}
                  onClick={() => selectModel(model.id)}
                  className="hover:bg-zinc-800/40 cursor-pointer transition-colors group"
                >
                  {/* Name (Exact user display name) */}
                  <td className="px-5 py-3 font-medium text-white group-hover:text-emerald-400 transition-colors">
                    {model.name}
                  </td>
                  <td className="px-4 py-3 text-zinc-400 font-mono text-[11px]">{model.provider}</td>
                  <td className="px-4 py-3 text-zinc-300 font-mono text-[11px]">{model.model}</td>
                  <td className="px-4 py-3">{getHealthBadge(model.health)}</td>
                  <td className="px-4 py-3 text-right font-mono font-semibold text-emerald-400">
                    {model.quality}%
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-zinc-300">
                    {model.requests.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-amber-400">{model.failures}</td>
                  <td className="px-4 py-3 text-right font-mono text-zinc-400">{model.latency}s</td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center text-[10px] text-zinc-400 group-hover:text-white font-mono">
                      Open <ArrowUpRight className="w-3 h-3 ml-0.5" />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Global Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Chart 1: Quality by Model */}
        <div className="sentinel-card p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <div>
              <h3 className="text-xs font-semibold text-white">Quality by Model</h3>
              <p className="text-[10px] text-zinc-500">Overall reliability accuracy percentage</p>
            </div>
            <BarChart3 className="w-4 h-4 text-zinc-500" />
          </div>
          <div className="h-52 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={qualityChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="#71717a"
                  fontSize={10}
                  tickLine={false}
                  interval={0}
                  angle={-10}
                  textAnchor="end"
                />
                <YAxis stroke="#71717a" fontSize={10} domain={[60, 100]} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '6px', fontSize: '11px' }}
                />
                <Bar dataKey="quality" radius={[4, 4, 0, 0]}>
                  {qualityChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Request Volume Over Time */}
        <div className="sentinel-card p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <div>
              <h3 className="text-xs font-semibold text-white">Request Volume Over Time</h3>
              <p className="text-[10px] text-zinc-500">Distribution across connected model endpoints</p>
            </div>
            <TrendingUp className="w-4 h-4 text-zinc-500" />
          </div>
          <div className="h-52 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={GLOBAL_REQUEST_SERIES} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="time" stroke="#71717a" fontSize={10} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '6px', fontSize: '11px' }}
                />
                <Line type="monotone" dataKey="Free Llama Assistant" stroke="#10b981" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Customer Support Bot" stroke="#3b82f6" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Research Assistant" stroke="#eab308" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Gemini Document Bot" stroke="#a855f7" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Failure Rate Comparison */}
        <div className="sentinel-card p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <div>
              <h3 className="text-xs font-semibold text-white">Failure Volume by Model</h3>
              <p className="text-[10px] text-zinc-500">Count of total detected anomalies</p>
            </div>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="h-52 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={failureChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="name" stroke="#71717a" fontSize={10} tickLine={false} interval={0} angle={-10} textAnchor="end" />
                <YAxis stroke="#71717a" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '6px', fontSize: '11px' }}
                />
                <Bar dataKey="failures" radius={[4, 4, 0, 0]}>
                  {failureChartData.map((entry, index) => (
                    <Cell key={`cell-fail-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Latency Comparison */}
        <div className="sentinel-card p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <div>
              <h3 className="text-xs font-semibold text-white">Average Latency (Seconds)</h3>
              <p className="text-[10px] text-zinc-500">Response turnaround time benchmark</p>
            </div>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="h-52 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={latencyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="name" stroke="#71717a" fontSize={10} tickLine={false} interval={0} angle={-10} textAnchor="end" />
                <YAxis stroke="#71717a" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '6px', fontSize: '11px' }}
                />
                <Bar dataKey="latency" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
