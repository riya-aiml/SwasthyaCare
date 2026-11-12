from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timezone
from .routers.predict import router as predict_router
from .routers.ocr import router as ocr_router
from .routers.internal_assessments import router as internal_assessments_router
from .services.model_registry import registry

app = FastAPI(
    title="SwasthyaCare AI & Clinical Decision Support Service",
    description="Microservice providing cardiovascular & diabetes risk estimation prototypes and medicine packaging OCR recognition.",
    version="1.0.0-prototype",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(predict_router)
app.include_router(ocr_router)
app.include_router(internal_assessments_router)

@app.on_event("startup")
async def startup_event():
    """Ensure models are warm-loaded on service startup."""
    registry.load_all_models()

@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "service": "SwasthyaCare AI Service",
        "version": "1.0.0-prototype",
        "timestamp_utc": datetime.now(timezone.utc).isoformat(),
    }

@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "Welcome to SwasthyaCare AI & Clinical Decision Support Microservice",
        "endpoints": {
            "health": "/health",
            "docs": "/docs",
            "heart_risk": "/api/v1/predict/heart-risk",
            "diabetes_risk": "/api/v1/predict/diabetes-risk",
            "ocr_medicine": "/api/v1/ocr/medicine",
            "ocr_upload": "/api/v1/ocr/upload-packaging",
        },
    }
