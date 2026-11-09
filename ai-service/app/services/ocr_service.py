import re
from typing import List, Tuple
from ..schemas.ocr import OCRMedicineResponse, MedicineMatchCandidate, OCR_SAFETY_ADVISORY

# Synthetic Pharmaceutical Formulary Database (S6-03 synthetic data)
FORMULARY_DATABASE = [
    {
        "brand_name": "Glucophage",
        "generic_name": "Metformin Hydrochloride",
        "therapeutic_class": "Biguanide / Antidiabetic",
        "strength": "500mg",
        "dosage_form": "Extended-Release Tablet",
        "keywords": ["glucophage", "metformin", "hydrochloride", "500mg", "antidiabetic"],
    },
    {
        "brand_name": "Lipitor",
        "generic_name": "Atorvastatin Calcium",
        "therapeutic_class": "HMG-CoA Reductase Inhibitor / Statin",
        "strength": "20mg",
        "dosage_form": "Film-Coated Tablet",
        "keywords": ["lipitor", "atorvastatin", "calcium", "20mg", "cholesterol", "statin"],
    },
    {
        "brand_name": "Norvasc",
        "generic_name": "Amlodipine Besylate",
        "therapeutic_class": "Calcium Channel Blocker / Antihypertensive",
        "strength": "5mg",
        "dosage_form": "Tablet",
        "keywords": ["norvasc", "amlodipine", "besylate", "5mg", "antihypertensive"],
    },
    {
        "brand_name": "Augmentin",
        "generic_name": "Amoxicillin and Clavulanate Potassium",
        "therapeutic_class": "Beta-lactam Antibiotic",
        "strength": "625mg",
        "dosage_form": "Tablet",
        "keywords": ["augmentin", "amoxicillin", "clavulanate", "potassium", "625mg", "antibiotic"],
    },
    {
        "brand_name": "Crocin",
        "generic_name": "Paracetamol / Acetaminophen",
        "therapeutic_class": "Analgesic & Antipyretic",
        "strength": "650mg",
        "dosage_form": "Tablet",
        "keywords": ["crocin", "paracetamol", "acetaminophen", "650mg", "fever", "pain"],
    },
    {
        "brand_name": "Ecosprin",
        "generic_name": "Aspirin",
        "therapeutic_class": "Antiplatelet Agent",
        "strength": "75mg",
        "dosage_form": "Enteric-Coated Tablet",
        "keywords": ["ecosprin", "aspirin", "acetylsalicylic", "75mg", "antiplatelet"],
    },
]


def extract_and_match_packaging_text(raw_text: str) -> OCRMedicineResponse:
    """
    Parses extracted text from medicine packaging and searches formulary database.
    Calculates candidate match confidence and handles inconclusive states safely.
    """
    cleaned = raw_text.lower()
    tokens = set(re.findall(r'[a-zA-Z0-9]+', cleaned))

    candidates: List[MedicineMatchCandidate] = []

    for drug in FORMULARY_DATABASE:
        matched_tokens = []
        for kw in drug["keywords"]:
            if kw in tokens or kw in cleaned:
                matched_tokens.append(kw)

        if matched_tokens:
            # Score based on proportion of drug keywords found
            confidence = round(len(matched_tokens) / len(drug["keywords"]), 2)
            # Minimum confidence threshold for candidate consideration
            if confidence >= 0.25:
                candidates.append(
                    MedicineMatchCandidate(
                        brand_name=drug["brand_name"],
                        generic_name=drug["generic_name"],
                        therapeutic_class=drug["therapeutic_class"],
                        strength=drug["strength"],
                        dosage_form=drug["dosage_form"],
                        confidence_score=min(confidence, 0.98),
                        matched_tokens=matched_tokens,
                    )
                )

    # Sort descending by confidence score
    candidates.sort(key=lambda x: x.confidence_score, reverse=True)

    is_inconclusive = len(candidates) == 0 or (len(candidates) > 0 and candidates[0].confidence_score < 0.40)

    return OCRMedicineResponse(
        extracted_text=raw_text.strip(),
        is_inconclusive=is_inconclusive,
        candidate_matches=candidates,
        safety_advisory=OCR_SAFETY_ADVISORY,
    )
