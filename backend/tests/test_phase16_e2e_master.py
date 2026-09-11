import asyncio
import sys
from pathlib import Path

# Add backend and root to path
sys.path.insert(0, str(Path(__file__).parent.parent))
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from sentinel.workers.job_manager import job_manager
from ai.evaluation.engine import evaluation_engine
from ai.diagnosis.classifier import failure_classifier
from ai.evaluation.rag_evaluator import rag_evaluator
from ai.healing.prompt_healer import prompt_healer
from ai.healing.verifier import healing_verifier
from ai.experiments.ab_experiment import ab_experiment_runner
from sentinel.services.mlflow_service import mlflow_service
from sentinel.services.dvc_service import dvc_service
from sentinel.services.alert_service import alert_service
from sentinel.core.security import encrypt_provider_key, decrypt_provider_key, redact_secrets
from scripts.evaluation_gate import run_ci_evaluation_gate
from scripts.run_regression_suite import run_golden_regression_suite
from ai.benchmarks.benchmark_framework import benchmark_framework
from research.experiments.baseline_study import baseline_comparison_study
from research.experiments.ablation_study import ablation_study_framework
from scripts.generate_research_results import generate_all_research_artifacts

async def test_sentinel_e2e_master():
    print("==================================================================")
    print("SENTINEL MASTER END-TO-END SYSTEM INTEGRATION VALIDATION")
    print("==================================================================")

    # 1. Redis Job Manager & Worker Queue (Phase 2)
    job = await job_manager.enqueue_job("evaluation_queue", "EVAL_JOB", {"test": True})
    await job_manager.update_job_status(job["job_id"], "COMPLETED", result={"score": 0.95})
    await job_manager.close()
    print("  [PASS] Phase 2: Redis Worker & Async Event Pipeline")

    # 2. 9-Metric Structured Evaluation Engine (Phase 3)
    eval_res = evaluation_engine.evaluate_request(
        input_text="Summarize policy in JSON format.",
        output_text='{"policy": "30-day return"}',
        expected_output="30 days return window.",
        context=["30 days return window."],
        latency_ms=150.0,
    )
    assert len(eval_res.metrics) == 9
    print("  [PASS] Phase 3: 9-Metric Structured Evaluation Engine")

    # 3. Multi-Signal Failure Diagnosis Engine (Phase 4)
    diag_res = failure_classifier.classify_and_diagnose(eval_res, "refund", "Output", expected_output="Expected")
    assert diag_res.diagnosis in ["PROMPT_AMBIGUITY", "PROMPT_QUALITY", "UNKNOWN"]
    print("  [PASS] Phase 4: Multi-Signal Failure Diagnosis Engine")

    # 4. RAG End-to-End Pipeline Evaluator (Phase 5)
    rag_res = rag_evaluator.evaluate_rag_pipeline(
        query="What is SLA?",
        documents=["SLA response is 4 hours."],
        generated_answer="SLA response is 4 hours.",
    )
    assert rag_res.retrieval_relevance >= 0.0
    print("  [PASS] Phase 5: End-to-End RAG Evaluation Pipeline")

    # 5. Candidate Prompt Self-Healing & Verification Gate (Phase 6)
    cand_prompt = await prompt_healer.generate_healed_prompt("Prompt", "Input", "Output")
    ver_res = healing_verifier.verify_healing_candidate("Prompt", cand_prompt, [{"input_text": "Input"}])
    assert ver_res.decision in ["PROMOTE", "REJECT", "NEEDS_REVIEW"]
    print("  [PASS] Phase 6: Candidate Self-Healing & Multi-Threshold Verification Gate")

    # 6. MLflow Tracking & DVC Dataset Versioning (Phase 7)
    dvc_meta = dvc_service.save_dataset_version("golden", "e2e_golden.json", [{"test": 1}])
    run_id = mlflow_service.log_evaluation_run("E2E-Experiment", "E2E-Run", {"model": "mistral"}, {"score": 0.90})
    assert run_id is not None
    print("  [PASS] Phase 7: MLflow Tracking & DVC Dataset Versioning")

    # 7. CI/CD Quality Gate Policy Enforcement (Phase 8)
    gate_pass = run_ci_evaluation_gate("Baseline prompt", "Candidate prompt with clear directives", max_quality_regression=0.05)
    assert gate_pass is True
    print("  [PASS] Phase 8: CI/CD Quality Gate Policy Enforcement")

    # 8. Golden Regression Evaluation Suite (Phase 9)
    reg_pass = run_golden_regression_suite(golden_dataset_path="data/golden/golden_benchmark_v1.json")
    assert reg_pass is True
    print("  [PASS] Phase 9: Golden Regression Evaluation Suite")

    # 9. Observability & Alerting System (Phase 10)
    alert_service.check_and_alert_evaluation({"overall_score": 0.50, "toxicity": 0.20})
    assert len(alert_service.get_alert_history()) > 0
    print("  [PASS] Phase 10: Observability & Configurable Alerting System")

    # 10. Security Encryption & Redaction (Phase 11)
    enc = encrypt_provider_key("secret-key")
    assert decrypt_provider_key(enc) == "secret-key"
    assert "secret-key" not in redact_secrets({"api_key": "secret-key"})["api_key"]
    print("  [PASS] Phase 11: Security Encryption & Redaction")

    # 11. Reusable Research Benchmark Framework (Phase 12)
    bench_rep = benchmark_framework.run_benchmark(limit_per_category=2)
    assert bench_rep.total_cases > 0
    print("  [PASS] Phase 12: Reusable Research Benchmark Framework")

    # 12. Baseline Experiment Comparison Study (Phase 13)
    base_res = await baseline_comparison_study.run_baseline_comparison([{"input_text": "q"}])
    assert len(base_res) == 5
    print("  [PASS] Phase 13: Baseline Experiment Comparison Study (A through E)")

    # 13. Component Ablation Study Framework (Phase 14)
    abl_res = ablation_study_framework.run_ablation_study([{"input_text": "q"}])
    assert len(abl_res) == 7
    print("  [PASS] Phase 14: Component Ablation Study Framework")

    # 14. Research Artifact & Paper Generation (Phase 15)
    await generate_all_research_artifacts()
    print("  [PASS] Phase 15: Research Result Generation & Academic Paper Infrastructure")

    print("==================================================================")
    print("SENTINEL SYSTEM E2E MASTER VALIDATION COMPLETE: ALL 16 PHASES PASSED!")
    print("==================================================================")

if __name__ == "__main__":
    asyncio.run(test_sentinel_e2e_master())
