from pydantic import BaseModel, EmailStr

class AuthRequest(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    username: str  # maps to email

class AuthResponse(BaseModel):
    user: UserOut
    token: str
