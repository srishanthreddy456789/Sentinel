# SENTINEL Python SDK Guide

## Quickstart

```python
from sentinel_sdk import sentinel

sentinel.init(
    api_key="sk_sentinel_1234567890",
    backend_url="http://localhost:8000",
    fail_open=True
)

@sentinel.monitor(connected_api_id="model-local")
def predict(prompt: str):
    return "Model completion response"
```
