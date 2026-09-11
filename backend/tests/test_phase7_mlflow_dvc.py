import sys
from pathlib import Path

# Add backend and root to path
sys.path.insert(0, str(Path(__file__).parent.parent))
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from sentinel.services.mlflow_service import mlflow_service
from sentinel.services.dvc_service import dvc_service

def test_mlflow_and_dvc_services():
    print("Testing Phase 7 MLflow Tracking, DVC Dataset Versioning & Reusable Services...")

    # 1. DVC Dataset Versioning Test
    dataset_meta = dvc_service.save_dataset_version(
        dataset_category="golden",
        filename="golden_benchmark_v1.json",
        records=[
            {"input_text": "What is SENTINEL?", "expected_output": "SENTINEL is an LLMOps platform."},
            {"input_text": "How does self-healing work?", "expected_output": "Self-healing generates candidate prompts and verifies improvement margin."},
        ],
        description="Golden evaluation dataset v1"
    )
    print(f"  [OK] DVC Dataset Version: {dataset_meta['dataset_version']} ({dataset_meta['record_count']} records)")
    assert dataset_meta["dataset_version"].startswith("dvc-") or dataset_meta["dataset_version"].startswith("v1-")

    # 2. MLflow Service Logging Test
    params = {
        "model": "mistral",
        "provider": "Ollama",
        "prompt_version": "v1.2",
        "dataset_version": dataset_meta["dataset_version"],
        "evaluator_version": "v2.0.0",
    }
    metrics = {
        "correctness": 0.88,
        "faithfulness": 0.82,
        "hallucination": 0.05,
        "overall_quality": 0.86,
    }
    run_id = mlflow_service.log_evaluation_run(
        experiment_name="Sentinel-Phase7-Benchmark",
        run_name="Run-Golden-v1.2",
        params=params,
        metrics=metrics,
    )
    print(f"  [OK] MLflow Run Logged (Run ID: {run_id})")
    assert run_id is not None

    # 3. MLflow Healing Experiment Logging Test
    healing_run_id = mlflow_service.log_healing_experiment(
        experiment_name="Sentinel-Healing-Suite",
        original_prompt_version="v1.0",
        candidate_prompt_version="v1.1-candidate",
        score_before=0.65,
        score_after=0.82,
        improvement=0.17,
        decision="PROMOTE",
        model="mistral",
    )
    print(f"  [OK] MLflow Healing Logged (Run ID: {healing_run_id})")
    assert healing_run_id is not None

    print("Phase 7 MLflow & DVC Services Test PASSED!")

if __name__ == "__main__":
    test_mlflow_and_dvc_services()
