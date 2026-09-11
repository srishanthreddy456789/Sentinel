import sys
from pathlib import Path

# Add project root to path
project_root = Path(__file__).resolve().parent.parent.parent
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))

from scripts.run_regression_suite import run_golden_regression_suite

def test_golden_regression_suite():
    print("Testing Phase 9 Golden Regression Test Suite...")
    
    passed = run_golden_regression_suite(
        golden_dataset_path="data/golden/golden_benchmark_v1.json",
        baseline_quality_threshold=0.70,
        max_allowed_quality_regression=0.02,
    )
    
    print(f"  [OK] Golden Regression Suite Execution Result: {passed}")
    assert passed is True, "Golden regression suite should pass baseline benchmarks"

    print("Phase 9 Golden Regression Suite Test PASSED!")

if __name__ == "__main__":
    test_golden_regression_suite()
