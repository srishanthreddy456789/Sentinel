import asyncio
import logging
from sentinel.database.database import AsyncSessionLocal, engine, Base
from sentinel.database.models import Developer, ConnectedApi, TestSuite, TestCase

logger = logging.getLogger(__name__)

async def seed_database():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        # 1. Ensure Default Developer
        dev = await db.get(Developer, "dev-default-001")
        if not dev:
            dev = Developer(
                id="dev-default-001",
                email="developer@sentinel.dev",
                password_hash="demo_password_hash",
                tier="pro",
            )
            db.add(dev)
            await db.flush()

        # 2. Ensure Default Free Llama Model
        local_api = await db.get(ConnectedApi, "model-local")
        if not local_api:
            local_api = ConnectedApi(
                id="model-local",
                developer_id=dev.id,
                name="Free Llama Assistant",
                provider="Ollama",
                model_name="Llama 3.1",
                base_url="http://localhost:11434",
                status="Healthy",
            )
            db.add(local_api)
            await db.flush()

        # 3. Ensure Initial Golden Evaluation Suite
        suite = await db.get(TestSuite, "suite-golden-001")
        if not suite:
            suite = TestSuite(
                id="suite-golden-001",
                connected_api_id="model-local",
                name="SENTINEL Core Quality Benchmark",
                description="Reference golden test suite for evaluating faithfulness, hallucination risk, and correctness.",
            )
            db.add(suite)
            await db.flush()

            initial_cases = [
                TestCase(
                    test_suite_id=suite.id,
                    input_text="What is the capital of France?",
                    expected_output="The capital of France is Paris.",
                    context="France is a country in Western Europe. Its capital and largest city is Paris.",
                ),
                TestCase(
                    test_suite_id=suite.id,
                    input_text="Summarize the company refund policy.",
                    expected_output="Customers are eligible for a full refund within 30 days of purchase with original receipt.",
                    context="SENTINEL Refund Policy: Full refunds are granted within 30 calendar days of original purchase provided proof of purchase is attached.",
                ),
                TestCase(
                    test_suite_id=suite.id,
                    input_text="How does SENTINEL detect hallucinations?",
                    expected_output="SENTINEL extracts claims from responses and verifies claim-to-context grounding using semantic analysis and LLM judges.",
                    context="SENTINEL uses a multi-stage evaluation pipeline: claim extraction, grounding verification against RAG context, and LLM judge scoring.",
                ),
            ]
            db.add_all(initial_cases)

        await db.commit()
        logger.info("Database seeding completed successfully.")

if __name__ == "__main__":
    asyncio.run(seed_database())
