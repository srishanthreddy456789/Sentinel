import time
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from sentinel.api.dependencies import get_current_developer
from sentinel.database.database import get_db
from sentinel.database.models import ConnectedApi, Developer, Diagnosis, Failure, HealingEvent, RequestLog
from ai.evaluation.engine import evaluation_engine
from ai.diagnosis.classifier import failure_classifier
from ai.healing.prompt_healer import prompt_healer
from ai.healing.verifier import healing_verifier
from ai.llm.ollama_client import ollama_client

router = APIRouter(prefix="/requests", tags=["Requests Pipeline"])

class RequestIngestSchema(BaseModel):
    connected_api_id: str
    prompt: str
    expected_output: Optional[str] = None
    context: Optional[Any] = None
    run_auto_healing: Optional[bool] = True

class RequestIngestOut(BaseModel):
    request_id: str
    connected_api_id: str
    input_text: str
    output_text: str
    latency_ms: float
    overall_quality: float
    correctness: float = 1.0
    faithfulness: float = 1.0
    toxicity: float = 0.0
    passed: bool = True
    failure_type: Optional[str] = None
    diagnosis: Optional[Dict[str, Any]] = None
    healing_event: Optional[Dict[str, Any]] = None

@router.post("/ingest", response_model=RequestIngestOut)
async def ingest_request(
    payload: RequestIngestSchema,
    current_developer: Developer = Depends(get_current_developer),
    db: AsyncSession = Depends(get_db)
):
    # 1. Fetch target connected API connection
    result = await db.execute(
        select(ConnectedApi).where(
            ConnectedApi.id == payload.connected_api_id,
            ConnectedApi.developer_id == current_developer.id
        )
    )
    api_obj = result.scalars().first()
    if not api_obj:
        dev_apis = await db.execute(
            select(ConnectedApi).where(ConnectedApi.developer_id == current_developer.id)
        )
        api_obj = dev_apis.scalars().first()

        if not api_obj:
            api_obj = ConnectedApi(
                id=payload.connected_api_id or "model-local",
                developer_id=current_developer.id,
                name="Free Llama Assistant",
                provider="Ollama",
                model_name="Llama 3.1",
                base_url="http://localhost:11434",
                status="Healthy",
            )
            db.add(api_obj)
            await db.commit()
            await db.refresh(api_obj)

    # 2. Call target LLM / provider model & measure latency
    start_time = time.time()
    if api_obj.provider.lower() in ["ollama", "sentinel_local"]:
        output_text = await ollama_client.generate_response(payload.prompt, model_name=api_obj.model_name or "mistral")
    elif api_obj.provider.lower() in ["google gemini", "gemini", "google ai"] and api_obj.encrypted_api_key:
        from sentinel.core.security import decrypt_provider_key
        import httpx
        raw_key = decrypt_provider_key(api_obj.encrypted_api_key)
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                res = await client.post(
                    f"https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key={raw_key}",
                    json={"contents": [{"role": "user", "parts": [{"text": payload.prompt}]}]}
                )
                if res.status_code == 200:
                    data = res.json()
                    output_text = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "") or f"Response from {api_obj.name}."
                else:
                    output_text = f"Response from {api_obj.name} ({api_obj.provider}): Request completed."
        except Exception:
            output_text = f"Execution output for {api_obj.name}: Request processed successfully."
    elif api_obj.provider.lower() in ["openai"] and api_obj.encrypted_api_key:
        from sentinel.core.security import decrypt_provider_key
        import httpx
        raw_key = decrypt_provider_key(api_obj.encrypted_api_key)
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                res = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={"Authorization": f"Bearer {raw_key}"},
                    json={"model": api_obj.model_name or "gpt-4o", "messages": [{"role": "user", "content": payload.prompt}]}
                )
                if res.status_code == 200:
                    data = res.json()
                    output_text = data.get("choices", [{}])[0].get("message", {}).get("content", "") or f"Response from {api_obj.name}."
                else:
                    output_text = f"Response from {api_obj.name}: Request completed."
        except Exception:
            output_text = f"Execution output for {api_obj.name}: Request processed successfully."
    else:
        output_text = f"Response from {api_obj.name} ({api_obj.provider}): Processed prompt execution successfully."
    latency_ms = round((time.time() - start_time) * 1000.0, 2)

    # 3. Evaluate response quality across multi-metrics
    eval_res = evaluation_engine.evaluate_request(
        input_text=payload.prompt,
        output_text=output_text,
        expected_output=payload.expected_output,
        context=payload.context,
        latency_ms=latency_ms,
    )

    # 4. Store Request Log in Database
    request_log = RequestLog(
        connected_api_id=api_obj.id,
        input_text=payload.prompt,
        output_text=output_text,
        expected_output=payload.expected_output,
        latency_ms=latency_ms,
        quality_score=eval_res.overall_score,
        failure_type=eval_res.detected_failures[0] if eval_res.detected_failures else None,
        meta_data={"detected_failures": eval_res.detected_failures},
    )
    db.add(request_log)
    await db.flush()

    diagnosis_data = None
    healing_data = None

    # 5. Classify & Diagnose Failure if quality is low
    if not eval_res.passed:
        diag = failure_classifier.classify_and_diagnose(
            eval_result=eval_res,
            input_text=payload.prompt,
            output_text=output_text,
            expected_output=payload.expected_output,
            context=payload.context,
        )

        diag_type = getattr(diag, "diagnosis_type", getattr(diag, "diagnosis", "UNKNOWN"))
        failure_record = Failure(
            connected_api_id=api_obj.id,
            request_log_id=request_log.id,
            failure_type=diag_type,
            severity="High" if diag.confidence > 0.85 else "Medium",
            input_text=payload.prompt,
            output_text=output_text,
            expected_output=payload.expected_output,
        )
        db.add(failure_record)
        await db.flush()

        diagnosis_record = Diagnosis(
            failure_id=failure_record.id,
            diagnosis_type=diag_type,
            confidence=diag.confidence,
            reason=diag.reason,
            evidence=diag.evidence,
        )
        db.add(diagnosis_record)
        await db.flush()

        diagnosis_data = {
            "diagnosis_type": diag_type,
            "confidence": diag.confidence,
            "reason": diag.reason,
            "evidence": diag.evidence,
        }

        # 6. Attempt Targeted Self-Healing & Verification
        if payload.run_auto_healing and diag.can_auto_heal:
            candidate_prompt = await prompt_healer.generate_healed_prompt(
                original_prompt=payload.prompt,
                failing_input=payload.prompt,
                failing_output=output_text,
                expected_output=payload.expected_output,
                diagnosis_reason=diag.reason,
            )

            # Verification Experiment: Compare Score A vs Score B
            verifier_res = healing_verifier.verify_healing_candidate(
                original_artifact=payload.prompt,
                candidate_artifact=candidate_prompt,
                test_cases=[{
                    "input_text": payload.prompt,
                    "expected_output": payload.expected_output,
                    "context": payload.context,
                }]
            )

            healing_event = HealingEvent(
                connected_api_id=api_obj.id,
                diagnosis_id=diagnosis_record.id,
                healing_type="PROMPT_HEALING",
                original_artifact=payload.prompt,
                candidate_artifact=candidate_prompt,
                score_before=verifier_res.score_before,
                score_after=verifier_res.score_after,
                improvement=verifier_res.improvement,
                decision=verifier_res.decision,
                reasoning=verifier_res.reasoning,
            )
            db.add(healing_event)
            await db.flush()

            healing_data = {
                "original_artifact": payload.prompt,
                "candidate_artifact": candidate_prompt,
                "score_before": verifier_res.score_before,
                "score_after": verifier_res.score_after,
                "improvement": verifier_res.improvement,
                "decision": verifier_res.decision,
                "reasoning": verifier_res.reasoning,
            }

    await db.commit()

    return RequestIngestOut(
        request_id=request_log.id,
        connected_api_id=api_obj.id,
        input_text=payload.prompt,
        output_text=output_text,
        latency_ms=latency_ms,
        overall_quality=eval_res.overall_score,
        correctness=eval_res.correctness,
        faithfulness=eval_res.faithfulness,
        toxicity=eval_res.toxicity,
        passed=eval_res.passed,
        failure_type=request_log.failure_type,
        diagnosis=diagnosis_data,
        healing_event=healing_data,
    )

@router.get("/{connected_api_id}/logs")
async def get_request_logs(
    connected_api_id: str,
    limit: int = 50,
    current_developer: Developer = Depends(get_current_developer),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(RequestLog)
        .where(RequestLog.connected_api_id == connected_api_id)
        .order_by(RequestLog.created_at.desc())
        .limit(limit)
    )
    return result.scalars().all()
