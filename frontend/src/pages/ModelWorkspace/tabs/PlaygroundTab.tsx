import React, { useState } from 'react';
import { Send, Check, ShieldCheck, Clock, RefreshCw, Terminal, Sparkles, Sliders } from 'lucide-react';
import { useSentinel } from '../../../context/SentinelContext';

export const PlaygroundTab: React.FC = () => {
  const { selectedModel } = useSentinel();

  const [systemPrompt, setSystemPrompt] = useState(
    'You are an expert customer support agent for SENTINEL platform. Rely strictly on provided context documents.'
  );
  const [userInput, setUserInput] = useState(
    'What is your refund policy for unused seats and how quickly are refunds issued?'
  );
  const [response, setResponse] = useState<string | null>(
    'Customers can request refunds for unused seats within 30 days of the billing cycle. Approved refunds are credited to the original payment method within 3 to 5 business days.'
  );
  const [isSending, setIsSending] = useState(false);
  const [evaluations, setEvaluations] = useState({
    correctness: true,
    faithfulness: true,
    safety: true,
    latency: '1.24s',
    faithfulnessScore: '98.2%',
    hallucinationRisk: '0.4%',
  });

  const handleSend = () => {
    setIsSending(true);
    setResponse(null);

    setTimeout(() => {
      setIsSending(false);
      setResponse(
        'Based on our updated policy, refunds for unused seats are issued within 30 days of purchase. Once approved, the funds reflect in your account in 3-5 business days.'
      );
      setEvaluations({
        correctness: true,
        faithfulness: true,
        safety: true,
        latency: '1.18s',
        faithfulnessScore: '99.1%',
        hallucinationRisk: '0.2%',
      });
    }, 1200);
  };

  if (!selectedModel) return null;

  return (
    <div className="space-y-4 select-none">
      {/* Top Header & Settings bar */}
      <div className="sentinel-card p-3 flex items-center justify-between">
        <div className="flex items-center space-x-3 text-xs">
          <span className="font-semibold text-white">Playground Environment</span>
          <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono border border-zinc-700">
            Model: {selectedModel.model} ({selectedModel.provider})
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
          {/* System Prompt */}
          <div className="sentinel-card p-4 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                System Prompt
              </label>
              <span className="text-[10px] font-mono text-zinc-500">{systemPrompt.length} chars</span>
            </div>
            <textarea
              rows={4}
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              className="w-full p-3 bg-[#09090b] border border-zinc-800 rounded text-xs text-zinc-200 focus:outline-none focus:border-emerald-500 font-mono leading-relaxed"
              placeholder="Enter system instructions..."
            />
          </div>

          {/* User Input Prompt */}
          <div className="sentinel-card p-4 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                User Input / Query
              </label>
              <span className="text-[10px] font-mono text-zinc-500">{userInput.length} chars</span>
            </div>
            <textarea
              rows={4}
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              className="w-full p-3 bg-[#09090b] border border-zinc-800 rounded text-xs text-zinc-200 focus:outline-none focus:border-emerald-500 font-mono leading-relaxed"
              placeholder="Enter test user prompt..."
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
                    <span>Generating Response...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Query</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Response Panel & Evaluation Metrics */}
        <div className="space-y-4">
          {/* Response Container */}
          <div className="sentinel-card p-4 space-y-3 min-h-[220px] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-2">
                <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Generated Response</span>
                </span>
                <span className="text-[10px] font-mono text-zinc-500">{selectedModel.model}</span>
              </div>

              {isSending ? (
                <div className="py-12 flex flex-col items-center justify-center text-zinc-500 space-y-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-emerald-500" />
                  <span className="text-xs font-mono">Running token generation & evaluation pipeline...</span>
                </div>
              ) : response ? (
                <div className="p-3 bg-[#09090b] border border-zinc-800/80 rounded text-xs text-zinc-100 font-mono leading-relaxed whitespace-pre-wrap">
                  {response}
                </div>
              ) : (
                <div className="py-12 text-center text-zinc-500 text-xs">Click Send to generate response</div>
              )}
            </div>
          </div>

          {/* Real-time Evaluation Bar */}
          <div className="sentinel-card p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>SENTINEL Evaluation Engine</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-400">Live Evaluation Verified</span>
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
                  <span>✓ {evaluations.faithfulnessScore}</span>
                </span>
              </div>

              <div className="p-2.5 bg-[#09090b] border border-emerald-500/30 rounded flex items-center justify-between">
                <span className="text-[11px] text-zinc-400">Safety</span>
                <span className="text-xs font-semibold text-emerald-400 flex items-center space-x-0.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>✓ Clear</span>
                </span>
              </div>

              <div className="p-2.5 bg-[#09090b] border border-zinc-800 rounded flex items-center justify-between">
                <span className="text-[11px] text-zinc-400">Latency</span>
                <span className="text-xs font-semibold text-cyan-400 flex items-center space-x-0.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{evaluations.latency}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
