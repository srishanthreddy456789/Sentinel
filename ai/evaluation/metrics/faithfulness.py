from typing import Any, Dict, Optional
from sentinel.core.config import settings
from ai.evaluation.metrics.base import BaseMetric, EvaluationResultSchema
from ai.evaluation.metrics.correctness import calculate_cosine_similarity

class FaithfulnessMetric(BaseMetric):
    """Evaluates whether generated claims are grounded in retrieved contexts/references."""
    def __init__(self, threshold: Optional[float] = None):
        super().__init__(threshold=threshold or getattr(settings, "RAG_SIMILARITY_THRESHOLD", 0.60))

    def evaluate(
        self,
        input_text: str,
        output_text: str,
        expected_output: Optional[str] = None,
        context: Optional[Any] = None,
        latency_ms: float = 0.0,
    ) -> EvaluationResultSchema:
        if not context:
            # If no context, evaluate against expected output or pass with medium confidence
            ref_text = expected_output or input_text
            score = calculate_cosine_similarity(output_text, ref_text)
            passed = score >= self.threshold
            return EvaluationResultSchema(
                metric_name="faithfulness",
                score=round(score, 4),
                passed=passed,
                confidence=0.7,
                reason=f"Faithfulness evaluated against input/reference (score: {score:.2f}).",
                details={"context_present": False}
            )

        context_str = str(context)
        similarity = calculate_cosine_similarity(output_text, context_str)
        passed = similarity >= self.threshold

        return EvaluationResultSchema(
            metric_name="faithfulness",
            score=round(similarity, 4),
            passed=passed,
            confidence=0.85,
            reason=f"Context faithfulness score is {similarity:.2f} (threshold: {self.threshold}).",
            details={"context_present": True, "similarity": similarity}
        )
