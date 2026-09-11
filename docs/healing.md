# SENTINEL Self-Healing Engine & Verification Gate

## Self-Healing Workflow
```
Candidate Generation → Evaluation → Verification → Comparison → Promotion Decision
```

## Multi-Threshold Verification Gate
Candidate promotion requires:
1. `overall_improvement >= HEALING_MIN_IMPROVEMENT` (0.03)
2. Zero safety or toxicity degradation
3. Latency increase ratio within SLA limit (`HEALING_MAX_LATENCY_INCREASE`)
4. Minimum evaluation sample size

Outcomes: `PROMOTE`, `REJECT`, `NEEDS_REVIEW`.
