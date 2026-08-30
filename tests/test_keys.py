from sentinel.core.security import generate_sdk_api_key, hash_sdk_api_key

def test_sdk_api_key_generation():
    raw_key, prefix, key_hash = generate_sdk_api_key()
    assert raw_key.startswith("sk_sentinel_")
    assert prefix == raw_key[:16]
    assert len(key_hash) == 64
    assert hash_sdk_api_key(raw_key) == key_hash
