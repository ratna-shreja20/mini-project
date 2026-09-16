import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import connect_to_mongo, close_mongo_connection
from app.routers import auth, verify

app = FastAPI(
    title="CertGuard AI — Certificate Forgery Detection API",
    description="AI-based academic certificate forgery detection system with MongoDB backend.",
    version="1.0.0",
)

# CORS — allow the frontend (Vite dev server and production builds)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Register routers under /api/v1
app.include_router(auth.router, prefix="/api/v1", tags=["auth"])
app.include_router(verify.router, prefix="/api/v1", tags=["verification"])


@app.on_event("startup")
async def startup():
    await connect_to_mongo()


@app.on_event("shutdown")
async def shutdown():
    await close_mongo_connection()


@app.get("/")
async def root():
    return {
        "service": "CertGuard AI API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/api/v1/health")
async def health():
    return {"status": "healthy"}


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True,
    )
