import logging
from typing import Any, Dict, Optional
from sentinel.core.config import settings

logger = logging.getLogger(__name__)

class MLflowService:
    """
    Centralized, reusable service for MLflow experiment tracking.
    Logs parameters, metrics, prompt versions, dataset versions, evaluator versions, and healing runs.
    Provides graceful fallback when MLflow tracking server is unreachable.
    """
    def __init__(self, tracking_uri: Optional[str] = None):
        self.tracking_uri = tracking_uri or getattr(settings, "MLFLOW_TRACKING_URI", "http://localhost:5000")
        self._mlflow = None
        self._initialized = False

    def _get_mlflow(self):
        if not self._initialized:
            try:
                import mlflow
                mlflow.set_tracking_uri(self.tracking_uri)
                self._mlflow = mlflow
                self._initialized = True
            except Exception as e:
                logger.warning(f"MLflow client unavailable ({e}). Experiments will log to local fallback.")
                self._mlflow = None
                self._initialized = True
        return self._mlflow

    def log_evaluation_run(
        self,
        experiment_name: str,
        run_name: str,
        params: Dict[str, Any],
        metrics: Dict[str, float],
        tags: Optional[Dict[str, str]] = None,
    ) -> Optional[str]:
        """Logs an evaluation run with model, prompt version, dataset version, evaluator version, and metrics."""
        mf = self._get_mlflow()
        if not mf:
            logger.info(f"[MLflow Fallback Log] Experiment: '{experiment_name}', Run: '{run_name}', Params: {params}, Metrics: {metrics}")
            return "local-fallback-run-id"

        try:
            mf.set_experiment(experiment_name)
            with mf.start_run(run_name=run_name) as run:
                # Log Parameters
                for k, v in params.items():
                    mf.log_param(k, str(v))
                
                # Log Metrics
                for k, v in metrics.items():
                    if isinstance(v, (int, float)):
                        mf.log_metric(k, float(v))

                # Log Tags
                if tags:
                    mf.set_tags(tags)
                
                logger.info(f"MLflow run {run.info.run_id} logged successfully for experiment {experiment_name}.")
                return run.info.run_id
        except Exception as e:
            logger.warning(f"Failed to log run to MLflow server: {e}")
            return "local-fallback-run-id"

    def log_healing_experiment(
        self,
        experiment_name: str,
        original_prompt_version: str,
        candidate_prompt_version: str,
        score_before: float,
        score_after: float,
        improvement: float,
        decision: str,
        model: str,
        diagnosis: str = "PROMPT_QUALITY",
    ) -> Optional[str]:
        """Logs a prompt self-healing experiment and verification gate outcome."""
        params = {
            "original_prompt_version": original_prompt_version,
            "candidate_prompt_version": candidate_prompt_version,
            "model": model,
            "diagnosis": diagnosis,
            "decision": decision,
            "evaluator_version": "v2.0.0",
        }
        metrics = {
            "score_before": score_before,
            "score_after": score_after,
            "improvement": improvement,
            "promoted": 1.0 if decision == "PROMOTE" else 0.0,
        }
        tags = {
            "task_type": "self_healing",
            "decision": decision,
        }
        return self.log_evaluation_run(
            experiment_name=experiment_name,
            run_name=f"Healing-{original_prompt_version}-to-{candidate_prompt_version}",
            params=params,
            metrics=metrics,
            tags=tags,
        )

mlflow_service = MLflowService()
