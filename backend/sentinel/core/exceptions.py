from fastapi import HTTPException, status

class SentinelException(HTTPException):
    def __init__(self, detail: str, status_code: int = status.HTTP_400_BAD_REQUEST):
        super().__init__(status_code=status_code, detail=detail)

class InvalidCredentialsException(SentinelException):
    def __init__(self):
        super().__init__(
            detail="Invalid email or password",
            status_code=status.HTTP_401_UNAUTHORIZED
        )

class InvalidTokenException(SentinelException):
    def __init__(self):
        super().__init__(
            detail="Could not validate credentials token",
            status_code=status.HTTP_401_UNAUTHORIZED
        )

class ModelNotFoundException(SentinelException):
    def __init__(self, model_id: str):
        super().__init__(
            detail=f"Model with ID {model_id} not found",
            status_code=status.HTTP_404_NOT_FOUND
        )

class ProviderApiException(SentinelException):
    def __init__(self, provider: str, error_msg: str):
        super().__init__(
            detail=f"Error communicating with {provider}: {error_msg}",
            status_code=status.HTTP_502_BAD_GATEWAY
        )
