from sentinel_sdk.client import SentinelSDKClient
from sentinel_sdk.wrapper import monitor

__version__ = "1.0.0"

def init(api_key: str, base_url: str = "http://localhost:8000"):
    """
    Initializes SENTINEL SDK with developer API key.
    Usage:
        import sentinel_sdk as sentinel
        sentinel.init(api_key="sk_sentinel_xxxx")
        model = sentinel.monitor(your_model, model_id="fraud_detector")
    """
    SentinelSDKClient.initialize(api_key=api_key, base_url=base_url)

__all__ = ["init", "monitor", "__version__"]
