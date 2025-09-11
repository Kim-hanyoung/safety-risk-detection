from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import JSON  # ✅ PostgreSQL JSON 타입
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


    # ✅ 첨부파일, 추가 설정 등을 JSON에 저장
    # 기본 구조: { "attachments": [ { "file_name": "...", "file_url": "..." } ] }
    meta = Column(JSON, nullable=True, default=dict)


    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


    # 관계
    author = relationship("User", lazy="joined")
    comments = relationship(
        "Comment",
        back_populates="post",
        lazy="selectin",
        cascade="all, delete-orphan"
    )




class Comment(Base):
    __tablename__ = "comments"


    id = Column(String, primary_key=True, default=gen_uuid)
    post_id = Column(String, ForeignKey("posts.id"), nullable=False)
    author_id = Column(String, ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


    post = relationship("Post", back_populates="comments")