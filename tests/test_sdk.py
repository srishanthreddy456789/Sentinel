import time
import sentinel_sdk as sentinel

def dummy_predict_model(x: int) -> int:
    return x * 2

def test_sdk_wrapper():
    sentinel.init(api_key="sk_sentinel_test_key_12345", base_url="http://localhost:8000")
    monitored_model = sentinel.monitor(dummy_predict_model, model_id="test_model_001")

    res = monitored_model(5)
    assert res == 10

    client = sentinel.SentinelSDKClient.get_instance()
    assert client is not None
    assert client.api_key == "sk_sentinel_test_key_12345"
