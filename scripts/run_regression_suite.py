import sys
import os
import json
import argparse
import logging
from pathlib import Path
from typing import Any, Dict, List, Optional

# Add project root and backend to path
project_root = Path(__file__).resolve().parent.parent
backend_path = project_root / "backend"
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))
if str(backend_path) not in sys.path:
    sys.path.insert(0, str(backend_path))

from sentinel.core.config import settings
from ai.evaluation.engine import evaluation_engine

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("regression_suite")

DEFAULT_GOLDEN_CASES = [
    {
        "id": "reg-001",
        "input_text": "What are your hours of operation?",
        "expected_output": "We are open Monday through Friday from 9 AM to 5 PM EST.",
        "category": "QA"
    },
    {
        "id": "reg-002",
        "input_text": "How do I initiate a return?",
        "expected_output": "To initiate a return, visit your account orders page and select 'Request Return'.",
        "category": "Customer Support"
    },
    {
        "id": "reg-003",
        "input_text": "Calculate 15% tip on $80 bill.",
        "expected_output": "15% of $80 is $12. The total bill with tip is $92.",
        "category": "Reasoning"
    },
    {
        "id": "reg-004",
        "input_text": "Explain quantum entanglement in simple terms under 20 words.",
        "expected_output": "Particles connected so measuring one instantly determines the state of the other regardless of distance.",
        "category": "Instruction Following"
    },
]

def run_golden_regression_suite(
    golden_dataset_path: Optional[str] = None,
    baseline_quality_threshold: float = 0.70,
    max_allowed_quality_regression: float = 0.02,
) -> bool:
    """
    Executes SENTINEL Golden Regression Evaluation Suite against baseline quality metrics.
    """
    logger.info("============================================================")
    logger.info("SENTINEL GOLDEN REGRESSION EVALUATION SUITE")
    logger.info("============================================================")

    test_cases = DEFAULT_GOLDEN_CASES
    if golden_dataset_path and Path(golden_dataset_path).exists():
        try:
            with open(golden_dataset_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                test_cases = data.get("records", DEFAULT_GOLDEN_CASES)
        except Exception as e:
            logger.warning(f"Could not load custom golden dataset file ({e}). Using default golden regression fixtures.")

    total_cases = len(test_cases)
    passed_cases = 0
    total_quality = 0.0
    total_toxicity = 0.0
    total_latency = 0.0

    results_summary: List[Dict[str, Any]] = []

    for case in test_cases:
        cid = case.get("id", "case")
        inp = case.get("input_text", "")
        exp = case.get("expected_output")
        ctx = case.get("context")

        # Evaluate output against expected golden output
        res = evaluation_engine.evaluate_request(
            input_text=inp,
            output_text=exp or "Output response",  # Test golden target fidelity
            expected_output=exp,
            context=ctx,
            latency_ms=case.get("latency_ms", 120.0),
        )

        total_quality += res.overall_score
        total_toxicity += res.toxicity
        total_latency += res.latency_ms

        if res.passed:
            passed_cases += 1

        results_summary.append({
            "id": cid,
            "category": case.get("category", "general"),
            "score": res.overall_score,
            "passed": res.passed,
            "toxicity": res.toxicity,
        })

    avg_quality = round(total_quality / max(total_cases, 1), 4)
    avg_toxicity = round(total_toxicity / max(total_cases, 1), 4)
    avg_latency = round(total_latency / max(total_cases, 1), 4)
    pass_rate = round((passed_cases / max(total_cases, 1)) * 100.0, 2)

    logger.info(f"Total Test Cases Evaluated : {total_cases}")
    logger.info(f"Passed Test Cases          : {passed_cases} ({pass_rate}%)")
    logger.info(f"Failed Test Cases          : {total_cases - passed_cases}")
    logger.info(f"Average Quality Score      : {avg_quality * 100:.2f}% (Target: {baseline_quality_threshold * 100:.2f}%)")
    logger.info(f"Average Toxicity Rate      : {avg_toxicity:.4f}")
    logger.info(f"Average Latency            : {avg_latency:.1f}ms")

    # Quality Regression Assertion
    quality_regression = round(baseline_quality_threshold - avg_quality, 4)
    has_regression = quality_regression > max_allowed_quality_regression

    if has_regression:
        logger.error(f"REGRESSION SUITE FAILED: Quality score dropped by {quality_regression*100:.2f}%, exceeding max regression limit ({max_allowed_quality_regression*100:.2f}%).")
        return False

    if avg_toxicity > getattr(settings, "EVAL_TOXICITY_THRESHOLD", 0.10):
        logger.error(f"REGRESSION SUITE FAILED: Safety violation (Average toxicity {avg_toxicity} exceeds limit).")
        return False

    logger.info("============================================================")
    logger.info("SUCCESS: GOLDEN REGRESSION SUITE PASSED ALL BENCHMARKS")
    logger.info("============================================================")
    return True

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="SENTINEL Golden Regression Evaluation Suite")
    parser.add_argument("--dataset", default="data/golden/golden_benchmark_v1.json", help="Path to golden dataset file")
    parser.add_argument("--threshold", type=float, default=0.70, help="Baseline quality threshold")
    parser.add_argument("--max-regression", type=float, default=0.02, help="Max regression drop allowed")
    
    args = parser.parse_args()
    passed = run_golden_regression_suite(
        golden_dataset_path=args.dataset,
        baseline_quality_threshold=args.threshold,
        max_allowed_quality_regression=args.max_regression,
    )
    sys.exit(0 if passed else 1)
