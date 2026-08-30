from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class ApiKeyCreate(BaseModel):
    name: str

class ApiKeyOut(BaseModel):
    id: str
    name: str
    key_prefix: str
    raw_key: Optional[str] = None  # Only returned on creation
    created_at: datetime
    last_used: Optional[datetime] = None

    class Config:
        from_attributes = True
