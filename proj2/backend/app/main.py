import os
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
from sqlalchemy.exc import IntegrityError

from .db import create_db_and_tables, get_session
from .models import User
from .schemas import AuthRequest, AuthResponse, UserOut
from .auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    get_current_user_claims,
)

load_dotenv()

app = FastAPI(title="CSC510 API")

origins_env = os.getenv("CORS_ORIGINS", "http://localhost:5173")
origins = [o.strip() for o in origins_env.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

# Auth routes
@app.post("/auth/register", response_model=AuthResponse)
def register(payload: AuthRequest, session: Session = Depends(get_session)):
    existing = session.exec(select(User).where(User.email == payload.email)).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="User already exists")

    user = User(email=payload.email, password_hash=get_password_hash(payload.password))
    session.add(user)
    try:
        session.commit()
        session.refresh(user)
    except IntegrityError:
        # race condition or unique constraint violation
        session.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="User already exists")

    token = create_access_token(sub=user.id, email=user.email)
    return {"user": {"id": user.id, "username": user.email}, "token": token}

@app.post("/auth/login", response_model=AuthResponse)
def login(payload: AuthRequest, session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.email == payload.email)).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token = create_access_token(sub=user.id, email=user.email)
    return {"user": {"id": user.id, "username": user.email}, "token": token}

@app.get("/auth/me", response_model=UserOut)
def me(claims=Depends(get_current_user_claims), session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.id == int(claims["sub"]))).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    return {"id": user.id, "username": user.email}

# Example protected domain route
@app.get("/runs")
def list_runs(claims=Depends(get_current_user_claims)):
    runs = [
        {"id": 1, "restaurant": "Campus Deli", "eta": "12:30", "seats": 3, "runner": "Alice"},
        {"id": 2, "restaurant": "Pizza Place", "eta": "13:15", "seats": 2, "runner": "Bob"},
    ]
    return {"runs": runs}
