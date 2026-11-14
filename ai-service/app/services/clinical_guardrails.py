"""
SwasthyaCare AI Service — Clinical Safety Guardrails & Negation Detection
Phase 6: Clinical Safety Hardening
1. Contextual Negation Handling for Red-Flag Triage (NegEx clinical NLP principles).
2. Structured Symptom Clarification Engine (SOCRATES / OPQRST clinical framework).
3. Safe Educational Pharmacology Guardrails with strict anti-prescription enforcement.
"""

import re
from typing import List, Tuple, Dict, Any, Optional
from app.schemas.chat_assistant import ChatIntent


class ClinicalNegationDetector:
    """
    Implements clinical NegEx negation detection to prevent false-positive P0 Emergency
    lockouts when patients explicitly negate red-flag symptoms.
    Examples:
      - "I do not have any chest pain, just a mild skin rash" -> Negated (Not an emergency)
      - "No shortness of breath, no palpitations" -> Negated
      - "Seene me koi dard nahi hai, bas thoda bukhar hai" -> Negated (Vernacular)
      - "Chest pain is unbearable and not stopping" -> Affirmative (EMERGENCY)
    """

    # Pre-negation cues (English)
    PRE_NEGATION_CUES = [
        r"\bno\b",
        r"\bnot\b",
        r"\bnone\b",
        r"\bwithout\b",
        r"\bdenies\b",
        r"\bdenied\b",
        r"\bdenying\b",
        r"\bnegative\s+for\b",
        r"\brules?\s+out\b",
        r"\bruled\s+out\b",
        r"\bfree\s+of\b",
        r"\bnever\s+had\b",
        r"\bnever\b",
        r"\bzero\b",
        r"\babsence\s+of\b",
        r"\bno\s+signs?\s+of\b",
        r"\bno\s+history\s+of\b",
        r"\bdon'?t\s+have\b",
        r"\bdo\s+not\s+have\b",
        r"\bdoes\s+not\s+have\b",
        r"\bdoesn'?t\s+have\b",
        r"\bdidn'?t\s+have\b",
        r"\bdid\s+not\s+have\b",
        r"\bhaven'?t\s+had\b",
        r"\bhasn'?t\s+had\b",
        r"\bhas\s+no\b",
        r"\bhave\s+no\b",
    ]

    # Pre-negation cues (Hindi / Hinglish)
    VERNACULAR_PRE_NEGATION = [
        r"\bkoi\s+(bhi\s+)?(dard|takleef|dikkat)\s+nahi\b",
        r"\bbina\s+kisi\b",
        r"\bnahi\s+hai\b",
    ]

    # Post-negation cues (English & Hindi)
    POST_NEGATION_CUES = [
        r"\bis\s+ruled\s+out\b",
        r"\bwas\s+ruled\s+out\b",
        r"\bunlikely\b",
        r"\bfree\b",
        # Hindi post-negation: e.g. "chhati me dard nahi hai"
        r"\bnahi\s+hai\b",
        r"\bnahi\s+ho\s+raha\b",
        r"\bnahi\s+tha\b",
        r"\bkoi\s+nahi\s+hai\b",
        r"\bmat\b",
    ]

    # Pseudo-negations: Phrases containing negation words that are NOT clinically negating the symptom
    PSEUDO_NEGATIONS = [
        r"\bnot\s+only\b",
        r"\bnot\s+just\b",
        r"\bnot\s+stopping\b",
        r"\bnot\s+relieved\b",
        r"\bnot\s+getting\s+better\b",
        r"\bnot\s+fading\b",
        r"\bnot\s+subsiding\b",
        r"\bno\s+relief\b",
        r"\bcan'?t\s+bear\b",
        r"\bunable\s+to\s+bear\b",
    ]

    # Clause boundary delimiters (conjunctions and punctuation that terminate negation scope)
    CLAUSE_BOUNDARIES = re.compile(r"[,;.:!?]|\b(but|however|although|nevertheless|yet|lekin|parantu|magar)\b", re.IGNORECASE)

    @classmethod
    def is_phrase_negated(cls, full_text: str, match_start: int, match_end: int) -> bool:
        """
        Determines if a matched symptom pattern in full_text is clinically negated.
        Evaluates a preceding window (up to 40 chars or clause boundary) and
        a succeeding window (up to 30 chars or clause boundary).
        """
        lower = full_text.lower()

        # 1. Check for pseudo-negation phrases around the match
        local_context = lower[max(0, match_start - 35):min(len(lower), match_end + 35)]
        for pseudo in cls.PSEUDO_NEGATIONS:
            if re.search(pseudo, local_context):
                return False

        # 2. Check preceding window (Pre-negation scope)
        preceding_text = lower[:match_start]
        # Split by clause boundaries to only consider the current clause
        clauses_before = cls.CLAUSE_BOUNDARIES.split(preceding_text)
        current_clause_before = clauses_before[-1] if clauses_before else preceding_text

        # Take the last 5 words before the match
        words_before = current_clause_before.strip().split()
        window_before_text = " ".join(words_before[-5:]) if len(words_before) > 5 else current_clause_before

        for cue in cls.PRE_NEGATION_CUES:
            if re.search(cue, window_before_text):
                return True

        # 3. Check succeeding window (Post-negation scope, especially common in Hindi SOV order)
        succeeding_text = lower[match_end:]
        clauses_after = cls.CLAUSE_BOUNDARIES.split(succeeding_text)
        current_clause_after = clauses_after[0] if clauses_after else succeeding_text

        # Take first 4 words after the match
        words_after = current_clause_after.strip().split()
        window_after_text = " ".join(words_after[:4]) if len(words_after) > 4 else current_clause_after

        for cue in cls.POST_NEGATION_CUES:
            if re.search(cue, window_after_text):
                return True

        return False

    @classmethod
    def evaluate_emergency_with_negation(
        cls,
        message: str,
        red_flag_patterns: List[str],
    ) -> Tuple[bool, Optional[str]]:
        """
        Scans message against all red_flag_patterns.
        Returns (is_emergency, affirmative_matched_pattern).
        If matches are found but all are negated, returns (False, None).
        """
        for pat in red_flag_patterns:
            for match in re.finditer(pat, message, re.IGNORECASE):
                # Check if this specific match instance is negated
                if not cls.is_phrase_negated(message, match.start(), match.end()):
                    return True, match.group(0)

        return False, None


