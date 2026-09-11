import math
import logging
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

from ai.evaluation.engine import evaluation_engine

logger = logging.getLogger(__name__)

class ABExperimentResult(BaseModel):
    experiment_id: str
    variant_a_name: str = "Variant A (Baseline)"
    variant_b_name: str = "Variant B (Candidate)"
    sample_size: int
    mean_a: float
    mean_b: float
    variance_a: float
    variance_b: float
    absolute_improvement: float
    relative_improvement: float
    confidence_interval_95: List[float] = Field(default_factory=list)
    effect_size_cohens_d: float
    is_statistically_significant: bool
    winner: str  # Variant A, Variant B, Tie
    metrics_breakdown: Dict[str, Any] = Field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "experiment_id": self.experiment_id,
            "variant_a_name": self.variant_a_name,
            "variant_b_name": self.variant_b_name,
            "sample_size": self.sample_size,
            "mean_a": self.mean_a,
            "mean_b": self.mean_b,
            "variance_a": self.variance_a,
            "variance_b": self.variance_b,
            "absolute_improvement": self.absolute_improvement,
            "relative_improvement": self.relative_improvement,
            "confidence_interval_95": self.confidence_interval_95,
            "effect_size_cohens_d": self.effect_size_cohens_d,
            "is_statistically_significant": self.is_statistically_significant,
            "winner": self.winner,
            "metrics_breakdown": self.metrics_breakdown,
        }

class ABExperimentRunner:
    """
    Executes controlled A/B evaluation experiments between Variant A (Baseline) and Variant B (Candidate Prompt)
    on the exact same dataset, calculating statistical significance and confidence intervals.
    """

    def run_experiment(
        self,
        experiment_id: str,
        variant_a_prompt: str,
        variant_b_prompt: str,
        dataset: List[Dict[str, Any]],
        variant_a_name: str = "Variant A (Baseline)",
        variant_b_name: str = "Variant B (Candidate)",
    ) -> ABExperimentResult:

        if not dataset:
            raise ValueError("Dataset cannot be empty for A/B experiment execution.")

        scores_a: List[float] = []
        scores_b: List[float] = []

        for case in dataset:
            inp = case.get("input_text", "")
            exp = case.get("expected_output")
            ctx = case.get("context")

            res_a = evaluation_engine.evaluate_request(
                input_text=inp,
                output_text=f"{variant_a_prompt}\n{inp}",
                expected_output=exp,
                context=ctx,
            )
            scores_a.append(res_a.overall_score)

            res_b = evaluation_engine.evaluate_request(
                input_text=inp,
                output_text=f"{variant_b_prompt}\n{inp}",
                expected_output=exp,
                context=ctx,
            )
            scores_b.append(res_b.overall_score)

        n = len(dataset)
        mean_a = round(sum(scores_a) / n, 4)
        mean_b = round(sum(scores_b) / n, 4)

        var_a = round(sum((x - mean_a) ** 2 for x in scores_a) / max(1, n - 1), 6)
        var_b = round(sum((x - mean_b) ** 2 for x in scores_b) / max(1, n - 1), 6)

        abs_imp = round(mean_b - mean_a, 4)
        rel_imp = round((abs_imp / max(mean_a, 0.0001)) * 100.0, 2)

        # Calculate standard error and 95% Confidence Interval
        pooled_se = math.sqrt(max(0.000001, (var_a / n) + (var_b / n)))
        ci_lower = round(abs_imp - (1.96 * pooled_se), 4)
        ci_upper = round(abs_imp + (1.96 * pooled_se), 4)

        # Cohen's d effect size
        pooled_std = math.sqrt(max(0.000001, (var_a + var_b) / 2.0))
        cohens_d = round(abs_imp / pooled_std, 4) if pooled_std > 0 else 0.0

        # Statistical significance check (requires n >= 10 and CI strictly above 0)
        is_stat_sig = n >= 10 and ci_lower > 0.0

        if abs_imp > 0.02 and (is_stat_sig or abs_imp >= 0.05):
            winner = variant_b_name
        elif abs_imp < -0.02:
            winner = variant_a_name
        else:
            winner = "Tie"

        metrics_breakdown = {
            "scores_a": scores_a,
            "scores_b": scores_b,
            "pooled_se": round(pooled_se, 6),
        }

        return ABExperimentResult(
            experiment_id=experiment_id,
            variant_a_name=variant_a_name,
            variant_b_name=variant_b_name,
            sample_size=n,
            mean_a=mean_a,
            mean_b=mean_b,
            variance_a=var_a,
            variance_b=var_b,
            absolute_improvement=abs_imp,
            relative_improvement=rel_imp,
            confidence_interval_95=[ci_lower, ci_upper],
            effect_size_cohens_d=cohens_d,
            is_statistically_significant=is_stat_sig,
            winner=winner,
            metrics_breakdown=metrics_breakdown,
        )

ab_experiment_runner = ABExperimentRunner()
