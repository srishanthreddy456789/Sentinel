import asyncio
import sys
from pathlib import Path

# Add backend and root to path
sys.path.insert(0, str(Path(__file__).parent.parent))
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from research.experiments.baseline_study import baseline_comparison_study

async def test_baseline_comparison_study():
    print("Testing Phase 13 Baseline Experiment & System Comparison Study...")

    dataset = [
        {"input_text": "How do I process a return?", "expected_output": "Visit your account orders page and click Request Return."},
        {"input_text": "What is the warranty period?", "expected_output": "Warranty is 1 year from purchase date."},
    ]

    out_dir = Path(__file__).parent.parent.parent / "research" / "experiments" / "baselines"
    results = await baseline_comparison_study.run_baseline_comparison(dataset, output_dir=out_dir)

    print(f"  [OK] Evaluation completed across 5 configurations (A through E)")
    for config_key, metrics in results.items():
        print(f"  [OK] {metrics.config_name}: Quality={metrics.quality_score}, FailureRate={metrics.failure_rate}, Regression={metrics.regression_rate}")

    assert len(results) == 5
    assert results["Config_E"].regression_rate == 0.00
    assert (out_dir / "baseline_comparison_results.json").exists()
    assert (out_dir / "baseline_comparison_results.csv").exists()

    print("Phase 13 Baseline Experiment Study Test PASSED!")

if __name__ == "__main__":
    asyncio.run(test_baseline_comparison_study())
