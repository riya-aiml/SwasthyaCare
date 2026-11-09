from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, timezone

OCR_SAFETY_ADVISORY = (
    "MEDICATION IDENTIFICATION ADVISORY: OCR text extraction and database candidate matching "
    "are supportive prototypes only. Never start, discontinue, or alter dosages of any medication "
    "based solely on digital image recognition. Always verify the packaging, prescription, "
    "and instructions with a registered physician or pharmacist."
)


class MedicineMatchCandidate(BaseModel):
    brand_name: str
    generic_name: str
    therapeutic_class: str
    strength: str
    dosage_form: str
    confidence_score: float = Field(..., ge=0.0, le=1.0)
    matched_tokens: List[str]


class OCRMedicineResponse(BaseModel):
    service_id: str = "swasthya-medicine-ocr"
    version: str = "v1.0.0-prototype"
    timestamp_utc: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    extracted_text: str
    is_inconclusive: bool
    candidate_matches: List[MedicineMatchCandidate]
    safety_advisory: str = OCR_SAFETY_ADVISORY
