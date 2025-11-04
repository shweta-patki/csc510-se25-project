import os
from typing import List
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
from sqlalchemy.exc import IntegrityError
from contextlib import asynccontextmanager

from .db import create_db_and_tables, get_session, ensure_user_points_column
from .models import User, FoodRun, Order
from .schemas import (
    AuthRequest, AuthResponse, UserOut,
    FoodRunCreate, FoodRunResponse,
    OrderCreate, OrderResponse,
    PointsResponse
)
from .auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    get_current_user_claims,
)

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create DB tables on startup
    create_db_and_tables()
    # Ensure SQLite dev DBs have newly added columns (e.g., 'points')
    ensure_user_points_column()
    yield


origins_env = os.getenv("CORS_ORIGINS", "http://localhost:5173")
origins = [o.strip() for o in origins_env.split(",") if o.strip()]

app = FastAPI(title="CSC510 API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"status": "ok"}

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
        session.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="User already exists")

    token = create_access_token(sub=user.id, email=user.email)
    return {"user": {"id": user.id, "username": user.email, "points": user.points}, "token": token}

@app.post("/auth/login", response_model=AuthResponse)
def login(payload: AuthRequest, session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.email == payload.email)).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token = create_access_token(sub=user.id, email=user.email)
    return {"user": {"id": user.id, "username": user.email, "points": user.points}, "token": token}

@app.get("/auth/me", response_model=UserOut)
def me(claims=Depends(get_current_user_claims), session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.id == int(claims["sub"]))).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    return {"id": user.id, "username": user.email, "points": user.points}

@app.post("/runs", response_model=FoodRunResponse)
def create_run(
    run: FoodRunCreate,
    claims=Depends(get_current_user_claims),
    session: Session = Depends(get_session)
):
    user_id = int(claims["sub"])
    food_run = FoodRun(**run.dict(), runner_id=user_id)
    session.add(food_run)
    session.commit()
    session.refresh(food_run)
    return food_run

@app.get("/runs", response_model=List[FoodRunResponse])
def list_runs(
    claims=Depends(get_current_user_claims),
    session: Session = Depends(get_session)
):
    runs = session.exec(select(FoodRun)).all()
    return runs

@app.post("/runs/{run_id}/orders", response_model=OrderResponse)
def create_order(
    run_id: int,
    order: OrderCreate,
    claims=Depends(get_current_user_claims),
    session: Session = Depends(get_session)
):
    user_id = int(claims["sub"])
    food_run = session.get(FoodRun, run_id)
    if not food_run:
        raise HTTPException(status_code=404, detail="Run not found")
    if food_run.status != "active":
        raise HTTPException(status_code=400, detail="Run is not active")
    
    order = Order(**order.dict(), run_id=run_id, user_id=user_id)
    session.add(order)
    session.commit()
    session.refresh(order)
    return order

@app.put("/runs/{run_id}/complete")
def complete_run(
    run_id: int,
    claims=Depends(get_current_user_claims),
    session: Session = Depends(get_session)
):
    user_id = int(claims["sub"])
    food_run = session.get(FoodRun, run_id)
    if not food_run:
        raise HTTPException(status_code=404, detail="Run not found")
    if food_run.runner_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Calculate total bill and points
    orders = session.exec(select(Order).where(Order.run_id == run_id)).all()
    total_amount = sum(order.amount for order in orders)
    earned_points = int(total_amount / 10)  # 1 point per $10
    
    # Update run status
    food_run.status = "completed"
    
    # Update runner's points
    runner = session.get(User, user_id)
    runner.points += earned_points
    
    session.commit()
    return {"message": "Run completed", "points_earned": earned_points}

@app.get("/points", response_model=PointsResponse)
def get_points(
    claims=Depends(get_current_user_claims),
    session: Session = Depends(get_session)
):
    user_id = int(claims["sub"])
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    points_value = (user.points // 10) * 5  # $5 per 10 points
    return {"points": user.points, "points_value": points_value}

@app.post("/points/redeem")
def redeem_points(
    claims=Depends(get_current_user_claims),
    session: Session = Depends(get_session)
):
    user_id = int(claims["sub"])
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    redeemable_points = (user.points // 10) * 10  # Round down to nearest 10
    if redeemable_points < 10:
        raise HTTPException(status_code=400, detail="Not enough points to redeem")
    
    redemption_value = (redeemable_points // 10) * 5  # $5 per 10 points
    user.points -= redeemable_points
    session.commit()
    
    return {
        "points_redeemed": redeemable_points,
        "value_redeemed": redemption_value,
        "remaining_points": user.points
    }
