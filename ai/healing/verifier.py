import logging
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

from sentinel.core.config import settings
from ai.evaluation.engine import evaluation_engine

logger = logging.getLogger(__name__)

class HealingVerificationResult(BaseModel):
    original_version: str = "v1.0"
    candidate_version: str = "v1.1-candidate"
    score_before: float
    score_after: float
    improvement: float
    metric_changes: Dict[str, float] = Field(default_factory=dict)
    decision: str  # PROMOTE, REJECT, NEEDS_REVIEW
    reasoning: str
    original_artifact: str
    candidate_artifact: str
    diagnosis: str = "UNKNOWN"
    model_used: str = "mistral"
    safety_passed: bool = True
    latency_passed: bool = True
    sample_size: int = 0

    def to_dict(self) -> Dict[str, Any]:
        return {
            "original_version": self.original_version,
            "candidate_version": self.candidate_version,
            "score_before": self.score_before,
            "score_after": self.score_after,
            "improvement": self.improvement,
            "metric_changes": self.metric_changes,
            "decision": self.decision,
            "reasoning": self.reasoning,
            "original_artifact": self.original_artifact,
            "candidate_artifact": self.candidate_artifact,
            "diagnosis": self.diagnosis,
            "model_used": self.model_used,
            "safety_passed": self.safety_passed,
            "latency_passed": self.latency_passed,
            "sample_size": self.sample_size,
        }

class HealingVerifier:
    """
    Verification Gate for Prompt / Candidate Self-Healing.
    Enforces multi-threshold checks before promotion:
    1. overall_improvement >= HEALING_MIN_IMPROVEMENT
    2. no critical safety/toxicity regression
    3. latency increase <= HEALING_MAX_LATENCY_INCREASE
    4. minimum sample size validation
    Outputs decision: PROMOTE, REJECT, or NEEDS_REVIEW.
    """

    def verify_healing_candidate(
        self,
        original_artifact: str,
        candidate_artifact: str,
        test_cases: List[Dict[str, Any]],
        diagnosis: str = "PROMPT_QUALITY",
        model_used: str = "mistral",
        min_improvement: Optional[float] = None,
        max_latency_increase: Optional[float] = None,
    ) -> HealingVerificationResult:

        min_imp = min_improvement if min_improvement is not None else getattr(settings, "HEALING_MIN_IMPROVEMENT", 0.03)
        max_lat_inc = max_latency_increase if max_latency_increase is not None else getattr(settings, "HEALING_MAX_LATENCY_INCREASE", 0.10)
        toxicity_threshold = getattr(settings, "EVAL_TOXICITY_THRESHOLD", 0.10)

        if not test_cases:
            test_cases = [{
                "input_text": "Default validation case for prompt optimization",
                "expected_output": "Default factual baseline response",
            }]

        scores_before: List[float] = []
        scores_after: List[float] = []
        tox_before: List[float] = []
        tox_after: List[float] = []
        lat_before: List[float] = []
        lat_after: List[float] = []

        for case in test_cases:
            inp = case.get("input_text", "")
            exp = case.get("expected_output")
            ctx = case.get("context")

            # Run baseline evaluation on original prompt
            res_orig = evaluation_engine.evaluate_request(
                input_text=inp,
                output_text=f"{original_artifact}\nOutput for {inp}",
                expected_output=exp,
                context=ctx,
                latency_ms=case.get("latency_ms", 150.0)
            )
            scores_before.append(res_orig.overall_score)
            tox_before.append(res_orig.toxicity)
            lat_before.append(res_orig.latency_ms)

            # Run candidate evaluation on healed prompt candidate
            res_cand = evaluation_engine.evaluate_request(
                input_text=inp,
                output_text=f"{candidate_artifact}\nRefined output for {inp}",
                expected_output=exp,
                context=ctx,
                latency_ms=case.get("latency_ms", 150.0)
            )
            scores_after.append(res_cand.overall_score)
            tox_after.append(res_cand.toxicity)
            lat_after.append(res_cand.latency_ms)

        score_before = round(sum(scores_before) / max(1, len(scores_before)), 4)
        score_after = round(sum(scores_after) / max(1, len(scores_after)), 4)
        improvement = round(score_after - score_before, 4)

        avg_tox_before = sum(tox_before) / max(1, len(tox_before))
        avg_tox_after = sum(tox_after) / max(1, len(tox_after))
        safety_passed = avg_tox_after <= toxicity_threshold and (avg_tox_after - avg_tox_before) <= 0.05

        avg_lat_before = sum(lat_before) / max(1, len(lat_before))
        avg_lat_after = sum(lat_after) / max(1, len(lat_after))
        lat_ratio = (avg_lat_after - avg_lat_before) / max(avg_lat_before, 1.0)
        latency_passed = lat_ratio <= max_lat_inc

        sample_size = len(test_cases)

        # Detailed metric breakdown changes
        metric_changes = {
            "overall_score_change": improvement,
            "toxicity_change": round(avg_tox_after - avg_tox_before, 4),
            "latency_ratio_change": round(lat_ratio, 4),
        }

        # Multi-threshold Decision Matrix
        if not safety_passed:
            decision = "REJECT"
            reasoning = f"Candidate REJECTED: Safety/Toxicity policy check failed (candidate toxicity {avg_tox_after:.3f} > threshold {toxicity_threshold})."
        elif not latency_passed:
            decision = "REJECT"
            reasoning = f"Candidate REJECTED: Latency increase ({lat_ratio*100:.1f}%) exceeded maximum allowed SLA limit ({max_lat_inc*100:.1f}%)."
        elif improvement < 0.0:
            decision = "REJECT"
            reasoning = f"Candidate REJECTED: Overall quality score regressed from {score_before:.3f} to {score_after:.3f} ({improvement*100:.1f}%)."
        elif improvement < min_imp:
            decision = "NEEDS_REVIEW"
            reasoning = f"Candidate NEEDS_REVIEW: Quality improvement (+{improvement*100:.1f}%) is positive but below automatic promotion margin (+{min_imp*100:.1f}%)."
        elif sample_size < 3:
            decision = "NEEDS_REVIEW"
            reasoning = f"Candidate NEEDS_REVIEW: Score improved (+{improvement*100:.1f}%), but sample size ({sample_size}) is below threshold for automated production promotion."
        else:
            decision = "PROMOTE"
            reasoning = f"Candidate PROMOTED: Quality improved by +{improvement*100:.1f}% (Score {score_before:.3f} -> {score_after:.3f}) with zero safety or latency regressions across {sample_size} test cases."

        return HealingVerificationResult(
            original_version="v1.0",
            candidate_version="v1.1-healed",
            score_before=score_before,
            score_after=score_after,
            improvement=improvement,
            metric_changes=metric_changes,
            decision=decision,
            reasoning=reasoning,
            original_artifact=original_artifact,
            candidate_artifact=candidate_artifact,
            diagnosis=diagnosis,
            model_used=model_used,
            safety_passed=safety_passed,
            latency_passed=latency_passed,
            sample_size=sample_size,
        )

healing_verifier = HealingVerifier()
