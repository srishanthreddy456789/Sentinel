from datetime import datetime
from pydantic import BaseModel, EmailStr

class UserRegister(BaseModel):
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    email: str
    tier: str

class UserOut(BaseModel):
    id: str
    email: EmailStr
    tier: str
    created_at: datetime

    class Config:
        from_attributes = True
