import asyncio
import json
import logging
import uuid
from datetime import datetime
from typing import Any, Dict, Optional
import redis.asyncio as aioredis
from sentinel.core.config import settings

logger = logging.getLogger(__name__)

class RedisJobManager:
    """
    Asynchronous job manager supporting Redis-backed queues with in-memory fallback.
    Queues: evaluation_queue, healing_queue, experiment_queue, notification_queue
    """
    def __init__(self, redis_url: Optional[str] = None):
        self.redis_url = redis_url or settings.REDIS_URL
        self._redis: Optional[aioredis.Redis] = None
        self._memory_jobs: Dict[str, Dict[str, Any]] = {}

    async def get_redis(self) -> Optional[aioredis.Redis]:
        if self._redis is None:
            try:
                client = aioredis.from_url(self.redis_url, decode_responses=True)
                await client.ping()
                self._redis = client
            except Exception as e:
                logger.warning(f"Redis connection unavailable ({e}). Using in-memory job queue fallback.")
                if 'client' in locals() and client:
                    await client.aclose()
                self._redis = None
        return self._redis

    async def close(self):
        if self._redis:
            await self._redis.aclose()
            self._redis = None

    async def enqueue_job(
        self,
        queue_name: str,
        job_type: str,
        payload: Dict[str, Any],
        request_id: Optional[str] = None,
        api_connection_id: Optional[str] = None,
        evaluation_run_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        job_id = f"job-{uuid.uuid4()}"
        job_data = {
            "job_id": job_id,
            "job_type": job_type,
            "queue_name": queue_name,
            "request_id": request_id,
            "api_connection_id": api_connection_id,
            "evaluation_run_id": evaluation_run_id,
            "payload": payload,
            "retry_count": 0,
            "max_retries": 3,
            "status": "QUEUED",
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
            "error": None,
        }

        r = await self.get_redis()
        if r:
            try:
                await r.hset(f"sentinel:job:{job_id}", mapping={"data": json.dumps(job_data)})
                await r.rpush(f"sentinel:queue:{queue_name}", job_id)
                logger.info(f"Job {job_id} enqueued to Redis queue {queue_name}.")
                return job_data
            except Exception as e:
                logger.error(f"Redis enqueue failed ({e}), falling back to memory queue.")

        self._memory_jobs[job_id] = job_data
        logger.info(f"Job {job_id} enqueued to in-memory queue {queue_name}.")
        return job_data

    async def get_job_status(self, job_id: str) -> Optional[Dict[str, Any]]:
        r = await self.get_redis()
        if r:
            try:
                raw_data = await r.hget(f"sentinel:job:{job_id}", "data")
                if raw_data:
                    return json.loads(raw_data)
            except Exception as e:
                logger.warning(f"Error reading job {job_id} from Redis: {e}")

        return self._memory_jobs.get(job_id)

    async def update_job_status(
        self,
        job_id: str,
        status: str,
        result: Optional[Dict[str, Any]] = None,
        error: Optional[str] = None,
    ) -> Optional[Dict[str, Any]]:
        job_data = await self.get_job_status(job_id)
        if not job_data:
            return None

        job_data["status"] = status
        job_data["updated_at"] = datetime.utcnow().isoformat()
        if result is not None:
            job_data["result"] = result
        if error is not None:
            job_data["error"] = error

        r = await self.get_redis()
        if r:
            try:
                await r.hset(f"sentinel:job:{job_id}", mapping={"data": json.dumps(job_data)})
            except Exception as e:
                logger.warning(f"Error updating job {job_id} in Redis: {e}")

        self._memory_jobs[job_id] = job_data
        return job_data

job_manager = RedisJobManager()
