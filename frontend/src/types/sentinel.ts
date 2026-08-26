export type ModelHealth = 'Healthy' | 'Degraded' | 'Healing' | 'Critical';

export type ApiProvider =
  | 'SENTINEL Free Local Model'
  | 'OpenAI'
  | 'Anthropic'
  | 'Google Gemini'
  | 'Mistral'
  | 'Ollama'
  | 'Hugging Face'
  | 'Custom LLM API';

export interface ConnectedModel {
  id: string;
  name: string; // User-provided exact display name (e.g. "My Customer Support Bot")
  provider: ApiProvider;
  model: string; // e.g. "GPT-4o", "Claude 3.5 Sonnet", "Llama 3.1", "Gemini 1.5 Pro"
  health: ModelHealth;
  quality: number; // percentage, e.g., 97.1
  requests: number;
  failures: number;
  latency: number; // seconds, e.g. 1.21
  baseUrl?: string;
  apiKey?: string;
  createdAt: string;
  description?: string;
}

export interface GlobalMetrics {
  totalModels: number;
  totalRequests: number;
  overallQuality: number;
  totalFailures: number;
  healingSuccessRate: number;
  averageLatency: number;
}

export interface EvaluationRun {
  id: string;
  modelId: string;
  promptVersion: string;
  testCases: number;
  passed: number;
  failed: number;
  quality: number;
  duration: string;
  status: 'Passed' | 'Failed' | 'Warning' | 'Running';
  timestamp: string;
}

export type FailureType =
  | 'Hallucination'
  | 'Prompt Issue'
  | 'Retrieval Issue'
  | 'Knowledge Gap'
  | 'Model Weakness'
  | 'Safety'
  | 'Latency'
  | 'Consistency';

export type SeverityLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export interface FailureRecord {
  id: string;
  modelId: string;
  testCase: string;
  type: FailureType;
  severity: SeverityLevel;
  detectedTime: string;
  diagnosis: string;
  healingState: 'Healing' | 'Resolved' | 'Pending' | 'Investigating';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Ignored';
  question?: string;
  generatedAnswer?: string;
  expectedAnswer?: string;
}

export interface DiagnosisEvidence {
  modelAgreement: number;
  retrievalCoverage: number;
  historicalFailureRate: number;
  promptQuality: number;
}

export interface DiagnosisData {
  failureId: string;
  modelId: string;
  question: string;
  generatedAnswer: string;
  expectedAnswer: string;
  type: FailureType;
  confidence: number;
  evidence: DiagnosisEvidence;
  causalFlow: string[];
  recommendedAction: string;
}

export interface HealingRecord {
  id: string;
  modelId: string;
  failureId: string;
  rootCause: string;
  action: string;
  beforeQuality: number;
  afterQuality: number;
  improvement: number;
  status: 'Promoted' | 'Testing' | 'Pending' | 'Rolled Back';
  timestamp: string;
}

export interface RequestLog {
  id: string;
  modelId: string;
  timestamp: string;
  model: string;
  latency: number;
  quality: number;
  status: 'Success' | 'Degraded' | 'Failed';
  input: string;
  output: string;
  retrievedContext?: string;
  tokensUsed?: number;
  cost?: number;
}

export interface ExperimentData {
  id: string;
  modelId: string;
  name: string;
  versionA: {
    name: string;
    prompt: string;
    quality: number;
  };
  versionB: {
    name: string;
    prompt: string;
    quality: number;
  };
  winner: 'A' | 'B' | 'In Progress';
  improvement: number;
  status: 'Completed' | 'Running' | 'Draft';
  totalSamples: number;
}

export interface PromptVersion {
  id: string;
  modelId: string;
  version: string;
  systemPrompt: string;
  quality: number;
  hallucination: number;
  created: string;
  status: 'Active' | 'Candidate' | 'Deprecated';
}

export interface ApiKeyItem {
  id: string;
  name: string;
  keyMasked: string;
  created: string;
  lastUsed: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  latency?: string;
  faithfulness?: number;
  hallucinationRisk?: number;
  retrievedContext?: string;
  tokens?: number;
}

export type WorkspaceTab =
  | 'Dashboard'
  | 'Chat'
  | 'Playground'
  | 'Evaluations'
  | 'Failures'
  | 'Diagnosis'
  | 'Healing'
  | 'Requests'
  | 'Experiments'
  | 'Prompts'
  | 'Integration'
  | 'Settings';
