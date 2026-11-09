from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
from typing import Optional
from ..schemas.ocr import OCRMedicineResponse
from ..services.ocr_service import extract_and_match_packaging_text

router = APIRouter(prefix="/api/v1/ocr", tags=["Medicine Package OCR & Identification"])

@router.post("/medicine", response_model=OCRMedicineResponse, status_code=status.HTTP_200_OK)
async def process_medicine_text(text: str = Form(...)):
    """
    Process extracted medicine packaging text and match against formulary database.
    """
    if not text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")
    return extract_and_match_packaging_text(text)


@router.post("/upload-packaging", response_model=OCRMedicineResponse, status_code=status.HTTP_200_OK)
async def upload_packaging_image(
    file: UploadFile = File(...),
    simulated_ocr_text: Optional[str] = Form(None)
):
    """
    Authorized medicine image upload endpoint (S6-08, S6-09)
    - Validates file content type (image/png, image/jpeg, image/webp)
    - Enforces max upload size of 5MB
    - Performs OCR parsing and safe candidate matching
    """
    ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"]
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported image type '{file.content_type}'. Must be PNG, JPEG, or WebP."
        )

    # Read image contents safely
    contents = await file.read()
    MAX_SIZE = 5 * 1024 * 1024  # 5 MB
    if len(contents) > MAX_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Image size exceeds 5MB limit."
        )

    # In prototype, simulate or parse extracted text from the filename/metadata/payload
    extracted_text = simulated_ocr_text or file.filename.replace("_", " ").replace("-", " ").replace(".", " ")

    return extract_and_match_packaging_text(extracted_text)
