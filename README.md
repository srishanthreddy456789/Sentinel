# SENTINEL

## Autonomous LLMOps and Self-Healing Evaluation Platform

> **SENTINEL is a local-first LLMOps platform that continuously evaluates Large Language Models, diagnoses the root causes of failures, and automatically attempts to self-heal them.**

[![Status](https://img.shields.io/badge/status-under--development-orange)]()
[![Python](https://img.shields.io/badge/Python-3.11-blue)]()
[![FastAPI](https://img.shields.io/badge/FastAPI-backend-009688)]()
[![Ollama](https://img.shields.io/badge/Ollama-local--LLM-black)]()
[![React](https://img.shields.io/badge/React-frontend-61DAFB)]()
[![Docker](https://img.shields.io/badge/Docker-containerized-2496ED)]()

---

## 📌 Overview

Large Language Models can produce incorrect, inconsistent, hallucinated, or poorly grounded responses even when the underlying application is functioning correctly.

Traditional CI/CD pipelines primarily test whether the software itself is working:

```text
Code
 ↓
Unit Tests
 ↓
Integration Tests
 ↓
Build
 ↓
Deploy
```

However, an LLM application can pass all traditional software tests while its actual AI quality degrades.

SENTINEL introduces an **AI quality layer** into the software lifecycle:

```text
Code / Prompt / Model Change
            ↓
       LLM Evaluation
            ↓
      Failure Detection
            ↓
         Diagnosis
            ↓
     Self-Healing Attempt
            ↓
         Verification
            ↓
      Quality Gate
            ↓
      Deploy / Block
```

SENTINEL is designed as a **local-first platform**, using Ollama to run local LLMs without requiring paid inference APIs or API keys.

---

# 🎯 Project Goals

SENTINEL aims to provide four major capabilities:

### 1. Evaluate

Continuously evaluate LLM responses using multiple quality metrics.

### 2. Diagnose

Determine the likely root cause when an LLM response fails.

### 3. Self-Heal

Automatically apply an appropriate recovery strategy.

### 4. Prevent Regression

Integrate AI evaluation into CI/CD so degraded prompts or models can be blocked before deployment.

---

# 🧠 Core Capabilities

## 1. Continuous LLM Evaluation

SENTINEL evaluates LLM responses across multiple dimensions:

* Semantic correctness
* Hallucination
* Faithfulness
* Relevance
* Consistency
* Toxicity
* Latency

The evaluation engine combines:

* Golden test suites
* Embedding-based semantic similarity
* Document grounding
* LLM-as-a-Judge
* Custom evaluation metrics

---

# 2. Multi-Layer Correctness Evaluation

SENTINEL uses multiple layers instead of relying on a single evaluation technique.

## Layer 1 — Golden Test Suite

Manually defined test cases contain:

```text
Question
Expected Answer
Category
Metadata
```

The generated answer is compared against the expected answer using semantic similarity.

Example:

```text
Expected:
Paris is the capital of France.

LLM:
The capital city of France is Paris.
```

Although the wording differs, the semantic meaning is almost identical.

SENTINEL therefore uses embeddings instead of exact string matching.

---

## Layer 2 — Document Grounding

For applications using RAG, the answer is compared with retrieved document chunks.

```text
Question
   ↓
Retriever
   ↓
Documents
   ↓
LLM
   ↓
Answer
   ↓
Compare Answer ↔ Retrieved Context
```

If the response is not sufficiently supported by the retrieved context, SENTINEL can flag a potential hallucination or grounding failure.

---

## Layer 3 — LLM-as-a-Judge

For difficult or ambiguous cases, a second LLM evaluates:

```text
Question
+
Generated Answer
+
Reference / Context
```

and produces a structured judgment with a reason.

This provides an additional evaluation signal when simple semantic similarity is insufficient.

---

# 🔍 Failure Diagnosis

A major feature of SENTINEL is that it does not stop at:

```text
Evaluation → FAIL
```

Instead, it attempts to determine:

> **Why did the model fail?**

The initial diagnosis framework contains three major failure categories.

---

## 1. Vague Prompt

The same question is sent to multiple models:

```text
Llama 3.1
Mistral
Phi-3
```

Their responses are converted into embeddings.

SENTINEL measures semantic agreement between the responses.

Conceptually:

```text
Question
   │
   ├──→ Llama
   ├──→ Mistral
   └──→ Phi
          │
          ▼
      Embeddings
          │
          ▼
   Similarity Analysis
          │
          ▼
    Model Agreement
```

Low agreement can be evidence that the prompt is ambiguous or underspecified.

The system should combine this signal with other evidence rather than treating one threshold as absolute proof.

---

# 2. Knowledge Gap

A model can fail because the information required to answer the question does not exist in the knowledge base.

SENTINEL analyzes:

```text
Correct / expected information
          ↓
       Embedding
          ↓
Compare against retrieved documents
          ↓
Knowledge coverage
```

If relevant information cannot be found in the available knowledge base, the failure may be classified as:

```text
KNOWLEDGE_GAP
```

---

# 3. Model Weakness

Some models may consistently perform poorly on particular topics.

For example:

```text
Model: Llama 3.1

Topic: Financial Reasoning

Evaluations: 150
Failures: 118
Failure Rate: 78.6%
```

SENTINEL uses historical evaluation data to identify persistent model weaknesses.

If a model consistently fails on a topic, SENTINEL can create a model weakness flag and recommend considering another model.

---

# 🛠️ Self-Healing

Once a failure is diagnosed, SENTINEL attempts to select an appropriate recovery strategy.

```text
Failure
   ↓
Diagnosis
   │
   ├── Vague Prompt
   │       ↓
   │   Prompt Healing
   │
   ├── Knowledge Gap / Retrieval Failure
   │       ↓
   │   RAG Healing
   │
   └── Model Weakness
           ↓
       Model Recommendation
```

---

# ✍️ Prompt Healing

For vague or poorly structured prompts, SENTINEL uses a meta-LLM to generate an improved prompt.

Input:

```text
Original Prompt
+
Incorrect Response
+
Expected Response
+
Failure Information
```

↓

Meta-LLM

↓

Improved Prompt

The new prompt is then evaluated against the original.

```text
Original Prompt
       │
       ├──────────────┐
       │              │
       ▼              ▼
 Evaluation       Evaluation
       │              │
       ▼              ▼
 Original Score   Healed Score
       │              │
       └──────┬───────┘
              ▼
         Comparison
              ↓
       Better Version
```

---

# 📚 RAG Healing

When the problem is related to missing or poorly retrieved information, SENTINEL attempts to improve retrieval.

### Process

```text
Original Question
        ↓
Generate Alternative Queries
        ↓
Multiple Search Queries
        ↓
ChromaDB Retrieval
        ↓
Candidate Documents
        ↓
Embedding Similarity
        ↓
Re-ranking
        ↓
Top Relevant Documents
        ↓
LLM
        ↓
Re-evaluation
```

The goal is to improve the quality of context supplied to the LLM.

---

# 🚨 Model Weakness Handling

Model weakness cannot always be automatically fixed.

Instead, SENTINEL:

1. Records the failure.
2. Calculates historical failure rates.
3. Creates a weakness flag.
4. Generates an alert.
5. Recommends an alternative model.
6. Allows the result to be displayed in the dashboard.

---

# 🧪 A/B Testing

SENTINEL evaluates original and healed versions against the same evaluation set.

```text
             Evaluation Set
                   │
          ┌────────┴────────┐
          ▼                 ▼
     Original Prompt   Healed Prompt
          │                 │
          ▼                 ▼
      Evaluation         Evaluation
          │                 │
          └────────┬────────┘
                   ▼
              Comparison
                   ↓
             Winner Selected
```

Metrics can include:

* Correctness
* Hallucination
* Faithfulness
* Consistency
* Toxicity
* Latency
* Overall evaluation score

The goal is to ensure that a healing operation actually improves the system rather than simply changing its behavior.

---

# 🖥️ Local-First Architecture

SENTINEL is designed to run locally.

The basic installation can contain:

```text
SENTINEL Desktop
│
├── React
├── Tauri
├── FastAPI
├── SQLite
├── ChromaDB
├── Sentence Transformer
└── Ollama
    ├── Llama 3.1
    ├── Mistral
    └── Phi-3
```

This provides:

* Local inference
* No mandatory paid LLM APIs
* No mandatory API keys
* Privacy-preserving evaluation
* Offline-capable evaluation
* Local experimentation

Actual model performance will depend on the user's available CPU, GPU, RAM, and storage.

---

# 🏗️ System Architecture

```text
                         SENTINEL
                            │
                  ┌─────────┴─────────┐
                  │                   │
              Desktop UI          Backend
                  │                   │
            React + Tauri          FastAPI
                                      │
                                      ▼
                              Evaluation Service
                                      │
                                      ▼
                               Evaluation Engine
                                      │
                  ┌───────────────────┼──────────────────┐
                  │                   │                  │
                  ▼                   ▼                  ▼
                 LLM              Embeddings            RAG
                  │                   │                  │
                  ▼                   ▼                  ▼
                Ollama          MiniLM-L6-v2          ChromaDB
                  │
        ┌─────────┼─────────┐
        ▼         ▼         ▼
      Llama     Mistral    Phi-3
                  │
                  ▼
             Evaluation
                  │
                  ▼
              Diagnosis
                  │
         ┌────────┼────────┐
         ▼        ▼        ▼
      Vague     Knowledge  Model
      Prompt      Gap      Weakness
         │        │        │
         ▼        ▼        ▼
      Prompt     RAG      Alert /
      Healing   Healing   Recommendation
         │        │        │
         └────────┼────────┘
                  ▼
              Verification
                  │
                  ▼
               A/B Test
                  │
                  ▼
              Persistence
                  │
                  ▼
             SQLite / PostgreSQL
                  │
                  ▼
              Dashboard
```

---

# 🔄 Evaluation Pipeline

The core SENTINEL pipeline is:

```text
INGEST
  ↓
EVALUATE
  ↓
CLASSIFY
  ↓
DIAGNOSE
  ↓
HEAL
  ↓
VERIFY
  ↓
STORE
  ↓
ALERT
```

Each stage has a specific responsibility.

---

# 🧩 Technology Stack

## AI / ML

* Python
* Ollama
* Llama 3.1
* Mistral
* Phi-3
* DeepEval
* Sentence Transformers
* all-MiniLM-L6-v2
* scikit-learn
* LlamaIndex
* ChromaDB

## Backend

* Python
* FastAPI
* Pydantic
* SQLAlchemy
* SQLite
* PostgreSQL
* REST APIs
* Background workers

## Frontend / Desktop

* React
* TypeScript
* Tailwind CSS
* D3.js / Recharts
* Tauri

## LLMOps / MLOps

* MLflow
* DVC
* Git
* GitHub Actions

## Infrastructure

* Docker
* Docker Compose
* Kubernetes
* Redis
* Prometheus
* Grafana

---

# 📂 Project Structure

```text
SENTINEL/
│
├── frontend/  → UI + Tauri
├── backend/  → FastAPI + database + APIs
├── ai/       → entire AI/ML system
├── data/     → datasets + benchmarks
├── prompts/  → prompt assets/versioning
├── research/ → experiments + paper
├── infrastructure/  → Docker + Kubernetes
├── mlops/  → MLflow + DVC + evaluation gates
├── tests/   → all testing
├── scripts/  → architecture + documentation
├── docs/   → setup/utilities
│
├── .github/
├── README.md
├── LICENSE
├── CONTRIBUTING.md
├── pyproject.toml
├── docker-compose.yml
├── dvc.yaml
├── params.yaml
└── .gitignore
```

### Directory Responsibilities

| Directory         | Responsibility                                    |
| ----------------- | ------------------------------------------------- |
| `frontend/`       | React + Tauri desktop interface                   |
| `backend/`        | FastAPI, APIs, database and application services  |
| `ai/`             | LLM evaluation, diagnosis, healing and RAG        |
| `data/`           | Golden datasets, benchmarks and experiment data   |
| `prompts/`        | System, evaluation and healing prompts            |
| `research/`       | Experiments, analysis, results and research paper |
| `infrastructure/` | Docker, Kubernetes and monitoring                 |
| `mlops/`          | MLflow, DVC and evaluation gates                  |
| `tests/`          | Unit, integration and end-to-end tests            |
| `scripts/`        | Setup, model and benchmark utilities              |
| `docs/`           | Architecture and technical documentation          |
| `.github/`        | CI/CD workflows                                   |

---

# 🔬 Research Direction

SENTINEL is also designed as an experimental research project.

The primary research question is:

> **Can an autonomous system accurately diagnose the root causes of LLM failures and select an appropriate self-healing strategy without human intervention?**

Potential research questions include:

1. Can multi-model semantic disagreement identify vague prompts?
2. Can retrieval analysis distinguish knowledge gaps from other failure types?
3. Can historical failure patterns identify model-specific weaknesses?
4. Can automatic prompt healing improve LLM evaluation scores?
5. Can RAG healing improve grounding and faithfulness?
6. Can the system automatically select an appropriate healing strategy?
7. Does self-healing improve quality without unacceptable latency overhead?

---

# 📊 Research Methodology

SENTINEL will be evaluated against baseline systems.

Potential baselines include:

```text
Baseline 1
LLM without self-healing

Baseline 2
LLM + standard RAG

Baseline 3
LLM + generic prompt rewriting

Baseline 4
LLM + fixed retrieval strategy

SENTINEL
Evaluation
→ Diagnosis
→ Targeted Healing
→ Verification
```

Evaluation metrics may include:

* Accuracy
* Semantic correctness
* Hallucination rate
* Faithfulness
* Consistency
* Toxicity
* Latency
* Diagnosis precision
* Diagnosis recall
* Diagnosis F1
* Healing success rate
* Regression rate
* Healing latency overhead
* Token overhead

---

# 🧪 Ablation Studies

To understand which components contribute to performance, SENTINEL can be evaluated with individual components removed.

Examples:

```text
Full SENTINEL

SENTINEL without multi-model diagnosis

SENTINEL without RAG re-ranking

SENTINEL without historical model analysis

SENTINEL without prompt healing

SENTINEL without verification
```

The results can be compared to determine the contribution of each component.

---

# 📈 Experiment Tracking

Each experiment should record information such as:

```text
Model
Model Version
Prompt Version
Dataset Version
Question
Category
Response
Latency
Evaluation Scores
Diagnosis
Diagnosis Confidence
Healing Strategy
Healed Response
Before Score
After Score
```

MLflow can be used for experiment tracking, while Git and DVC can be used for code, prompt, and dataset versioning.

The goal is reproducibility.

---

# 🔐 Privacy

SENTINEL is designed around local inference.

When running in local mode:

```text
Questions
Documents
Prompts
LLM Responses
Embeddings
Evaluation Results
```

can remain on the user's machine.

No external LLM API is required for the core local evaluation workflow.

---

# 🚀 Future Server Mode

Although SENTINEL is local-first, the architecture can later support centralized deployment.

```text
                    Load Balancer
                         │
                         ▼
                  FastAPI Instances
                         │
                ┌────────┴────────┐
                ▼                 ▼
              Redis           PostgreSQL
                │
                ▼
        Evaluation Workers
                │
                ▼
       Ollama / vLLM Servers
                │
                ▼
             LLMs
```

This enables:

* Team-wide evaluation
* Centralized experiment tracking
* Multiple workers
* Horizontal scaling
* Shared dashboards
* CI/CD integration

---

# 🔄 CI/CD Evaluation Gate

SENTINEL extends traditional CI/CD by evaluating AI quality before deployment.

```text
Developer Commit
       ↓
Unit Tests
       ↓
Integration Tests
       ↓
Build
       ↓
LLM Evaluation Suite
       ↓
Compare Against Baseline
       ↓
Quality Gate
       │
   ┌───┴────┐
   ▼        ▼
 PASS      FAIL
   │        │
   ▼        ▼
Deploy    Block
```

Example quality policies:

```text
Correctness below threshold
        → FAIL

Hallucination above threshold
        → FAIL

Faithfulness below threshold
        → FAIL

Significant latency regression
        → FAIL
```

This allows AI quality regression to become a deployment concern.

---

# 🛣️ Development Roadmap

## Month 1 — Core Infrastructure

* Ollama setup
* Local model integration
* FastAPI
* SQLite
* Basic evaluation engine
* Semantic similarity
* Latency evaluation
* Initial hallucination/grounding evaluation
* Docker development environment

## Month 2 — LLMOps Pipeline

* DeepEval integration
* DVC
* MLflow
* Redis/background workers
* Expanded evaluation metrics
* Evaluation datasets

## Month 3 — Diagnosis & Self-Healing

* Multi-model diagnosis
* Knowledge-gap detection
* Model weakness detection
* Prompt healer
* RAG healer
* Verification
* A/B testing

## Month 4 — CI/CD

* GitHub Actions
* Automated evaluation
* Baseline comparison
* Quality gates
* Deployment blocking
* Regression testing

## Month 5 — Application & Deployment

* Desktop application
* React dashboard
* Evaluation visualization
* Failure analysis
* Healing history
* Model comparison
* Monitoring
* Packaging

## Month 6 — Research & Benchmarking

* Large-scale benchmark
* Model comparison
* Ablation studies
* Error analysis
* Statistical analysis
* Research report
* Paper preparation
* Demo
* Documentation

---

# 👥 Team Responsibilities

## AI/ML

Responsible for:

* LLM integration
* Evaluation engine
* Embeddings
* Evaluation metrics
* Diagnosis
* RAG
* Prompt healing
* RAG healing
* Model weakness detection
* A/B testing
* AI experiments
* Research methodology

## Backend

Responsible for:

* FastAPI
* API design
* Database
* SQLAlchemy
* Application services
* Evaluation job management
* Result persistence
* Backend testing

## DevOps / LLMOps

Responsible for:

* Docker
* Docker Compose
* GitHub Actions
* DVC infrastructure
* MLflow infrastructure
* Kubernetes
* CI/CD
* Evaluation gates
* Monitoring
* Deployment

---

# 🤝 Development Workflow

SENTINEL uses a feature-branch workflow.

```text
main
 │
 ├── feature/ai-*
 ├── feature/backend-*
 └── feature/devops-*
```

Development process:

```text
Create Feature Branch
        ↓
Develop
        ↓
Run Tests
        ↓
Commit
        ↓
Push
        ↓
Pull Request
        ↓
Code Review
        ↓
CI Checks
        ↓
Merge into main
```

The `main` branch should remain stable.

---

# 🧪 Testing Strategy

SENTINEL uses multiple testing levels.

## Unit Tests

Test individual:

* Metrics
* Embedding functions
* Diagnosis logic
* Healing logic
* API services

## Integration Tests

Test:

```text
API
 ↓
Evaluation Service
 ↓
AI Engine
 ↓
Database
```

## End-to-End Tests

Test the complete workflow:

```text
Question
 ↓
LLM
 ↓
Evaluation
 ↓
Diagnosis
 ↓
Healing
 ↓
Verification
 ↓
Stored Result
```

---

# 📜 License

This project is licensed under the MIT License.

See [LICENSE](LICENSE) for details.

---

# 🚧 Project Status

**SENTINEL is currently under active development.**

The architecture and research methodology may evolve as experiments are conducted and results are analyzed.

The current development priority is:

```text
Core Infrastructure
        ↓
LLM Evaluation
        ↓
Failure Diagnosis
        ↓
Self-Healing
        ↓
LLMOps / CI-CD
        ↓
Research Benchmark
```

---

# ⭐ Vision

SENTINEL aims to move LLM applications from:

```text
"Does the application work?"
```

to:

```text
"Is the AI system still performing correctly,
why did it fail, can it fix itself,
and should this version be deployed?"
```

The long-term goal is to provide a **local-first, autonomous quality and reliability layer for LLM applications**.

---

## Project

**SENTINEL — Autonomous LLMOps and Self-Healing Evaluation Platform**

Built as a collaborative AI/ML, backend, and DevOps engineering project.

**Status:** 🚧 Under Development
