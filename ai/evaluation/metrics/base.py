from abc import ABC, abstractmethod
from typing import Any, Dict, Optional
from pydantic import BaseModel, Field

class EvaluationResultSchema(BaseModel):
    metric_name: str
    score: float = Field(ge=0.0, le=1.0)
    passed: bool
    confidence: float = Field(default=0.8, ge=0.0, le=1.0)
    reason: str = ""
    details: Dict[str, Any] = Field(default_factory=dict)

class BaseMetric(ABC):
    def __init__(self, threshold: float = 0.75):
        self.threshold = threshold

    @abstractmethod
    def evaluate(
        self,
        input_text: str,
        output_text: str,
        expected_output: Optional[str] = None,
        context: Optional[Any] = None,
        latency_ms: float = 0.0,
    ) -> EvaluationResultSchema:
        pass
