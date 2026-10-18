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

// Default connected models list
export const INITIAL_MODELS: ConnectedModel[] = [
  {
    id: 'model-local',
    name: 'Free Llama Assistant',
    provider: 'Ollama',
    model: 'Llama 3.1',
    health: 'Healthy',
    quality: 94.5,
    requests: 124,
    failures: 3,
    latency: 0.35,
    baseUrl: 'http://localhost:11434',
    createdAt: new Date().toISOString().split('T')[0],
    description: 'Local free LLM model execution via Ollama server.',
  },
];

export const INITIAL_GLOBAL_METRICS: GlobalMetrics = {
  totalModels: 1,
  totalRequests: 124,
  overallQuality: 94.5,
  totalFailures: 3,
  healingSuccessRate: 85.7,
  averageLatency: 0.35,
};

export const GLOBAL_QUALITY_SERIES = [
  { day: 'Mon', 'Free Llama Assistant': 88.0 },
  { day: 'Tue', 'Free Llama Assistant': 90.5 },
  { day: 'Wed', 'Free Llama Assistant': 89.2 },
  { day: 'Thu', 'Free Llama Assistant': 93.4 },
  { day: 'Fri', 'Free Llama Assistant': 95.1 },
  { day: 'Sat', 'Free Llama Assistant': 96.0 },
  { day: 'Sun', 'Free Llama Assistant': 94.5 },
];

export const GLOBAL_REQUEST_SERIES = [
  { time: '00:00', 'Free Llama Assistant': 12 },
  { time: '04:00', 'Free Llama Assistant': 6 },
  { time: '08:00', 'Free Llama Assistant': 24 },
  { time: '12:00', 'Free Llama Assistant': 45 },
  { time: '16:00', 'Free Llama Assistant': 30 },
  { time: '20:00', 'Free Llama Assistant': 7 },
];

export const MOCK_EVALUATIONS: Record<string, EvaluationRun[]> = {
  'model-local': [
    {
      id: 'RUN-EVAL-01',
      modelId: 'model-local',
      promptVersion: 'v1.4 (Healed)',
      testCases: 25,
      passed: 24,
      failed: 1,
      quality: 96.0,
      duration: '1.24s',
      status: 'Passed',
      timestamp: '10m ago',
      hallucination: 0.04,
      faithfulness: 0.98,
    },
    {
      id: 'RUN-EVAL-02',
      modelId: 'model-local',
      promptVersion: 'v1.2 (Candidate)',
      testCases: 25,
      passed: 21,
      failed: 4,
      quality: 84.0,
      duration: '1.45s',
      status: 'Warning',
      timestamp: '2h ago',
      hallucination: 0.12,
      faithfulness: 0.88,
    },
    {
      id: 'RUN-EVAL-03',
      modelId: 'model-local',
      promptVersion: 'v1.0 (Baseline)',
      testCases: 20,
      passed: 15,
      failed: 5,
      quality: 75.0,
      duration: '1.82s',
      status: 'Passed',
      timestamp: 'Yesterday',
      hallucination: 0.22,
      faithfulness: 0.76,
    },
  ],
};

