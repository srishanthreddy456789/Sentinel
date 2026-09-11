import logging
from typing import Any, Dict, List, Optional
from sentinel.core.config import settings
from ai.evaluation.metrics.base import BaseMetric, EvaluationResultSchema
from ai.evaluation.metrics.correctness import calculate_cosine_similarity

logger = logging.getLogger(__name__)

class RetrievalRelevanceMetric(BaseMetric):
    """Evaluates the relevance of retrieved context documents to the user input query."""
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
                metric_name="retrieval_relevance",
                score=1.0,
                passed=True,
                confidence=0.5,
                reason="No retrieval context provided for evaluation.",
                evidence=[],
                details={"context_provided": False}
            )

        passages: List[str] = []
        if isinstance(context, list):
            passages = [str(item) for item in context]
        elif isinstance(context, dict):
            passages = [str(v) for v in context.values()]
        else:
            passages = [str(context)]

        if not passages:
            return EvaluationResultSchema(
                metric_name="retrieval_relevance",
                score=0.0,
                passed=False,
                confidence=0.9,
                reason="Empty context list provided.",
                evidence=[],
                details={"context_provided": True, "passage_count": 0}
            )

        scores: List[float] = []
        evidence: List[Dict[str, Any]] = []

        for idx, passage in enumerate(passages):
            sim = calculate_cosine_similarity(input_text, passage)
            scores.append(sim)
            evidence.append({
                "passage_index": idx,
                "passage_snippet": passage[:120] + "..." if len(passage) > 120 else passage,
                "relevance_score": round(sim, 4)
            })

        avg_score = round(sum(scores) / len(scores), 4) if scores else 0.0
        passed = avg_score >= self.threshold

        return EvaluationResultSchema(
            metric_name="retrieval_relevance",
            score=avg_score,
            passed=passed,
            confidence=0.85,
            reason=f"Average retrieval relevance score is {avg_score:.2f} across {len(passages)} context passages (threshold: {self.threshold}).",
            evidence=evidence,
            details={"passage_count": len(passages), "individual_scores": scores}
        )
