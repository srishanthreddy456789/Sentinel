import logging
from typing import Any, Dict, Optional
import httpx

from sentinel.core.config import settings

logger = logging.getLogger(__name__)

class PromptHealer:
    """Generates candidate improved prompts when PROMPT_QUALITY or ambiguity is diagnosed."""

    async def generate_healed_prompt(
        self,
        original_prompt: str,
        failing_input: str,
        failing_output: str,
        expected_output: Optional[str] = None,
        diagnosis_reason: str = "",
    ) -> str:
        meta_prompt = f"""You are an expert Prompt Engineer for SENTINEL Self-Healing System.
The following original prompt failed during execution:

--- ORIGINAL PROMPT ---
{original_prompt}

--- FAILING USER INPUT ---
{failing_input}

--- FAILING MODEL OUTPUT ---
{failing_output}

--- EXPECTED OUTPUT (IF AVAILABLE) ---
{expected_output or 'N/A'}

--- DIAGNOSIS REASON ---
{diagnosis_reason}

Task: Write an improved, clear, unambiguous, and constrained system/user prompt template that fixes this failure.
Return ONLY the healed prompt text without commentary or markdown codeblocks."""

        # Attempt to call local Ollama model if running
        ollama_url = getattr(settings, "OLLAMA_BASE_URL", "http://localhost:11434")
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.post(
                    f"{ollama_url}/api/generate",
                    json={
                        "model": "mistral",
                        "prompt": meta_prompt,
                        "stream": False,
                    },
                )
                if resp.status_code == 200:
                    body = resp.json()
                    candidate = body.get("response", "").strip()
                    if candidate:
                        return candidate
        except Exception as e:
            logger.info(f"Ollama local LLM unavailable for prompt healing generation ({e}). Falling back to rule-based prompt healing optimizer.")

        # Heuristic Rule-Based Prompt Healing Fallback
        healed = original_prompt.strip()
        if "System Instructions:" not in healed:
            healed = f"System Instructions: Be concise, accurate, factual, and strictly follow user format requirements.\n\n{healed}"
        
        healed += "\n\nAdditional Guidance: Provide precise reasoning step-by-step and ensure all claims are directly supported by references."
        return healed

prompt_healer = PromptHealer()
