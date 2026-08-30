from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class ConnectedApiCreate(BaseModel):
    name: str
    provider: str  # openai, anthropic, gemini, mistral, huggingface, custom, sentinel_free
    api_key: Optional[str] = None
    task_type: Optional[str] = "llm_chat"

class ConnectedApiOut(BaseModel):
    id: str
    name: str
    provider: str
    task_type: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
