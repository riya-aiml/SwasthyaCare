"""
SwasthyaCare AI Service — Real Clinical Data Preprocessor
Processes authentic clinical benchmark datasets:
1. Gretel.ai Clinical Symptom-to-Diagnosis Benchmark (train.jsonl & test.jsonl)
2. Kaggle Columbia University Disease-Symptom Benchmark (kaggle_disease_symptoms_4920.csv)

Maps ICD-10 clinical diagnoses to 8 primary hospital OPD specialty departments:
- Cardiology
- Endocrinology
- Pulmonology
- Gastroenterology
- Orthopedics
- Neurology
- Dermatology
- General_Medicine

Generates production-grade processed datasets with verified clinical provenance.
"""

import os
import json
import re
import pandas as pd
from typing import Dict, List, Tuple

RAW_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "raw")
PROCESSED_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "processed")
os.makedirs(PROCESSED_DIR, exist_ok=True)

# Standard Medical Ontology Mapping: Diagnosis -> Hospital Outpatient Department
DIAGNOSIS_TO_SPECIALTY: Dict[str, str] = {
    # Cardiology
    "hypertension": "Cardiology",
    "varicose veins": "Cardiology",
    "heart attack": "Cardiology",

    # Endocrinology
    "diabetes": "Endocrinology",
    "hypothyroidism": "Endocrinology",
    "hyperthyroidism": "Endocrinology",
    "hypoglycemia": "Endocrinology",

    # Pulmonology
    "bronchial asthma": "Pulmonology",
    "pneumonia": "Pulmonology",
    "tuberculosis": "Pulmonology",
    "common cold": "Pulmonology",

    # Gastroenterology
    "gastroesophageal reflux disease": "Gastroenterology",
    "gerd": "Gastroenterology",
    "peptic ulcer disease": "Gastroenterology",
    "peptic ulcer diseae": "Gastroenterology",
    "jaundice": "Gastroenterology",
    "gastroenteritis": "Gastroenterology",
    "chronic cholestasis": "Gastroenterology",
    "alcoholic hepatitis": "Gastroenterology",
    "hepatitis a": "Gastroenterology",
    "hepatitis b": "Gastroenterology",
    "hepatitis c": "Gastroenterology",
    "hepatitis d": "Gastroenterology",
    "hepatitis e": "Gastroenterology",
    "dimorphic hemmorhoids(piles)": "Gastroenterology",

    # Orthopedics
    "cervical spondylosis": "Orthopedics",
    "arthritis": "Orthopedics",
    "osteoarthristis": "Orthopedics",
    "osteoarthritis": "Orthopedics",

    # Neurology
    "migraine": "Neurology",
    "paralysis (brain hemorrhage)": "Neurology",
    "(vertigo) paroymsal  positional vertigo": "Neurology",
    "(vertigo) paroxysmal positional vertigo": "Neurology",

    # Dermatology
    "psoriasis": "Dermatology",
    "impetigo": "Dermatology",
    "acne": "Dermatology",
    "fungal infection": "Dermatology",

    # General Medicine
    "malaria": "General_Medicine",
    "dengue": "General_Medicine",
    "typhoid": "General_Medicine",
    "allergy": "General_Medicine",
    "urinary tract infection": "General_Medicine",
    "chicken pox": "General_Medicine",
    "drug reaction": "General_Medicine",
    "aids": "General_Medicine"
}


def clean_text(text: str) -> str:
    """Standardizes natural language text."""
    if not isinstance(text, str):
        return ""
    text = text.strip()
    text = re.sub(r"\s+", " ", text)
    return text


def load_gretel_narratives() -> List[Dict[str, str]]:
    """Loads and standardizes real patient narratives from Gretel.ai benchmark."""
    train_file = os.path.join(RAW_DIR, "symptom_to_diagnosis_train.jsonl")
    test_file = os.path.join(RAW_DIR, "symptom_to_diagnosis_test.jsonl")

    records = []

    for filepath in [train_file, test_file]:
        if not os.path.isfile(filepath):
            continue
        with open(filepath, "r", encoding="utf-8") as f:
            for line in f:
                if not line.strip():
                    continue
                data = json.loads(line)
                diagnosis = data.get("output_text", "").strip().lower()
                symptom_text = clean_text(data.get("input_text", ""))

                dept = DIAGNOSIS_TO_SPECIALTY.get(diagnosis)
                if dept and symptom_text:
                    records.append({
                        "symptom_text": symptom_text,
                        "diagnosis": diagnosis,
                        "department": dept,
                        "provenance": "Gretel.ai Clinical Benchmark (HuggingFace)"
                    })

    print(f"Loaded {len(records)} records from Gretel.ai clinical narratives.")
    return records


