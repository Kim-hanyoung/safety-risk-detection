from sqlalchemy import Column, String, DateTime, ForeignKey, Text, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..db import Base
import uuid

def gen_uuid():
    return str(uuid.uuid4())

class Post(Base):
    __tablename__ = "posts"
    id = Column(String, primary_key=True, default=gen_uuid)
    author_id = Column(String, ForeignKey("users.id"), nullable=False)
    category = Column(String, nullable=False)  # "reports" | "general"
    title = Column(String, nullable=False)
    content_md = Column(Text, nullable=False)
    meta = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    author = relationship("User", lazy="joined")
    comments = relationship("Comment", back_populates="post", lazy="selectin",cascade="all, delete-orphan")

class Comment(Base):
    __tablename__ = "comments"
    id = Column(String, primary_key=True, default=gen_uuid)
    post_id = Column(String, ForeignKey("posts.id"), nullable=False)
    author_id = Column(String, ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    post = relationship("Post", back_populates="comments")
