import sys
import os
import argparse
import logging
from pathlib import Path

# Add project root and backend to path
project_root = Path(__file__).resolve().parent.parent
backend_path = project_root / "backend"
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))
if str(backend_path) not in sys.path:
    sys.path.insert(0, str(backend_path))

from sentinel.core.config import settings
from ai.evaluation.engine import evaluation_engine
from ai.healing.verifier import healing_verifier

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("evaluation_gate")

def run_ci_evaluation_gate(
    baseline_prompt: str,
    candidate_prompt: str,
    max_quality_regression: float = 0.02,
    max_latency_increase: float = 0.10,
    min_safety_score: float = 0.95,
) -> bool:
    """
    CI/CD Evaluation Gate enforcing quality, safety, and performance SLA policies before merging prompt/model updates.
    """
    logger.info("============================================================")
    logger.info("SENTINEL CI/CD EVALUATION QUALITY GATE")
    logger.info("============================================================")

    test_cases = [
        {"input_text": "How do I request a refund?", "expected_output": "Refunds can be requested via your account dashboard within 30 days."},
        {"input_text": "What is the SLA response time?", "expected_output": "Our standard support SLA response time is within 4 business hours."},
        {"input_text": "Describe billing payment methods.", "expected_output": "We accept major credit cards, PayPal, and wire transfers for enterprise plans."},
    ]

    verification = healing_verifier.verify_healing_candidate(
        original_artifact=baseline_prompt,
        candidate_artifact=candidate_prompt,
        test_cases=test_cases,
        min_improvement=-max_quality_regression,
        max_latency_increase=max_latency_increase,
    )

    logger.info(f"Baseline Overall Score : {verification.score_before * 100:.2f}%")
    logger.info(f"Candidate Overall Score: {verification.score_after * 100:.2f}%")
    logger.info(f"Quality Score Delta    : {verification.improvement * 100:+.2f}% (Max Allowed Regression: -{max_quality_regression*100:.2f}%)")
    logger.info(f"Safety Policy Status   : {'PASSED' if verification.safety_passed else 'FAILED'}")
    logger.info(f"Latency SLA Status     : {'PASSED' if verification.latency_passed else 'FAILED'}")
    logger.info(f"Final Decision Outcome : {verification.decision}")
    logger.info(f"Reasoning              : {verification.reasoning}")

    # Enforce strict policy rejection rules
    if verification.improvement < -max_quality_regression:
        logger.error(f"EVALUATION GATE REJECTED [QUALITY_REGRESSION]: Quality drop of {abs(verification.improvement)*100:.2f}% exceeded maximum allowed regression ({max_quality_regression*100:.2f}%).")
        return False

    if not verification.safety_passed:
        logger.error("EVALUATION GATE REJECTED [SAFETY_VIOLATION]: Candidate failed safety / toxicity evaluation checks.")
        return False

    if not verification.latency_passed:
        logger.error("EVALUATION GATE REJECTED [LATENCY_VIOLATION]: Candidate exceeded allowed latency increase ratio.")
        return False

    logger.info("============================================================")
    logger.info("SUCCESS: SENTINEL CI/CD EVALUATION GATE PASSED ALL POLICIES")
    logger.info("============================================================")
    return True

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="SENTINEL CI/CD Prompt & Model Evaluation Quality Gate")
    parser.add_argument("--baseline", default="Baseline system prompt instructions", help="Baseline prompt text")
    parser.add_argument("--candidate", default="Candidate system prompt with detailed rules and guidelines", help="Candidate prompt text")
    parser.add_argument("--max-regression", type=float, default=0.02, help="Max quality drop allowed (e.g. 0.02 for 2%)")
    parser.add_argument("--max-latency-inc", type=float, default=0.10, help="Max latency increase ratio allowed (e.g. 0.10 for 10%)")
    parser.add_argument("--min-safety", type=float, default=0.95, help="Minimum safety score required")
    
    args = parser.parse_args()
    
    passed = run_ci_evaluation_gate(
        baseline_prompt=args.baseline,
        candidate_prompt=args.candidate,
        max_quality_regression=args.max_regression,
        max_latency_increase=args.max_latency_inc,
        min_safety_score=args.min_safety,
    )
    sys.exit(0 if passed else 1)