def load_kaggle_symptoms() -> List[Dict[str, str]]:
    """
    Loads Columbia University / Kaggle 4,920 records dataset.
    Converts binary symptom flags into clinical natural language complaint presentations.
    """
    csv_path = os.path.join(RAW_DIR, "kaggle_disease_symptoms_4920.csv")
    if not os.path.isfile(csv_path):
        return []

    df = pd.read_csv(csv_path)
    # Drop empty columns
    df = df.dropna(axis=1, how="all")

    symptom_cols = [c for c in df.columns if c.lower() not in ["prognosis", "unnamed: 133"]]

    # Format symptom column names into natural language (e.g. "chest_pain" -> "chest pain")
    col_to_phrase = {c: c.replace("_", " ").strip() for c in symptom_cols}

    records = []
    # Use diverse symptom profiles across all 41 diseases
    # Cap per disease at 60 rows to prevent any single department (e.g. Hepatitis/GI) from dominating
    disease_counts: Dict[str, int] = {}

    templates = [
        "Patient presents with {symptoms}.",
        "Experiencing {symptoms} for the past several days.",
        "Clinical complaint of {symptoms}.",
        "I have been having {symptoms} and need medical consultation.",
        "Chief complaint includes {symptoms}.",
        "I am suffering from severe {symptoms} and need to see a specialist.",
        "Experiencing persistent {symptoms}.",
        "I need to book an appointment with a doctor for my {symptoms}.",
        "Suffering from uncomfortable {symptoms} recently.",
        "Please help me, I have {symptoms}."
    ]

    idx = 0
    # Shuffle dataframe with fixed seed for clinical reproducibility
    shuffled_df = df.sample(frac=1.0, random_state=42).reset_index(drop=True)

    for _, row in shuffled_df.iterrows():
        diag = str(row.get("prognosis", "")).strip().lower()
        dept = DIAGNOSIS_TO_SPECIALTY.get(diag)
        if not dept:
            continue

        if disease_counts.get(diag, 0) >= 50:
            continue

        # Get active symptoms
        active_symptoms = [col_to_phrase[col] for col in symptom_cols if row[col] == 1]
        if not active_symptoms:
            continue

        if len(active_symptoms) == 1:
            sym_str = active_symptoms[0]
        elif len(active_symptoms) == 2:
            sym_str = f"{active_symptoms[0]} and {active_symptoms[1]}"
        else:
            sym_str = ", ".join(active_symptoms[:-1]) + f", and {active_symptoms[-1]}"

        template = templates[idx % len(templates)]
        idx += 1
        narrative = template.format(symptoms=sym_str)

        records.append({
            "symptom_text": narrative,
            "diagnosis": diag,
            "department": dept,
            "provenance": "Kaggle Columbia University Disease-Symptom Benchmark"
        })
        disease_counts[diag] = disease_counts.get(diag, 0) + 1

    print(f"Loaded {len(records)} natural-language presentations from Kaggle disease-symptom benchmark across {len(disease_counts)} diseases.")

    print(f"Loaded {len(records)} natural-language presentations from Kaggle disease-symptom benchmark.")
    return records


def build_unified_dataset():
    """Builds and saves the unified real-world dataset."""
    gretel_records = load_gretel_narratives()
    kaggle_records = load_kaggle_symptoms()

    all_records = gretel_records + kaggle_records

    out_file = os.path.join(PROCESSED_DIR, "real_clinical_specialties_dataset.json")
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(all_records, f, indent=2)

    df = pd.DataFrame(all_records)
    print("\n=== UNIFIED PRODUCTION CLINICAL DATASET SUMMARY ===")
    print(f"Total authentic clinical records: {len(all_records)}")
    print("\nDistribution across 8 Hospital Departments:")
    print(df["department"].value_counts())
    print(f"\nSaved processed real dataset to: {out_file}")


if __name__ == "__main__":
    build_unified_dataset()
