# SENTINEL Python SDK (`sentinel-eval-sdk` v3.0.2)

[![PyPI Version](https://img.shields.io/pypi/v/sentinel-eval-sdk.svg?color=blue)](https://pypi.org/project/sentinel-eval-sdk/)
[![Python Versions](https://img.shields.io/badge/Python-3.8%20%7C%203.9%20%7C%203.10%20%7C%203.11%20%7C%203.12-emerald.svg)](https://pypi.org/project/sentinel-eval-sdk/)
[![License](https://img.shields.io/badge/License-MIT-purple.svg)](https://github.com/srishanthreddy456789/Sentinel/blob/main/LICENSE)
[![GitHub Repository](https://img.shields.io/badge/GitHub-srishanthreddy456789%2FSentinel-black.svg?logo=github)](https://github.com/srishanthreddy456789/Sentinel/tree/main/sdk)
[![ResearchGate](https://img.shields.io/badge/ResearchGate-Publication%20414271476-00CCBB.svg)](https://www.researchgate.net/publication/414271476_SENTINEL_Autonomous_LLMOps_with_Hybrid_Subword-Dense_Embedding_Cosine_Similarity_Real-Time_Faithfulness_Verification_and_Closed-Loop_Prompt_Self-Healing)
[![Author Review Email](https://img.shields.io/badge/Reviewer%20Contact-srishanthreddy311030%40gmail.com-red.svg)](mailto:srishanthreddy311030@gmail.com)

> **Official Python Client for SENTINEL: Autonomous LLMOps with Hybrid Subword-Dense Embedding Cosine Similarity, Real-Time Faithfulness Verification, and Closed-Loop Prompt Self-Healing.**

---

## 📩 Reviewer Contact & Peer Review Feedback

For academic paper feedback, research review, bug reports, or enterprise integration inquiries, please reach out directly:

- 👤 **Author & Lead Developer**: Srishanth Reddy
- 📧 **Review / Feedback Email**: [`srishanthreddy311030@gmail.com`](mailto:srishanthreddy311030@gmail.com)
- 🌐 **ResearchGate Publication**: [SENTINEL Autonomous LLMOps (Publication #414271476)](https://www.researchgate.net/publication/414271476_SENTINEL_Autonomous_LLMOps_with_Hybrid_Subword-Dense_Embedding_Cosine_Similarity_Real-Time_Faithfulness_Verification_and_Closed-Loop_Prompt_Self-Healing)
- 📦 **PyPI Package**: [https://pypi.org/project/sentinel-eval-sdk/](https://pypi.org/project/sentinel-eval-sdk/)
- 🐙 **GitHub Repository**: [https://github.com/srishanthreddy456789/Sentinel](https://github.com/srishanthreddy456789/Sentinel)

---

## 📌 Executive Summary

SENTINEL (`sentinel-eval-sdk`) inserts a continuous, sub-20ms **AI Quality Verification Layer** into production LLM and RAG pipelines. Operating completely **local-first** without external cloud API dependencies, SENTINEL tracks predictions, detects hallucinations, verifies context entailment, evaluates 9 metric dimensions, diagnoses failure root causes, and automatically repairs prompt regressions using closed-loop self-healing algorithms.

---

## 🚀 Installation

Install the official package from PyPI:

```bash
pip install sentinel-eval-sdk
```

---

## ⚡ 3-Line Decorator Quickstart

Monitor any LLM execution function or RAG chain with **zero latency overhead** ($<0.1\text{ ms}$ main-thread queuing):

```python
import sentinel_sdk as sentinel

# 1. Initialize SENTINEL SDK with backend URL & API Key
sentinel.init(api_key="sk_sentinel_2026", base_url="http://localhost:8000")

# 2. Wrap your LLM invocation function
@sentinel.monitor(model_id="customer_support_bot")
def generate_response(user_query: str):
    # Call your local Ollama instance, LangChain RAG pipeline, or custom model
    return "Refunds are processed within 30 days of purchase."

# 3. Execute function normally — telemetry is dispatched asynchronously in background!
response = generate_response("What is the refund policy?")
print("Response:", response)
```

---

## 🧰 Detailed Function Reference & Technical Guide

The SDK exports 7 predefined feature functions matching every tab in the SENTINEL Desktop App interface.

---

### 1. `sentinel.playground()` — Interactive Execution & Metric Testing

**Desktop App Equivalent**: 🧪 **Playground Tab**

#### Description
Executes interactive model inputs against reference targets or retrieved context, performing real-time 9-metric evaluation. Used during prompt development, rapid testing, and regression checking.

#### Function Signature
```python
def playground(
    input_text: str,
    expected_output: Optional[str] = None,
    context: Optional[str] = None,
    model_id: str = "default_model"
) -> Dict[str, Any]:
```

#### Parameters
| Parameter | Type | Required | Default | Description |
| :--- | :--- | :---: | :---: | :--- |
| `input_text` | `str` | **Yes** | — | The user prompt or evaluation query string. |
| `expected_output` | `str` | No | `None` | Ground-truth reference text for cosine similarity evaluation. |
| `context` | `str` | No | `None` | Retrieved document context chunks for RAG faithfulness verification. |
| `model_id` | `str` | No | `"default_model"` | Model identifier to tag evaluation records in the dashboard. |

#### Code Example
```python
import sentinel_sdk as sentinel

metrics = sentinel.playground(
    input_text="What is the guaranteed SLA uptime?",
    expected_output="SENTINEL guarantees 99.9% uptime SLA.",
    context="Official Policy: SENTINEL Enterprise guarantees 99.9% uptime SLA for all clusters."
)

print("Overall Quality Score:", metrics["overall_score"])
print("Passed Quality Gate:", metrics["passed"])
```

#### Return Value Schema (`Dict[str, Any]`)
```json
{
  "correctness": 1.0,
  "faithfulness": 0.98,
  "safety": 1.0,
  "instruction_adherence": 1.0,
  "consistency": 1.0,
  "latency_ms": 14.2,
  "overall_score": 0.992,
  "passed": true,
  "detected_failures": []
}
```

---

### 2. `sentinel.evaluate()` — Complete 9-Dimensional Quality Evaluation

**Desktop App Equivalent**: 📊 **Evaluations Tab**

#### Description
Evaluates pre-existing input-output generation pairs against SENTINEL's 9 orthogonal metric dimensions: Correctness, Faithfulness, Hallucination Rate, Instruction Adherence, Consistency, Safety, Toxicity, Latency, and Throughput.

#### Function Signature
```python
def evaluate(
    input_text: str,
    output_text: str,
    expected_output: Optional[str] = None,
    context: Optional[str] = None
) -> Dict[str, Any]:
```

#### Parameters
| Parameter | Type | Required | Default | Description |
| :--- | :--- | :---: | :---: | :--- |
| `input_text` | `str` | **Yes** | — | Prompt input submitted to the LLM. |
| `output_text` | `str` | **Yes** | — | Generated text produced by the LLM. |
| `expected_output` | `str` | No | `None` | Ground reference target string. |
| `context` | `str` | No | `None` | Grounding reference context document. |

#### Code Example
```python
import sentinel_sdk as sentinel

eval_result = sentinel.evaluate(
    input_text="Summarize quarterly financial results",
    output_text="Revenue grew by 24% YoY in Q3 with 99.9% customer retention.",
    expected_output="Q3 revenue grew by 24% year-over-year.",
    context="Q3 Financial Report: Revenue increased 24% YoY. Retention reached 99.9%."
)

print(f"Correctness: {eval_result['correctness']:.2f}")
print(f"Faithfulness: {eval_result['faithfulness']:.2f}")
```

#### Return Value Schema (`Dict[str, Any]`)
```json
{
  "correctness": 0.965,
  "faithfulness": 1.0,
  "hallucination_rate": 0.0,
  "instruction_adherence": 0.95,
  "consistency": 1.0,
  "safety": 1.0,
  "toxicity": 0.0,
  "latency_ms": 11.8,
  "overall_score": 0.981,
  "passed": true
}
```

---

### 3. `sentinel.diagnose()` — Failure Taxonomy & Root Cause Isolation

**Desktop App Equivalent**: 🔍 **Diagnosis Tab**

#### Description
Analytically inspects LLM generations to detect semantic failure classes (`FAITHFULNESS`, `HALLUCINATION`, `INSTRUCTION_BREAK`, `LATENCY_SPIKE`), isolates root causes, and recommends explicit remediation strategies.

#### Function Signature
```python
def diagnose(
    input_text: str,
    output_text: str,
    context: Optional[str] = None
) -> Dict[str, Any]:
```

#### Parameters
| Parameter | Type | Required | Default | Description |
| :--- | :--- | :---: | :---: | :--- |
| `input_text` | `str` | **Yes** | — | Prompt given to model. |
| `output_text` | `str` | **Yes** | — | Model generation under inspection. |
| `context` | `str` | No | `None` | Ground truth domain context document. |

#### Code Example
```python
import sentinel_sdk as sentinel

diag = sentinel.diagnose(
    input_text="Provide medical dosage for pediatric headache",
    output_text="Administer 500mg Ibuprofen every 2 hours.",
    context="Medical Guidelines: Pediatric Ibuprofen dosage is 10mg/kg every 6 hours. Max 400mg/day."
)

if diag["has_failures"]:
    print("Detected Failures:", diag["detected_failures"])
    print("Root Cause:", diag["root_cause"])
    print("Remediation Action:", diag["recommendation"])
```

#### Return Value Schema (`Dict[str, Any]`)
```json
{
  "has_failures": true,
  "detected_failures": ["FAITHFULNESS", "SAFETY"],
  "root_cause": "FAITHFULNESS",
  "severity": "HIGH",
  "recommendation": "Inject strict context refusal directives into system prompt: 'State 'Information not provided' if facts are missing from context.'"
}
```

---

### 4. `sentinel.heal()` — Closed-Loop Prompt Self-Healing Engine

**Desktop App Equivalent**: 🩹 **Self-Healing Tab**

#### Description
Executes active prompt mutation operator $P' = M(P, F)$ to synthesize candidate prompts that repair failure root causes without human intervention, automatically testing and promoting passing prompts into version registries.

#### Function Signature
```python
def heal(
    prompt: str,
    failure_type: str = "FAITHFULNESS",
    model_id: str = "default_model"
) -> Dict[str, Any]:
```

#### Parameters
| Parameter | Type | Required | Default | Description |
| :--- | :--- | :---: | :---: | :--- |
| `prompt` | `str` | **Yes** | — | Original system prompt to mutate. |
| `failure_type` | `str` | No | `"FAITHFULNESS"` | Failure class to repair (`FAITHFULNESS`, `CORRECTNESS`, `SAFETY`, `SCHEMA`). |
| `model_id` | `str` | No | `"default_model"` | Model target identifier. |

#### Code Example
```python
import sentinel_sdk as sentinel

result = sentinel.heal(
    prompt="You are a customer support bot for an online retailer.",
    failure_type="FAITHFULNESS"
)

print("Original:", result["original_prompt"])
print("Healed System Prompt:", result["healed_prompt"])
```

#### Return Value Schema (`Dict[str, Any]`)
```json
{
  "original_prompt": "You are a customer support bot for an online retailer.",
  "healed_prompt": "You are a customer support bot for an online retailer. State 'Information not provided' if facts are missing from retrieved context.",
  "mutation_applied": "DELTA_FAITHFULNESS_V2",
  "recovery_confidence": 0.94,
  "promoted_version": "v1.4"
}
```

---

### 5. `sentinel.failures()` — Incident Failure Logs

**Desktop App Equivalent**: ⚠️ **Failures Tab**

#### Description
Fetches historical records of quality gate failures, hallucination incidents, and degraded model generations captured by background telemetry.

#### Function Signature
```python
def failures(limit: int = 20) -> List[Dict[str, Any]]:
```

#### Parameters
| Parameter | Type | Required | Default | Description |
| :--- | :--- | :---: | :---: | :--- |
| `limit` | `int` | No | `20` | Maximum number of failure incident records to fetch. |

#### Code Example
```python
import sentinel_sdk as sentinel

incidents = sentinel.failures(limit=5)
for item in incidents:
    print(f"Incident #{item['id']} | Type: {item['failure_type']} | Score: {item['score']}")
```

---

### 6. `sentinel.requests()` — Live Telemetry Request Logs

**Desktop App Equivalent**: 📈 **Requests Log Tab**

#### Description
Retrieves live streaming and batch execution telemetry records captured asynchronously across all monitored model functions.

#### Function Signature
```python
def requests(limit: int = 50) -> List[Dict[str, Any]]:
```

#### Parameters
| Parameter | Type | Required | Default | Description |
| :--- | :--- | :---: | :---: | :--- |
| `limit` | `int` | No | `50` | Maximum request log items to retrieve. |

#### Code Example
```python
import sentinel_sdk as sentinel

logs = sentinel.requests(limit=10)
print(f"Retrieved {len(logs)} telemetry records.")
```

---

### 7. `sentinel.experiments()` — Side-by-Side Model Benchmarking

**Desktop App Equivalent**: 🔬 **Experiments Tab**

#### Description
Runs side-by-side comparative benchmarking between two local or remote models (e.g. `llama3.1:8b` vs `mistral`), calculating statistical win rates across evaluation suites.

#### Function Signature
```python
def experiments(
    model_a: str = "llama3.1:8b",
    model_b: str = "mistral",
    suite_id: Optional[str] = None
) -> Dict[str, Any]:
```

#### Parameters
| Parameter | Type | Required | Default | Description |
| :--- | :--- | :---: | :---: | :--- |
| `model_a` | `str` | No | `"llama3.1:8b"` | Baseline model identifier. |
| `model_b` | `str` | No | `"mistral"` | Candidate comparison model identifier. |
| `suite_id` | `str` | No | `None` | Optional benchmark dataset suite ID. |

#### Code Example
```python
import sentinel_sdk as sentinel

exp_result = sentinel.experiments(model_a="llama3.1:8b", model_b="mistral")

print("Winner Model:", exp_result["winner"])
print("Model A Overall Score:", exp_result["model_a_score"])
print("Model B Overall Score:", exp_result["model_b_score"])
```

---

## 🧮 Mathematical Metric Formulations

### Hybrid Vector Cosine Similarity ($S_{\text{correctness}}$)
Let $y$ be generated text and $\hat{y}$ ground reference:

$$\vec{v}_1 = \mathbf{E}(y), \quad \vec{v}_2 = \mathbf{E}(\hat{y})$$

$$S_{\text{dense}}(y, \hat{y}) = \frac{\vec{v}_1 \cdot \vec{v}_2}{\|\vec{v}_1\|_2 \|\vec{v}_2\|_2}$$

### Sparse Subword Trigram Fallback
$$\vec{w}(t) = \sum_{w \in \text{Tokens}(t)} \mathbf{e}_{\text{tok}(w)} + 0.5 \sum_{g \in \text{Grams}_3(t)} \mathbf{e}_{\text{gram}(g)}$$

---

## 📖 Citation

```bibtex
@article{reddy2026sentinel,
  title={SENTINEL: Autonomous LLMOps with Hybrid Subword-Dense Embedding Cosine Similarity, Real-Time Faithfulness Verification, and Closed-Loop Prompt Self-Healing},
  author={Reddy, Srishanth},
  journal={ResearchGate Publication},
  number={414271476},
  year={2026},
  url={https://www.researchgate.net/publication/414271476}
}
```

---

## 📄 License & Maintainers

Distributed under the **MIT License**.

- **Maintainer & Lead Researcher**: Srishanth Reddy
- **Direct Feedback & Review Email**: [`srishanthreddy311030@gmail.com`](mailto:srishanthreddy311030@gmail.com)
