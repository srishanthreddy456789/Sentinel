import sys
from pathlib import Path

# Add backend and root to path
sys.path.insert(0, str(Path(__file__).parent.parent))
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from ai.benchmarks.benchmark_framework import benchmark_framework, BenchmarkCategory

def test_benchmark_framework():
    print("Testing Phase 12 SENTINEL Reusable Research Benchmark Framework...")

    # 1. Verify scaled case generation
    scaled = benchmark_framework.generate_scaled_benchmark_cases(BenchmarkCategory.RAG.value, 50)
    print(f"  [OK] Generated {len(scaled)} scaled benchmark cases for {BenchmarkCategory.RAG.value}")
    assert len(scaled) == 50

    # 2. Run multi-category benchmark
    report = benchmark_framework.run_benchmark(
        suite_name="Phase12-Test-Suite",
        categories=[BenchmarkCategory.GENERAL_QA.value, BenchmarkCategory.RAG.value, BenchmarkCategory.SAFETY.value],
        limit_per_category=5,
    )
    res_dict = report.to_dict()
    print(f"  [OK] Total Benchmark Cases Evaluated: {report.total_cases}")
    print(f"  [OK] Overall Benchmark Score: {report.overall_score * 100:.2f}% (Pass Rate: {report.pass_rate}%)")
    assert report.total_cases == 15
    assert len(report.category_scores) == 3
    assert "correctness" in report.metric_breakdown

    print("Phase 12 Benchmark Framework Test PASSED!")

if __name__ == "__main__":
    test_benchmark_framework()
