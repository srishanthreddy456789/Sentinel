from typing import Any, Dict, Optional
from ai.evaluation.metrics.base import BaseMetric, EvaluationResultSchema
from ai.evaluation.metrics.correctness import calculate_cosine_similarity

class HallucinationMetric(BaseMetric):
    """Detects ungrounded or fabricated claims in response compared to context/reference. Low hallucination score means high fidelity."""
    def __init__(self, threshold: float = 0.30):
        super().__init__(threshold=threshold)

    def evaluate(
        self,
        input_text: str,
        output_text: str,
        expected_output: Optional[str] = None,
        context: Optional[Any] = None,
        latency_ms: float = 0.0,
    ) -> EvaluationResultSchema:
        reference = str(context) if context else (expected_output or input_text)
        similarity = calculate_cosine_similarity(output_text, reference)
        
        # Hallucination rate is inverse of groundedness
        hallucination_score = max(0.0, 1.0 - similarity)
        passed = hallucination_score <= self.threshold

        return EvaluationResultSchema(
            metric_name="hallucination",
            score=round(hallucination_score, 4),
            passed=passed,
            confidence=0.8,
            reason=f"Hallucination probability rate is {hallucination_score:.2f} (max threshold: {self.threshold}).",
            details={"groundedness_similarity": similarity, "hallucination_score": hallucination_score}
        )
