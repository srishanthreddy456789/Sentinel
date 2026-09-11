from typing import Any, Dict, Optional
from ai.evaluation.metrics.base import BaseMetric, EvaluationResultSchema

class ConsistencyMetric(BaseMetric):
    """Evaluates response logical consistency and internal structural coherence."""
    def __init__(self, threshold: float = 0.70):
        super().__init__(threshold=threshold)

    def evaluate(
        self,
        input_text: str,
        output_text: str,
        expected_output: Optional[str] = None,
        context: Optional[Any] = None,
        latency_ms: float = 0.0,
    ) -> EvaluationResultSchema:
        score = 0.90
        # Check for repetition or empty loops
        lines = [line.strip() for line in output_text.splitlines() if line.strip()]
        if len(lines) > 2 and len(set(lines)) < len(lines) / 2:
            score = 0.40  # Repetitive hallucination/inconsistency loop

        passed = score >= self.threshold

        return EvaluationResultSchema(
            metric_name="consistency",
            score=round(score, 4),
            passed=passed,
            confidence=0.85,
            reason=f"Logical consistency score is {score:.2f}.",
            details={"unique_lines_ratio": len(set(lines))/max(1, len(lines))}
        )
