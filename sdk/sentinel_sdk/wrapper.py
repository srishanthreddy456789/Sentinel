import functools
from typing import Any, Callable, Optional
from sentinel_sdk.client import SentinelSDKClient

class MonitoredModelWrapper:
    def __init__(self, model_or_fn: Any, model_id: str = "default_model"):
        self._target = model_or_fn
        self.model_id = model_id

    def __call__(self, *args, **kwargs) -> Any:
        input_data = kwargs if kwargs else (args[0] if args else {})
        result = self._target(*args, **kwargs)
        
        client = SentinelSDKClient.get_instance()
        if client:
            client.enqueue_prediction(
                model_id=self.model_id,
                input_data=input_data,
                output_data=result
            )
        return result

    def predict(self, *args, **kwargs) -> Any:
        if hasattr(self._target, "predict"):
            input_data = args[0] if args else kwargs
            result = self._target.predict(*args, **kwargs)
            client = SentinelSDKClient.get_instance()
            if client:
                client.enqueue_prediction(
                    model_id=self.model_id,
                    input_data=input_data,
                    output_data=result
                )
            return result
        return self.__call__(*args, **kwargs)

def monitor(target: Any, model_id: str = "default_model") -> MonitoredModelWrapper:
    """
    3-line integration wrapper:
    model = sentinel.monitor(your_model, model_id="fraud_detector")
    """
    return MonitoredModelWrapper(target, model_id=model_id)
