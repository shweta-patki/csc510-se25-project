from typing import Optional
from sqlmodel import SQLModel, Field
from sqlalchemy import Column, String, DateTime, text

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    # enforce unique via underlying SQLAlchemy Column (put index on the sa_column to avoid SQLModel conflict)
    email: str = Field(sa_column=Column(String, unique=True, index=True))
    password_hash: str
    created_at: Optional[str] = Field(
        default=None,
        sa_column=Column(DateTime(timezone=True), server_default=text("CURRENT_TIMESTAMP")),
    )