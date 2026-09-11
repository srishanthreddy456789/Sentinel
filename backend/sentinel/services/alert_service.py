import uuid
import logging
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

class AlertRecord(BaseModel):
    alert_id: str = Field(default_factory=lambda: f"alert-{uuid.uuid4()}")
    alert_type: str  # quality_degradation, high_hallucination_rate, toxicity_increase, latency_sla_violation, model_unavailable, healing_failure, evaluation_gate_failure
    severity: str = "HIGH"  # CRITICAL, HIGH, MEDIUM, LOW
    message: str
    target_component: str = "evaluator"
    details: Dict[str, Any] = Field(default_factory=dict)
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    acknowledged: bool = False

    def to_dict(self) -> Dict[str, Any]:
        return {
            "alert_id": self.alert_id,
            "alert_type": self.alert_type,
            "severity": self.severity,
            "message": self.message,
            "target_component": self.target_component,
            "details": self.details,
            "created_at": self.created_at,
            "acknowledged": self.acknowledged,
        }

class AlertService:
    """
    Centralized Configurable Alerting Service for SENTINEL.
    Monitors system health, evaluation degradation, safety violations, and worker failures.
    """
    def __init__(self):
        self._alerts_history: List[AlertRecord] = []

    def trigger_alert(
        self,
        alert_type: str,
        message: str,
        severity: str = "HIGH",
        target_component: str = "evaluator",
        details: Optional[Dict[str, Any]] = None,
    ) -> AlertRecord:
        record = AlertRecord(
            alert_type=alert_type,
            severity=severity,
            message=message,
            target_component=target_component,
            details=details or {},
        )
        self._alerts_history.insert(0, record)
        logger.warning(f"ALERT TRIGGERED [{alert_type.upper()} - {severity}]: {message}")
        return record

    def check_and_alert_evaluation(self, eval_dict: Dict[str, Any]):
        """Evaluates an evaluation result dictionary against alert criteria."""
        score = eval_dict.get("overall_score", 1.0)
        hallucination = eval_dict.get("hallucination", 0.0)
        toxicity = eval_dict.get("toxicity", 0.0)
        latency = eval_dict.get("latency_ms", 0.0)

        if score < 0.60:
            self.trigger_alert(
                alert_type="quality_degradation",
                message=f"Overall evaluation quality score dropped to {score:.2f} (below 0.60 threshold).",
                severity="HIGH",
                details={"overall_score": score},
            )

        if hallucination > 0.35:
            self.trigger_alert(
                alert_type="high_hallucination_rate",
                message=f"High hallucination probability detected ({hallucination:.2f}).",
                severity="HIGH",
                details={"hallucination_score": hallucination},
            )

        if toxicity > 0.10:
            self.trigger_alert(
                alert_type="toxicity_increase",
                message=f"Toxicity policy violation detected ({toxicity:.2f}).",
                severity="CRITICAL",
                details={"toxicity_score": toxicity},
            )

        if latency > 3000.0:
            self.trigger_alert(
                alert_type="latency_sla_violation",
                message=f"Latency SLA violation: request took {latency:.1f}ms (threshold 3000ms).",
                severity="MEDIUM",
                details={"latency_ms": latency},
            )

    def get_alert_history(self, limit: int = 50) -> List[Dict[str, Any]]:
        return [a.to_dict() for a in self._alerts_history[:limit]]

    def acknowledge_alert(self, alert_id: str) -> bool:
        for alert in self._alerts_history:
            if alert.alert_id == alert_id:
                alert.acknowledged = True
                return True
        return False

alert_service = AlertService()
