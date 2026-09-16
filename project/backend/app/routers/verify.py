from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, UploadFile, File, Query

from ..core.database import get_db
from ..models.schemas import VerificationRecord
from ..services.forgery_detection import analyze_image, analyze_pdf, classify_verdict

router = APIRouter()

ALLOWED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".pdf"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


@router.post("/verify")
async def verify_document(
    file: UploadFile = File(...),
    user_id: str = Query(...),
):
    db = get_db()
    if db is None:
        raise HTTPException(status_code=500, detail="Database not connected")

    # Validate file extension
    filename = file.filename or "unknown"
    ext = "." + filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Only PNG, JPG, JPEG, and PDF files are supported.",
        )

    # Read file bytes
    file_bytes = await file.read()
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File size exceeds 10 MB limit.")

    # Run analysis
    if ext == ".pdf":
        details = analyze_pdf(file_bytes)
    else:
        details = analyze_image(file_bytes)

    # Classify verdict
    verdict, confidence = classify_verdict(
        details["ela_analysis"]["anomaly_score"],
        details["extracted_lines"],
    )

    # Create timestamp
    now = datetime.now(timezone.utc)
    created_at = now.strftime("%Y-%m-%d %H:%M:%S")

    # Build record
    record = {
        "filename": filename,
        "verdict": verdict,
        "confidence_score": confidence,
        "created_at": created_at,
        "user_id": user_id,
        "details": details,
    }

    # Look up username for admin audit logs
    user = await db.users.find_one({"_id": _to_object_id(user_id)})
    if user:
        record["username"] = user.get("username", "")

    # Insert into MongoDB
    result = await db.verifications.insert_one(record)
    record["_id"] = str(result.inserted_id)

    return VerificationRecord(
        _id=str(result.inserted_id),
        filename=record["filename"],
        verdict=record["verdict"],
        confidence_score=record["confidence_score"],
        created_at=record["created_at"],
        user_id=record["user_id"],
        username=record.get("username"),
        details=details,
    )


@router.get("/dashboard-stats")
async def dashboard_stats(user_id: str = Query(...), role: str = Query("user")):
    db = get_db()
    if db is None:
        raise HTTPException(status_code=500, detail="Database not connected")

    # Build query based on role
    query = {} if role == "admin" else {"user_id": user_id}

    # Fetch all verification records for this user (or all if admin)
    cursor = db.verifications.find(query).sort("_id", -1)
    records_raw = await cursor.to_list(length=500)

    # Compute stats
    total = len(records_raw)
    genuine = sum(1 for r in records_raw if r.get("verdict") == "Genuine")
    suspicious = sum(1 for r in records_raw if r.get("verdict") == "Suspicious")
    fake = sum(1 for r in records_raw if r.get("verdict") == "Fake")

    # Serialize records for the frontend
    records = []
    for r in records_raw:
        records.append(
            {
                "id": str(r["_id"]),
                "filename": r.get("filename", ""),
                "verdict": r.get("verdict", ""),
                "confidence_score": r.get("confidence_score", 0.0),
                "created_at": r.get("created_at", ""),
                "user_id": r.get("user_id"),
                "username": r.get("username"),
                "details": r.get("details"),
            }
        )

    return {
        "total": total,
        "genuine": genuine,
        "suspicious": suspicious,
        "fake": fake,
        "records": records,
    }


def _to_object_id(oid: str):
    from bson import ObjectId

    try:
        return ObjectId(oid)
    except Exception:
        return None
