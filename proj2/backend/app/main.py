import os
from typing import List
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
from sqlalchemy.exc import IntegrityError
from contextlib import asynccontextmanager

from .db import (
    create_db_and_tables,
    get_session,
    ensure_user_points_column,
    ensure_foodrun_capacity_column,
    ensure_order_pin_column,
)
from .models import User, FoodRun, Order
from .schemas import (
    AuthRequest, AuthResponse, UserOut,
    FoodRunCreate, FoodRunResponse, JoinedRunResponse,
    OrderCreate, OrderResponse, OrderJoinResponse,
    PointsResponse, PinVerifyRequest
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
    ensure_foodrun_capacity_column()
    ensure_order_pin_column()
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
    # respond with seats_remaining derived from capacity - current orders
    orders_count = session.exec(select(Order).where(Order.run_id == food_run.id, Order.status != "cancelled")).all()
    seats_remaining = max(food_run.capacity - len(orders_count), 0)
    return {
        **food_run.dict(),
        "runner_username": claims.get("email", str(user_id)),
        "seats_remaining": seats_remaining,
        "orders": []
    }

@app.get("/runs", response_model=List[FoodRunResponse])
def list_runs(
    claims=Depends(get_current_user_claims),
    session: Session = Depends(get_session)
):
    runs = session.exec(select(FoodRun)).all()
    # attach seats_remaining for each run
    responses = []
    for r in runs:
        count = session.exec(select(Order).where(Order.run_id == r.id, Order.status != "cancelled")).all()
        seats_remaining = max(r.capacity - len(count), 0)
        # fetch runner email
        runner = session.get(User, r.runner_id)
        responses.append({
            **r.dict(),
            "runner_username": runner.email if runner else str(r.runner_id),
            "seats_remaining": seats_remaining,
            "orders": []
        })
    return responses

@app.post("/runs/{run_id}/orders", response_model=OrderJoinResponse)
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
    if food_run.runner_id == user_id:
        raise HTTPException(status_code=400, detail="Runner cannot join own run")
    # enforce capacity and prevent duplicate join
    existing = session.exec(select(Order).where(Order.run_id == run_id, Order.user_id == user_id, Order.status != "cancelled")).first()
    if existing:
        raise HTTPException(status_code=400, detail="You have already joined this run")
    current_count = session.exec(select(Order).where(Order.run_id == run_id, Order.status != "cancelled")).all()
    if len(current_count) >= food_run.capacity:
        raise HTTPException(status_code=400, detail="Run is full")
    
    # ensure a 4-digit PIN
    pin = order.pin if order.pin else f"{int(os.urandom(2).hex(), 16) % 9000 + 1000:04d}"
    order_row = Order(**{**order.dict(), "pin": pin}, run_id=run_id, user_id=user_id)
    session.add(order_row)
    session.commit()
    session.refresh(order_row)
    u = session.get(User, user_id)
    return {
        "id": order_row.id,
        "run_id": order_row.run_id,
        "user_id": order_row.user_id,
        "status": order_row.status,
        "items": order_row.items,
        "amount": order_row.amount,
        "user_email": u.email if u else str(user_id),
        "pin": pin,
    }

@app.post("/runs/{run_id}/orders/{order_id}/verify-pin")
def verify_order_pin(
    run_id: int,
    order_id: int,
    payload: PinVerifyRequest,
    claims=Depends(get_current_user_claims),
    session: Session = Depends(get_session),
):
    user_id = int(claims["sub"])
    run = session.get(FoodRun, run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    if run.runner_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    order = session.get(Order, order_id)
    if not order or order.run_id != run_id:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.status == "cancelled":
        raise HTTPException(status_code=400, detail="Order cancelled")
    if not order.pin:
        raise HTTPException(status_code=400, detail="No PIN set for this order")
    if str(order.pin) != str(payload.pin):
        raise HTTPException(status_code=400, detail="Incorrect PIN")
    order.status = "delivered"
    session.commit()
    return {"message": "PIN verified. Order marked delivered."}

@app.delete("/runs/{run_id}/orders/me")
def cancel_my_order(
    run_id: int,
    claims=Depends(get_current_user_claims),
    session: Session = Depends(get_session)
):
    user_id = int(claims["sub"])
    ord = session.exec(select(Order).where(Order.run_id == run_id, Order.user_id == user_id, Order.status != "cancelled")).first()
    if not ord:
        raise HTTPException(status_code=404, detail="No active order to cancel")
    ord.status = "cancelled"
    session.commit()
    return {"message": "Order cancelled"}

@app.get("/runs/available", response_model=List[FoodRunResponse])
def list_available_runs(
    claims=Depends(get_current_user_claims),
    session: Session = Depends(get_session)
):
    user_id = int(claims["sub"])
    runs = session.exec(select(FoodRun).where(FoodRun.status == "active", FoodRun.runner_id != user_id)).all()
    responses = []
    for r in runs:
        count = session.exec(select(Order).where(Order.run_id == r.id, Order.status != "cancelled")).all()
        seats_remaining = max(r.capacity - len(count), 0)
        if seats_remaining > 0:
            runner = session.get(User, r.runner_id)
            responses.append({
                **r.dict(),
                "runner_username": runner.email if runner else str(r.runner_id),
                "seats_remaining": seats_remaining,
                "orders": []
            })
    return responses

@app.get("/runs/mine", response_model=List[FoodRunResponse])
def list_my_runs(
    claims=Depends(get_current_user_claims),
    session: Session = Depends(get_session)
):
    user_id = int(claims["sub"])
    runs = session.exec(select(FoodRun).where(FoodRun.runner_id == user_id, FoodRun.status == "active")).all()
    responses = []
    for r in runs:
        orders = session.exec(select(Order).where(Order.run_id == r.id, Order.status != "cancelled")).all()
        seats_remaining = max(r.capacity - len(orders), 0)
        runner = session.get(User, r.runner_id)
        # build orders payload with user emails
        order_payload = []
        for o in orders:
            u = session.get(User, o.user_id)
            order_payload.append({
                "id": o.id,
                "run_id": o.run_id,
                "user_id": o.user_id,
                "status": o.status,
                "items": o.items,
                "amount": o.amount,
                "user_email": u.email if u else str(o.user_id),
            })
        responses.append({
            **r.dict(),
            "runner_username": runner.email if runner else str(r.runner_id),
            "seats_remaining": seats_remaining,
            "orders": order_payload
        })
    return responses

@app.get("/runs/id/{run_id}", response_model=FoodRunResponse)
def get_run_details(
    run_id: int,
    claims=Depends(get_current_user_claims),
    session: Session = Depends(get_session)
):
    user_id = int(claims["sub"])
    run = session.get(FoodRun, run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    if run.runner_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    orders = session.exec(select(Order).where(Order.run_id == run.id, Order.status != "cancelled")).all()
    seats_remaining = max(run.capacity - len(orders), 0)
    runner = session.get(User, run.runner_id)

    order_payload = []
    for o in orders:
        u = session.get(User, o.user_id)
        order_payload.append({
            "id": o.id,
            "run_id": o.run_id,
            "user_id": o.user_id,
            "status": o.status,
            "items": o.items,
            "amount": o.amount,
            "user_email": u.email if u else str(o.user_id),
        })

    return {
        **run.dict(),
        "runner_username": runner.email if runner else str(run.runner_id),
        "seats_remaining": seats_remaining,
        "orders": order_payload,
    }

@app.get("/runs/joined", response_model=List[JoinedRunResponse])
def list_joined_runs(
    claims=Depends(get_current_user_claims),
    session: Session = Depends(get_session)
):
    user_id = int(claims["sub"])
    # Find runs that have a non-cancelled order by this user
    stmt = select(Order.run_id).where(
        Order.user_id == user_id,
        Order.status != "cancelled",
    ).distinct()
    # Some SQLModel/SQLAlchemy versions return scalars directly; others return 1-tuples.
    rows = session.exec(stmt).all()
    run_ids = [row[0] if isinstance(row, (list, tuple)) else row for row in rows]
    if not run_ids:
        return []
    runs = session.exec(select(FoodRun).where(FoodRun.id.in_(run_ids), FoodRun.status == "active")).all()
    responses = []
    for r in runs:
        count = session.exec(select(Order).where(Order.run_id == r.id, Order.status != "cancelled")).all()
        cap = r.capacity or 0
        seats_remaining = max(cap - len(count), 0)
        runner = session.get(User, r.runner_id)
        # find my order for this run (expose pin to the owner of the order only)
        mine = session.exec(
            select(Order).where(
                Order.run_id == r.id,
                Order.user_id == user_id,
                Order.status != "cancelled",
            )
        ).first()
        # Build explicit payload to avoid any None values breaking response validation
        payload = {
            "id": r.id,
            "runner_id": r.runner_id,
            "restaurant": r.restaurant or "",
            "drop_point": r.drop_point or "",
            "eta": r.eta or "",
            "capacity": cap,
            "status": r.status or "active",
            "runner_username": runner.email if runner else str(r.runner_id),
            "seats_remaining": seats_remaining,
            "orders": []
        }
        if mine:
            payload["my_order"] = {
                "id": mine.id,
                "run_id": mine.run_id,
                "items": mine.items,
                "amount": mine.amount,
                "status": mine.status,
                "pin": mine.pin or "",
            }
        responses.append(payload)
    return responses

@app.get("/runs/mine/history", response_model=List[FoodRunResponse])
def list_my_runs_history(
    claims=Depends(get_current_user_claims),
    session: Session = Depends(get_session)
):
    user_id = int(claims["sub"])
    runs = session.exec(select(FoodRun).where(FoodRun.runner_id == user_id, FoodRun.status != "active")).all()
    responses = []
    for r in runs:
        orders = session.exec(select(Order).where(Order.run_id == r.id)).all()
        runner = session.get(User, r.runner_id)
        order_payload = []
        for o in orders:
            u = session.get(User, o.user_id)
            order_payload.append({
                "id": o.id,
                "run_id": o.run_id,
                "user_id": o.user_id,
                "status": o.status,
                "items": o.items,
                "amount": o.amount,
                "user_email": u.email if u else str(o.user_id),
            })
        responses.append({
            **r.dict(),
            "runner_username": runner.email if runner else str(r.runner_id),
            "seats_remaining": 0,
            "orders": order_payload,
        })
    return responses

@app.get("/runs/joined/history", response_model=List[JoinedRunResponse])
def list_joined_runs_history(
    claims=Depends(get_current_user_claims),
    session: Session = Depends(get_session)
):
    user_id = int(claims["sub"])
    stmt = select(Order.run_id).where(Order.user_id == user_id).distinct()
    rows = session.exec(stmt).all()
    run_ids = [row[0] if isinstance(row, (list, tuple)) else row for row in rows]
    if not run_ids:
        return []
    runs = session.exec(select(FoodRun).where(FoodRun.id.in_(run_ids), FoodRun.status != "active")).all()
    responses = []
    for r in runs:
        runner = session.get(User, r.runner_id)
        # include my_order for historical reference
        mine = session.exec(
            select(Order).where(
                Order.run_id == r.id,
                Order.user_id == user_id,
            )
        ).first()
        payload = {
            **r.dict(),
            "runner_username": runner.email if runner else str(r.runner_id),
            "seats_remaining": 0,
            "orders": [],
        }
        if mine:
            payload["my_order"] = {
                "id": mine.id,
                "run_id": mine.run_id,
                "items": mine.items,
                "amount": mine.amount,
                "status": mine.status,
                "pin": (mine.pin or ""),
            }
        responses.append(payload)
    return responses

@app.delete("/runs/{run_id}/orders/{order_id}")
def runner_remove_order(
    run_id: int,
    order_id: int,
    claims=Depends(get_current_user_claims),
    session: Session = Depends(get_session)
):
    user_id = int(claims["sub"])
    run = session.get(FoodRun, run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    if run.runner_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    if run.status != "active":
        raise HTTPException(status_code=400, detail="Run is not active")
    ord = session.get(Order, order_id)
    if not ord or ord.run_id != run_id or ord.status == "cancelled":
        raise HTTPException(status_code=404, detail="Order not found")
    ord.status = "cancelled"
    session.commit()
    return {"message": "Order removed"}

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
    earned_points = total_amount / 10  # 1 point per $10
    
    # Update run status
    food_run.status = "completed"
    
    # Update runner's points
    runner = session.get(User, user_id)
    runner.points += earned_points
    
    session.commit()
    return {"message": "Run completed", "points_earned": earned_points}

@app.put("/runs/{run_id}/cancel")
def cancel_run(
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
    if food_run.status != "active":
        raise HTTPException(status_code=400, detail="Run is not active")
    food_run.status = "cancelled"
    session.commit()
    return {"message": "Run cancelled"}

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
