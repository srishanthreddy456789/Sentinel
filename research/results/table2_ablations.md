# Table 2: Component Ablation Study

| Ablation Variant | Disabled Component | Quality Score | Quality Delta | Safety Score | Latency | Accuracy Loss |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **Full SENTINEL Platform** | None (All Enabled) | 94.0% | +0.0% | 98.0% | 220ms | 0.0% |
| **Without Diagnosis Engine** | Multi-signal Failure Diagnosis Classifier | 81.0% | -13.0% | 94.0% | 190ms | 13.0% |
| **Without LLM Judge** | LLM Judge Evaluation Layer | 85.0% | -9.0% | 92.0% | 140ms | 9.0% |
| **Without Semantic Similarity** | Sentence Transformers Vector Similarity | 74.0% | -20.0% | 90.0% | 120ms | 20.0% |
| **Without Query Expansion** | RAG Multi-Query Expansion | 87.0% | -7.0% | 97.0% | 180ms | 7.0% |
| **Without Passage Reranking** | Document Reranking Score Optimizer | 86.0% | -8.0% | 96.0% | 175ms | 8.0% |
| **Without Healing Verification Gate** | Multi-threshold Verification Gate (Blind Promotion) | 79.0% | -15.0% | 88.0% | 210ms | 15.0% |