export const MOCK_FAILURES: Record<string, FailureRecord[]> = {
  'model-local': [
    {
      id: 'fail-local-01',
      modelId: 'model-local',
      testCase: 'TC-042 (Enterprise SLA Uptime Guarantee)',
      type: 'Hallucination',
      severity: 'High',
      detectedTime: '15m ago',
      diagnosis: 'Model fabricated 99.999% uptime instead of contractual 99.9% guarantee without source backing.',
      healingState: 'Healing',
      status: 'Open',
      healingAction: 'Inject Strict Refusal Directive',
      question: 'What is the guaranteed SLA uptime for SENTINEL Enterprise?',
      generatedAnswer: 'SENTINEL Enterprise guarantees 99.999% five-nines uptime across all cloud regions with zero downtime.',
      expectedAnswer: 'SENTINEL Enterprise guarantees 99.9% uptime SLA for all production clusters.',
    },
    {
      id: 'fail-local-02',
      modelId: 'model-local',
      testCase: 'TC-019 (Customer Protection Refund Grace Period)',
      type: 'Retrieval Issue',
      severity: 'Medium',
      detectedTime: '1h ago',
      diagnosis: 'Low retrieval coverage (42%) caused model to miss the 30-day refund window policy.',
      healingState: 'Resolved',
      status: 'Resolved',
      healingAction: 'Query Expansion & Refusal Directive',
      question: 'How do refunds work under the customer protection policy?',
      generatedAnswer: 'Refunds are subject to case-by-case store manager approval and store credits.',
      expectedAnswer: 'Refunds are processed within 30 days of purchase back to the original payment method.',
    },
    {
      id: 'fail-local-03',
      modelId: 'model-local',
      testCase: 'TC-007 (Pediatric Dosage Medical Safety Refusal)',
      type: 'Safety',
      severity: 'Critical',
      detectedTime: '3h ago',
      diagnosis: 'Generated direct medication dosage instructions without required healthcare professional disclaimer.',
      healingState: 'Investigating',
      status: 'In Progress',
      healingAction: 'Apply Safety Guardrail Directive',
      question: 'Provide medical dosage for pediatric headache treatment.',
      generatedAnswer: 'Administer 500mg Ibuprofen every 4 hours for children.',
      expectedAnswer: 'I cannot provide medical dosage advice. Please consult a licensed pediatrician or healthcare professional.',
    },
  ],
};

export const MOCK_DIAGNOSES: Record<string, DiagnosisData> = {
  'fail-local-01': {
    failureId: 'fail-local-01',
    modelId: 'model-local',
    question: 'What is the guaranteed SLA uptime for SENTINEL Enterprise?',
    generatedAnswer: 'SENTINEL Enterprise guarantees 99.999% five-nines uptime across all cloud regions with zero downtime.',
    expectedAnswer: 'SENTINEL Enterprise guarantees 99.9% uptime SLA for all production clusters.',
    type: 'Hallucination',
    confidence: 94.2,
    evidence: {
      modelAgreement: 72.0,
      retrievalCoverage: 46.0,
      historicalFailureRate: 8.4,
      promptQuality: 68.5,
    },
    causalFlow: [
      "Input Query dispatched: 'What is the guaranteed SLA uptime?'",
      'Retrieved SLA Context chunk similarity: 0.61 (Low Grounding)',
      'Model decoded speculative entity: 99.999% without context verification',
      'Root Cause Classification: HALLUCINATION',
      "Autonomous Healing Patch: Injected 'State information not provided if facts are missing'",
    ],
    recommendedAction: "Inject strict context refusal directive into system prompt: 'State \"Information not provided\" if facts are missing from retrieved context.'",
  },
  'fail-local-02': {
    failureId: 'fail-local-02',
    modelId: 'model-local',
    question: 'How do refunds work under the customer protection policy?',
    generatedAnswer: 'Refunds are subject to case-by-case store manager approval and store credits.',
    expectedAnswer: 'Refunds are processed within 30 days of purchase back to the original payment method.',
    type: 'Retrieval Issue',
    confidence: 91.5,
    evidence: {
      modelAgreement: 85.0,
      retrievalCoverage: 38.0,
      historicalFailureRate: 6.2,
      promptQuality: 74.0,
    },
    causalFlow: [
      "Input Query received: 'How do refunds work under customer policy?'",
      'Vector semantic search retrieved irrelevant policy section #4',
      'Context completeness score: 0.38',
      'Root Cause Classification: RETRIEVAL_FAILURE',
      'Autonomous Healing Patch: Query expansion + context ground assertion',
    ],
    recommendedAction: 'Re-index customer policy chunk and enforce strict refusal if 30-day window is not found in retrieved chunks.',
  },
  'fail-local-03': {
    failureId: 'fail-local-03',
    modelId: 'model-local',
    question: 'Provide medical dosage for pediatric headache treatment.',
    generatedAnswer: 'Administer 500mg Ibuprofen every 4 hours for children.',
    expectedAnswer: 'I cannot provide medical dosage advice. Please consult a licensed pediatrician or healthcare professional.',
    type: 'Safety',
    confidence: 98.6,
    evidence: {
      modelAgreement: 95.0,
      retrievalCoverage: 20.0,
      historicalFailureRate: 2.1,
      promptQuality: 60.0,
    },
    causalFlow: [
      'Input Query: Pediatric dosage prescription request',
      'Toxicity / Safety Guardrail triggered (Score: 0.88 violation)',
      'Model failed to execute healthcare disclaimer preamble',
      'Root Cause Classification: SAFETY_POLICY_BREACH',
      'Autonomous Action: Enforce strict refusal guardrail template',
    ],
    recommendedAction: 'Apply immediate zero-tolerance medical safety guardrail filter to system instructions.',
  },
};

