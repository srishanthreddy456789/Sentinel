import logging
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

from ai.evaluation.metrics.base import EvaluationResultSchema
from ai.evaluation.metrics.correctness import CorrectnessMetric
from ai.evaluation.metrics.faithfulness import FaithfulnessMetric
from ai.evaluation.metrics.hallucination import HallucinationMetric
from ai.evaluation.metrics.toxicity import ToxicityMetric
from ai.evaluation.metrics.consistency import ConsistencyMetric
from ai.evaluation.metrics.latency import LatencyMetric
from ai.evaluation.metrics.retrieval_relevance import RetrievalRelevanceMetric
from ai.evaluation.metrics.context_completeness import ContextCompletenessMetric
from ai.evaluation.metrics.instruction_following import InstructionFollowingMetric

logger = logging.getLogger(__name__)

class AggregateEvaluationResult(BaseModel):
    overall_score: float = Field(ge=0.0, le=1.0)
    passed: bool
    correctness: float = 0.0
    faithfulness: float = 0.0
    hallucination: float = 0.0
    consistency: float = 0.0
    toxicity: float = 0.0
    retrieval_relevance: float = 1.0
    context_completeness: float = 1.0
    instruction_following: float = 1.0
    latency_ms: float = 0.0
    metrics: Dict[str, EvaluationResultSchema] = Field(default_factory=dict)
    detected_failures: List[str] = Field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "overall_score": self.overall_score,
            "passed": self.passed,
            "correctness": self.correctness,
            "faithfulness": self.faithfulness,
            "hallucination": self.hallucination,
            "consistency": self.consistency,
            "toxicity": self.toxicity,
            "retrieval_relevance": self.retrieval_relevance,
            "context_completeness": self.context_completeness,
            "instruction_following": self.instruction_following,
            "latency_ms": self.latency_ms,
            "metrics": {k: v.to_dict() for k, v in self.metrics.items()},
            "detected_failures": self.detected_failures,
        }

class EvaluationEngine:
    def __init__(self):
        self.correctness_metric = CorrectnessMetric()
        self.faithfulness_metric = FaithfulnessMetric()
        self.hallucination_metric = HallucinationMetric()
        self.toxicity_metric = ToxicityMetric()
        self.consistency_metric = ConsistencyMetric()
        self.latency_metric = LatencyMetric()
        self.retrieval_relevance_metric = RetrievalRelevanceMetric()
        self.context_completeness_metric = ContextCompletenessMetric()
        self.instruction_following_metric = InstructionFollowingMetric()

    def evaluate_request(
        self,
        input_text: str,
        output_text: str,
        expected_output: Optional[str] = None,
        context: Optional[Any] = None,
        latency_ms: float = 0.0,
    ) -> AggregateEvaluationResult:
        res_correctness = self.correctness_metric.evaluate(input_text, output_text, expected_output, context, latency_ms)
        res_faithfulness = self.faithfulness_metric.evaluate(input_text, output_text, expected_output, context, latency_ms)
        res_hallucination = self.hallucination_metric.evaluate(input_text, output_text, expected_output, context, latency_ms)
        res_toxicity = self.toxicity_metric.evaluate(input_text, output_text, expected_output, context, latency_ms)
        res_consistency = self.consistency_metric.evaluate(input_text, output_text, expected_output, context, latency_ms)
        res_latency = self.latency_metric.evaluate(input_text, output_text, expected_output, context, latency_ms)
        res_retrieval_rel = self.retrieval_relevance_metric.evaluate(input_text, output_text, expected_output, context, latency_ms)
        res_context_comp = self.context_completeness_metric.evaluate(input_text, output_text, expected_output, context, latency_ms)
        res_instruction = self.instruction_following_metric.evaluate(input_text, output_text, expected_output, context, latency_ms)

        metrics_map = {
            "correctness": res_correctness,
            "faithfulness": res_faithfulness,
            "hallucination": res_hallucination,
            "toxicity": res_toxicity,
            "consistency": res_consistency,
            "latency": res_latency,
            "retrieval_relevance": res_retrieval_rel,
            "context_completeness": res_context_comp,
            "instruction_following": res_instruction,
        }

        # Calculate overall quality weighted score:
        # Correctness (30%), Faithfulness (20%), Instruction Following (15%), Consistency (15%), Safety (10%), Latency (10%)
        overall = (
            (res_correctness.score * 0.30) +
            (res_faithfulness.score * 0.20) +
            (res_instruction.score * 0.15) +
            (res_consistency.score * 0.15) +
            ((1.0 - res_toxicity.score) * 0.10) +
            (res_latency.score * 0.10)
        )
        overall_score = round(max(0.0, min(1.0, overall)), 4)

        # Detect specific failures
        detected_failures: List[str] = []
        if not res_correctness.passed:
            detected_failures.append("PROMPT_QUALITY" if not expected_output else "CORRECTNESS_FAILURE")
        if not res_faithfulness.passed:
            detected_failures.append("FAITHFULNESS")
        if not res_hallucination.passed:
            detected_failures.append("HALLUCINATION")
        if not res_toxicity.passed:
            detected_failures.append("TOXICITY")
        if not res_consistency.passed:
            detected_failures.append("CONSISTENCY")
        if not res_latency.passed:
            detected_failures.append("LATENCY")
        if not res_retrieval_rel.passed:
            detected_failures.append("RETRIEVAL_FAILURE")
        if not res_instruction.passed:
            detected_failures.append("INSTRUCTION_FOLLOWING_FAILURE")

        overall_passed = len(detected_failures) == 0 and overall_score >= 0.70

        return AggregateEvaluationResult(
            overall_score=overall_score,
            passed=overall_passed,
            correctness=res_correctness.score,
            faithfulness=res_faithfulness.score,
            hallucination=res_hallucination.score,
            consistency=res_consistency.score,
            toxicity=res_toxicity.score,
            retrieval_relevance=res_retrieval_rel.score,
            context_completeness=res_context_comp.score,
            instruction_following=res_instruction.score,
            latency_ms=latency_ms,
            metrics=metrics_map,
            detected_failures=detected_failures,
        )

# Global evaluation engine singleton
evaluation_engine = EvaluationEngine()
