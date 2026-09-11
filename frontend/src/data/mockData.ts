import {
  ConnectedModel,
  GlobalMetrics,
  EvaluationRun,
  FailureRecord,
  DiagnosisData,
  HealingRecord,
  RequestLog,
  ExperimentData,
  PromptVersion,
  ApiKeyItem,
} from '../types/sentinel';

// Default empty connected models list
export const INITIAL_MODELS: ConnectedModel[] = [
  {
    id: 'model-local',
    name: 'Free Llama Assistant',
    provider: 'Ollama',
    model: 'Llama 3.1',
    health: 'Healthy',
    quality: 100.0,
    requests: 0,
    failures: 0,
    latency: 0.35,
    baseUrl: 'http://localhost:11434',
    createdAt: new Date().toISOString().split('T')[0],
    description: 'Local free LLM model execution via Ollama server.',
  },
];

export const INITIAL_GLOBAL_METRICS: GlobalMetrics = {
  totalModels: 1,
  totalRequests: 0,
  overallQuality: 100.0,
  totalFailures: 0,
  healingSuccessRate: 100.0,
  averageLatency: 0.35,
};

export const GLOBAL_QUALITY_SERIES = [
  { day: 'Mon', 'Free Llama Assistant': 100.0 },
  { day: 'Tue', 'Free Llama Assistant': 100.0 },
  { day: 'Wed', 'Free Llama Assistant': 100.0 },
  { day: 'Thu', 'Free Llama Assistant': 100.0 },
  { day: 'Fri', 'Free Llama Assistant': 100.0 },
  { day: 'Sat', 'Free Llama Assistant': 100.0 },
  { day: 'Sun', 'Free Llama Assistant': 100.0 },
];

export const GLOBAL_REQUEST_SERIES = [
  { time: '00:00', 'Free Llama Assistant': 0 },
  { time: '04:00', 'Free Llama Assistant': 0 },
  { time: '08:00', 'Free Llama Assistant': 0 },
  { time: '12:00', 'Free Llama Assistant': 0 },
  { time: '16:00', 'Free Llama Assistant': 0 },
  { time: '20:00', 'Free Llama Assistant': 0 },
];

export const MOCK_EVALUATIONS: Record<string, EvaluationRun[]> = {};
export const MOCK_FAILURES: Record<string, FailureRecord[]> = {};
export const MOCK_DIAGNOSES: Record<string, DiagnosisData> = {};
export const MOCK_HEALING: Record<string, HealingRecord[]> = {};
export const MOCK_REQUESTS: Record<string, RequestLog[]> = {};
export const MOCK_EXPERIMENTS: Record<string, ExperimentData[]> = {};
export const MOCK_PROMPTS: Record<string, PromptVersion[]> = {};

export const MOCK_API_KEYS: ApiKeyItem[] = [
  {
    id: 'key-1',
    name: 'Default Development Key',
    keyMasked: 'sk_live_sentinel_8f9a2b4c••••••••',
    created: new Date().toISOString().split('T')[0],
    lastUsed: 'Active',
  },
];