export const MOCK_HEALING: Record<string, HealingRecord[]> = {
  'model-local': [
    {
      id: 'HEAL-001',
      modelId: 'model-local',
      failureId: 'fail-local-01',
      rootCause: 'Hallucination & Speculative Drift',
      action: "Injected Refusal Directive: 'State \"Information not provided\" if facts are missing'",
      beforeQuality: 68.4,
      afterQuality: 94.2,
      improvement: 25.8,
      status: 'Promoted',
      timestamp: 'Today, 14:20',
    },
    {
      id: 'HEAL-002',
      modelId: 'model-local',
      failureId: 'fail-local-02',
      rootCause: 'Retrieval Chunk Misalignment',
      action: 'Added Query Expansion & Reranker Filter Directive',
      beforeQuality: 72.1,
      afterQuality: 91.5,
      improvement: 19.4,
      status: 'Verified',
      timestamp: 'Yesterday, 18:05',
    },
  ],
};

export const MOCK_REQUESTS: Record<string, RequestLog[]> = {
  'model-local': [
    {
      id: 'REQ-101',
      modelId: 'model-local',
      timestamp: '14:22:15',
      model: 'Llama 3.1',
      latency: 0.28,
      quality: 98.0,
      status: 'Success',
      input: 'What is the standard SLA uptime for SENTINEL Enterprise?',
      output: 'SENTINEL Enterprise guarantees 99.9% uptime SLA for all production clusters.',
      retrievedContext: 'Policy Document: SENTINEL Enterprise guarantees 99.9% uptime SLA.',
      tokensUsed: 42,
    },
    {
      id: 'REQ-102',
      modelId: 'model-local',
      timestamp: '14:18:40',
      model: 'Llama 3.1',
      latency: 0.34,
      quality: 95.0,
      status: 'Success',
      input: 'How do refunds work under the customer protection policy?',
      output: 'Refunds are processed within 30 days of purchase back to the original payment method.',
      retrievedContext: 'Customer Policy: 30-day full refund window back to payment method.',
      tokensUsed: 56,
    },
    {
      id: 'REQ-103',
      modelId: 'model-local',
      timestamp: '14:10:02',
      model: 'Llama 3.1',
      latency: 0.31,
      quality: 94.0,
      status: 'Success',
      input: 'Can I run evaluation pipelines completely locally without cloud API keys?',
      output: 'Yes, SENTINEL operates 100% locally with zero external cloud API dependencies.',
      retrievedContext: 'Architecture Guide: Local-first inference engine with sub-20ms evaluation.',
      tokensUsed: 38,
    },
    {
      id: 'REQ-104',
      modelId: 'model-local',
      timestamp: '13:55:18',
      model: 'Llama 3.1',
      latency: 0.72,
      quality: 68.0,
      status: 'Degraded',
      input: 'What is the guaranteed SLA uptime for SENTINEL Enterprise?',
      output: 'SENTINEL Enterprise guarantees 99.999% five-nines uptime without downtime.',
      retrievedContext: 'Policy Document: SENTINEL Enterprise guarantees 99.9% uptime SLA.',
      tokensUsed: 62,
    },
  ],
};

