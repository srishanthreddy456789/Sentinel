import asyncio
import logging
from typing import Any, Dict
from sentinel.database.database import AsyncSessionLocal
from sentinel.database.models import EvaluationRun, EvaluationResult, TestCase, TestSuite, ConnectedApi
from sentinel.workers.job_manager import job_manager
from ai.evaluation.engine import evaluation_engine
from ai.llm.ollama_client import ollama_client

logger = logging.getLogger(__name__)

async def process_evaluation_job(job_id: str, payload: Dict[str, Any]):
    await job_manager.update_job_status(job_id, "RUNNING")
    suite_id = payload.get("suite_id")
    run_id = payload.get("run_id")

    async with AsyncSessionLocal() as db:
        run = await db.get(EvaluationRun, run_id) if run_id else None
        suite = await db.get(TestSuite, suite_id) if suite_id else None

        if not suite or not run:
            await job_manager.update_job_status(job_id, "FAILED", error="Evaluation suite or run record not found.")
            return

        api_obj = await db.get(ConnectedApi, suite.connected_api_id)
        model_name = api_obj.model_name if api_obj else "mistral"

        # Fetch test cases for suite
        test_cases = (await db.execute(
            TestCase.__table__.select().where(TestCase.test_suite_id == suite.id)
        )).fetchall()

        total_cases = len(test_cases)
        passed_cases = 0
        total_score = 0.0

        for case in test_cases:
            # Generate model completion
            output_text = await ollama_client.generate_response(case.input_text, model_name=model_name)
            
            # Evaluate using EvaluationEngine
            eval_res = evaluation_engine.evaluate_request(
                input_text=case.input_text,
                output_text=output_text,
                expected_output=case.expected_output,
                context=case.context,
                latency_ms=150.0,
            )

            if eval_res.passed:
                passed_cases += 1
            total_score += eval_res.overall_score

            eval_result_record = EvaluationResult(
                evaluation_run_id=run.id,
                test_case_id=case.id,
                output_text=output_text,
                quality_score=eval_res.overall_score,
                passed=eval_res.passed,
                metrics=eval_res.to_dict(),
            )
            db.add(eval_result_record)

        overall_score = round(total_score / max(total_cases, 1), 4)
        run.status = "COMPLETED"
        run.score = overall_score
        run.passed_cases = passed_cases
        run.total_cases = total_cases
        await db.commit()

        result_summary = {
            "evaluation_run_id": run.id,
            "overall_score": overall_score,
            "passed_cases": passed_cases,
            "total_cases": total_cases,
            "pass_rate": round(passed_cases / max(total_cases, 1) * 100, 2),
        }
        await job_manager.update_job_status(job_id, "COMPLETED", result=result_summary)
        logger.info(f"Evaluation job {job_id} completed successfully. Score: {overall_score}")

async def start_evaluation_worker_loop():
    logger.info("Evaluation Worker loop started. Monitoring job queues...")
    while True:
        try:
            # Worker polling logic (Redis queue or memory fallback)
            await asyncio.sleep(1.0)
        except asyncio.CancelledError:
            break
        except Exception as e:
            logger.error(f"Error in evaluation worker loop: {e}")
