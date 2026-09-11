# SENTINEL Evaluation Engine

The SENTINEL Evaluation Engine provides 9 structured evaluators:
1. `correctness`: Semantic vector similarity (sentence-transformers), golden suite comparison, claim comparison.
2. `hallucination`: Inverse groundedness against reference context.
3. `faithfulness`: Context grounding verification.
4. `consistency`: Logic contradiction and repetition detection.
5. `toxicity`: Inappropriate vocabulary detection.
6. `latency`: Performance SLA verification.
7. `retrieval_relevance`: Passages relevance to user query.
8. `context_completeness`: Query coverage assessment.
9. `instruction_following`: Prompt structure and rule adherence.

All metrics return structured outputs:
```json
{
  "metric": "faithfulness",
  "score": 0.87,
  "passed": true,
  "confidence": 0.92,
  "reason": "...",
  "evidence": [...]
}
```
