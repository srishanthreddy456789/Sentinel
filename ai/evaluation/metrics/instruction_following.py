import logging
import re
from typing import Any, Dict, List, Optional
from sentinel.core.config import settings
from ai.evaluation.metrics.base import BaseMetric, EvaluationResultSchema

logger = logging.getLogger(__name__)

class InstructionFollowingMetric(BaseMetric):
    """Evaluates whether the LLM output follows structural and formatting constraints specified in the prompt."""
    def __init__(self, threshold: Optional[float] = None):
        super().__init__(threshold=threshold or 0.80)

    def evaluate(
        self,
        input_text: str,
        output_text: str,
        expected_output: Optional[str] = None,
        context: Optional[Any] = None,
        latency_ms: float = 0.0,
    ) -> EvaluationResultSchema:
        if not output_text or not output_text.strip():
            return EvaluationResultSchema(
                metric_name="instruction_following",
                score=0.0,
                passed=False,
                confidence=1.0,
                reason="Output text is empty.",
                evidence=["Empty output text"],
                details={}
            )

        rules_checked = 0
        rules_passed = 0
        evidence: List[str] = []

        lower_input = input_text.lower()
        lower_output = output_text.lower()

        # Check JSON format request
        if "json" in lower_input:
            rules_checked += 1
            if ("{" in output_text and "}" in output_text) or ("[" in output_text and "]" in output_text):
                rules_passed += 1
                evidence.append("Matched requested JSON output structure")
            else:
                evidence.append("Failed requested JSON output structure")

        # Check list/bullet format request
        if "list" in lower_input or "bullet" in lower_input:
            rules_checked += 1
            if re.search(r"^\s*[-*•\d+.]", output_text, re.MULTILINE):
                rules_passed += 1
                evidence.append("Matched bullet/list format request")
            else:
                evidence.append("Failed bullet/list format request")

        # Check word count constraint (e.g. under X words)
        word_match = re.search(r"under (\d+) words|less than (\d+) words", lower_input)
        if word_match:
            limit = int(word_match.group(1) or word_match.group(2))
            rules_checked += 1
            actual_words = len(output_text.split())
            if actual_words <= limit:
                rules_passed += 1
                evidence.append(f"Passed word limit constraint ({actual_words} <= {limit} words)")
            else:
                evidence.append(f"Exceeded word limit constraint ({actual_words} > {limit} words)")

        # If no specific formatting instructions detected, default check length and coherence
        if rules_checked == 0:
            score = 0.90 if len(output_text.strip()) > 10 else 0.50
            passed = score >= self.threshold
            return EvaluationResultSchema(
                metric_name="instruction_following",
                score=score,
                passed=passed,
                confidence=0.7,
                reason="No explicit formatting constraints detected in input prompt.",
                evidence=["General output length check"],
                details={"rules_checked": 0}
            )

        score = round(rules_passed / rules_checked, 4)
        passed = score >= self.threshold

        return EvaluationResultSchema(
            metric_name="instruction_following",
            score=score,
            passed=passed,
            confidence=0.85,
            reason=f"Passed {rules_passed}/{rules_checked} explicit prompt instruction constraints (score: {score:.2f}).",
            evidence=evidence,
            details={"rules_passed": rules_passed, "rules_checked": rules_checked}
        )
