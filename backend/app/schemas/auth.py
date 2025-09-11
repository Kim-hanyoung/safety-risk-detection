from pydantic import BaseModel, EmailStr

class SignupIn(BaseModel):
    email: EmailStr
    password: str
    name: str | None = None

class LoginIn(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: str
    email: EmailStr
    name: str | None = None
    class Config: from_attributes = True

class AuthOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut
