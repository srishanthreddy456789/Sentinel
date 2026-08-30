import React, { useState } from 'react';
import {
  Shield,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Sparkles,
  Activity,
  Cpu,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  UserCheck,
  Building2,
  Terminal,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AuthPageProps {
  onContinueAsGuest?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onContinueAsGuest }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [selectedTier, setSelectedTier] = useState<'developer' | 'pro' | 'enterprise'>('pro');

  const { login, signup, demoLogin, isLoading, authError, clearError } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!email || !password) {
      return;
    }

    if (mode === 'signup') {
      if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
      }
      await signup(email, password);
    } else {
      await login(email, password);
    }
  };

  const getPasswordStrength = () => {
    if (!password) return { label: '', color: 'bg-zinc-700', percentage: 0 };
    if (password.length < 6) return { label: 'Weak', color: 'bg-red-500', percentage: 33 };
    if (password.length < 10) return { label: 'Medium', color: 'bg-yellow-500', percentage: 66 };
    return { label: 'Strong', color: 'bg-emerald-500', percentage: 100 };
  };

  const strength = getPasswordStrength();

  return (
    <div className="min-h-screen w-screen bg-[#09090b] text-zinc-100 flex flex-col justify-between overflow-x-hidden font-sans relative">
      {/* Background ambient lighting glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#18181b_1px,transparent_1px),linear-gradient(to_bottom,#18181b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />

      {/* Top Header Navigation */}
      <header className="px-6 py-4 flex items-center justify-between z-10 border-b border-zinc-800/50 backdrop-blur-md bg-[#09090b]/80">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-sm shadow-emerald-500/20">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-zinc-100 tracking-wider text-base">SENTINEL</span>
            <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
              v2.4 MLOps
            </span>
          </div>
        </div>

        {onContinueAsGuest && (
          <button
            onClick={onContinueAsGuest}
            className="text-xs text-zinc-400 hover:text-zinc-200 px-3 py-1.5 rounded-md hover:bg-zinc-800/60 transition-colors flex items-center space-x-1 border border-transparent hover:border-zinc-700"
          >
            <span>Explore Demo Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </header>

      {/* Main Content Split Layout */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 z-10">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Feature Highlights & Branding */}
          <div className="lg:col-span-6 space-y-6 text-left hidden lg:block pr-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>Autonomous LLM Guardrails & Observability</span>
            </div>

            <h1 className="text-4xl font-extrabold text-white tracking-tight leading-tight">
              Real-time ML Model Shield & Self-Healing Platform
            </h1>

            <p className="text-sm text-zinc-400 leading-relaxed">
              Sentinel monitors production LLM prompts, evaluates hallucination risks, tracks latency SLAs, and automatically patches model instructions on the fly.
            </p>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 gap-3.5 pt-2">
              <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700/80 transition-all flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-zinc-200">Continuous Drift & Hallucination Guard</h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">Automated factual alignment score & toxic prompt filtering in real-time.</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700/80 transition-all flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-zinc-200">Local & Cloud Model Interoperability</h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">Plug in local Ollama daemon, OpenAI, Anthropic, or custom REST APIs.</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700/80 transition-all flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 shrink-0">
                  <Terminal className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-zinc-200">Developer SDK & Key Management</h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">Instant API key generation with Fernet encryption and granular permissions.</p>
                </div>
              </div>
            </div>

            {/* Quick Stats Pill */}
            <div className="pt-2 flex items-center space-x-6 text-xs text-zinc-400 font-mono">
              <div>
                <span className="text-emerald-400 font-bold text-sm">99.94%</span> Uptime SLA
              </div>
              <div className="h-3 w-px bg-zinc-800" />
              <div>
                <span className="text-emerald-400 font-bold text-sm">&lt;1.2s</span> Avg P95 Latency
              </div>
              <div className="h-3 w-px bg-zinc-800" />
              <div>
                <span className="text-emerald-400 font-bold text-sm">0.12%</span> Hallucination Rate
              </div>
            </div>
          </div>

          {/* Right Column: Glassmorphic Auth Form Card */}
          <div className="lg:col-span-6 w-full max-w-md mx-auto">
            <div className="bg-[#121215]/90 border border-zinc-800/90 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
              {/* Glow accent bar top */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-blue-500" />

              {/* Mode Toggle Tabs */}
              <div className="flex bg-zinc-900/90 p-1 rounded-xl border border-zinc-800 mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    clearError();
                  }}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                    mode === 'login'
                      ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700/60'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    clearError();
                  }}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                    mode === 'signup'
                      ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700/60'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* Form Title & Subtitle */}
              <div className="mb-6">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  {mode === 'login' ? 'Welcome Back to Sentinel' : 'Start Monitoring your AI Models'}
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  {mode === 'login'
                    ? 'Enter your credentials to access your MLOps dashboard.'
                    : 'Create a developer account to monitor, test, and auto-heal LLMs.'}
                </p>
              </div>

              {/* Error Message Toast */}
              {authError && (
                <div className="mb-5 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div className="flex-1">{authError}</div>
                  <button onClick={clearError} className="text-red-400 hover:text-red-200 font-bold ml-1">
                    ×
                  </button>
                </div>
              )}

              {/* Auth Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Field */}
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">Work Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="engineer@sentinel-mlops.dev"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-zinc-900/90 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-mono"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-medium text-zinc-300">Password</label>
                    {mode === 'login' && (
                      <a href="#" onClick={(e) => { e.preventDefault(); alert('Reset link sent to registered email.'); }} className="text-[11px] text-emerald-400 hover:underline">
                        Forgot password?
                      </a>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-zinc-900/90 border border-zinc-800 rounded-lg pl-9 pr-9 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Strength Meter (Signup Mode) */}
                  {mode === 'signup' && password.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <div className="flex justify-between items-center text-[10px] text-zinc-400">
                        <span>Strength</span>
                        <span className="font-semibold text-zinc-300">{strength.label}</span>
                      </div>
                      <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${strength.color} transition-all duration-300`}
                          style={{ width: `${strength.percentage}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password (Signup Mode) */}
                {mode === 'signup' && (
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1.5">Confirm Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-zinc-900/90 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-mono"
                      />
                    </div>
                  </div>
                )}

                {/* Tier Picker (Signup Mode) */}
                {mode === 'signup' && (
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1.5">Select Account Tier</label>
                    <div className="grid grid-cols-3 gap-2">
                      <div
                        onClick={() => setSelectedTier('developer')}
                        className={`p-2 rounded-lg border text-center cursor-pointer transition-all ${
                          selectedTier === 'developer'
                            ? 'border-emerald-500 bg-emerald-500/10 text-white'
                            : 'border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-zinc-700'
                        }`}
                      >
                        <UserCheck className="w-3.5 h-3.5 mx-auto mb-1 text-emerald-400" />
                        <div className="text-[11px] font-bold">Free</div>
                        <div className="text-[9px] text-zinc-400">1 Model</div>
                      </div>

                      <div
                        onClick={() => setSelectedTier('pro')}
                        className={`p-2 rounded-lg border text-center cursor-pointer transition-all ${
                          selectedTier === 'pro'
                            ? 'border-emerald-500 bg-emerald-500/10 text-white'
                            : 'border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-zinc-700'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5 mx-auto mb-1 text-emerald-400" />
                        <div className="text-[11px] font-bold">Pro</div>
                        <div className="text-[9px] text-zinc-400">10 Models</div>
                      </div>

                      <div
                        onClick={() => setSelectedTier('enterprise')}
                        className={`p-2 rounded-lg border text-center cursor-pointer transition-all ${
                          selectedTier === 'enterprise'
                            ? 'border-emerald-500 bg-emerald-500/10 text-white'
                            : 'border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-zinc-700'
                        }`}
                      >
                        <Building2 className="w-3.5 h-3.5 mx-auto mb-1 text-emerald-400" />
                        <div className="text-[11px] font-bold">Enterprise</div>
                        <div className="text-[9px] text-zinc-400">Unlimited</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Remember Me / Terms Checkbox */}
                <div className="flex items-center justify-between text-xs text-zinc-400 pt-1">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-emerald-500/20"
                    />
                    <span>{mode === 'login' ? 'Remember session' : 'I agree to Terms & MLOps Governance Policy'}</span>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-2.5 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-xs transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <span>{mode === 'login' ? 'Sign In to Workspace' : 'Create Account'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="my-5 flex items-center space-x-3">
                <div className="h-px flex-1 bg-zinc-800" />
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">Instant Preview</span>
                <div className="h-px flex-1 bg-zinc-800" />
              </div>

              {/* One-Click Demo Logins */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => demoLogin('engineer')}
                  className="w-full py-2 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800/90 border border-zinc-800 text-zinc-300 text-xs font-medium transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
                    <span>Quick Demo: Senior AI Engineer</span>
                  </div>
                  <span className="text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-400 font-mono">Pro Tier</span>
                </button>

                <button
                  type="button"
                  onClick={() => demoLogin('admin')}
                  className="w-full py-2 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800/90 border border-zinc-800 text-zinc-300 text-xs font-medium transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 group-hover:scale-110 transition-transform" />
                    <span>Quick Demo: Lead MLOps Architect</span>
                  </div>
                  <span className="text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-400 font-mono">Enterprise</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-3 px-6 border-t border-zinc-800/40 text-center text-[11px] text-zinc-500 z-10 flex flex-col sm:flex-row items-center justify-between">
        <div>Sentinel AI Security & MLOps Platform © 2026. All rights reserved.</div>
        <div className="flex items-center space-x-4 mt-1 sm:mt-0 font-mono text-[10px]">
          <span className="hover:text-zinc-400 cursor-pointer">Security Protocol v2</span>
          <span>•</span>
          <span className="hover:text-zinc-400 cursor-pointer">SDK Docs</span>
          <span>•</span>
          <span className="hover:text-zinc-400 cursor-pointer">Privacy & Data Governance</span>
        </div>
      </footer>
    </div>
  );
};
