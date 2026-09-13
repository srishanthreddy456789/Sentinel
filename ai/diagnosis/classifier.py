import logging
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

from sentinel.core.config import settings
from ai.evaluation.engine import AggregateEvaluationResult
from ai.diagnosis.historical_analyzer import historical_failure_analyzer

logger = logging.getLogger(__name__)

class DiagnosisResultSchema(BaseModel):
    diagnosis: str  # PROMPT_QUALITY, PROMPT_AMBIGUITY, RETRIEVAL_FAILURE, KNOWLEDGE_GAP, MODEL_WEAKNESS, HALLUCINATION, FAITHFULNESS_FAILURE, CONSISTENCY_FAILURE, TOXICITY, LATENCY, UNKNOWN
    confidence: float = Field(ge=0.0, le=1.0)
    reason: str
    evidence: Dict[str, Any] = Field(default_factory=dict)
    can_auto_heal: bool = False

    @property
    def diagnosis_type(self) -> str:
        return self.diagnosis

    def to_dict(self) -> Dict[str, Any]:
        return {
            "diagnosis": self.diagnosis,
            "diagnosis_type": self.diagnosis,
            "confidence": self.confidence,
            "reason": self.reason,
            "evidence": self.evidence,
            "can_auto_heal": self.can_auto_heal,
        }

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
        
        latency_sla = getattr(settings, "EVAL_LATENCY_SLA_MS", 2000.0)
        min_samples = getattr(settings, "MODEL_WEAKNESS_MIN_SAMPLES", 30)
        min_confidence = getattr(settings, "DIAGNOSIS_MIN_CONFIDENCE", 0.70)

        # 1. Toxicity Check
        toxicity_threshold = getattr(settings, "EVAL_TOXICITY_THRESHOLD", 0.10)
        if eval_result.toxicity > toxicity_threshold:
            return DiagnosisResultSchema(
                diagnosis="TOXICITY",
                confidence=0.95,
                reason="Safety policy violation: output text contained toxic or inappropriate vocabulary.",
                evidence={"toxicity_score": eval_result.toxicity, "threshold": toxicity_threshold},
                can_auto_heal=False,
            )

        # 2. Latency SLA Check
        if eval_result.latency_ms > latency_sla:
            return DiagnosisResultSchema(
                diagnosis="LATENCY",
                confidence=0.90,
                reason=f"Request latency ({eval_result.latency_ms:.1f}ms) exceeded SLA threshold ({latency_sla}ms).",
                evidence={"latency_ms": eval_result.latency_ms, "sla_limit_ms": latency_sla},
                can_auto_heal=False,
            )

        # 3. RAG / Context Grounding & Knowledge Gap Evaluation
        if context is not None:
            context_str = str(context)
            if len(context_str.strip()) < 20 or "no context" in context_str.lower():
                return DiagnosisResultSchema(
                    diagnosis="KNOWLEDGE_GAP",
                    confidence=0.85,
                    reason="Retrieved knowledge base context was empty or missing required domain facts.",
                    evidence={
                        "context_length": len(context_str),
                        "faithfulness_score": eval_result.faithfulness,
                        "retrieval_score": eval_result.retrieval_relevance,
                    },
                    can_auto_heal=True,
                )
            
            if eval_result.retrieval_relevance < getattr(settings, "RAG_SIMILARITY_THRESHOLD", 0.60) or eval_result.faithfulness < getattr(settings, "EVAL_FAITHFULNESS_THRESHOLD", 0.60):
                return DiagnosisResultSchema(
                    diagnosis="RETRIEVAL_FAILURE",
                    confidence=0.88,
                    reason="Retrieved passages were weakly relevant or failed to provide grounded evidence for the prompt.",
                    evidence={
                        "retrieval_score": eval_result.retrieval_relevance,
                        "faithfulness_score": eval_result.faithfulness,
                        "historical_failure_rate": historical_failure_rate,
                    },
                    can_auto_heal=True,
                )

        # 4. Model Weakness Detection (Multi-sample statistical check)
        if historical_samples_count >= min_samples and historical_failure_rate >= 0.50:
            return DiagnosisResultSchema(
                diagnosis="MODEL_WEAKNESS",
                confidence=0.85,
                reason=f"Model consistently fails on this task domain ({historical_failure_rate*100:.1f}% failure rate across {historical_samples_count} sample runs).",
                evidence={
                    "historical_samples": historical_samples_count,
                    "historical_failure_rate": historical_failure_rate,
                    "min_samples_threshold": min_samples,
                },
                can_auto_heal=False,
            )

        # 5. Prompt Ambiguity vs Prompt Quality
        if eval_result.correctness < getattr(settings, "EVAL_CORRECTNESS_THRESHOLD", 0.75):
            input_words = input_text.split()
            has_question_mark = "?" in input_text
            
            if len(input_words) < 4 and not has_question_mark:
                return DiagnosisResultSchema(
                    diagnosis="PROMPT_AMBIGUITY",
                    confidence=0.85,
                    reason="Input prompt is overly terse, vague, or lacks clear directives.",
                    evidence={
                        "input_word_count": len(input_words),
                        "has_question_mark": has_question_mark,
                        "correctness_score": eval_result.correctness,
                    },
                    can_auto_heal=True,
                )
            else:
                return DiagnosisResultSchema(
                    diagnosis="PROMPT_QUALITY",
                    confidence=0.80,
                    reason="Prompt instructions failed to elicit the expected output format or exact requirements.",
                    evidence={
                        "correctness_score": eval_result.correctness,
                        "expected_output_present": expected_output is not None,
                        "instruction_following_score": eval_result.instruction_following,
                    },
                    can_auto_heal=True,
                )

        # 6. Hallucination Check
        if eval_result.hallucination > getattr(settings, "EVAL_HALLUCINATION_THRESHOLD", 0.30):
            return DiagnosisResultSchema(
                diagnosis="HALLUCINATION",
                confidence=0.82,
                reason="Generated response contained ungrounded or unsupported claims.",
                evidence={"hallucination_score": eval_result.hallucination},
                can_auto_heal=True,
            )

        # 7. Faithfulness Failure Check
        if eval_result.faithfulness < getattr(settings, "EVAL_FAITHFULNESS_THRESHOLD", 0.60):
            return DiagnosisResultSchema(
                diagnosis="FAITHFULNESS_FAILURE",
                confidence=0.80,
                reason="Response diverged from reference context facts.",
                evidence={"faithfulness_score": eval_result.faithfulness},
                can_auto_heal=True,
            )

        # 8. Consistency Failure Check
        if eval_result.consistency < getattr(settings, "EVAL_CONSISTENCY_THRESHOLD", 0.70):
            return DiagnosisResultSchema(
                diagnosis="CONSISTENCY_FAILURE",
                confidence=0.80,
                reason="Output exhibited internal logical contradiction or repetitive loops.",
                evidence={"consistency_score": eval_result.consistency},
                can_auto_heal=True,
            )

        # Fallback for uncertain / unclassified edge cases
        return DiagnosisResultSchema(
            diagnosis="UNKNOWN",
            confidence=0.50,
            reason="Insufficient evidence to unambiguously categorize the failure mode.",
            evidence={"overall_score": eval_result.overall_score},
            can_auto_heal=False,
        )

# Global failure classifier instance
failure_classifier = FailureClassifier()
