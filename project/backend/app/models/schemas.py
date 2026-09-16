from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class LoginRequest(BaseModel):
    username: str
    password: str


class SignupRequest(BaseModel):
    username: str
    password: str
    role: str = "user"  # "user" or "admin"


class AuthResponse(BaseModel):
    user_id: str
    username: str
    role: str


class ELAAnalysis(BaseModel):
    anomaly_score: float
    is_tampered: bool


class VerificationDetails(BaseModel):
    ela_analysis: ELAAnalysis
    extracted_text_count: int
    extracted_lines: list[str]


class VerificationRecord(BaseModel):
    id: str = Field(alias="_id")
    filename: str
    verdict: str  # "Genuine", "Suspicious", "Fake"
    confidence_score: float
    created_at: str
    user_id: Optional[str] = None
    username: Optional[str] = None
    details: Optional[VerificationDetails] = None

    class Config:
        populate_by_name = True


class DashboardStats(BaseModel):
    total: int
    genuine: int
    suspicious: int
    fake: int
    records: list[dict]
