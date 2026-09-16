import bcrypt
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException

from ..core.database import get_db
from ..models.schemas import LoginRequest, SignupRequest, AuthResponse

router = APIRouter()


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


@router.post("/signup", response_model=AuthResponse)
async def signup(req: SignupRequest):
    db = get_db()
    if db is None:
        raise HTTPException(status_code=500, detail="Database not connected")

    if req.role not in ("user", "admin"):
        raise HTTPException(status_code=400, detail="Role must be 'user' or 'admin'")

    # Check if username already exists
    existing = await db.users.find_one({"username": req.username})
    if existing:
        raise HTTPException(status_code=409, detail="Username already exists")

    user_doc = {
        "username": req.username,
        "password": hash_password(req.password),
        "role": req.role,
        "created_at": datetime.now(timezone.utc),
    }

    result = await db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)

    return AuthResponse(user_id=user_id, username=req.username, role=req.role)


@router.post("/login", response_model=AuthResponse)
async def login(req: LoginRequest):
    db = get_db()
    if db is None:
        raise HTTPException(status_code=500, detail="Database not connected")

    user = await db.users.find_one({"username": req.username})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid username or password")

    if not verify_password(req.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid username or password")

    return AuthResponse(
        user_id=str(user["_id"]),
        username=user["username"],
        role=user.get("role", "user"),
    )
