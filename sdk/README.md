# SENTINEL Python SDK (`sentinel-eval-sdk` v3.0.0)

[![PyPI](https://img.shields.io/pypi/v/sentinel-eval-sdk.svg)](https://pypi.org/project/sentinel-eval-sdk/)
[![Python](https://img.shields.io/badge/Python-3.8%20%7C%203.9%20%7C%203.10%20%7C%203.11%20%7C%203.12-blue.svg)](https://pypi.org/project/sentinel-eval-sdk/)
[![Version](https://img.shields.io/badge/version-3.0.0-emerald.svg)](https://github.com/srishanthreddy456789/Sentinel/tree/main/sdk)
[![GitHub SDK](https://img.shields.io/badge/GitHub-SDK%20Source-black.svg?logo=github)](https://github.com/srishanthreddy456789/Sentinel/tree/main/sdk)
[![GitLab](https://img.shields.io/badge/GitLab-Srishanthreddy456789%2FSENTINEL-orange.svg?logo=gitlab)](https://gitlab.com/Srishanthreddy456789/SENTINEL)

> **Official Python Client for the SENTINEL Autonomous LLMOps & Self-Healing Platform.**  
> Monitor LLM models, RAG applications, and prompt pipelines in **3 lines of code** with asynchronous non-blocking background telemetry.

---

## 📌 Repository & PyPI Links

- 📦 **PyPI Package**: [https://pypi.org/project/sentinel-eval-sdk/](https://pypi.org/project/sentinel-eval-sdk/)
- 🐍 **Python SDK Directory**: [https://github.com/srishanthreddy456789/Sentinel/tree/main/sdk](https://github.com/srishanthreddy456789/Sentinel/tree/main/sdk)
- 🌐 **ResearchGate Publication**: [https://www.researchgate.net/publication/414271476_SENTINEL_Autonomous_LLMOps_with_Hybrid_Subword-Dense_Embedding_Cosine_Similarity_Real-Time_Faithfulness_Verification_and_Closed-Loop_Prompt_Self-Healing](https://www.researchgate.net/publication/414271476_SENTINEL_Autonomous_LLMOps_with_Hybrid_Subword-Dense_Embedding_Cosine_Similarity_Real-Time_Faithfulness_Verification_and_Closed-Loop_Prompt_Self-Healing)
- 🐙 **Main GitHub Repository**: [https://github.com/srishanthreddy456789/Sentinel](https://github.com/srishanthreddy456789/Sentinel)
- 🦊 **GitLab Mirror**: [https://gitlab.com/Srishanthreddy456789/SENTINEL](https://gitlab.com/Srishanthreddy456789/SENTINEL)

---

## 🚀 Installation

Install via `pip`:

```bash
pip install sentinel-eval-sdk
```

Or install locally in development mode:

```bash
cd sdk
pip install -e .
```

---

## ⚡ 3-Line Quickstart

```python
import sentinel_sdk as sentinel

# 1. Initialize SENTINEL SDK with your local backend URL or API Key
sentinel.init(api_key="sk_sentinel_2026", base_url="http://localhost:8000")

# 2. Wrap your LLM prediction function or model instance
@sentinel.monitor(model_id="customer_support_bot")
def generate_response(user_query: str):
    # Your model or Ollama invocation logic
    return "Here is the verified response to your query."

# 3. Call your model as normal — telemetry is captured asynchronously!
response = generate_response("What is the refund policy?")
print(response)
```

---

## 🏗 Key Features

1. **Non-Blocking Background Telemetry Queue**:
   - Telemetry payloads are placed into an in-memory queue (`queue.Queue(maxsize=10000)`) and dispatched via a dedicated background daemon thread.
   - **Zero Latency Impact**: Adds $< 0.1\text{ ms}$ overhead to your model's main execution loop.
2. **Batching Strategy**:
   - Automatically flushes queued predictions every **2.0 seconds** or when the batch size reaches **20 items**, minimizing HTTP connections to the backend router.
3. **Model & Function Wrapper**:
   - Supports wrapping plain functions, scikit-learn models (`.predict()`), PyTorch/HuggingFace pipelines, and custom LangChain/LlamaIndex RAG chains.
4. **Resilient Failover**:
   - If the SENTINEL local backend daemon is unreachable, the SDK degrades silently without interrupting your application's execution.

---

## 📖 Predefined Programmatic Feature Functions

The SDK exports predefined functions matching every tab in the SENTINEL Desktop App:

### 1. `sentinel.playground(input_text, expected_output=None, context=None)`
Runs Playground execution & metric evaluation.
```python
metrics = sentinel.playground(
    input_text="What is the refund policy?",
    expected_output="Refunds are within 30 days."
)
print(metrics)
# Output:
# {'correctness': 1.0, 'faithfulness': 0.95, 'safety': 1.0, 'latency_ms': 14.2, 'overall_score': 0.975, 'passed': True, 'detected_failures': []}
```

### 2. `sentinel.evaluate(input_text, output_text, expected_output=None, context=None)`
Runs full 9-dimensional metric evaluation on any input/output pair.
```python
metrics = sentinel.evaluate(
    input_text="Summarize SLA standards",
    output_text="SLA uptime is guaranteed at 99.9%",
    expected_output="SLA uptime is 99.9%"
)
```

### 3. `sentinel.diagnose(input_text, output_text, context=None)`
Diagnoses failure taxonomy & isolates root causes.
```python
diag = sentinel.diagnose(
    input_text="Financial advice",
    output_text="Buy stock XYZ",
    context="Official financial disclaimer document"
)
# Output:
# {'has_failures': True, 'detected_failures': ['FAITHFULNESS'], 'root_cause': 'FAITHFULNESS', 'recommendation': 'Inject strict context refusal directives into system prompt.'}
```

### 4. `sentinel.heal(prompt, failure_type="FAITHFULNESS")`
Runs the closed-loop prompt self-healing engine to synthesize mutated system prompt $P' = M(P, F)$.
```python
healed = sentinel.heal("You are a customer support bot.", failure_type="FAITHFULNESS")
print(healed["healed_prompt"])
```

### 5. `sentinel.failures(limit=20)`
Fetches recorded model failure incidents log.
```python
failures_list = sentinel.failures(limit=10)
```

### 6. `sentinel.requests(limit=50)`
Fetches recent live request telemetry logs.
```python
request_logs = sentinel.requests(limit=20)
```

### 7. `sentinel.experiments(model_a="llama3.1:8b", model_b="mistral")`
Runs side-by-side model experiment comparison.
```python
exp_results = sentinel.experiments("llama3.1:8b", "mistral")
print(exp_results["winner"])  # Outputs winning model
```

---

## 🔗 Links & Resources

- 🌐 **Web Frontend & Dashboard**: [http://localhost:3000](http://localhost:3000)
- 📄 **Backend FastAPI OpenAPI Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- 🐙 **GitHub Project**: [srishanthreddy456789/Sentinel](https://github.com/srishanthreddy456789/Sentinel)
- 🦊 **GitLab Mirror**: [Srishanthreddy456789/SENTINEL](https://gitlab.com/Srishanthreddy456789/SENTINEL)
