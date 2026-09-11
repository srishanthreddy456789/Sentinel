import sys
import os
import json
import argparse
import logging
from pathlib import Path

# Add project root and backend to path
project_root = Path(__file__).resolve().parent.parent
backend_path = project_root / "backend"
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))
if str(backend_path) not in sys.path:
    sys.path.insert(0, str(backend_path))

from ai.benchmarks.benchmark_framework import benchmark_framework, BenchmarkCategory

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("sentinel_benchmark")

def main():
    parser = argparse.ArgumentParser(description="SENTINEL Multi-Category Research Benchmark Framework")
    parser.add_argument("--categories", nargs="+", help="Benchmark categories to run (e.g. 'General QA' 'RAG' 'Safety')")
    parser.add_argument("--limit", type=int, default=10, help="Number of test cases per category (scalable to 500, 1000, 5000+)")
    parser.add_argument("--export-json", help="Path to export benchmark results JSON file")

    args = parser.parse_args()

    logger.info("============================================================")
    logger.info("STARTING SENTINEL RESEARCH BENCHMARK FRAMEWORK RUN")
    logger.info("============================================================")

    report = benchmark_framework.run_benchmark(
        suite_name="SENTINEL Benchmark Suite v2.0",
        categories=args.categories,
        limit_per_category=args.limit,
    )

    logger.info(f"Total Benchmark Test Cases : {report.total_cases}")
    logger.info(f"Passed Test Cases          : {report.passed_cases} ({report.pass_rate}%)")
    logger.info(f"Failed Test Cases          : {report.failed_cases}")
    logger.info(f"Overall Benchmark Quality  : {report.overall_score * 100:.2f}%")
    logger.info(f"Average Latency            : {report.latency_avg_ms:.1f}ms")
    logger.info("--- CATEGORY SCORES ---")
    for cat, score in report.category_scores.items():
        logger.info(f"  - {cat:22s}: {score * 100:.2f}%")

    if args.export_json:
        out_path = Path(args.export_json)
        out_path.parent.mkdir(parents=True, exist_ok=True)
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(report.to_dict(), f, indent=2)
        logger.info(f"Exported benchmark results to '{out_path}'.")

    logger.info("============================================================")
    logger.info("SENTINEL RESEARCH BENCHMARK COMPLETED SUCCESSFULLY")
    logger.info("============================================================")

if __name__ == "__main__":
    main()
