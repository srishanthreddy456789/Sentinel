# SENTINEL AI Engine

## Overview

The `ai/` directory contains the AI-related logic used to evaluate LLM outputs, identify potential quality failures, diagnose their causes, and test possible remediation strategies.

## Core Responsibilities

- Evaluate generated responses against reference information or test cases.
- Detect potential hallucinations and unsupported claims.
- Assess correctness, faithfulness, consistency, toxicity, and latency where supported.
- Diagnose possible causes of evaluation failures.
- Generate candidate prompt or retrieval improvements.
- Verify proposed changes against an evaluation suite.

## Conceptual Workflow

```text
LLM Response
     |
     v
Evaluation Engine
     |
     v
Failure Classification
     |
     v
Diagnosis
     |
     v
Candidate Remediation
     |
     v
Evaluation Against Same Test Suite
     |
     v
Promote or Reject Candidate
```

## Main Components

### Evaluation

Evaluates model outputs using the metrics and evaluation methods implemented in the repository.

### Diagnosis

Analyzes evaluation failures and assigns possible failure categories. A diagnosis should include supporting evidence and confidence information where available.

### Healing

Generates potential improvements, such as prompt revisions or retrieval changes. A candidate should not be considered successful until its performance has been evaluated.

### LLM Integrations

Provides interfaces for interacting with supported model providers and local inference systems.

## Hallucination Detection

Hallucination detection should compare individual factual claims against reference evidence when available.

Natural Language Inference (NLI) can classify the relationship between a premise and a claim as:

- **Entailment:** The evidence supports the claim.
- **Contradiction:** The evidence conflicts with the claim.
- **Neutral:** The evidence does not establish the claim.

Neutral does not necessarily mean the claim is false. Detection results are estimates and should not be presented as guaranteed factual verification.

## Evaluation and Verification

A proposed remediation should be tested against the same evaluation dataset used for the baseline. Track changes in relevant metrics and identify regressions before promoting a candidate.

## Development Guidelines

- Keep evaluation, diagnosis, and healing logic modular.
- Separate model-provider code from evaluation logic.
- Use reproducible test cases.
- Record evidence for detected failures.
- Avoid treating model-generated confidence as calibrated probability without validation.
- Do not claim an improvement without experimental evidence.

## Testing

Use the repository's available unit and integration tests. Add tests for supported metrics, diagnosis categories, model failures, edge cases, and remediation regressions.

## Current Status

Document which evaluators, diagnosis methods, and remediation strategies are implemented, partially implemented, or planned.

## Related Documentation

- [Backend](../backend/README.md)
- [Research](../research/README.md)
- [Tests](../tests/README.md)
