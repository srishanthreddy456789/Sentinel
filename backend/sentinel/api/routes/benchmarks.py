from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from sentinel.api.dependencies import get_current_developer
from sentinel.database.models import Developer
from ai.benchmarks.benchmark_framework import BenchmarkRunner

router = APIRouter(prefix="/benchmarks", tags=["Research Benchmarks"])

class BenchmarkRunRequestSchema(BaseModel):
    benchmark_name: Optional[str] = "SENTINEL-8-Category-Master-Suite"
    sample_count: Optional[int] = 10

class BenchmarkSummaryOut(BaseModel):
    benchmark_name: str
    total_samples: int
    categories: List[str]
    configurations: Dict[str, Dict[str, Any]]
    passed_configurations: List[str]

@router.post("/run")
async def run_benchmark(
    payload: BenchmarkRunRequestSchema,
    current_developer: Developer = Depends(get_current_developer),
):
    runner = BenchmarkRunner()
    results = runner.run_all_benchmarks()
    return {
        "status": "success",
        "benchmark_name": payload.benchmark_name,
        "sample_count": payload.sample_count,
        "results": results,
    }

@router.get("/summary", response_model=BenchmarkSummaryOut)
async def get_benchmark_summary(
    current_developer: Developer = Depends(get_current_developer),
):
    runner = BenchmarkRunner()
    results = runner.run_all_benchmarks()
    configs = results.get("configurations", {})
    passed = [cfg for cfg, data in configs.items() if data.get("overall_score", 0) >= 0.75]
    
    return BenchmarkSummaryOut(
        benchmark_name="SENTINEL-8-Category-Master-Suite",
        total_samples=results.get("total_samples", 800),
        categories=[
            "rag_grounding", "instruction_following", "hallucination_prevention",
            "toxicity_safety", "consistency", "latency_optimization",
            "self_healing_verification", "ci_gate_compliance"
        ],
        configurations=configs,
        passed_configurations=passed,
    )
