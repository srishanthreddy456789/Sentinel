import sys
from pathlib import Path

# Add backend and root to path
sys.path.insert(0, str(Path(__file__).parent.parent))
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from research.experiments.ablation_study import ablation_study_framework

def test_ablation_study_framework():
    print("Testing Phase 14 SENTINEL Ablation Studies Framework...")

    dataset = [{"input_text": "Sample query", "expected_output": "Sample output"}]
    out_dir = Path(__file__).parent.parent.parent / "research" / "experiments" / "ablations"
    results = ablation_study_framework.run_ablation_study(dataset, output_dir=out_dir)

    print(f"  [OK] Ablation study evaluated {len(results)} component configurations")
    for key, metrics in results.items():
        print(f"  [OK] {metrics.ablation_name}: Score={metrics.overall_quality_score}, Delta={metrics.quality_delta:+.2f}, AccuracyLoss={metrics.accuracy_loss:.2f}")

    assert len(results) == 7
    assert "without_diagnosis" in results
    assert "without_llm_judge" in results
    assert "without_semantic_similarity" in results
    assert "without_query_expansion" in results
    assert "without_reranking" in results
    assert "without_healing_verification" in results
    assert (out_dir / "ablation_study_results.json").exists()
    assert (out_dir / "ablation_study_results.csv").exists()

    print("Phase 14 Ablation Study Test PASSED!")

if __name__ == "__main__":
    test_ablation_study_framework()