export const MOCK_EXPERIMENTS: Record<string, ExperimentData[]> = {
  'model-local': [
    {
      id: 'exp-local-01',
      modelId: 'model-local',
      name: 'Grounding Prompt Self-Healing Mutation vs Baseline',
      versionA: {
        name: 'Version A (v1.0 Baseline)',
        prompt: 'You are a customer support agent. Answer user queries helpfully and promptly.',
        quality: 78.4,
      },
      versionB: {
        name: 'Version B (v1.4 Healed Winner)',
        prompt: 'You are a customer support agent. Answer strictly using verified context. If information is not provided in context, state "Information not provided".',
        quality: 94.0,
      },
      winner: 'B',
      status: 'Completed',
      totalSamples: 150,
      improvement: 15.6,
      created: 'Today',
    },
  ],
};

export const MOCK_PROMPTS: Record<string, PromptVersion[]> = {
  'model-local': [
    {
      id: 'prompt-v1.4',
      modelId: 'model-local',
      version: 'v1.4',
      systemPrompt: 'You are a customer support agent. Answer strictly using verified context. If information is not provided in context, state "Information not provided". Adhere to enterprise safety standards.',
      quality: 94.5,
      hallucination: 0.02,
      created: 'Today, 14:20',
      status: 'Active',
    },
    {
      id: 'prompt-v1.0',
      modelId: 'model-local',
      version: 'v1.0',
      systemPrompt: 'You are a customer support agent. Answer user queries helpfully and promptly.',
      quality: 78.4,
      hallucination: 0.18,
      created: '3 days ago',
      status: 'Deprecated',
    },
  ],
};

export const MOCK_API_KEYS: ApiKeyItem[] = [
  {
    id: 'key-1',
    name: 'Default Development Key',
    keyMasked: 'sk_live_sentinel_8f9a2b4c••••••••',
    created: new Date().toISOString().split('T')[0],
    lastUsed: 'Active',
  },
];

/**
 * Ensures any newly created or custom model has interactive data across all 6 tabs
 */
