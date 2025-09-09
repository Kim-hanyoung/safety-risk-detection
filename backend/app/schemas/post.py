from pydantic import BaseModel, Field
from typing import Optional, Literal, List
from datetime import datetime

Category = Literal["reports", "general"]

class AuthorOut(BaseModel):
    id: str
    email: str
    name: Optional[str] = None
    class Config: from_attributes = True

class CommentOut(BaseModel):
    id: str
    author_id: str
    content: str
    created_at: datetime
    class Config: from_attributes = True
    
class CommentCreate(BaseModel):
    contnet: str = Field(..., min_length=1)

class CommentUpdate(BaseModel):
    content: Optional[str] = Field(None, min_length=1)

class PostCreate(BaseModel):
    title: str = Field(..., min_length=1)
    content_md: str = Field(..., min_length=1)
    category: Category
    meta: Optional[dict] = None

class PostOut(BaseModel):
    id: str
    category: Category
    title: str
    content_md: str
    author: AuthorOut
    created_at: datetime
    updated_at: Optional[datetime] = None
    class Config: from_attributes = True

class PostDetail(PostOut):
    comments: List[CommentOut] = []

class PageOut(BaseModel):
    items: List[PostOut]
    total: int
    page: int
    page_size: int

class PostUpdate(BaseModel):
    title: Optional[str] = None
    content_md: Optional[str] = None
    category: Optional[str] = None
    meta: Optional[str] = None