from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.orm import Session
from typing import Optional, Literal
from ..db import get_db
from ..models.post import Post, Comment
from ..models.user import User
from ..core.security import current_sub
from ..schemas.post import PostCreate, PostOut, PostDetail, PageOut, PostUpdate
from fastapi.responses import FileResponse
import os, shutil, uuid


# 업로드 디렉토리
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


router = APIRouter(prefix="/posts", tags=["posts"])


# 허용되는 카테고리
Category = Literal["reports", "general"]




def get_user(db: Session, user_id: str) -> User:
    u = db.query(User).get(user_id)
    if not u:
        raise HTTPException(404, "User not found")
    return u




def ensure_can_edit(user: User, post: Post):
    if user.role != "admin" and post.author_id != user.id:
        raise HTTPException(403, "Forbidden")




def ensure_can_edit_comment(user: User, comment: Comment):
    if user.role != "admin" and comment.author_id != user.id:
        raise HTTPException(403, "Forbidden")




# 📌 attachments를 항상 {file_name, file_url} 형태로 normalize
def normalize_attachments(meta: Optional[dict]) -> list[dict]:
    if not meta:
        return []
    raw = meta.get("attachments", [])
    result = []
    for att in raw:
        if isinstance(att, str):
            result.append({"file_name": os.path.basename(att), "file_url": att})
        elif isinstance(att, dict) and "file_url" in att:
            result.append({
                "file_name": att.get("file_name") or os.path.basename(att["file_url"]),
                "file_url": att["file_url"],
            })
    return result




def serialize_post(p: Post) -> dict:
    """ORM Post 객체를 dict로 변환하면서 attachments를 최상위로 정리"""
    return {
        "id": p.id,
        "author": {
            "id": p.author.id,
            "email": p.author.email,
            "name": p.author.name,
        },
        "category": p.category,
        "title": p.title,
        "content_md": p.content_md,
        "created_at": p.created_at,
        "updated_at": p.updated_at,
        "attachments": normalize_attachments(p.meta or {}),  # ✅ 첨부파일을 최상위 필드로
    }




# 게시글 목록
@router.get("/", response_model=PageOut)
def list_posts(
    category: Optional[Category] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
):
    q = db.query(Post).order_by(Post.created_at.desc())
    if category:
        q = q.filter(Post.category == category)


    total = q.count()
    items = q.offset((page - 1) * page_size).limit(page_size).all()


    return {
        "items": [serialize_post(p) for p in items],
        "total": total,
        "page": page,
        "page_size": page_size,
    }




# 게시글 단일 조회
@router.get("/{post_id}", response_model=PostDetail)
def get_post(post_id: str, db: Session = Depends(get_db)):
    p = db.query(Post).get(post_id)
    if not p:
        raise HTTPException(404, "Post not found")
    return serialize_post(p)




# 게시글 생성
@router.post("/", response_model=PostOut)
def create_post(
    body: PostCreate,
    sub: str = Depends(current_sub),
    db: Session = Depends(get_db)
):
    user = get_user(db, sub)
    p = Post(
        author_id=user.id,
        category=body.category,
        title=body.title,
        content_md=body.content_md,
        meta=body.meta or {},
    )
    db.add(p)
    db.commit()
    db.refresh(p)
    return serialize_post(p)


# 게시글 수정
@router.patch("/{post_id}", response_model=PostOut)
def update_post(
    post_id: str,
    body: PostUpdate,
    sub: str = Depends(current_sub),
    db: Session = Depends(get_db),
):
    user = get_user(db, sub)
    p = db.query(Post).get(post_id)
    if not p:
        raise HTTPException(404, "Post not found")
    ensure_can_edit(user, p)


    if body.title is not None:
        p.title = body.title
    if body.content_md is not None:
        p.content_md = body.content_md
    if body.category is not None:
        p.category = body.category
    if body.meta is not None:
        # ✅ 병합이 아니라 덮어쓰기 (삭제 반영 가능)
        p.meta = body.meta


    db.commit()
    db.refresh(p)
    return serialize_post(p)




# 게시글 삭제
@router.delete("/{post_id}", response_model=dict)
def delete_post(
    post_id: str,
    sub: str = Depends(current_sub),
    db: Session = Depends(get_db)
):
    user = get_user(db, sub)
    p = db.query(Post).get(post_id)
    if not p:
        raise HTTPException(404, "Post not found")
    ensure_can_edit(user, p)
    db.delete(p)
    db.commit()
    return {"ok": True}




# 파일 업로드
@router.post("/upload", response_model=dict)
async def upload_post_file(file: UploadFile = File(...)):
    ext = os.path.splitext(file.filename)[1]
    filename = f"{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(UPLOAD_DIR, filename)


    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)


    return {
        "file_name": file.filename,
        "file_url": f"/uploads/{filename}",
    }




# 업로드된 파일 조회
@router.get("/files/{filename}")
async def get_post_file(filename: str):
    file_path = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(404, "File not found")
    return FileResponse(file_path)