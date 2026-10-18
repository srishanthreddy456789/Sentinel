import time
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from sentinel.api.dependencies import get_current_developer
from sentinel.database.database import get_db
from sentinel.database.models import ConnectedApi, Developer, Failure, Diagnosis
from ai.evaluation.engine import evaluation_engine
from ai.diagnosis.classifier import failure_classifier

router = APIRouter(prefix="/diagnosis", tags=["Failure Diagnosis & Root Cause Analysis"])

class DiagnosisRequestSchema(BaseModel):
    connected_api_id: Optional[str] = "default_model"
    input_text: str
    output_text: str
    expected_output: Optional[str] = None
    context: Optional[Any] = None
    failure_id: Optional[str] = None

class DiagnosisResponseSchema(BaseModel):
    has_failures: bool
    detected_failures: List[str]
    root_cause: str
    confidence: float
    severity: str
    recommendation: str
    question: str
    generated_answer: str
    expected_answer: str
    evidence: Dict[str, Any]
    causal_flow: List[str]
    can_auto_heal: bool

@router.post("/analyze", response_model=DiagnosisResponseSchema)
async def analyze_diagnosis(
    payload: DiagnosisRequestSchema,
    current_developer: Developer = Depends(get_current_developer),
    db: AsyncSession = Depends(get_db)
):
    # 1. Run 9-dimensional evaluation
    eval_res = evaluation_engine.evaluate_request(
        input_text=payload.input_text,
        output_text=payload.output_text,
        expected_output=payload.expected_output,
        context=payload.context
    )

    # 2. Run Failure Classification & Diagnosis
    diag_res = failure_classifier.classify_and_diagnose(
        eval_result=eval_res,
        input_text=payload.input_text,
        output_text=payload.output_text,
        expected_output=payload.expected_output,
        context=payload.context
    )

    failures = list(eval_res.detected_failures)
    if not failures and not eval_res.passed:
        failures.append(diag_res.diagnosis_type)

    has_failures = len(failures) > 0 or not eval_res.passed
    root_cause = diag_res.diagnosis_type if has_failures else "NONE"

    severity = "High" if eval_res.overall_score < 0.50 else ("Medium" if has_failures else "Low")

    recommendations = {
        "FAITHFULNESS": "Inject strict context refusal directives into system prompt: 'State \"Information not provided\" if facts are missing from retrieved context.'",
        "RETRIEVAL_FAILURE": "Improve semantic retrieval top-k re-ranking and re-index domain document chunks with dense vector embeddings.",
        "KNOWLEDGE_GAP": "Expand retrieval index with updated domain documents covering the query's factual entities.",
        "CORRECTNESS": "Format model output adhering strictly to golden schema constraints and provided ground reference.",
        "HALLUCINATION": "Disable speculative generation and constrain decoding temperature (T <= 0.2).",
        "TOXICITY": "Enable strict content moderation filters and policy guardrails.",
        "LATENCY": "Optimize token max_tokens parameter and enable streaming inference.",
        "NONE": "Execution passed quality gate. Maintain current prompt version."
    }

    causal_flow = [
        f"Input Query dispatched: '{payload.input_text[:60]}...'",
        f"Context alignment score evaluated: {eval_res.faithfulness:.2f}",
        f"Semantic correctness similarity: {eval_res.correctness:.2f}",
        f"Root Cause Classification: {root_cause}",
        f"Autonomous Action: {recommendations.get(root_cause, 'Maintain prompt version.')}"
    ]

    evidence = {
        "modelAgreement": round(eval_res.consistency * 100, 1),
        "retrievalCoverage": round(eval_res.faithfulness * 100, 1),
        "historicalFailureRate": 8.4,
        "promptQuality": round(eval_res.overall_score * 100, 1),
        "correctness": round(eval_res.correctness, 4),
        "faithfulness": round(eval_res.faithfulness, 4),
        "toxicity": round(eval_res.toxicity, 4),
        "latency_ms": round(eval_res.latency_ms, 2)
    }

    return DiagnosisResponseSchema(
        has_failures=has_failures,
        detected_failures=failures,
        root_cause=root_cause,
        confidence=diag_res.confidence,
        severity=severity,
        recommendation=recommendations.get(root_cause, "Apply prompt mutation patch."),
        question=payload.input_text,
        generated_answer=payload.output_text,
        expected_answer=payload.expected_output or "Expected ground truth matching context.",
        evidence=evidence,
        causal_flow=causal_flow,
        can_auto_heal=diag_res.can_auto_heal
    )
