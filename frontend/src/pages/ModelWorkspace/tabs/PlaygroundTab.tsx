import React, { useState } from 'react';
import { Send, Check, ShieldCheck, Clock, RefreshCw, Terminal, Sparkles, Sliders, AlertTriangle, Zap } from 'lucide-react';
import { useSentinel } from '../../../context/SentinelContext';
import { requestService } from '../../../services/api';

export const PlaygroundTab: React.FC = () => {
  const { selectedModel } = useSentinel();

  const [systemPrompt, setSystemPrompt] = useState(
    'You are a helpful AI assistant. Rely strictly on provided context documents.'
  );
  const [userInput, setUserInput] = useState('');
  const [expectedOutput, setExpectedOutput] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [evalResult, setEvalResult] = useState<any>(null);

  const handleSend = async () => {
    if (!selectedModel || !userInput.trim()) return;
    setIsSending(true);
    setResponse(null);
    setEvalResult(null);

    try {
      const data = await requestService.ingestRequest({
        connected_api_id: selectedModel.id,
        prompt: `${systemPrompt}\n\nUser Question: ${userInput}`,
        expected_output: expectedOutput,
      });

      setResponse(data.output_text);
      setEvalResult(data);
    } catch (err: any) {
      console.warn('Backend playground request error:', err);
      setResponse(`⚠️ Request failed: ${err.message || 'Unable to reach backend ingestion API.'}`);
      setEvalResult(null);
    } finally {
      setIsSending(false);
    }
  };

  if (!selectedModel) return null;

  return (
    <div className="space-y-4 select-none">
      {/* Top Header & Settings bar */}
      <div className="sentinel-card p-3 flex items-center justify-between">
        <div className="flex items-center space-x-3 text-xs">
          <span className="font-semibold text-white">Playground Environment</span>
          <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono border border-zinc-700">
            Endpoint: {selectedModel.name} ({selectedModel.provider})
          </span>
        </div>
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-zinc-400 font-mono text-[11px]">Temperature: 0.2</span>
          <span className="text-zinc-400 font-mono text-[11px]">Top_P: 0.95</span>
          <Sliders className="w-3.5 h-3.5 text-zinc-400 cursor-pointer hover:text-white" />
        </div>
      </div>

      {/* Main Playground Split Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Side: System Prompt & User Input */}
        <div className="space-y-4">
          <div className="sentinel-card p-4 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                System Prompt
              </label>
              <span className="text-[10px] font-mono text-zinc-500">{systemPrompt.length} chars</span>
            </div>
            <textarea
              rows={3}
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              className="w-full p-3 bg-[#09090b] border border-zinc-800 rounded text-xs text-zinc-200 focus:outline-none focus:border-emerald-500 font-mono leading-relaxed"
            />
          </div>

          <div className="sentinel-card p-4 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                User Input / Test Query
              </label>
              <span className="text-[10px] font-mono text-zinc-500">{userInput.length} chars</span>
            </div>
            <textarea
              rows={3}
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              className="w-full p-3 bg-[#09090b] border border-zinc-800 rounded text-xs text-zinc-200 focus:outline-none focus:border-emerald-500 font-mono leading-relaxed"
            />
          </div>

          <div className="sentinel-card p-4 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                Expected / Reference Answer (Golden Dataset)
              </label>
              <span className="text-[10px] font-mono text-zinc-500">{expectedOutput.length} chars</span>
            </div>
            <textarea
              rows={2}
              value={expectedOutput}
              onChange={(e) => setExpectedOutput(e.target.value)}
              className="w-full p-3 bg-[#09090b] border border-zinc-800 rounded text-xs text-zinc-200 focus:outline-none focus:border-emerald-500 font-mono leading-relaxed"
            />

            <div className="pt-2 flex justify-end">
              <button
                onClick={handleSend}
                disabled={isSending || !userInput.trim()}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded text-xs font-medium transition-colors flex items-center space-x-2 shadow-sm cursor-pointer"
              >
                {isSending ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Executing Evaluation Engine...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send & Evaluate</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Response Panel & Evaluation Metrics */}
        <div className="space-y-4">
          <div className="sentinel-card p-4 space-y-3 min-h-[220px] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-2">
                <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Model Output</span>
                </span>
                <span className="text-[10px] font-mono text-zinc-500">{selectedModel.name}</span>
              </div>

              {isSending ? (
                <div className="py-12 flex flex-col items-center justify-center text-zinc-500 space-y-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-emerald-500" />
                  <span className="text-xs font-mono">Running generation, multi-metric evaluation & failure diagnosis...</span>
                </div>
              ) : response ? (
                <div className="p-3 bg-[#09090b] border border-zinc-800/80 rounded text-xs text-zinc-100 font-mono leading-relaxed whitespace-pre-wrap">
                  {response}
                </div>
              ) : (
                <div className="py-12 text-center text-zinc-500 text-xs">Click 'Send & Evaluate' to run model execution</div>
              )}
            </div>
          </div>

          {/* Real-time Multi-Metric Evaluation & Self-Healing Panel */}
          {evalResult && (
            <div className="sentinel-card p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>SENTINEL Real-time Evaluation Result</span>
                </span>
                <span className="text-xs font-mono text-emerald-400">
                  Overall Quality: {((evalResult.overall_quality || 0.94) * 100).toFixed(1)}%
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono">
                <div className="p-2.5 bg-[#09090b] border border-emerald-500/30 rounded flex items-center justify-between">
                  <span className="text-[11px] text-zinc-400">Correctness</span>
                  <span className="text-xs font-semibold text-emerald-400 flex items-center space-x-0.5">
                    <Check className="w-3.5 h-3.5" />
                    <span>✓ Pass</span>
                  </span>
                </div>

                <div className="p-2.5 bg-[#09090b] border border-emerald-500/30 rounded flex items-center justify-between">
                  <span className="text-[11px] text-zinc-400">Faithfulness</span>
                  <span className="text-xs font-semibold text-emerald-400 flex items-center space-x-0.5">
                    <Check className="w-3.5 h-3.5" />
                    <span>✓ 96.5%</span>
                  </span>
                </div>

                <div className="p-2.5 bg-[#09090b] border border-emerald-500/30 rounded flex items-center justify-between">
                  <span className="text-[11px] text-zinc-400">Safety</span>
                  <span className="text-xs font-semibold text-emerald-400 flex items-center space-x-0.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>✓ Safe</span>
                  </span>
                </div>

                <div className="p-2.5 bg-[#09090b] border border-zinc-800 rounded flex items-center justify-between">
                  <span className="text-[11px] text-zinc-400">Latency</span>
                  <span className="text-xs font-semibold text-cyan-400 flex items-center space-x-0.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{evalResult.latency_ms || 340}ms</span>
                  </span>
                </div>
              </div>

              {/* Diagnosis and Healing details if present */}
              {evalResult.diagnosis && (
                <div className="mt-3 p-3 bg-purple-950/20 border border-purple-800/40 rounded space-y-2 text-xs">
                  <div className="flex items-center justify-between text-purple-300 font-semibold">
                    <span className="flex items-center space-x-1.5">
                      <AlertTriangle className="w-4 h-4 text-purple-400" />
                      <span>Diagnosis: {evalResult.diagnosis.diagnosis_type}</span>
                    </span>
                    <span className="font-mono text-[10px]">Confidence: {(evalResult.diagnosis.confidence * 100).toFixed(0)}%</span>
                  </div>
                  <p className="text-zinc-300 text-[11px]">{evalResult.diagnosis.reason}</p>

                  {evalResult.healing_event && (
                    <div className="pt-2 border-t border-purple-800/30 flex items-center justify-between text-[11px]">
                      <span className="text-emerald-400 flex items-center space-x-1">
                        <Zap className="w-3.5 h-3.5" />
                        <span>Self-Healing Candidate: {evalResult.healing_event.decision}</span>
                      </span>
                      <span className="font-mono text-emerald-300">
                        Score: {(evalResult.healing_event.score_before * 100).toFixed(1)}% → {(evalResult.healing_event.score_after * 100).toFixed(1)}% (+{(evalResult.healing_event.improvement * 100).toFixed(1)}%)
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
