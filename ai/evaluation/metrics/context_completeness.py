import logging
from typing import Any, Dict, List, Optional
from sentinel.core.config import settings
from ai.evaluation.metrics.base import BaseMetric, EvaluationResultSchema
from ai.evaluation.metrics.correctness import calculate_cosine_similarity

logger = logging.getLogger(__name__)

class ContextCompletenessMetric(BaseMetric):
    """Evaluates whether retrieved context provides sufficient information to cover the prompt requirements."""
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
            return EvaluationResultSchema(
                metric_name="context_completeness",
                score=1.0,
                passed=True,
                confidence=0.5,
                reason="No context required or provided.",
                evidence=[],
                details={"context_provided": False}
            )

        context_str = str(context)
        # Coverage is evaluated by checking how well context aligns with query topics & expected output key phrases
        ref_text = expected_output or input_text
        coverage_score = calculate_cosine_similarity(ref_text, context_str)
        passed = coverage_score >= self.threshold

        return EvaluationResultSchema(
            metric_name="context_completeness",
            score=round(coverage_score, 4),
            passed=passed,
            confidence=0.8,
            reason=f"Context completeness coverage score is {coverage_score:.2f} (threshold: {self.threshold}).",
            evidence=[{"context_length": len(context_str), "coverage_score": coverage_score}],
            details={"context_length": len(context_str)}
        )