class SymptomClarifier:
    """
    Structured Clinical Symptom Clarification Engine.
    When patients present non-emergency acute symptoms (headache, abdominal ache, fever, cough),
    the assistant initiates the evidence-based SOCRATES / OPQRST clinical framework.
    """

    NON_EMERGENCY_SYMPTOM_PATTERNS = {
        "headache": [
            r"\b(headache|head\s+hurts?|head\s+ache|sar\s+dard|matha\s+dard)\b",
        ],
        "abdominal_pain": [
            r"\b(stomach|belly|abdomen|abdominal|tummy)\s+(is\s+)?(hurt(ing|s)?|cramp(ing|s)?)\b",
            r"\b(stomach\s+pain|stomach\s+ache|belly\s+pain|abdominal\s+pain|tummy\s+ache|pet\s+dard)\b",
        ],
        "joint_back_pain": [
            r"\b(back\s+pain|backache|knee\s+pain|joint\s+pain|kamar\s+dard|ghutne\s+me\s+dard)\b",
        ],
        "respiratory_mild": [
            r"\b(mild\s+cough|cold\s+and\s+cough|sore\s+throat|runny\s+nose|khasi|gala\s+kharash)\b",
        ],
        "fever_mild": [
            r"\b(mild\s+fever|low\s+grade\s+fever|fever\s+for\s+\d+\s*days?|bukhar)\b",
        ],
    }

    @classmethod
    def detect_mild_symptom(cls, message: str) -> Optional[str]:
        lower = message.lower()
        for symptom_type, patterns in cls.NON_EMERGENCY_SYMPTOM_PATTERNS.items():
            for pat in patterns:
                if re.search(pat, lower):
                    return symptom_type
        return None

    @classmethod
    def generate_socrates_clarification(cls, symptom_type: str, query: str) -> str:
        symptom_labels = {
            "headache": "headache",
            "abdominal_pain": "stomach discomfort",
            "joint_back_pain": "joint or back discomfort",
            "respiratory_mild": "cough or sore throat",
            "fever_mild": "fever",
        }
        name = symptom_labels.get(symptom_type, "symptom")

        return (
            f"I understand you are experiencing {name}. To help understand your situation and guide you "
            f"toward the appropriate clinical specialty, please consider these details (the SOCRATES assessment):\n\n"
            f"1. **Site & Spread:** Where exactly is the discomfort, and does it radiate to your neck, back, or shoulders?\n"
            f"2. **Onset & Duration:** When did it start, and was the onset sudden or gradual?\n"
            f"3. **Character:** Is it throbbing, sharp, burning, dull, or cramp-like?\n"
            f"4. **Severity:** On a scale from 1 (mild) to 10 (unbearable), how would you rate it?\n"
            f"5. **Associated Signs:** Are you noticing fever, nausea, vomiting, dizziness, or visual changes?\n"
            f"6. **Aggravating/Relieving Factors:** Does movement, light, food, or rest make it better or worse?\n\n"
            f"⚠️ **Warning Red Flags:** If you experience sudden 'thunderclap' severity, stiff neck, high fever (>102°F), "
            f"confusion, or loss of balance, please visit the emergency department or dial **112 / 108** immediately.\n\n"
            f"Would you like me to help you book an OPD consultation with our General Medicine or Specialist doctors?"
        )


