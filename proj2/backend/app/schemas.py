from typing import List, Optional
from pydantic import BaseModel, EmailStr

class AuthRequest(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    username: str  # maps to email
    points: int

class AuthResponse(BaseModel):
    user: UserOut
    token: str

class OrderCreate(BaseModel):
    items: str
    amount: float
    pin: Optional[str] = None  # optional client-provided PIN; server will generate if missing

class OrderResponse(OrderCreate):
    id: int
    run_id: int
    user_id: int
    status: str
    user_email: str

class OrderJoinResponse(BaseModel):
    # Response for joining a run; includes the generated PIN for the joiner
    id: int
    run_id: int
    user_id: int
    status: str
    items: str
    amount: float
    user_email: str
    pin: str

class MyOrderResponse(BaseModel):
    id: int
    run_id: int
    items: str
    amount: float
    status: str
    pin: str

class FoodRunCreate(BaseModel):
    restaurant: str
    drop_point: str
    eta: str
    capacity: int = 5

class FoodRunResponse(FoodRunCreate):
    id: int
    runner_id: int
    runner_username: str
    status: str
    seats_remaining: int
    orders: List[OrderResponse] = []

class JoinedRunResponse(FoodRunResponse):
    my_order: Optional[MyOrderResponse] = None

class PointsResponse(BaseModel):
    points: int
    points_value: float  # in dollars

class PinVerifyRequest(BaseModel):
    pin: str
