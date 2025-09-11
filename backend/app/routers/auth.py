from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..db import get_db
from ..models.user import User
from ..core.security import hash_password, verify_password, create_token, current_sub
from ..schemas.auth import SignupIn, LoginIn, AuthOut, UserOut

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/signup", response_model=AuthOut)
def signup(body: SignupIn, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == body.email).first():
        raise HTTPException(400, "Email already exists")
    u = User(email=body.email, password_hash=hash_password(body.password), name=body.name)
    db.add(u); db.commit(); db.refresh(u)
    token = create_token(u.id)
    return {"access_token": token, "user": u}

@router.post("/login", response_model=AuthOut)
def login(body: LoginIn, db: Session = Depends(get_db)):
    u: User | None = db.query(User).filter(User.email == body.email).first()
    if not u or not verify_password(body.password, u.password_hash):
        raise HTTPException(401, "Invalid credentials")
    token = create_token(u.id)
    return {"access_token": token, "user": u}

@router.get("/me", response_model=UserOut)
def me(sub: str = Depends(current_sub), db: Session = Depends(get_db)):
    u = db.query(User).get(sub)
    if not u: raise HTTPException(404, "User not found")
    return u
