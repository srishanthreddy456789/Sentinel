import sys
import os
from pathlib import Path
project_root = Path(__file__).resolve().parent.parent
backend_path = project_root / "backend"
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))
if str(backend_path) not in sys.path:
    sys.path.insert(0, str(backend_path))

import argparse
import logging
from ai.evaluation.engine import evaluation_engine
from ai.healing.verifier import healing_verifier

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("evaluation_gate")

def run_evaluation_gate(baseline_prompt: str, candidate_prompt: str, max_allowed_drop: float = 0.01) -> bool:
    """CI/CD evaluation gate checking prompt performance against regression tolerance."""
    logger.info("Running SENTINEL CI/CD Evaluation Gate Benchmark...")
    
    test_cases = [
        {"input_text": "How do I request a refund?", "expected_output": "Refunds can be requested via your account dashboard within 30 days."},
        {"input_text": "What is the SLA response time?", "expected_output": "Our standard support SLA response time is within 4 business hours."},
    ]

    result = healing_verifier.verify_healing_candidate(
        original_artifact=baseline_prompt,
        candidate_artifact=candidate_prompt,
        test_cases=test_cases,
        min_improvement=-max_allowed_drop
    )

    logger.info(f"Baseline Score (Score A): {result.score_before * 100:.2f}%")
    logger.info(f"Candidate Score (Score B): {result.score_after * 100:.2f}%")
    logger.info(f"Score Delta: {result.improvement * 100:+.2f}%")

    if result.improvement < -max_allowed_drop:
        logger.error(f"EVALUATION GATE FAILED: Quality dropped by {abs(result.improvement)*100:.2f}%, exceeding max allowed tolerance of {max_allowed_drop*100:.2f}%.")
        return False

    logger.info("EVALUATION GATE PASSED: Quality gate passed standard tolerance checks.")
    return True

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="SENTINEL CI/CD Prompt Evaluation Gate")
    parser.add_argument("--baseline", default="Standard prompt baseline v1", help="Baseline prompt text")
    parser.add_argument("--candidate", default="Improved system prompt candidate v2 with instructions", help="Candidate prompt text")
    parser.add_argument("--tolerance", type=float, default=0.01, help="Max allowed drop threshold")
    
    args = parser.parse_args()
    
    passed = run_evaluation_gate(args.baseline, args.candidate, args.tolerance)
    if not passed:
        sys.exit(1)
    sys.exit(0)
