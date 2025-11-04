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

class OrderResponse(OrderCreate):
    id: int
    run_id: int
    user_id: int
    status: str

class FoodRunCreate(BaseModel):
    restaurant: str
    drop_point: str
    eta: str

class FoodRunResponse(FoodRunCreate):
    id: int
    runner_id: int
    status: str
    orders: List[OrderResponse] = []

class PointsResponse(BaseModel):
    points: int
    points_value: float  # in dollars
