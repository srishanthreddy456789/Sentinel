import React, { createContext, useContext, useState, useMemo } from 'react';
import {
  ConnectedModel,
  GlobalMetrics,
  WorkspaceTab,
  ApiProvider,
  EvaluationRun,
  FailureRecord,
  DiagnosisData,
  HealingRecord,
  RequestLog,
  ExperimentData,
  PromptVersion,
  ApiKeyItem,
  ChatMessage,
} from '../types/sentinel';
import {
  INITIAL_MODELS,
  INITIAL_GLOBAL_METRICS,
  MOCK_EVALUATIONS,
  MOCK_FAILURES,
  MOCK_DIAGNOSES,
  MOCK_HEALING,
  MOCK_REQUESTS,
  MOCK_EXPERIMENTS,
  MOCK_PROMPTS,
  MOCK_API_KEYS,
} from '../data/mockData';

const DEFAULT_CHAT_THREADS: Record<string, ChatMessage[]> = {
  'model-2': [
    {
      id: 'msg-1',
      role: 'user',
      content: 'What is your refund policy for unused seats?',
      timestamp: '21:40:10',
    },
    {
      id: 'msg-2',
      role: 'assistant',
      content:
        'Customers can request refunds for unused seats within 30 days of the billing cycle. Approved refunds are credited to the original payment method within 3 to 5 business days.',
      timestamp: '21:40:11',
      latency: '1.12s',
      faithfulness: 98.6,
      hallucinationRisk: 0.2,
      retrievedContext: 'DocChunk #089: Refund policy duration terms and multi-seat pro-rata refunds.',
      tokens: 54,
    },
  ],
  'model-1': [
    {
      id: 'msg-101',
      role: 'user',
      content: 'Summarize system memory status for local Llama 3.1.',
      timestamp: '21:30:00',
    },
    {
      id: 'msg-102',
      role: 'assistant',
      content:
        'Current RAM usage is approximately 1.4GB. The local Ollama daemon is running healthy with an average latency of 1.38 seconds per inference call.',
      timestamp: '21:30:01',
      latency: '1.38s',
      faithfulness: 99.4,
      hallucinationRisk: 0.1,
      retrievedContext: 'Local System Daemon Metrics #001.',
      tokens: 48,
    },
  ],
};

interface SentinelContextType {
  models: ConnectedModel[];
  selectedModelId: string | null; // null = Global Dashboard level
  selectedModel: ConnectedModel | null;
  activeTab: WorkspaceTab;
  selectedFailureId: string | null;
  isAddApiModalOpen: boolean;
  globalMetrics: GlobalMetrics;
  
  // Model Data
  evaluationsMap: Record<string, EvaluationRun[]>;
  failuresMap: Record<string, FailureRecord[]>;
  diagnosesMap: Record<string, DiagnosisData>;
  healingMap: Record<string, HealingRecord[]>;
  requestsMap: Record<string, RequestLog[]>;
  experimentsMap: Record<string, ExperimentData[]>;
  promptsMap: Record<string, PromptVersion[]>;
  apiKeys: ApiKeyItem[];
  chatThreadsMap: Record<string, ChatMessage[]>;

  // Actions
  selectModel: (id: string | null) => void;
  setActiveTab: (tab: WorkspaceTab) => void;
  openAddApiModal: () => void;
  closeAddApiModal: () => void;
  addModel: (data: { name: string; provider: ApiProvider; model: string; baseUrl?: string; apiKey?: string }) => void;
  updateModelName: (id: string, newName: string) => void;
  updateModelSettings: (id: string, updates: Partial<ConnectedModel>) => void;
  deleteModel: (id: string) => void;
  selectFailureForDiagnosis: (failureId: string) => void;
  applyDiagnosisFix: (failureId: string) => void;
  promoteHealing: (healingId: string) => void;
  promoteExperimentWinner: (experimentId: string) => void;
  createApiKey: (name: string) => void;
  revokeApiKey: (keyId: string) => void;
  sendChatMessage: (modelId: string, content: string) => void;
  clearChatHistory: (modelId: string) => void;
}

const SentinelContext = createContext<SentinelContextType | undefined>(undefined);

