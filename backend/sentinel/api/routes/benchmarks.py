from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from sentinel.api.dependencies import get_current_developer
from sentinel.database.models import Developer
from ai.benchmarks.benchmark_framework import SentinelBenchmarkFramework

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
    runner = SentinelBenchmarkFramework()
    report = runner.run_benchmark(
        suite_name=payload.benchmark_name or "SENTINEL-Master-Benchmark",
        limit_per_category=payload.sample_count or 10,
    )
    return {
        "status": "success",
        "benchmark_name": payload.benchmark_name,
        "sample_count": payload.sample_count,
        "results": report.to_dict(),
    }

@router.get("/summary", response_model=BenchmarkSummaryOut)
async def get_benchmark_summary(
    current_developer: Developer = Depends(get_current_developer),
):
    runner = SentinelBenchmarkFramework()
    report = runner.run_benchmark(limit_per_category=5)
    cat_scores = report.category_scores
    passed = [cat for cat, score in cat_scores.items() if score >= 0.70]

    return BenchmarkSummaryOut(
        benchmark_name="SENTINEL-8-Category-Master-Suite",
        total_samples=report.total_cases,
        categories=list(cat_scores.keys()),
        configurations={"Master": report.to_dict()},
        passed_configurations=passed,
    )
