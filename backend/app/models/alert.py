from sqlalchemy import Column, String, DateTime, Boolean, JSON
from sqlalchemy.sql import func
from ..db import Base
import uuid

class Alert(Base):
    __tablename__ = "alerts"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    created_at = Column(DateTime, server_default=func.now())
    severity = Column(String, default="warning")   # info | warning | critical
    message = Column(String, nullable=False)
    meta = Column(JSON, default={})
    seen = Column(Boolean, default=False)
