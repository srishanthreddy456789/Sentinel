from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from sentinel.api.dependencies import get_current_developer
from sentinel.database.database import get_db
from sentinel.database.models import (
    ConnectedApi,
    Developer,
    EvaluationResult,
    EvaluationRun,
    TestCase,
    TestSuite,
)
from ai.evaluation.engine import evaluation_engine

router = APIRouter(prefix="/evaluations", tags=["Evaluations & Test Suites"])

class TestSuiteCreateSchema(BaseModel):
    connected_api_id: str
    name: str
    description: Optional[str] = None

class TestCaseCreateSchema(BaseModel):
    input_text: str
    expected_output: Optional[str] = None
    context: Optional[Any] = None
    category: Optional[str] = "general"

@router.get("/suites/{connected_api_id}")
async def list_test_suites(
    connected_api_id: str,
    current_developer: Developer = Depends(get_current_developer),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(TestSuite).where(TestSuite.connected_api_id == connected_api_id)
    )
    return result.scalars().all()

@router.post("/suites")
async def create_test_suite(
    payload: TestSuiteCreateSchema,
    current_developer: Developer = Depends(get_current_developer),
    db: AsyncSession = Depends(get_db)
):
    suite = TestSuite(
        connected_api_id=payload.connected_api_id,
        name=payload.name,
        description=payload.description,
        case_count=0,
    )
    db.add(suite)
    await db.commit()
    await db.refresh(suite)
    return suite

@router.post("/suites/{suite_id}/cases")
async def add_test_case(
    suite_id: str,
    payload: TestCaseCreateSchema,
    current_developer: Developer = Depends(get_current_developer),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(TestSuite).where(TestSuite.id == suite_id))
    suite = result.scalars().first()
    if not suite:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Test suite not found")

    test_case = TestCase(
        test_suite_id=suite.id,
        input_text=payload.input_text,
        expected_output=payload.expected_output,
        context=payload.context,
        category=payload.category or "general",
    )
    db.add(test_case)
    suite.case_count += 1
    await db.commit()
    await db.refresh(test_case)
    return test_case

from sentinel.workers.job_manager import job_manager
from sentinel.workers.evaluation_worker import process_evaluation_job

@router.get("/jobs/{job_id}")
async def get_job_status(job_id: str):
    status = await job_manager.get_job_status(job_id)
    if not status:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    return status

@router.post("/suites/{suite_id}/run")
async def run_evaluation_suite(
    suite_id: str,
    current_developer: Developer = Depends(get_current_developer),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(TestSuite).where(TestSuite.id == suite_id))
    suite = result.scalars().first()
    if not suite:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Test suite not found")

    cases_result = await db.execute(select(TestCase).where(TestCase.test_suite_id == suite.id))
    cases = cases_result.scalars().all()

    if not cases:
        c1 = TestCase(test_suite_id=suite.id, input_text="What are your hours of operation?", expected_output="We are open Monday through Friday from 9 AM to 5 PM EST.")
        c2 = TestCase(test_suite_id=suite.id, input_text="How do I initiate a return?", expected_output="To initiate a return, visit your account orders page and select 'Request Return'.")
        db.add_all([c1, c2])
        await db.commit()

    eval_run = EvaluationRun(
        connected_api_id=suite.connected_api_id,
        test_suite_id=suite.id,
        run_name=f"Run - {suite.name}",
        status="QUEUED",
    )
    db.add(eval_run)
    await db.commit()
    await db.refresh(eval_run)

    # Enqueue job to Redis / memory worker
    job = await job_manager.enqueue_job(
        queue_name="evaluation_queue",
        job_type="SUITE_EVALUATION",
        payload={"suite_id": suite.id, "run_id": eval_run.id},
        api_connection_id=suite.connected_api_id,
        evaluation_run_id=eval_run.id,
    )

    # Spawn background task processing job
    asyncio.create_task(process_evaluation_job(job["job_id"], job["payload"]))

    return {
        "run_id": eval_run.id,
        "job_id": job["job_id"],
        "status": "queued",
        "message": "Evaluation job enqueued successfully.",
    }

@router.get("/runs/{connected_api_id}")
async def list_evaluation_runs(
    connected_api_id: str,
    current_developer: Developer = Depends(get_current_developer),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(EvaluationRun)
        .where(EvaluationRun.connected_api_id == connected_api_id)
        .order_by(EvaluationRun.created_at.desc())
    )
    return result.scalars().all()
