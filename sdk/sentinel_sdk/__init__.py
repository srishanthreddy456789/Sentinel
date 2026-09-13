"""
SENTINEL SDK — Autonomous LLMOps & Self-Healing Python Client (v3.0.0)

Predefined Functions:
    sentinel.playground(input_text, expected_output=...)
    sentinel.evaluate(input_text, output_text, ...)
    sentinel.diagnose(input_text, output_text, ...)
    sentinel.heal(prompt, failure_type=...)
    sentinel.failures(limit=...)
    sentinel.requests(limit=...)
    sentinel.experiments(model_a, model_b)
"""

from typing import Any, Dict, List, Optional
from sentinel_sdk.client import SentinelSDKClient
from sentinel_sdk.wrapper import monitor

__version__ = "3.0.0"

def init(api_key: str = "sk_sentinel_default", base_url: str = "http://localhost:8000"):
    """
    Initializes SENTINEL SDK with developer API key and backend URL.
    """
    SentinelSDKClient.initialize(api_key=api_key, base_url=base_url)

def playground(
    input_text: str,
    expected_output: Optional[str] = None,
    output_text: Optional[str] = None,
    context: Optional[str] = None,
    model_name: str = "Ollama - Llama 3.1"
) -> Dict[str, Any]:
    """
    Runs Playground execution & metric evaluation.
    Usage:
        metrics = sentinel.playground("What is refund policy?", expected_output="Refunds within 30 days")
    Returns:
        {"correctness": 0.88, "faithfulness": 0.95, "safety": 1.0, "latency_ms": 14.2, "overall_score": 0.89, "passed": True}
    """
    client = SentinelSDKClient.get_instance()
    return client.playground(
        input_text=input_text,
        expected_output=expected_output,
        output_text=output_text,
        context=context,
        model_name=model_name
    )

def evaluate(
    input_text: str,
    output_text: str,
    expected_output: Optional[str] = None,
    context: Optional[str] = None
) -> Dict[str, Any]:
    """
    Evaluates an input/output pair across 9 orthogonal quality dimensions.
    """
    client = SentinelSDKClient.get_instance()
    return client.evaluate(
        input_text=input_text,
        output_text=output_text,
        expected_output=expected_output,
        context=context
    )

def diagnose(
    input_text: str,
    output_text: str,
    context: Optional[str] = None
) -> Dict[str, Any]:
    """
    Runs root cause diagnosis & failure taxonomy detection.
    """
    client = SentinelSDKClient.get_instance()
    return client.diagnose(input_text=input_text, output_text=output_text, context=context)

def heal(
    prompt: str,
    failure_type: str = "FAITHFULNESS"
) -> Dict[str, Any]:
    """
    Runs closed-loop prompt self-healing mutation engine P' = M(P, F).
    """
    client = SentinelSDKClient.get_instance()
    return client.heal(prompt=prompt, failure_type=failure_type)

def failures(limit: int = 20) -> List[Dict[str, Any]]:
    """
    Fetches model failure incidents log.
    """
    client = SentinelSDKClient.get_instance()
    return client.failures(limit=limit)

def requests(limit: int = 50) -> List[Dict[str, Any]]:
    """
    Fetches live request telemetry history entries.
    """
    client = SentinelSDKClient.get_instance()
    return client.requests(limit=limit)

def experiments(model_a: str = "llama3.1:8b", model_b: str = "mistral") -> Dict[str, Any]:
    """
    Runs side-by-side model experiment comparison.
    """
    client = SentinelSDKClient.get_instance()
    return client.experiments(model_a=model_a, model_b=model_b)

__all__ = [
    "init",
    "monitor",
    "playground",
    "evaluate",
    "diagnose",
    "heal",
    "failures",
    "requests",
    "experiments",
    "__version__"
]
