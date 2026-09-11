import asyncio
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sentinel.workers.job_manager import job_manager

async def test_job_manager():
    print("Testing RedisJobManager enqueuing & retrieval...")
    job = await job_manager.enqueue_job(
        queue_name="evaluation_queue",
        job_type="SUITE_EVALUATION",
        payload={"suite_id": "suite-test-01", "run_id": "run-test-01"},
        api_connection_id="model-local",
        evaluation_run_id="run-test-01"
    )
    assert job["job_id"].startswith("job-"), "Job ID should start with job-"
    assert job["status"] == "QUEUED", "Job status should be QUEUED"
    
    status = await job_manager.get_job_status(job["job_id"])
    assert status["job_id"] == job["job_id"], "Fetched job ID should match"
    print(f"Enqueued and fetched job successfully: {status['job_id']} (Status: {status['status']})")
    
    updated = await job_manager.update_job_status(job["job_id"], "COMPLETED", result={"score": 0.95})
    assert updated["status"] == "COMPLETED", "Job status should update to COMPLETED"
    print(f"Updated job status successfully: {updated['job_id']} (Status: {updated['status']}, Result: {updated['result']})")
    await job_manager.close()
    print("Phase 2 RedisJobManager test PASSED!")

if __name__ == "__main__":
    asyncio.run(test_job_manager())
