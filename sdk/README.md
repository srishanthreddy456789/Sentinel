# SENTINEL Python SDK (`sentinel-mlops` v3.0.0)

[![Python](https://img.shields.io/badge/Python-3.8%20%7C%203.9%20%7C%203.10%20%7C%203.11-blue.svg)](https://pypi.org/project/sentinel-mlops/)
[![Version](https://img.shields.io/badge/version-3.0.0-emerald.svg)](https://github.com/srishanthreddy456789/Sentinel/tree/main/sdk)
[![GitHub SDK](https://img.shields.io/badge/GitHub-SDK%20Source-black.svg?logo=github)](https://github.com/srishanthreddy456789/Sentinel/tree/main/sdk)
[![GitLab](https://img.shields.io/badge/GitLab-Srishanthreddy456789%2FSENTINEL-orange.svg?logo=gitlab)](https://gitlab.com/Srishanthreddy456789/SENTINEL)

> **Official Python Client for the SENTINEL Autonomous LLMOps & Self-Healing Platform.**  
> Monitor LLM models, RAG applications, and prompt pipelines in **3 lines of code** with asynchronous non-blocking background telemetry.

---

## 📌 Repository Links

- 🐍 **Python SDK Directory**: [https://github.com/srishanthreddy456789/Sentinel/tree/main/sdk](https://github.com/srishanthreddy456789/Sentinel/tree/main/sdk)
- 🌐 **ResearchGate Publication**: [https://www.researchgate.net/publication/414271476_SENTINEL...](https://www.researchgate.net/publication/414271476_SENTINEL_Autonomous_LLMOps_with_Hybrid_Subword-Dense_Embedding_Cosine_Similarity_Real-Time_Faithfulness_Verification_and_Closed-Loop_Prompt_Self-Healing)
- 🐙 **Main GitHub Repository**: [https://github.com/srishanthreddy456789/Sentinel](https://github.com/srishanthreddy456789/Sentinel)
- 🦊 **GitLab Mirror**: [https://gitlab.com/Srishanthreddy456789/SENTINEL](https://gitlab.com/Srishanthreddy456789/SENTINEL)
- 📖 **AI Research Paper**: [SENTINEL Research Paper (PDF)](../research/paper/SENTINEL_Research_Paper.pdf)
- 💡 **Key Novel Features**: [Unique Technological Features Matrix](../research/paper/UNIQUE_FEATURES.md)

---

## 🚀 Installation

Install via `pip`:

```bash
pip install sentinel-mlops
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

## 📖 API Reference

### `sentinel.init(api_key: str, base_url: str = "http://localhost:8000")`
Initializes the SDK singleton client.
- `api_key`: Developer secret token or JWT token.
- `base_url`: Endpoint of the SENTINEL FastAPI engine (defaults to `http://localhost:8000`).

### `sentinel.monitor(target: Any, model_id: str = "default_model")`
Monitors a function or class instance.
- `target`: The callable function or model object.
- `model_id`: Descriptive identifier for tracking model metrics in the SENTINEL dashboard.

---

## 🔗 Links & Resources

- 🌐 **Web Frontend & Dashboard**: [http://localhost:3000](http://localhost:3000)
- 📄 **Backend FastAPI OpenAPI Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- 🐙 **GitHub Project**: [srishanthreddy456789/Sentinel](https://github.com/srishanthreddy456789/Sentinel)
- 🦊 **GitLab Mirror**: [Srishanthreddy456789/SENTINEL](https://gitlab.com/Srishanthreddy456789/SENTINEL)