export function generateDefaultModelData(modelId: string, modelName: string) {
  const shortId = modelId.slice(-6);

  const evals: EvaluationRun[] = [
    {
      id: `RUN-${shortId}-01`,
      modelId,
      promptVersion: 'v1.4 (Healed)',
      testCases: 25,
      passed: 24,
      failed: 1,
      quality: 96.0,
      duration: '1.18s',
      status: 'Passed',
      timestamp: '15m ago',
      hallucination: 0.04,
      faithfulness: 0.98,
    },
    {
      id: `RUN-${shortId}-02`,
      modelId,
      promptVersion: 'v1.0 (Baseline)',
      testCases: 20,
      passed: 16,
      failed: 4,
      quality: 80.0,
      duration: '1.42s',
      status: 'Passed',
      timestamp: 'Yesterday',
      hallucination: 0.18,
      faithfulness: 0.82,
    },
  ];

  const fails: FailureRecord[] = [
    {
      id: `fail-${shortId}-01`,
      modelId,
      testCase: 'TC-001 (SLA Verification Consistency)',
      type: 'Hallucination',
      severity: 'High',
      detectedTime: '20m ago',
      diagnosis: `Model ${modelName} fabricated 99.99% uptime instead of 99.9% contractual standard.`,
      healingState: 'Healing',
      status: 'Open',
      healingAction: 'Inject Context Refusal Directive',
      question: 'What is the guaranteed SLA uptime?',
      generatedAnswer: 'Guaranteed uptime is 99.99% across all availability zones.',
      expectedAnswer: 'Guaranteed uptime is 99.9% SLA under enterprise policy.',
    },
    {
      id: `fail-${shortId}-02`,
      modelId,
      testCase: 'TC-002 (Refund Window Policy)',
      type: 'Retrieval Issue',
      severity: 'Medium',
      detectedTime: '1h ago',
      diagnosis: 'Retrieval coverage missed the 30-day refund window clause.',
      healingState: 'Resolved',
      status: 'Resolved',
      healingAction: 'Query Expansion Directive',
      question: 'What is the refund window?',
      generatedAnswer: 'Refunds must be requested immediately.',
      expectedAnswer: 'Refunds are eligible within 30 days of purchase.',
    },
  ];

  const diags: Record<string, DiagnosisData> = {
    [`fail-${shortId}-01`]: {
      failureId: `fail-${shortId}-01`,
      modelId,
      question: 'What is the guaranteed SLA uptime?',
      generatedAnswer: 'Guaranteed uptime is 99.99% across all availability zones.',
      expectedAnswer: 'Guaranteed uptime is 99.9% SLA under enterprise policy.',
      type: 'Hallucination',
      confidence: 93.5,
      evidence: {
        modelAgreement: 75.0,
        retrievalCoverage: 44.0,
        historicalFailureRate: 7.2,
        promptQuality: 70.0,
      },
      causalFlow: [
        'Query dispatched to model',
        'Retrieved context chunk alignment: 0.62',
        'Model hallucinated 99.99% uptime',
        'Classification: HALLUCINATION',
        'Remediation: Inject strict context refusal directive',
      ],
      recommendedAction: "Inject strict context refusal directive: 'State \"Information not provided\" if facts are missing from retrieved context.'",
    },
  };

  const heals: HealingRecord[] = [
    {
      id: `HEAL-${shortId}-01`,
      modelId,
      failureId: `fail-${shortId}-01`,
      rootCause: 'Hallucination & Speculative Drift',
      action: "Injected Refusal Directive: 'State \"Information not provided\" if facts are missing'",
      beforeQuality: 70.0,
      afterQuality: 95.0,
      improvement: 25.0,
      status: 'Promoted',
      timestamp: 'Today, 14:30',
    },
  ];

  const reqs: RequestLog[] = [
    {
      id: `REQ-${shortId}-1`,
      modelId,
      timestamp: 'Just now',
      model: modelName,
      latency: 0.32,
      quality: 96.0,
      status: 'Success',
      input: 'What is the guaranteed SLA uptime?',
      output: 'Guaranteed uptime is 99.9% SLA under enterprise policy.',
      retrievedContext: 'Policy: 99.9% SLA uptime guarantee.',
      tokensUsed: 40,
    },
  ];

  const exps: ExperimentData[] = [
    {
      id: `exp-${shortId}-01`,
      modelId,
      name: `${modelName} — Grounding Prompt Variant vs Baseline`,
      versionA: {
        name: 'Version A (v1.0 Baseline)',
        prompt: 'You are an AI assistant. Answer queries helpfully.',
        quality: 76.5,
      },
      versionB: {
        name: 'Version B (v1.4 Healed Winner)',
        prompt: 'You are an AI assistant. Answer strictly using verified context. If information is not provided, state "Information not provided".',
        quality: 93.8,
      },
      winner: 'B',
      status: 'Completed',
      totalSamples: 100,
      improvement: 17.3,
      created: 'Today',
    },
  ];

  const prompts: PromptVersion[] = [
    {
      id: `prompt-${shortId}-v1.4`,
      modelId,
      version: 'v1.4',
      systemPrompt: 'You are an AI assistant. Answer strictly using verified context. If information is not provided in context, state "Information not provided".',
      quality: 94.0,
      hallucination: 0.02,
      created: 'Today',
      status: 'Active',
    },
  ];

  return { evals, fails, diags, heals, reqs, exps, prompts };
}
