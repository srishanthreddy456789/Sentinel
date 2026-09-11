# SENTINEL System Design Document

## Functional Requirements
- Monitor LLM request completions, tokens, and latency across providers.
- Execute automated 9-metric evaluation on model responses.
- Diagnose failure causes using multi-signal evidence.
- Generate and verify candidate prompt improvements with multi-threshold verification gates.
- Track experiments using MLflow and version evaluation datasets using DVC.
- Enforce CI/CD quality gates preventing performance or safety regressions.

## Non-Functional Requirements
- **Idempotency**: Prevent duplicate evaluation job processing.
- **Fail-Safe Operation**: SDK and background workers gracefully handle provider outages.
- **Security**: Fernet encrypted API key storage, secret redaction in logs.
- **Reproducibility**: Trace every evaluation run to exact prompt, dataset, model, and evaluator versions.
