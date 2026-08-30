import logging
import queue
import threading
import time
from typing import Any, Dict, Optional
import httpx

logger = logging.getLogger("sentinel-sdk")

class SentinelSDKClient:
    _instance: Optional['SentinelSDKClient'] = None

    def __init__(self, api_key: str, base_url: str = "http://localhost:8000"):
        self.api_key = api_key
        self.base_url = base_url.rstrip("/")
        self.queue: queue.Queue = queue.Queue(maxsize=10000)
        self.is_running = True
        self.worker_thread = threading.Thread(target=self._background_worker, daemon=True)
        self.worker_thread.start()

    @classmethod
    def initialize(cls, api_key: str, base_url: str = "http://localhost:8000") -> 'SentinelSDKClient':
        if not cls._instance:
            cls._instance = cls(api_key=api_key, base_url=base_url)
        return cls._instance

    @classmethod
    def get_instance(cls) -> Optional['SentinelSDKClient']:
        return cls._instance

    def enqueue_prediction(self, model_id: str, input_data: Any, output_data: Any, confidence: Optional[float] = None):
        payload = {
            "model_id": model_id,
            "input": input_data if isinstance(input_data, dict) else {"raw": str(input_data)},
            "output": output_data if isinstance(output_data, dict) else {"raw": str(output_data)},
            "confidence": confidence
        }
        try:
            self.queue.put_nowait(payload)
        except queue.Full:
            logger.warning("SENTINEL SDK queue full, dropping prediction payload.")

    def _background_worker(self):
        batch = []
        last_flush = time.time()

        while self.is_running:
            try:
                item = self.queue.get(timeout=1.0)
                batch.append(item)
            except queue.Empty:
                pass

            now = time.time()
            if (len(batch) >= 20 or (now - last_flush) >= 2.0) and batch:
                self._send_batch(batch)
                batch = []
                last_flush = now

    def _send_batch(self, batch: list):
        url = f"{self.base_url}/api/v1/predict/batch"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        try:
            with httpx.Client(timeout=5.0) as client:
                res = client.post(url, json={"predictions": batch}, headers=headers)
                if res.status_code != 201 and res.status_code != 200:
                    logger.debug(f"SENTINEL SDK prediction push status {res.status_code}")
        except Exception as e:
            logger.debug(f"SENTINEL SDK background dispatch error: {e}")
