from datetime import datetime
from typing import Any, Dict, Optional
from pydantic import BaseModel

class ConnectedApiCreate(BaseModel):
    name: str  # Must be preserved exactly as entered
    provider: str
    base_url: Optional[str] = None
    model_name: Optional[str] = None
    api_key: Optional[str] = None
    task_type: Optional[str] = "llm_chat"
    config: Optional[Dict[str, Any]] = None

class ConnectedApiOut(BaseModel):
    id: str
    name: str
    provider: str
    base_url: Optional[str] = None
    model_name: Optional[str] = None
    task_type: str
    status: str
    config: Optional[Dict[str, Any]] = None
    created_at: datetime

    class Config:
        from_attributes = True
