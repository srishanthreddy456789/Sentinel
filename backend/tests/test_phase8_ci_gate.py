import sys
from pathlib import Path

# Add project root to path
project_root = Path(__file__).resolve().parent.parent.parent
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))

from scripts.evaluation_gate import run_ci_evaluation_gate

def test_ci_evaluation_gate():
    print("Testing Phase 8 CI/CD Evaluation Quality Gate Policy...")

    baseline = "Be a helpful support assistant."
    candidate_good = "System Instructions: Be a helpful, accurate support assistant. Provide concise step-by-step guidance."
    
    # 1. Test Passing Candidate (Within Allowed Policy Margin)
    pass_result = run_ci_evaluation_gate(
        baseline_prompt=baseline,
        candidate_prompt=candidate_good,
        max_quality_regression=0.10,
    )
    print(f"  [OK] Passing Candidate Gate Result: {pass_result}")
    assert pass_result is True

    # 2. Test Failing Candidate (Severe Quality Regression)
    candidate_bad = "gibberish empty output response"
    fail_result = run_ci_evaluation_gate(
        baseline_prompt=baseline,
        candidate_prompt=candidate_bad,
        max_quality_regression=0.01,
    )
    print(f"  [OK] Failing Candidate Gate Result: {fail_result}")
    assert fail_result is False

    print("Phase 8 CI/CD Evaluation Gate Test PASSED!")

if __name__ == "__main__":
    test_ci_evaluation_gate()
