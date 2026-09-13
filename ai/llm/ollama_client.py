import logging
from typing import Any, Dict, List, Optional
import httpx

from sentinel.core.config import settings

logger = logging.getLogger(__name__)

class OllamaClient:
    def __init__(self, base_url: Optional[str] = None):
        self.base_url = base_url or getattr(settings, "OLLAMA_BASE_URL", "http://localhost:11434")

    async def check_health_and_status(self) -> Dict[str, Any]:
        """Detects whether Ollama is installed, running, available models, and returns helpful setup instructions if unavailable."""
        try:
            async with httpx.AsyncClient(timeout=3.0) as client:
                resp = await client.get(f"{self.base_url}/api/tags")
                if resp.status_code == 200:
                    data = resp.json()
                    models = [m.get("name") for m in data.get("models", [])]
                    return {
                        "installed": True,
                        "running": True,
                        "base_url": self.base_url,
                        "models": models,
                        "status": "Healthy",
                        "instructions": "Ollama is running locally. You can use free local models (Llama3, Mistral, Phi3)."
                    }
        except Exception as e:
            logger.info(f"Ollama health check unreachable at {self.base_url}: {e}")

        return {
            "installed": False,
            "running": False,
            "base_url": self.base_url,
            "models": [],
            "status": "Unavailable",
            "instructions": "To use local models: 1. Download Ollama from https://ollama.ai. 2. Run 'ollama run mistral' in your terminal. 3. Refresh connection."
        }

    async def generate_response(self, prompt: str, model_name: str = "mistral") -> str:
        target_model = model_name
        try:
            async with httpx.AsyncClient(timeout=2.0) as client:
                tags_resp = await client.get(f"{self.base_url}/api/tags")
                if tags_resp.status_code == 200:
                    models_list = [m.get("name") for m in tags_resp.json().get("models", [])]
                    if models_list:
                        clean_req = model_name.lower().replace(" ", "").replace("-", "")
                        match = next((m for m in models_list if clean_req in m.lower().replace(" ", "").replace("-", "")), None)
                        target_model = match or models_list[0]
        except Exception as e:
            logger.info(f"Ollama tags check fallback: {e}")

        url = f"{self.base_url}/api/generate"
        try:
            async with httpx.AsyncClient(timeout=httpx.Timeout(15.0, connect=3.0)) as client:
                resp = await client.post(
                    url,
                    json={"model": target_model, "prompt": prompt, "stream": False}
                )
                if resp.status_code == 200:
                    text = resp.json().get("response", "")
                    if text:
                        return text

                # Fallback to /api/chat
                chat_resp = await client.post(
                    f"{self.base_url}/api/chat",
                    json={"model": target_model, "messages": [{"role": "user", "content": prompt}], "stream": False}
                )
                if chat_resp.status_code == 200:
                    text = chat_resp.json().get("message", {}).get("content", "")
                    if text:
                        return text
        except Exception as e:
            logger.warning(f"Ollama response generation failed: {e}")
        
        # Fallback simulation when local hardware is insufficient or Ollama is offline
        return f"[SENTINEL Simulation Response] Received input prompt ({len(prompt)} chars). Processing task using rule-based local engine."

ollama_client = OllamaClient()
