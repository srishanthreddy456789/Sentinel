import logging
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

from ai.evaluation.engine import AggregateEvaluationResult

logger = logging.getLogger(__name__)

class DiagnosisResultSchema(BaseModel):
    diagnosis_type: str  # PROMPT_QUALITY, KNOWLEDGE_GAP, RAG_RETRIEVAL, MODEL_WEAKNESS, HALLUCINATION, FAITHFULNESS, CONSISTENCY, TOXICITY, LATENCY, UNKNOWN
    confidence: float = Field(ge=0.0, le=1.0)
    reason: str
    evidence: Dict[str, Any] = Field(default_factory=dict)
    can_auto_heal: bool = False

class FailureClassifier:
    def classify_and_diagnose(
        self,
        eval_result: AggregateEvaluationResult,
        input_text: str,
        output_text: str,
        expected_output: Optional[str] = None,
        context: Optional[Any] = None,
        historical_samples_count: int = 0,
        historical_failure_rate: float = 0.0,
    ) -> DiagnosisResultSchema:
        # Check Toxicity
        if eval_result.toxicity > 0.10:
            return DiagnosisResultSchema(
                diagnosis_type="TOXICITY",
                confidence=0.95,
                reason="Safety evaluator flagged policy-violating or toxic vocabulary in output.",
                evidence={"toxicity_score": eval_result.toxicity},
                can_auto_heal=False,  # Unsafe outputs require user intervention or system refusal prompt
            )

        # Check Latency
        if eval_result.latency_ms > 2500.0:
            return DiagnosisResultSchema(
                diagnosis_type="LATENCY",
                confidence=0.90,
                reason=f"Request latency ({eval_result.latency_ms:.1f}ms) exceeded SLA threshold (2500ms).",
                evidence={"latency_ms": eval_result.latency_ms},
                can_auto_heal=False,
            )

        # Check Context Grounding / RAG / Knowledge Gap vs Retrieval
        if context is not None:
            if eval_result.faithfulness < 0.60 or eval_result.hallucination > 0.30:
                context_str = str(context)
                if len(context_str.strip()) < 20 or "no context" in context_str.lower():
                    return DiagnosisResultSchema(
                        diagnosis_type="KNOWLEDGE_GAP",
                        confidence=0.85,
                        reason="Retrieved knowledge base context was empty or insufficient to answer the query.",
                        evidence={"context_length": len(context_str), "faithfulness": eval_result.faithfulness},
                        can_auto_heal=True,
                    )
                else:
                    return DiagnosisResultSchema(
                        diagnosis_type="RAG_RETRIEVAL",
                        confidence=0.88,
                        reason="Context was present, but top retrieved documents lacked targeted answer facts.",
                        evidence={"faithfulness": eval_result.faithfulness, "hallucination": eval_result.hallucination},
                        can_auto_heal=True,
                    )

        # Check Model Weakness (Requires sample size >= 30 and failure rate > 0.65)
        min_samples = 30
        if historical_samples_count >= min_samples and historical_failure_rate > 0.65:
            return DiagnosisResultSchema(
                diagnosis_type="MODEL_WEAKNESS",
                confidence=0.82,
                reason=f"Model consistently fails on this task category (failure rate: {historical_failure_rate*100:.1f}% across {historical_samples_count} evaluations).",
                evidence={"historical_samples": historical_samples_count, "failure_rate": historical_failure_rate},
                can_auto_heal=False,  # Model weakness recommends alternative model
            )

        # Check Prompt Quality / Ambiguity
        if eval_result.correctness < 0.75:
            # Check prompt vagueness / ambiguity
            is_ambiguous = len(input_text.split()) < 4 or "?" not in input_text
            confidence = 0.85 if is_ambiguous else 0.78
            return DiagnosisResultSchema(
                diagnosis_type="PROMPT_QUALITY",
                confidence=confidence,
                reason="Model output missed expected criteria due to prompt formatting or ambiguity.",
                evidence={
                    "correctness_score": eval_result.correctness,
                    "expected_output": expected_output[:100] if expected_output else None,
                    "input_length": len(input_text),
                },
                can_auto_heal=True,
            )

        # Check Hallucination / Consistency
        if eval_result.hallucination > 0.30:
            return DiagnosisResultSchema(
                diagnosis_type="HALLUCINATION",
                confidence=0.80,
                reason="Response contains unsupported factual assertions relative to context/reference.",
                evidence={"hallucination_score": eval_result.hallucination},
                can_auto_heal=True,
            )

        if eval_result.consistency < 0.70:
            return DiagnosisResultSchema(
                diagnosis_type="CONSISTENCY",
                confidence=0.80,
                reason="Response exhibited logical contradictions or repetitive output loops.",
                evidence={"consistency_score": eval_result.consistency},
                can_auto_heal=True,
            )

        return DiagnosisResultSchema(
            diagnosis_type="UNKNOWN",
            confidence=0.50,
            reason="Failure cause could not be unambiguously categorized with high confidence.",
            evidence={"overall_score": eval_result.overall_score},
            can_auto_heal=False,
        )

# Failure classifier singleton
failure_classifier = FailureClassifier()
