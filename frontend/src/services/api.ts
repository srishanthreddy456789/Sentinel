const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000/api/v1';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('sentinel_auth_token') || localStorage.getItem('sentinel_token') || 'demo_token';
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  };

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(err.message || err.detail || 'API Request Failed');
    }
    return await res.json();
  } catch (error) {
    console.warn(`[SENTINEL API] Request to ${endpoint} failed:`, error);
    throw error;
  }
}

export const connectionService = {
  listConnections: () => request<any[]>('/apis/'),
  addConnection: (data: { name: string; provider: string; base_url?: string; model_name?: string; api_key?: string }) =>
    request<any>('/apis/add', { method: 'POST', body: JSON.stringify(data) }),
  getConnectionStatus: (apiId: string) => request<any>(`/apis/${apiId}/status`),
  deleteConnection: (apiId: string) => request<void>(`/apis/${apiId}`, { method: 'DELETE' }),
};

export const dashboardService = {
  getGlobalDashboard: () => request<any>('/dashboard/global'),
  getIndividualDashboard: (apiId: string) => request<any>(`/dashboard/model/${apiId}`),
  getSystemMetrics: () => request<any>('/dashboard/system-metrics'),
};

export const requestService = {
  ingestRequest: (data: { connected_api_id: string; prompt: string; expected_output?: string; context?: any }) =>
    request<any>('/requests/ingest', { method: 'POST', body: JSON.stringify(data) }),
  getRequestLogs: (apiId: string) => request<any[]>(`/requests/${apiId}/logs`),
};

export const evaluationService = {
  listTestSuites: (apiId: string) => request<any[]>(`/evaluations/suites/${apiId}`),
  createTestSuite: (data: { connected_api_id: string; name: string; description?: string }) =>
    request<any>('/evaluations/suites', { method: 'POST', body: JSON.stringify(data) }),
  addTestCase: (suiteId: string, data: { input_text: string; expected_output?: string; context?: any }) =>
    request<any>(`/evaluations/suites/${suiteId}/cases`, { method: 'POST', body: JSON.stringify(data) }),
  runEvaluationSuite: (suiteId: string) =>
    request<any>(`/evaluations/suites/${suiteId}/run`, { method: 'POST' }),
  listEvaluationRuns: (apiId: string) => request<any[]>(`/evaluations/runs/${apiId}`),
};

export const failureService = {
  listFailures: (apiId: string) => request<any[]>(`/failures/${apiId}`),
  getFailureDetails: (failureId: string) => request<any>(`/failures/details/${failureId}`),
};

export const healingService = {
  listHealingEvents: (apiId: string) => request<any[]>(`/healing/${apiId}`),
  triggerHealing: (data: { connected_api_id: string; original_prompt: string; failing_input: string; failing_output: string; expected_output?: string }) =>
    request<any>('/healing/trigger', { method: 'POST', body: JSON.stringify(data) }),
};

export const promptService = {
  listPromptVersions: (apiId: string) => request<any[]>(`/prompts/${apiId}`),
  createPromptVersion: (data: { connected_api_id: string; content: string; change_summary?: string }) =>
    request<any>('/prompts/', { method: 'POST', body: JSON.stringify(data) }),
  comparePromptVersions: (v1Id: string, v2Id: string) => request<any>(`/prompts/compare/${v1Id}/${v2Id}`),
};

export const embeddingService = {
  computeSimilarity: (text1: string, text2: string) =>
    request<any>('/embeddings/similarity', { method: 'POST', body: JSON.stringify({ text1, text2 }) }),
  vectorizeText: (text: string) =>
    request<any>('/embeddings/vectorize', { method: 'POST', body: JSON.stringify({ text }) }),
};

export const benchmarkService = {
  runBenchmark: (benchmarkName?: string, sampleCount?: number) =>
    request<any>('/benchmarks/run', { method: 'POST', body: JSON.stringify({ benchmark_name: benchmarkName, sample_count: sampleCount }) }),
  getBenchmarkSummary: () => request<any>('/benchmarks/summary'),
};

export const researchService = {
  getAblationStudy: () => request<any>('/research/ablation'),
};

export const alertService = {
  listAlerts: () => request<any[]>('/alerts/'),
  getSystemHealth: () => request<any>('/health/detailed'),
};

export const keyService = {
  listKeys: () => request<any[]>('/keys/'),
  generateKey: (name: string) => request<any>('/keys/generate', { method: 'POST', body: JSON.stringify({ name }) }),
  revokeKey: (keyId: string) => request<void>(`/keys/revoke/${keyId}`, { method: 'POST' }),
};
