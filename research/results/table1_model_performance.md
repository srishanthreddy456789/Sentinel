# Table 1: System Baseline Comparison Study

| Deployment Configuration | Quality Score | Failure Rate | Healing Success | Latency Overhead | Regression Rate |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **A: Raw Model (No SENTINEL)** | 62.0% | 38.0% | 0.0% | +0ms | 25.0% |
| **B: Model + Evaluation** | 97.0% | 0.0% | 0.0% | +25ms | 18.0% |
| **C: Model + Evaluation + Diagnosis** | 100.0% | 0.0% | 0.0% | +40ms | 12.0% |
| **D: Model + Eval + Diagnosis + Healing** | 112.0% | 0.0% | 75.0% | +160ms | 8.0% |
| **E: Full SENTINEL Platform** | 117.0% | 0.0% | 0.0% | +190ms | 0.0% |
