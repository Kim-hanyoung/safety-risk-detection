from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..db import get_db
from ..models.alert import Alert

router = APIRouter(prefix="/alerts", tags=["alerts"])

@router.get("/")
def list_alerts(seen: bool | None = None, limit: int = 20, db: Session = Depends(get_db)):
    q = db.query(Alert).order_by(Alert.created_at.desc())
    if seen is not None:
        q = q.filter(Alert.seen == seen)
    return [ 
        {"id":a.id,"created_at":a.created_at,"severity":a.severity,"message":a.message,"meta":a.meta,"seen":a.seen}
        for a in q.limit(limit).all()
    ]
