# SENTINEL System Architecture

SENTINEL is built as a modular monolith with background worker processes designed for local developer desktop deployment (via Electron) and cloud-ready microservices scalability.

```
                        ┌─────────────────────┐
                        │   Electron Desktop  │
                        │   React Frontend    │
                        └──────────┬──────────┘
                                   │
                                   ▼
                        ┌─────────────────────┐
                        │      FastAPI        │
                        │     API Gateway     │
                        └──────────┬──────────┘
                                   │
              ┌────────────────────┼────────────────────┐
              │                    │                    │
              ▼                    ▼                    ▼
        PostgreSQL               Redis             AI Services
        Metadata                Queue              Evaluation
        History                 Events             Diagnosis
        Experiments             Jobs               Healing
              │                    │                    │
              │                    ▼                    │
              │              Worker Processes           │
              │                    │                    │
              └────────────────────┼────────────────────┘
                                   │
                  ┌────────────────┼────────────────┐
                  │                │                │
                  ▼                ▼                ▼
               MLflow             DVC            ChromaDB
             Experiments        Datasets          Vectors
                  │                │                │
                  └────────────────┼────────────────┘
                                   │
                                   ▼
                         External / Local LLMs
                         ┌────────────────────┐
                         │ Ollama             │
                         │ Gemini             │
                         │ OpenAI             │
                         │ Custom Providers   │
                         └────────────────────┘
```

## Architectural Layers

1. **FastAPI API Gateway**: Asynchronous REST endpoints handling routing, authentication, secret masking, and background task dispatch.
2. **PostgreSQL / SQLite Database**: Relational storage for developers, connected models, prompt versions, evaluation runs, test suites, and alert history.
3. **Redis & Background Workers**: Asynchronous Redis job queues (`evaluation_queue`, `healing_queue`, `experiment_queue`, `notification_queue`) with zero-blocker in-memory fallback.
4. **AI Services Core**:
   - **Evaluation Engine**: 9 structured metric evaluators.
   - **Diagnosis Engine**: 11 failure mode root cause classifiers.
   - **Self-Healing Engine**: Meta-prompting candidate generation & multi-threshold verification gates.
5. **MLOps Infrastructure**: MLflow experiment tracking & DVC dataset version hashing (`data/golden/`, `data/rag/`, `data/safety/`, `data/regression/`, `data/benchmarks/`).
