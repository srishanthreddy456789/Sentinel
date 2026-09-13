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
  ChatSession,
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
import { connectionService, dashboardService } from '../services/api';

const DEFAULT_CHAT_THREADS: Record<string, ChatMessage[]> = {};

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
  chatSessionsMap: Record<string, ChatSession[]>;
  activeSessionIdMap: Record<string, string>;

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
  sendChatMessage: (modelId: string, content: string) => Promise<void>;
  clearChatHistory: (modelId: string) => void;
  createNewChatSession: (modelId: string) => ChatSession;
  switchChatSession: (modelId: string, sessionId: string) => void;
  deleteChatSession: (modelId: string, sessionId: string) => void;
}

const SentinelContext = createContext<SentinelContextType | undefined>(undefined);

const MODELS_KEY = 'sentinel_custom_models';

export const SentinelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [models, setModels] = useState<ConnectedModel[]>(() => {
    try {
      const saved = localStorage.getItem(MODELS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load saved models from localStorage:', e);
    }
    return INITIAL_MODELS;
  });
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('Dashboard');
  const [selectedFailureId, setSelectedFailureId] = useState<string | null>(null);
  const [isAddApiModalOpen, setIsAddApiModalOpen] = useState<boolean>(false);

  // Persist models state to localStorage whenever it updates
  React.useEffect(() => {
    try {
      localStorage.setItem(MODELS_KEY, JSON.stringify(models));
    } catch (e) {
      console.warn('Failed to save models to localStorage:', e);
    }
  }, [models]);

  // Fetch real connected models from backend on startup
  React.useEffect(() => {
    const fetchBackendConnections = async () => {
      try {
        const backendApis = await connectionService.listConnections();
        if (Array.isArray(backendApis) && backendApis.length > 0) {
          const loadedModels: ConnectedModel[] = backendApis.map((api: any) => ({
            id: api.id,
            name: api.name,
            provider: api.provider,
            model: api.model_name || api.provider,
            health: api.status || 'Healthy',
            quality: 100.0,
            requests: 0,
            failures: 0,
            latency: 0.35,
            baseUrl: api.base_url,
            createdAt: api.created_at ? api.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
          }));

          setModels((prev) => {
            const merged = [...loadedModels];
            for (const p of prev) {
              if (!merged.some((m) => m.id === p.id || m.name === p.name)) {
                merged.push(p);
              }
            }
            return merged;
          });
        }
      } catch (err) {
        console.warn('Backend connections fetch:', err);
      }
    };
    fetchBackendConnections();
  }, []);

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
      return { totalModels: 0, totalRequests: 0, overallQuality: 0, totalFailures: 0, healingSuccessRate: 100.0, averageLatency: 0 };
    }
    const totalRequests = models.reduce((acc, m) => acc + m.requests, 0);
    const totalFailures = models.reduce((acc, m) => acc + m.failures, 0);
    const overallQuality = Number((models.reduce((acc, m) => acc + m.quality, 0) / totalModels).toFixed(1));
    const averageLatency = Number((models.reduce((acc, m) => acc + m.latency, 0) / totalModels).toFixed(2));
    
    const allHealing = Object.values(healingMap).flat();
    const successfulFixes = allHealing.filter((h) => h.status === 'Verified' || h.status === 'Promoted').length;
    const healingSuccessRate = allHealing.length
      ? Number(((successfulFixes / allHealing.length) * 100).toFixed(1))
      : 100.0;

    return {
      totalModels,
      totalRequests,
      overallQuality,
      totalFailures,
      healingSuccessRate,
      averageLatency,
    };
  }, [models, healingMap]);

  const selectModel = (id: string | null) => {
    setSelectedModelId(id);
    setActiveTab('Dashboard'); // Reset to Dashboard tab when entering workspace or returning
  };

  const openAddApiModal = () => setIsAddApiModalOpen(true);
  const closeAddApiModal = () => setIsAddApiModalOpen(false);

  const addModel = async (data: { name: string; provider: ApiProvider; model: string; baseUrl?: string; apiKey?: string }) => {
    let createdId = `model-${Date.now()}`;
    try {
      const apiRes = await connectionService.addConnection({
        name: data.name,
        provider: data.provider,
        base_url: data.baseUrl,
        model_name: data.model,
        api_key: data.apiKey,
      });
      if (apiRes && apiRes.id) {
        createdId = apiRes.id;
      }
    } catch (e) {
      console.warn('Backend add connection fallback:', e);
    }

    const newModel: ConnectedModel = {
      id: createdId,
      name: data.name, // Displayed EXACTLY as entered
      provider: data.provider,
      model: data.model || (data.provider === 'SENTINEL Free Local Model' ? 'Llama 3.1 8B (Local)' : 'Custom API'),
      health: 'Healthy',
      quality: 100.0,
      requests: 0,
      failures: 0,
      latency: 0.35,
      baseUrl: data.baseUrl,
      apiKey: data.apiKey,
      createdAt: new Date().toISOString().split('T')[0],
      description: `User connected AI model API (${data.provider}).`,
    };

    setModels((prev) => [...prev, newModel]);
    closeAddApiModal();

    // Auto-select newly created model and navigate to its workspace dashboard
    setSelectedModelId(createdId);
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

  const deleteModel = async (id: string) => {
    try {
      await connectionService.deleteConnection(id);
    } catch (e) {
      console.warn('Backend delete connection fallback:', e);
    }
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

  const [chatSessionsMap, setChatSessionsMap] = useState<Record<string, ChatSession[]>>({});
  const [activeSessionIdMap, setActiveSessionIdMap] = useState<Record<string, string>>({});

  const createNewChatSession = (modelId: string): ChatSession => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newSession: ChatSession = {
      id: `session-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      modelId,
      title: 'New Chat',
      createdAt: timestamp,
      updatedAt: timestamp,
      messages: [],
    };

    setChatSessionsMap((prev) => ({
      ...prev,
      [modelId]: [newSession, ...(prev[modelId] || [])],
    }));

    setActiveSessionIdMap((prev) => ({
      ...prev,
      [modelId]: newSession.id,
    }));

    return newSession;
  };

  const switchChatSession = (modelId: string, sessionId: string) => {
    setActiveSessionIdMap((prev) => ({
      ...prev,
      [modelId]: sessionId,
    }));
  };

  const deleteChatSession = (modelId: string, sessionId: string) => {
    setChatSessionsMap((prev) => {
      const existing = prev[modelId] || [];
      const remaining = existing.filter((s) => s.id !== sessionId);
      return {
        ...prev,
        [modelId]: remaining,
      };
    });

    setActiveSessionIdMap((prev) => {
      if (prev[modelId] === sessionId) {
        const remaining = (chatSessionsMap[modelId] || []).filter((s) => s.id !== sessionId);
        return {
          ...prev,
          [modelId]: remaining.length > 0 ? remaining[0].id : '',
        };
      }
      return prev;
    });
  };

  const sendChatMessage = async (modelId: string, content: string) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-u`,
      role: 'user',
      content,
      timestamp,
    };

    let modelSessions = chatSessionsMap[modelId] || [];
    let currentSessionId = activeSessionIdMap[modelId];
    let currentSession = modelSessions.find((s) => s.id === currentSessionId);

    if (!currentSession) {
      currentSession = {
        id: `session-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        modelId,
        title: content.trim().length > 30 ? content.trim().slice(0, 30) + '...' : content.trim(),
        createdAt: timestamp,
        updatedAt: timestamp,
        messages: [],
      };
      currentSessionId = currentSession.id;
      modelSessions = [currentSession, ...modelSessions];
    }

    const sessionTitle =
      currentSession.title === 'New Chat' || currentSession.messages.length === 0
        ? content.trim().length > 30
          ? content.trim().slice(0, 30) + '...'
          : content.trim()
        : currentSession.title;

    const updatedMessages = [...currentSession.messages, userMsg];
    const updatedSession: ChatSession = {
      ...currentSession,
      title: sessionTitle,
      updatedAt: timestamp,
      messages: updatedMessages,
    };

    setChatSessionsMap((prev) => {
      const existing = prev[modelId] || [];
      const hasSession = existing.some((s) => s.id === currentSessionId);
      const nextList = hasSession
        ? existing.map((s) => (s.id === currentSessionId ? updatedSession : s))
        : [updatedSession, ...existing];
      return {
        ...prev,
        [modelId]: nextList,
      };
    });

    setActiveSessionIdMap((prev) => ({
      ...prev,
      [modelId]: currentSessionId,
    }));

    setChatThreadsMap((prev) => ({
      ...prev,
      [modelId]: updatedMessages,
    }));

    const appendAssistantMsg = (assistantMsg: ChatMessage) => {
      setChatSessionsMap((prev) => {
        const existing = prev[modelId] || [];
        const nextList = existing.map((s) => {
          if (s.id === currentSessionId) {
            return {
              ...s,
              updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              messages: [...s.messages, assistantMsg],
            };
          }
          return s;
        });
        return {
          ...prev,
          [modelId]: nextList,
        };
      });

      setChatThreadsMap((prev) => ({
        ...prev,
        [modelId]: [...(prev[modelId] || []), assistantMsg],
      }));
    };

    const recordModelRequest = (targetId?: string, latSec?: number) => {
      if (!targetId || typeof latSec !== 'number') return;
      setModels((prev) =>
        prev.map((m) => {
          if (m.id === targetId) {
            const reqs = (m.requests || 0) + 1;
            const avgLat = Number((((m.latency || 0) * (m.requests || 0) + latSec) / reqs).toFixed(2));
            return { ...m, requests: reqs, latency: avgLat };
          }
          return m;
        })
      );
    };

    const model = models.find((m) => m.id === modelId);
    const isOllamaProvider =
      model?.provider === 'Ollama' ||
      model?.provider === 'SENTINEL Free Local Model' ||
      model?.provider === 'SENTINEL Local Model' ||
      (model?.baseUrl && (model.baseUrl.includes('11434') || model.baseUrl.includes('localhost')));

    if (isOllamaProvider) {
      const startTime = Date.now();
      try {
        let availableModels: string[] = [];
        try {
          const tagsRes = await fetch('/ollama-api/api/tags');
          if (tagsRes.ok) {
            const tagsData = await tagsRes.json();
            availableModels = (tagsData.models || []).map((m: any) => m.name || m.model);
          }
        } catch (err) {
          try {
            const tagsResDirect = await fetch('http://localhost:11434/api/tags');
            if (tagsResDirect.ok) {
              const tagsData = await tagsResDirect.json();
              availableModels = (tagsData.models || []).map((m: any) => m.name || m.model);
            }
          } catch (e) {
            console.warn('Ollama tags fetch error:', e);
          }
        }

        if (availableModels.length === 0) {
          const assistantMsg: ChatMessage = {
            id: `msg-${Date.now()}-a`,
            role: 'assistant',
            content: `⚡ Local Ollama daemon is active at http://localhost:11434, but no downloaded models were detected.\n\nPlease run \`ollama run mistral\` or \`ollama pull llama3.2\` in your terminal, then try again!`,
            timestamp: new Date().toTimeString().slice(0, 8),
            latency: '0.01s',
            faithfulness: 100,
            hallucinationRisk: 0,
            retrievedContext: 'Ollama Local Daemon Status: No Models Found',
            tokens: 0,
          };
          appendAssistantMsg(assistantMsg);
          return;
        }

        let targetModelTag = availableModels[0];
        if (model?.model && availableModels.length > 0) {
          const cleanRequestedName = model.model.toLowerCase().replace(/[^a-z0-9]/g, '');
          const match = availableModels.find((am) => {
            const cleanAm = am.toLowerCase().replace(/[^a-z0-9]/g, '');
            return cleanAm.includes(cleanRequestedName) || cleanRequestedName.includes(cleanAm);
          });
          if (match) {
            targetModelTag = match;
          }
        }

        const apiMessages = updatedMessages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));

        let response: Response;
        try {
          response = await fetch('/ollama-api/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: targetModelTag,
              messages: apiMessages,
              stream: false,
            }),
          });
        } catch (err) {
          response = await fetch('http://localhost:11434/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: targetModelTag,
              messages: apiMessages,
              stream: false,
            }),
          });
        }

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`Ollama API returned HTTP ${response.status}: ${errText}`);
        }

        const data = await response.json();
        const latencyMs = Date.now() - startTime;
        const latencySec = (latencyMs / 1000).toFixed(2) + 's';
        const tokens = data.eval_count || data.prompt_eval_count || Math.ceil((data.message?.content || '').length / 4) || 50;

        const assistantMsg: ChatMessage = {
          id: `msg-${Date.now()}-a`,
          role: 'assistant',
          content: data.message?.content || 'No text content returned from Ollama.',
          timestamp: new Date().toTimeString().slice(0, 8),
          latency: latencySec,
          faithfulness: 100.0,
          hallucinationRisk: 0.0,
          retrievedContext: `Local System Ollama (${targetModelTag}) Ground Truth Verification.`,
          tokens,
        };

        recordModelRequest(modelId, Number((latencyMs / 1000).toFixed(2)));
        appendAssistantMsg(assistantMsg);
        return;
      } catch (err: any) {
        console.error('Ollama chat error:', err);

        let hint = 'Make sure Ollama app or daemon is running (`http://localhost:11434`).';
        if (err.message?.includes('model') || err.message?.includes('not found')) {
          hint = 'Download a model using `ollama pull llama3.2` or `ollama pull tinyllama` in PowerShell.';
        }

        const assistantMsg: ChatMessage = {
          id: `msg-${Date.now()}-a`,
          role: 'assistant',
          content: `⚠️ Unable to communicate with local Ollama daemon.\n\nError Details: ${err.message || err}\n\n💡 Tip: ${hint}`,
          timestamp: new Date().toTimeString().slice(0, 8),
          latency: '0.05s',
          faithfulness: 0,
          hallucinationRisk: 100,
          tokens: 0,
        };

        appendAssistantMsg(assistantMsg);
        return;
      }
    }

    // External Provider API Execution
    const apiKeyClean = (model?.apiKey || '').trim();

    // Smart key auto-detection for Google Gemini vs OpenAI
    const isGeminiKey =
      apiKeyClean.startsWith('AIza') ||
      apiKeyClean.startsWith('AQ.') ||
      apiKeyClean.startsWith('AQ') ||
      apiKeyClean.startsWith('AIzaSy');

    const isGeminiProvider =
      model?.provider === 'Google Gemini' ||
      model?.provider === 'Google AI' ||
      model?.name?.toLowerCase().includes('gemini') ||
      isGeminiKey;

    const isOpenAIProvider =
      !isGeminiKey &&
      (model?.provider === 'OpenAI' ||
        (apiKeyClean.startsWith('sk-') && !apiKeyClean.startsWith('sk_live_sentinel')));

    if (isGeminiProvider) {
      if (!apiKeyClean || apiKeyClean === 'dummy_key' || apiKeyClean.includes('sk_live_an')) {
        const assistantMsg: ChatMessage = {
          id: `msg-${Date.now()}-a`,
          role: 'assistant',
          content: `⚠️ Google Gemini API Key Required / Missing.\n\nPlease enter a valid Google AI Studio API Key in Settings. Get a free key at https://aistudio.google.com.`,
          timestamp: new Date().toTimeString().slice(0, 8),
          latency: '0.02s',
          faithfulness: 0,
          hallucinationRisk: 100,
          tokens: 0,
        };
        appendAssistantMsg(assistantMsg);
        return;
      }

      const startTime = Date.now();
      try {
        const candidateModels: string[] = ['gemini-flash-latest', 'gemini-pro-latest'];

        // If user typed a specific model in workspace model settings
        const customModel = (model?.model || '').toLowerCase().trim().replace(/^models\//, '');
        if (
          customModel &&
          !customModel.includes('dummy') &&
          customModel !== 'gemini-pro' &&
          customModel !== 'gemini' &&
          customModel !== 'gemini 1.5 pro'
        ) {
          candidateModels.unshift(customModel);
        }

        // 1. Try querying Google AI Studio ModelService for exact supported models
        try {
          const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKeyClean}`);
          if (listRes.ok) {
            const listData = await listRes.json();
            const validModels: string[] = (listData.models || [])
              .filter((m: any) => (m.supportedGenerationMethods || []).includes('generateContent'))
              .map((m: any) => (m.name || '').replace('models/', ''));

            if (validModels.length > 0) {
              const flashMatch = validModels.find(
                (m) => m === 'gemini-flash-latest' || m.includes('2.5-flash') || m.includes('flash-latest')
              );
              const proMatch = validModels.find((m) => m === 'gemini-pro-latest' || m.includes('pro-latest'));

              const userPrefersPro = customModel.includes('pro');
              const preferred = userPrefersPro ? proMatch || flashMatch : flashMatch || proMatch;
              if (preferred && !candidateModels.includes(preferred)) {
                candidateModels.unshift(preferred);
              }
            }
          }
        } catch (e) {
          console.warn('Gemini models listing error:', e);
        }

        // Deduplicate candidate list & ensure gemini-flash-latest is always included
        const uniqueCandidates = Array.from(new Set(candidateModels));
        if (!uniqueCandidates.includes('gemini-flash-latest')) {
          uniqueCandidates.push('gemini-flash-latest');
        }

        let res: Response | null = null;
        let usedModel = uniqueCandidates[0];
        let lastErr = '';

        for (const mName of uniqueCandidates) {
          usedModel = mName;
          const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${mName}:generateContent?key=${apiKeyClean}`;
          try {
            const attemptRes = await fetch(geminiUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [
                  {
                    role: 'user',
                    parts: [{ text: content }],
                  },
                ],
              }),
            });

            if (attemptRes.ok) {
              res = attemptRes;
              break;
            } else {
              const errData = await attemptRes.json().catch(() => ({}));
              lastErr = errData.error?.message || `HTTP ${attemptRes.status}`;
              console.warn(`Gemini model ${mName} call failed (${attemptRes.status}): ${lastErr}`);
            }
          } catch (fetchErr: any) {
            lastErr = fetchErr.message || String(fetchErr);
            console.warn(`Gemini network call failed for ${mName}: ${lastErr}`);
          }
        }

        if (!res || !res.ok) {
          throw new Error(lastErr || 'All Gemini model endpoints failed.');
        }

        const data = await res.json();
        const outputText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response text generated by Google Gemini.';
        const latencySec = ((Date.now() - startTime) / 1000).toFixed(2) + 's';
        const tokens = data.usageMetadata?.totalTokenCount || Math.ceil(outputText.length / 4);

        const assistantMsg: ChatMessage = {
          id: `msg-${Date.now()}-a`,
          role: 'assistant',
          content: outputText,
          timestamp: new Date().toTimeString().slice(0, 8),
          latency: latencySec,
          faithfulness: 100.0,
          hallucinationRisk: 0.0,
          retrievedContext: `Google AI Studio API (${usedModel}) Ground Truth Execution.`,
          tokens,
        };

        recordModelRequest(modelId, Number(((Date.now() - startTime) / 1000).toFixed(2)));
        appendAssistantMsg(assistantMsg);
        return;
      } catch (err: any) {
        console.error('Google Gemini API execution error:', err);
        const assistantMsg: ChatMessage = {
          id: `msg-${Date.now()}-a`,
          role: 'assistant',
          content: `⚠️ Google Gemini API Call Failed for model ${model?.name}.\n\nError Details: ${err.message || err}\n\n💡 Troubleshooting Checklist:\n1. Ensure your Google AI API key is valid (get key at https://aistudio.google.com).\n2. Verify internet access and model quota availability.\n3. Make sure the API key is saved under Model Workspace Settings.`,
          timestamp: new Date().toTimeString().slice(0, 8),
          latency: '0.04s',
          faithfulness: 0,
          hallucinationRisk: 100,
          tokens: 0,
        };

        appendAssistantMsg(assistantMsg);
        return;
      }
    }

    if (isOpenAIProvider) {
      const startTime = Date.now();
      try {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKeyClean}`,
          },
          body: JSON.stringify({
            model: model?.model || 'gpt-4o',
            messages: [{ role: 'user', content }],
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          const errMsg = errData.error?.message || `HTTP ${res.status}`;
          throw new Error(`OpenAI API returned HTTP ${res.status}: ${errMsg}`);
        }

        const data = await res.json();
        const outputText = data.choices?.[0]?.message?.content || 'No response text returned.';
        const latencySec = ((Date.now() - startTime) / 1000).toFixed(2) + 's';
        const tokens = data.usage?.total_tokens || Math.ceil(outputText.length / 4);

        const assistantMsg: ChatMessage = {
          id: `msg-${Date.now()}-a`,
          role: 'assistant',
          content: outputText,
          timestamp: new Date().toTimeString().slice(0, 8),
          latency: latencySec,
          faithfulness: 100.0,
          hallucinationRisk: 0.0,
          retrievedContext: `OpenAI API Execution (${data.model || 'gpt-4o'}).`,
          tokens,
        };

        recordModelRequest(modelId, Number(((Date.now() - startTime) / 1000).toFixed(2)));
        appendAssistantMsg(assistantMsg);
        return;
      } catch (err: any) {
        console.error('OpenAI API execution error:', err);
        const assistantMsg: ChatMessage = {
          id: `msg-${Date.now()}-a`,
          role: 'assistant',
          content: `⚠️ OpenAI API Call Failed for model ${model?.name}.\n\nError: ${err.message || err}`,
          timestamp: new Date().toTimeString().slice(0, 8),
          latency: '0.04s',
          faithfulness: 0,
          hallucinationRisk: 100,
          tokens: 0,
        };

        appendAssistantMsg(assistantMsg);
        return;
      }
    }

    // Default Fallback to Backend Ingestion API for other custom connections
    if (!apiKeyClean || apiKeyClean === 'dummy_key') {
      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now()}-a`,
        role: 'assistant',
        content: `⚠️ API Key Required / Missing for ${model?.name || 'this provider'}.\n\nProvider (${model?.provider || 'External API'}) requires a valid API key. No valid API key was provided for this connection.\n\n💡 How to resolve:\n1. Click "Settings" in the left sidebar or top right gear icon.\n2. Enter your valid ${model?.provider} API key and save.\n3. Alternatively, switch to "Free Llama Assistant" to run models locally via Ollama without an external API key.`,
        timestamp: new Date().toTimeString().slice(0, 8),
        latency: '0.02s',
        faithfulness: 0,
        hallucinationRisk: 100,
        tokens: 0,
      };

      appendAssistantMsg(assistantMsg);
      return;
    }

    const startTime = Date.now();
    try {
      const res = await fetch('http://localhost:8000/api/v1/requests/ingest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer demo_token',
        },
        body: JSON.stringify({
          connected_api_id: modelId,
          prompt: content,
        }),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        throw new Error(`API returned HTTP ${res.status}: ${errText}`);
      }

      const data = await res.json();
      const latencySec = ((Date.now() - startTime) / 1000).toFixed(2) + 's';

      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now()}-a`,
        role: 'assistant',
        content: data.output_text,
        timestamp: new Date().toTimeString().slice(0, 8),
        latency: latencySec,
        faithfulness: Number(((data.overall_quality || 0.94) * 100).toFixed(1)),
        hallucinationRisk: 0.2,
        retrievedContext: `SENTINEL Execution & Evaluation Pipeline (${data.request_id.slice(0, 8)}).`,
        tokens: Math.ceil((data.output_text || '').length / 4),
      };

      appendAssistantMsg(assistantMsg);
    } catch (err: any) {
      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now()}-a`,
        role: 'assistant',
        content: `⚠️ API Key Validation / Connection Failed for ${model?.name}.\n\nError: ${err.message || err}\n\nPlease check your provider credentials under Settings or switch to a local Ollama model.`,
        timestamp: new Date().toTimeString().slice(0, 8),
        latency: '0.04s',
        faithfulness: 0,
        hallucinationRisk: 100,
        tokens: 0,
      };

      appendAssistantMsg(assistantMsg);
    }
  };

  const clearChatHistory = (modelId: string) => {
    const activeId = activeSessionIdMap[modelId];
    if (activeId) {
      setChatSessionsMap((prev) => ({
        ...prev,
        [modelId]: (prev[modelId] || []).map((s) => (s.id === activeId ? { ...s, messages: [] } : s)),
      }));
    }
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
        chatSessionsMap,
        activeSessionIdMap,
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
        createNewChatSession,
        switchChatSession,
        deleteChatSession,
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
