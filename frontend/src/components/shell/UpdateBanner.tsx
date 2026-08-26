import React, { useState } from 'react';
import { Sparkles, Download, RefreshCw, X, Check } from 'lucide-react';

export const UpdateBanner: React.FC = () => {
  const [updateAvailable, setUpdateAvailable] = useState<boolean>(true);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [updateComplete, setUpdateComplete] = useState<boolean>(false);

  if (!updateAvailable) return null;

  const handleApplyUpdate = () => {
    setIsUpdating(true);
    setTimeout(() => {
      setIsUpdating(false);
      setUpdateComplete(true);
      setTimeout(() => {
        setUpdateAvailable(false);
      }, 2000);
    }, 1500);
  };

  return (
    <div className="bg-gradient-to-r from-emerald-950 via-[#121215] to-purple-950 border-b border-emerald-500/30 px-4 py-2 flex items-center justify-between text-xs text-zinc-100 select-none animate-in slide-in-from-top duration-200">
      <div className="flex items-center space-x-3">
        <div className="p-1 rounded bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold border border-emerald-500/30">
          v2.5.0 RELEASE
        </div>
        <div className="flex items-center space-x-2">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span className="font-medium text-white">New SENTINEL Version v2.5.0 Available</span>
          <span className="text-zinc-400 hidden md:inline text-[11px] font-mono">
            — Llama 3.2 support & accelerated self-healing diagnosis engine.
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-2 font-mono text-[11px]">
        {updateComplete ? (
          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded border border-emerald-500/40 flex items-center space-x-1 font-semibold">
            <Check className="w-3.5 h-3.5" />
            <span>Updated to v2.5.0!</span>
          </span>
        ) : (
          <button
            onClick={handleApplyUpdate}
            disabled={isUpdating}
            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded font-medium transition-colors flex items-center space-x-1.5 shadow-sm cursor-pointer"
          >
            {isUpdating ? (
              <>
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>Downloading Patch...</span>
              </>
            ) : (
              <>
                <Download className="w-3 h-3" />
                <span>Update & Restart</span>
              </>
            )}
          </button>
        )}

        <button
          onClick={() => setUpdateAvailable(false)}
          className="p-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 transition-colors"
          title="Dismiss banner"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
