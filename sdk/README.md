# SENTINEL Python SDK (`sentinel-eval-sdk` v3.0.1)

[![PyPI Version](https://img.shields.io/pypi/v/sentinel-eval-sdk.svg?color=blue)](https://pypi.org/project/sentinel-eval-sdk/)
[![Python Versions](https://img.shields.io/badge/Python-3.8%20%7C%203.9%20%7C%203.10%20%7C%203.11%20%7C%203.12-emerald.svg)](https://pypi.org/project/sentinel-eval-sdk/)
[![License](https://img.shields.io/badge/License-MIT-purple.svg)](https://github.com/srishanthreddy456789/Sentinel/blob/main/LICENSE)
[![GitHub Repository](https://img.shields.io/badge/GitHub-srishanthreddy456789%2FSentinel-black.svg?logo=github)](https://github.com/srishanthreddy456789/Sentinel/tree/main/sdk)
[![ResearchGate](https://img.shields.io/badge/ResearchGate-Publication%20414271476-00CCBB.svg)](https://www.researchgate.net/publication/414271476_SENTINEL_Autonomous_LLMOps_with_Hybrid_Subword-Dense_Embedding_Cosine_Similarity_Real-Time_Faithfulness_Verification_and_Closed-Loop_Prompt_Self-Healing)

> **The Official Python SDK for SENTINEL: Autonomous LLMOps with Hybrid Subword-Dense Embedding Cosine Similarity, Real-Time Faithfulness Verification, and Closed-Loop Prompt Self-Healing.**

SENTINEL (`sentinel-eval-sdk`) inserts a continuous, sub-20ms **AI Quality Verification Layer** into production LLM and RAG applications. It tracks predictions, detects hallucinations, verifies context entailment, evaluates 9 metric dimensions, diagnoses failure root causes, and automatically repairs prompt regressions using closed-loop self-healing algorithms.

---

## 📌 Links & Resources

- 📦 **PyPI Package**: [https://pypi.org/project/sentinel-eval-sdk/](https://pypi.org/project/sentinel-eval-sdk/)
- 🐍 **SDK Source Directory**: [https://github.com/srishanthreddy456789/Sentinel/tree/main/sdk](https://github.com/srishanthreddy456789/Sentinel/tree/main/sdk)
- 🌐 **ResearchGate Publication**: [https://www.researchgate.net/publication/414271476_SENTINEL...](https://www.researchgate.net/publication/414271476_SENTINEL_Autonomous_LLMOps_with_Hybrid_Subword-Dense_Embedding_Cosine_Similarity_Real-Time_Faithfulness_Verification_and_Closed-Loop_Prompt_Self-Healing)
- 🐙 **GitHub Repository**: [https://github.com/srishanthreddy456789/Sentinel](https://github.com/srishanthreddy456789/Sentinel)
- 🦊 **GitLab Mirror**: [https://gitlab.com/Srishanthreddy456789/SENTINEL](https://gitlab.com/Srishanthreddy456789/SENTINEL)

---

## 🚀 Installation

Install the official package from PyPI via `pip`:

```bash
pip install sentinel-eval-sdk
```

---

## ⚡ 3-Line Decorator Quickstart

Monitor any LLM function, RAG pipeline, or Ollama/LangChain model with **zero latency impact**:

```python
import sentinel_sdk as sentinel

# 1. Initialize SENTINEL SDK with your backend URL & API Key
sentinel.init(api_key="sk_sentinel_2026", base_url="http://localhost:8000")

# 2. Monitor any LLM generation function
@sentinel.monitor(model_id="customer_support_bot")
def generate_response(user_query: str):
    # Your model execution logic (Ollama, OpenAI, HuggingFace, RAG, etc.)
    return "Refunds are processed within 30 days of purchase."

# 3. Call your function normally — telemetry is queued asynchronously in <0.1ms!
response = generate_response("What is the refund policy?")
print("Response:", response)
```

---

## ⚖ Key Differentiators: SENTINEL vs. Cloud Observability Frameworks

| Feature / Metric | Commercial Cloud (LangSmith / DeepEval) | SENTINEL SDK (`sentinel-eval-sdk`) |
| :--- | :---: | :---: |
| **Inference Latency** | 1,500ms – 3,500ms (Cloud API calls) | **Sub-20ms ($P_{95} = 18.4\text{ ms}$)** |
| **Operational Overhead** | High ($/token for cloud GPT-4 judges) | **$0.00 (100% Local Inference & Embeddings)** |
| **Data Privacy & Security** | Data sent to third-party endpoints | **Zero-Trust Data Sovereignty (Local-First)** |
| **Evaluation Mechanism** | Cloud LLM-as-a-Judge | **Hybrid Subword TF-IDF + Dense Cosine Similarity** |
| **Prompt Optimization** | Manual prompt editing | **Closed-Loop Prompt Self-Healing $P' = M(P, F)$** |
| **Telemetry Impact** | Synchronous HTTP overhead | **Async Non-Blocking Queue (`Queue` + Thread Daemon)** |

---

## 📖 Complete Predefined Feature Functions

`sentinel-eval-sdk` exports predefined functions matching every core tab in the SENTINEL Desktop App interface:

### 1. `sentinel.playground(input_text, expected_output=None, context=None)`
Runs real-time Playground execution and immediate 9-dimensional metric evaluation.

```python
import sentinel_sdk as sentinel

metrics = sentinel.playground(
    input_text="What is the standard SLA uptime for SENTINEL Enterprise?",
    expected_output="SENTINEL guarantees 99.9% uptime SLA.",
    context="System SLA Documentation: SENTINEL Enterprise guarantees 99.9% uptime SLA."
)

print(metrics)
# Returns:
# {
#     "correctness": 1.0,
#     "faithfulness": 0.98,
#     "safety": 1.0,
#     "latency_ms": 12.4,
#     "overall_score": 0.99,
#     "passed": True,
#     "detected_failures": []
# }
```

---

### 2. `sentinel.evaluate(input_text, output_text, expected_output=None, context=None)`
Performs complete 9-dimensional quantitative evaluation on any model response.

```python
eval_result = sentinel.evaluate(
    input_text="Summarize quarterly revenue growth",
    output_text="Revenue grew by 24% year-over-year in Q3.",
    expected_output="Quarterly revenue increased by 24% YoY."
)
print("Correctness Score:", eval_result["correctness"])
```

---

### 3. `sentinel.diagnose(input_text, output_text, context=None)`
Diagnoses failure taxonomy, isolates root cause, and provides explicit remediation instructions.

```python
diagnosis = sentinel.diagnose(
    input_text="Give investment advice on stock XYZ",
    output_text="You should buy 100 shares of stock XYZ today.",
    context="Financial Services Disclaimer: Do not provide direct stock purchase advice."
)

print("Has Failures:", diagnosis["has_failures"])
print("Root Cause:", diagnosis["root_cause"])
print("Recommendation:", diagnosis["recommendation"])
```

---

### 4. `sentinel.heal(prompt, failure_type="FAITHFULNESS")`
Triggers the **Closed-Loop Prompt Self-Healing Engine** to synthesize a mutated system prompt $P' = M(P, F)$ that resolves quality failures.

```python
healed = sentinel.heal(
    prompt="You are an enterprise AI assistant.",
    failure_type="FAITHFULNESS"
)

print("Original Prompt:", healed["original_prompt"])
print("Healed System Prompt:", healed["healed_prompt"])
# Mutated Output: "You are an enterprise AI assistant. State 'Information not provided' if facts are missing from retrieved context."
```

---

### 5. `sentinel.failures(limit=20)`
Retrieves recorded model failure logs from the SENTINEL persistence engine.

```python
failures_log = sentinel.failures(limit=10)
for incident in failures_log:
    print(f"Incident [{incident['id']}]: {incident['failure_type']} - Score: {incident['score']}")
```

---

### 6. `sentinel.requests(limit=50)`
Retrieves real-time live telemetry requests and performance logs.

```python
logs = sentinel.requests(limit=25)
print(f"Retrieved {len(logs)} request telemetry records.")
```

---

### 7. `sentinel.experiments(model_a="llama3.1:8b", model_b="mistral")`
Runs automated side-by-side benchmark comparison between two local or remote LLM models.

```python
exp = sentinel.experiments(model_a="llama3.1:8b", model_b="mistral")
print("Winner Model:", exp["winner"])
print("Model A Score:", exp["model_a_score"])
print("Model B Score:", exp["model_b_score"])
```

---

## 🧮 Mathematical Foundations & Metric Definitions

SENTINEL evaluates generation performance across 9 orthogonal metric dimensions:

1. **Hybrid Cosine Similarity ($S_{\text{correctness}}$)**:
   Computes high-dimensional dense embeddings ($d=384$ via `all-MiniLM-L6-v2`) combined with sparse subword 3-gram TF-IDF fallback:
   $$S_{\text{dense}}(y, \hat{y}) = \frac{\vec{v}_1 \cdot \vec{v}_2}{\|\vec{v}_1\|_2 \|\vec{v}_2\|_2}$$

2. **Faithfulness & Entailment Verification ($S_{\text{faithfulness}}$)**:
   Decomposes output responses into discrete claim sentences and asserts maximum semantic alignment against retrieved context chunks:
   $$S_{\text{faithfulness}} = \frac{1}{k} \sum_{i=1}^k \mathbf{1}(\max_{c \in C} \text{Sim}(s_i, c) \ge 0.65)$$

3. **Hallucination Rate ($S_{\text{hallucination}}$)**:
   Measures factual contradiction between generated claims and verified background premises.

4. **Instruction Adherence**:
   Validates schema integrity, JSON structural format, and prompt constraints.

5. **Consistency**:
   Evaluates multi-turn conversation memory alignment and semantic stability.

6. **Toxicity & Safety Guardrails**:
   Filters harmful output patterns, policy violations, and inappropriate text.

7. **Latency & Throughput**:
   Monitors execution time overhead ($P_{50} = 4.2\text{ ms}, P_{95} = 18.4\text{ ms}$).

---

## 🔬 Academic Research & Citation

If you use `sentinel-eval-sdk` in academic research or production LLM systems, please cite the research paper:

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

## 📄 License

Distributed under the **MIT License**. Free for commercial and non-commercial open-source usage.
