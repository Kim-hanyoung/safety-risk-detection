import datetime as dt
import jwt
from passlib.context import CryptContext
from fastapi import Header, HTTPException
from .config import settings

pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")
ALG = "HS256"

def hash_password(pw: str) -> str:
    return pwd.hash(pw)

def verify_password(pw: str, pw_hash: str) -> bool:
    return pwd.verify(pw, pw_hash)

def create_token(sub: str, days:int=7) -> str:
    payload = {"sub": sub, "exp": dt.datetime.utcnow() + dt.timedelta(days=days)}
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=ALG)

def current_sub(authorization: str = Header(...)):
    try:
        token = authorization.replace("Bearer ", "")
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[ALG])
        return payload["sub"]
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