export const SentinelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [models, setModels] = useState<ConnectedModel[]>(INITIAL_MODELS);
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('Dashboard');
  const [selectedFailureId, setSelectedFailureId] = useState<string | null>('FAIL-0832');
  const [isAddApiModalOpen, setIsAddApiModalOpen] = useState<boolean>(false);

  // Stateful copies of mock data maps for interactive updates
  const [evaluationsMap, setEvaluationsMap] = useState<Record<string, EvaluationRun[]>>(MOCK_EVALUATIONS);
  const [failuresMap, setFailuresMap] = useState<Record<string, FailureRecord[]>>(MOCK_FAILURES);
  const [diagnosesMap, setDiagnosesMap] = useState<Record<string, DiagnosisData>>(MOCK_DIAGNOSES);
  const [healingMap, setHealingMap] = useState<Record<string, HealingRecord[]>>(MOCK_HEALING);
  const [requestsMap, setRequestsMap] = useState<Record<string, RequestLog[]>>(MOCK_REQUESTS);
  const [experimentsMap, setExperimentsMap] = useState<Record<string, ExperimentData[]>>(MOCK_EXPERIMENTS);
  const [promptsMap, setPromptsMap] = useState<Record<string, PromptVersion[]>>(MOCK_PROMPTS);
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>(MOCK_API_KEYS);
  const [chatThreadsMap, setChatThreadsMap] = useState<Record<string, ChatMessage[]>>(DEFAULT_CHAT_THREADS);

  // Derived selected model
  const selectedModel = useMemo(() => {
    if (!selectedModelId) return null;
    return models.find((m) => m.id === selectedModelId) || null;
  }, [models, selectedModelId]);

  // Derived dynamic global metrics
  const globalMetrics = useMemo<GlobalMetrics>(() => {
    const totalModels = models.length;
    if (totalModels === 0) {
      return { totalModels: 0, totalRequests: 0, overallQuality: 0, totalFailures: 0, healingSuccessRate: 0, averageLatency: 0 };
    }
    const totalRequests = models.reduce((acc, m) => acc + m.requests, 0);
    const totalFailures = models.reduce((acc, m) => acc + m.failures, 0);
    const overallQuality = Number((models.reduce((acc, m) => acc + m.quality, 0) / totalModels).toFixed(1));
    const averageLatency = Number((models.reduce((acc, m) => acc + m.latency, 0) / totalModels).toFixed(2));
    
    return {
      totalModels,
      totalRequests,
      overallQuality,
      totalFailures,
      healingSuccessRate: 81.2,
      averageLatency,
    };
  }, [models]);

  const selectModel = (id: string | null) => {
    setSelectedModelId(id);
    setActiveTab('Dashboard'); // Reset to Dashboard tab when entering workspace or returning
  };

  const openAddApiModal = () => setIsAddApiModalOpen(true);
  const closeAddApiModal = () => setIsAddApiModalOpen(false);

  const addModel = (data: { name: string; provider: ApiProvider; model: string; baseUrl?: string; apiKey?: string }) => {
    const newId = `model-${Date.now()}`;
    const newModel: ConnectedModel = {
      id: newId,
      name: data.name, // Displayed EXACTLY as entered
      provider: data.provider,
      model: data.model || (data.provider === 'SENTINEL Free Local Model' ? 'Llama 3.1 8B (Local)' : 'Custom API'),
      health: 'Healthy',
      quality: 98.5,
      requests: 120,
      failures: 1,
      latency: 1.15,
      baseUrl: data.baseUrl,
      apiKey: data.apiKey,
      createdAt: new Date().toISOString().split('T')[0],
      description: `User connected AI model API (${data.provider}).`,
    };

    setModels((prev) => [...prev, newModel]);
    closeAddApiModal();

    // Auto-select newly created model and navigate to its workspace dashboard
    setSelectedModelId(newId);
    setActiveTab('Dashboard');
  };

  const updateModelName = (id: string, newName: string) => {
    setModels((prev) =>
      prev.map((m) => (m.id === id ? { ...m, name: newName } : m))
    );
  };

  const updateModelSettings = (id: string, updates: Partial<ConnectedModel>) => {
    setModels((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
    );
  };

  const deleteModel = (id: string) => {
    setModels((prev) => prev.filter((m) => m.id !== id));
    if (selectedModelId === id) {
      setSelectedModelId(null);
    }
  };

  const selectFailureForDiagnosis = (failureId: string) => {
    setSelectedFailureId(failureId);
    setActiveTab('Diagnosis');
  };

  const applyDiagnosisFix = (failureId: string) => {
    // Update failure record to Resolved
    setFailuresMap((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((mId) => {
        updated[mId] = updated[mId].map((f) =>
          f.id === failureId ? { ...f, status: 'Resolved', healingState: 'Resolved' } : f
        );
      });
      return updated;
    });

    // Add entry to healing history
    if (selectedModelId) {
      const newHealing: HealingRecord = {
        id: `HEAL-${Date.now().toString().slice(-3)}`,
        modelId: selectedModelId,
        failureId,
        rootCause: 'Retrieval & Reranking Optimization',
        action: 'Applied Query Expansion & Reranker Filter',
        beforeQuality: 72.4,
        afterQuality: 92.1,
        improvement: 19.7,
        status: 'Promoted',
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      };

      setHealingMap((prev) => ({
        ...prev,
        [selectedModelId]: [newHealing, ...(prev[selectedModelId] || [])],
      }));
    }
  };

  const promoteHealing = (healingId: string) => {
    if (!selectedModelId) return;
    setHealingMap((prev) => ({
      ...prev,
      [selectedModelId]: (prev[selectedModelId] || []).map((h) =>
        h.id === healingId ? { ...h, status: 'Promoted' } : h
      ),
    }));
  };

  const promoteExperimentWinner = (experimentId: string) => {
    if (!selectedModelId) return;
    setExperimentsMap((prev) => ({
      ...prev,
      [selectedModelId]: (prev[selectedModelId] || []).map((e) =>
        e.id === experimentId ? { ...e, winner: 'B', status: 'Completed' } : e
      ),
    }));
  };

  const createApiKey = (name: string) => {
    const newKey: ApiKeyItem = {
      id: `key-${Date.now()}`,
      name: name || 'New SDK Key',
      keyMasked: `sk_live_sentinel_${Math.random().toString(36).slice(2, 10)}••••••••`,
      created: new Date().toISOString().split('T')[0],
      lastUsed: 'Just now',
    };
    setApiKeys((prev) => [newKey, ...prev]);
  };

  const revokeApiKey = (keyId: string) => {
    setApiKeys((prev) => prev.filter((k) => k.id !== keyId));
  };

  const sendChatMessage = (modelId: string, content: string) => {
    const timestamp = new Date().toTimeString().slice(0, 8);
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-u`,
      role: 'user',
      content,
      timestamp,
    };

    setChatThreadsMap((prev) => ({
      ...prev,
      [modelId]: [...(prev[modelId] || []), userMsg],
    }));

    // Simulated real-time LLM inference + SENTINEL Reliability evaluation
    setTimeout(() => {
      const model = models.find((m) => m.id === modelId);
      const modelName = model?.name || 'Model';

      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now()}-a`,
        role: 'assistant',
        content: `I am ${modelName} powered by ${model?.provider || 'API'}. Received query: "${content}". Verified context ground truth.`,
        timestamp: new Date().toTimeString().slice(0, 8),
        latency: '1.14s',
        faithfulness: 99.1,
        hallucinationRisk: 0.2,
        retrievedContext: `DocChunk #412: Production knowledge base verification for ${modelName}.`,
        tokens: 62,
      };

      setChatThreadsMap((prev) => ({
        ...prev,
        [modelId]: [...(prev[modelId] || []), assistantMsg],
      }));
    }, 1000);
  };

  const clearChatHistory = (modelId: string) => {
    setChatThreadsMap((prev) => ({
      ...prev,
      [modelId]: [],
    }));
  };

  return (
    <SentinelContext.Provider
      value={{
        models,
        selectedModelId,
        selectedModel,
        activeTab,
        selectedFailureId,
        isAddApiModalOpen,
        globalMetrics,
        evaluationsMap,
        failuresMap,
        diagnosesMap,
        healingMap,
        requestsMap,
        experimentsMap,
        promptsMap,
        apiKeys,
        chatThreadsMap,
        selectModel,
        setActiveTab,
        openAddApiModal,
        closeAddApiModal,
        addModel,
        updateModelName,
        updateModelSettings,
        deleteModel,
        selectFailureForDiagnosis,
        applyDiagnosisFix,
        promoteHealing,
        promoteExperimentWinner,
        createApiKey,
        revokeApiKey,
        sendChatMessage,
        clearChatHistory,
      }}
    >
      {children}
    </SentinelContext.Provider>
  );
};

export const useSentinel = () => {
  const context = useContext(SentinelContext);
  if (!context) {
    throw new Error('useSentinel must be used within a SentinelProvider');
  }
  return context;
};
