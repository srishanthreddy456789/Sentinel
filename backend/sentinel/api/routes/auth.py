from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from sentinel.api.dependencies import get_current_developer
from sentinel.core.security import create_access_token, get_password_hash, verify_password
from sentinel.database.database import get_db
from sentinel.database.models import Developer
from sentinel.schemas.auth import TokenResponse, UserLogin, UserOut, UserRegister

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def register(payload: UserRegister, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Developer).where(Developer.email == payload.email))
    if result.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Developer with this email already exists"
        )

    developer = Developer(
        email=payload.email,
        password_hash=get_password_hash(payload.password),
        tier="free"
    )
    db.add(developer)
    await db.commit()
    await db.refresh(developer)
    return developer

@router.post("/login", response_model=TokenResponse)
async def login(payload: UserLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Developer).where(Developer.email == payload.email))
    developer = result.scalars().first()

    if not developer or not verify_password(payload.password, developer.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    token = create_access_token(subject=developer.id)
    return TokenResponse(
        access_token=token,
        user_id=developer.id,
        email=developer.email,
        tier=developer.tier
    )

@router.get("/me", response_model=UserOut)
async def get_me(current_developer: Developer = Depends(get_current_developer)):
    return current_developer