class EducationalPharmacologyEngine:
    """
    Distinguishes educational drug inquiries from illegal/unsafe prescription requests.
    Educates on Mechanism of Action (MOA) and recognized drug interactions while
    strictly blocking dosage calculation, drug alterations, and new prescriptions.
    """

    DRUG_EDUCATION_DATABASE = {
        "metformin": {
            "class": "Biguanide Oral Antihyperglycemic",
            "moa": "Decreases hepatic glucose production, decreases intestinal absorption of glucose, and improves insulin sensitivity by increasing peripheral glucose uptake.",
            "administration_guidance": "Usually administered with or after meals to reduce common gastrointestinal side effects.",
            "common_side_effects": "Nausea, diarrhea, stomach upset, metallic taste.",
            "guideline_source": "ICMR Guidelines for Type 2 Diabetes [DOC-CLIN-01]",
        },
        "telmisartan": {
            "class": "Angiotensin II Receptor Blocker (ARB)",
            "moa": "Selectively blocks the binding of Angiotensin II to the AT1 receptor in vascular smooth muscle, causing vasodilation and reducing blood pressure.",
            "administration_guidance": "Taken once daily with or without food. Blood pressure monitoring is recommended during initiation.",
            "common_side_effects": "Dizziness, lightheadedness, back pain, sinus congestion.",
            "guideline_source": "ICMR & Indian Guidelines on Hypertension (IGH-IV) [DOC-CLIN-02]",
        },
        "atorvastatin": {
            "class": "HMG-CoA Reductase Inhibitor (Statin)",
            "moa": "Inhibits HMG-CoA reductase, the rate-limiting enzyme in cholesterol biosynthesis, upregulating hepatic LDL receptors and lowering blood LDL-C and triglycerides.",
            "administration_guidance": "Usually taken once daily in the evening or at bedtime with or without food.",
            "common_side_effects": "Headache, mild muscle ache (myalgia), digestive symptoms.",
            "guideline_source": "WHO HEARTS & ICMR Dyslipidemia Protocols [DOC-CLIN-03]",
        },
        "paracetamol": {
            "class": "Analgesic & Antipyretic",
            "moa": "Inhibits central prostaglandin synthesis with analgesic and antipyretic properties, with minimal peripheral anti-inflammatory action.",
            "administration_guidance": "Must strictly avoid exceeding maximum daily safe limits due to risk of hepatotoxicity. Avoid concurrent alcohol intake.",
            "common_side_effects": "Generally well tolerated at therapeutic doses; excessive doses cause severe liver damage.",
            "guideline_source": "Indian Pharmacopoeia & National Essential Medicines List [DOC-CLIN-06]",
        },
    }

    @classmethod
    def get_educational_summary(cls, drug_name: str) -> Optional[str]:
        drug_key = drug_name.lower().strip()
        info = cls.DRUG_EDUCATION_DATABASE.get(drug_key)
        if not info:
            return None

        return (
            f"**Pharmacological Education: {drug_name.title()}**\n\n"
            f"- **Drug Classification:** {info['class']}\n"
            f"- **Mechanism of Action:** {info['moa']}\n"
            f"- **Administration Principles:** {info['administration_guidance']}\n"
            f"- **Common Recognized Side Effects:** {info['common_side_effects']}\n"
            f"- **Reference Standard:** {info['guideline_source']}\n\n"
            f"🔒 *Safety Advisory: This information is for educational purposes only. SwasthyaCare Assistant "
            f"cannot recommend dosages, adjust regimens, or prescribe medications. Never start, stop, or change "
            f"the dose of any medication without consulting your treating physician.*"
        )
