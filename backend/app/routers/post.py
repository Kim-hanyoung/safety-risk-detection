from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session
from typing import Optional, Literal
from ..db import get_db
from ..models.post import Post, Comment
from ..models.user import User
from ..core.security import current_sub
from ..schemas.post import PostCreate, PostOut, PostDetail, PageOut, PostUpdate, CommentCreate, CommentUpdate

router = APIRouter(prefix="/posts", tags=["posts"])

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
    return {"items": items, "total": total, "page": page, "page_size": page_size}

@router.get("/{post_id}", response_model=PostDetail)
def get_post(post_id: str, db: Session = Depends(get_db)):
    p = db.query(Post).get(post_id)
    if not p:
        raise HTTPException(404, "Post not found")
    return p

@router.post("/", response_model=PostOut)
def create_post(body: PostCreate, sub: str = Depends(current_sub), db: Session = Depends(get_db)):
    user = get_user(db, sub)
    p = Post(
        author_id=user.id,
        category=body.category,
        title=body.title,
        content_md=body.content_md,
        meta=body.meta,
    )
    db.add(p); db.commit(); db.refresh(p)
    return p

# 게시글 수정
@router.patch("/{post_id}", response_model=PostUpdate)
def update_post(
    post_id: str,
    body: PostUpdate,
    sub: str = Depends(current_sub),
    db: Session = Depends(get_db)
):
    user = get_user(db, sub)
    p = db.query(Post).get(post_id)
    if not p: raise HTTPException(404, "Post not found")
    ensure_can_edit(user, p)

    if body.title is not None: p.title = body.title
    if body.content_md is not None: p.content_md = body.content_md
    if body.category is not None: p.category = body.category
    if body.meta is not None: p.meta = body.meta
    db.commit(); db.refresh(p)
    return p

# 게시글 삭제
@router.delete("/{post_id}", response_model=dict)
def delete_post(
    post_id: str,
    sub: str = Depends(current_sub),
    db: Session = Depends(get_db)
):
    user = get_user(db, sub)
    p = db.query(Post).get(post_id)
    if not p: raise HTTPException(404, "Post not found")
    ensure_can_edit(user, p)
    db.delete(p); db.commit()
    return {"ok": True}

# ✅ 댓글 생성
@router.post("/{post_id}/comments", response_model=dict)
async def create_comment(
    post_id: str,
    request: Request,                                 # ✅ Request로 직접 파싱
    sub: str = Depends(current_sub),
    db: Session = Depends(get_db),
):
    user = get_user(db, sub)
    post = db.query(Post).get(post_id)
    if not post:
        raise HTTPException(404, "Post not found")

    # ✅ JSON → 폼 순서로 시도
    content = None
    try:
        data = await request.json()
        content = (data or {}).get("content")
    except Exception:
        pass
    if not content:
        form = await request.form()
        content = form.get("content")

    if not content or not str(content).strip():
        raise HTTPException(status_code=422, detail="content required")

    c = Comment(post_id=post_id, author_id=user.id, content=str(content).strip())
    db.add(c); db.commit(); db.refresh(c)
    return {"ok": True, "id": c.id}

# ✅ 댓글 수정
@router.patch("/{post_id}/comments/{comment_id}", response_model=dict)
async def update_comment(
    post_id: str, comment_id: str, request: Request,
    sub: str = Depends(current_sub), db: Session = Depends(get_db),
):
    user = get_user(db, sub)
    c = db.query(Comment).get(comment_id)
    if not c or c.post_id != post_id:
        raise HTTPException(404, "Comment not found")
    ensure_can_edit_comment(user, c)

    new_content = None
    try:
        data = await request.json()
        new_content = (data or {}).get("content")
    except Exception:
        pass
    if not new_content:
        form = await request.form()
        new_content = form.get("content")

    if not new_content or not str(new_content).strip():
        raise HTTPException(422, "content required")

    c.content = str(new_content).strip()
    db.commit()
    return {"ok": True}

# ✅ 댓글 삭제
@router.delete("/{post_id}/comments/{comment_id}", response_model=dict)
def delete_comment(
    post_id: str,
    comment_id: str,
    sub: str = Depends(current_sub),
    db: Session = Depends(get_db),
):
    user = get_user(db, sub)
    c = db.query(Comment).get(comment_id)
    if not c or c.post_id != post_id: raise HTTPException(404, "Comment not found")
    ensure_can_edit_comment(user, c)
    db.delete(c); db.commit()
    return {"ok": True}
