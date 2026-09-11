from typing import Any, Dict, Optional
from ai.evaluation.metrics.base import BaseMetric, EvaluationResultSchema

class LatencyMetric(BaseMetric):
    """Evaluates request latency against P95 max target threshold in milliseconds (default: 2500ms)."""
    def __init__(self, threshold_ms: float = 2500.0):
        super().__init__(threshold=threshold_ms)

    def evaluate(
        self,
        input_text: str,
        output_text: str,
        expected_output: Optional[str] = None,
        context: Optional[Any] = None,
        latency_ms: float = 0.0,
    ) -> EvaluationResultSchema:
        passed = latency_ms <= self.threshold
        # Score normalized between 0.0 (worst) and 1.0 (best)
        score = max(0.0, 1.0 - (latency_ms / (self.threshold * 2)))

        return EvaluationResultSchema(
            metric_name="latency",
            score=round(score, 4),
            passed=passed,
            confidence=1.0,
            reason=f"Latency {latency_ms:.1f}ms vs threshold target {self.threshold}ms.",
            details={"latency_ms": latency_ms, "threshold_ms": self.threshold}
        )
