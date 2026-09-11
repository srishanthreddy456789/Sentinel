import logging
from typing import Any, Dict, List, Optional
from sentinel.core.config import settings

logger = logging.getLogger(__name__)

class HistoricalFailureAnalyzer:
    """
    Analyzes historical evaluation runs and request logs to detect systemic failure patterns
    grouped by model, topic/category, suite, prompt version, or failure type.
    """
    def __init__(self, min_samples: Optional[int] = None):
        self.min_samples = min_samples or getattr(settings, "MODEL_WEAKNESS_MIN_SAMPLES", 30)

    def analyze_failure_rates(
        self,
        historical_records: List[Dict[str, Any]],
        group_by: str = "model"
    ) -> Dict[str, Dict[str, Any]]:
        """
        Groups historical failure logs by model, category, or prompt version.
        Returns aggregate metrics: sample_count, failure_count, failure_rate, and confidence.
        """
        groups: Dict[str, Dict[str, int]] = {}

        for rec in historical_records:
            group_key = str(rec.get(group_by, "unknown"))
            if group_key not in groups:
                groups[group_key] = {"sample_count": 0, "failure_count": 0}
            
            groups[group_key]["sample_count"] += 1
            if not rec.get("passed", True):
                groups[group_key]["failure_count"] += 1

        results: Dict[str, Dict[str, Any]] = {}
        for group_key, stats in groups.items():
            samples = stats["sample_count"]
            failures = stats["failure_count"]
            rate = round(failures / max(samples, 1), 4)
            
            # Confidence grows with sample size up to 1.0
            confidence = round(min(1.0, samples / float(self.min_samples)), 2)
            is_weakness = samples >= self.min_samples and rate >= 0.50

            results[group_key] = {
                "group_key": group_key,
                "group_by": group_by,
                "sample_count": samples,
                "failure_count": failures,
                "failure_rate": rate,
                "confidence": confidence,
                "is_model_weakness": is_weakness,
            }

        return results

historical_failure_analyzer = HistoricalFailureAnalyzer()
