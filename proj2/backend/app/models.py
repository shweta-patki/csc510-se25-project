from typing import Optional
from sqlmodel import SQLModel, Field
from sqlalchemy import Column, String, DateTime, text

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    # enforce unique via underlying SQLAlchemy Column (put index on the sa_column to avoid SQLModel conflict)
    email: str = Field(sa_column=Column(String, unique=True, index=True))
    password_hash: str
    points: int = Field(default=0)
    created_at: Optional[str] = Field(
        default=None,
        sa_column=Column(DateTime(timezone=True), server_default=text("CURRENT_TIMESTAMP")),
    )

class FoodRun(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    runner_id: int = Field(foreign_key="user.id")
    restaurant: str
    drop_point: str
    eta: str
    status: str = Field(default="active")  # active, completed, cancelled
    created_at: Optional[str] = Field(
        default=None,
        sa_column=Column(DateTime(timezone=True), server_default=text("CURRENT_TIMESTAMP")),
    )

class Order(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    run_id: int = Field(foreign_key="foodrun.id")
    user_id: int = Field(foreign_key="user.id")
    items: str  # JSON string of ordered items
    amount: float
    status: str = Field(default="pending")  # pending, paid, delivered
    created_at: Optional[str] = Field(
        default=None,
        sa_column=Column(DateTime(timezone=True), server_default=text("CURRENT_TIMESTAMP")),
    )