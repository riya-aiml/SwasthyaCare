"""
SwasthyaCare AI Service — Phase 5 Hybrid Retrieval & Vernacular Support Tests
Sprint 10: Task S10-02 & Phase 5 Hardening
Verifies:
1. Vernacular query expansion for Hindi / Hinglish medical queries.
2. BM25 lexical keyword ranking with length normalization and IDF.
3. Dense semantic vector space indexing (TF-IDF + TruncatedSVD cosine similarity).
4. Hybrid retrieval fusion and ranking across clinical and platform corpora.
5. Maternal & child health guideline integration (DOC-CLIN-07: ANC, NIS vaccines, breastfeeding).
6. Priority 0 emergency intercept and prescription refusal for Hindi/Hinglish queries.
"""

import os
import sys
import pytest
from fastapi.testclient import TestClient

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from app.main import app
from app.services.hybrid_retrieval import (
    VernacularNormalizer,
    BM25Index,
    SemanticVectorIndex,
    HybridCorpusIndex,
)
from app.services.chat_rag_service import (
    DualCorpusManager,
    IntentClassifier,
    chat_rag_service,
)
from app.schemas.chat_assistant import ChatIntent
from app.core.security import DEFAULT_INTERNAL_SECRET


class TestPhase5HybridRetrieval:

    def setup_method(self):
        self.client = TestClient(app)
        self.secret = DEFAULT_INTERNAL_SECRET
        self.data_dir = os.path.join(BASE_DIR, "data")
        self.corpus_manager = DualCorpusManager(self.data_dir)

    # ========================================================
    # 1. VERNACULAR NORMALIZATION
    # ========================================================
    def test_vernacular_query_expansion_cardiac(self):
        """Hindi cardiac symptom query expands to chest and pain concepts."""
        raw = "Mujhe chhati me dard ho raha hai"
        expanded = VernacularNormalizer.expand_query(raw)
        assert "chest" in expanded
        assert "pain" in expanded

    def test_vernacular_query_expansion_respiratory(self):
        """Hindi respiratory query expands to dyspnea and respiratory concepts."""
        raw = "Saans lene me takleef hai"
        expanded = VernacularNormalizer.expand_query(raw)
        assert "breath" in expanded or "respiratory" in expanded

    def test_vernacular_query_expansion_diabetes_hypertension(self):
        """Vernacular chronic condition terms expand to clinical concepts."""
        raw_db = "shakkar kam karne ke tips"
        expanded_db = VernacularNormalizer.expand_query(raw_db)
        assert "diabetes" in expanded_db or "glucose" in expanded_db

        raw_ht = "raktchap control kaise kare"
        expanded_ht = VernacularNormalizer.expand_query(raw_ht)
        assert "blood pressure" in expanded_ht or "hypertension" in expanded_ht

    def test_vernacular_query_expansion_maternal_child(self):
        """Vernacular terms for child and vaccination expand accurately."""
        raw = "bachha ka teeka lagwana hai"
        expanded = VernacularNormalizer.expand_query(raw)
        assert "child" in expanded or "infant" in expanded
        assert "vaccine" in expanded or "immunization" in expanded

    # ========================================================
    # 2. BM25 LEXICAL INDEX
    # ========================================================
    def test_bm25_index_scoring(self):
        """BM25 index rewards relevant documents based on TF and IDF."""
        docs = [
            ["patient", "fasting", "blood", "glucose", "diabetes", "icmr"],
            ["cardiology", "hypertension", "blood", "pressure", "sodium"],
            ["pediatric", "infant", "vaccine", "immunization", "bcg"],
        ]
        bm25 = BM25Index(k1=1.5, b=0.75)
        bm25.fit(docs)

        scores_glucose = bm25.score(["glucose", "fasting"])
        assert scores_glucose[0] > scores_glucose[1]
        assert scores_glucose[0] > scores_glucose[2]

        scores_vaccine = bm25.score(["vaccine", "infant"])
        assert scores_vaccine[2] > scores_vaccine[0]

    # ========================================================
    # 3. SEMANTIC VECTOR INDEX (LSA)
    # ========================================================
    def test_semantic_vector_index(self):
        """Dense semantic index scores related conceptual queries high."""
        texts = [
            "Clinical management of Type 2 Diabetes Mellitus including fasting blood glucose and HbA1c targets.",
            "Cardiovascular risk assessment and blood pressure control with sodium restriction.",
            "Infant immunization schedule covering BCG, Polio, Pentavalent and Measles vaccines.",
        ]
        vec_index = SemanticVectorIndex(n_components=2)
        vec_index.fit(texts)

        sims_db = vec_index.score("glycemic control and high sugar")
        assert len(sims_db) == 3
        assert sims_db[0] >= 0.0

    # ========================================================
    # 4. HYBRID RETRIEVAL CORPUS SEARCH
    # ========================================================
    def test_hybrid_search_clinical_hypertension(self):
        """Clinical hypertension query retrieves DOC-CLIN-02 via hybrid search."""
        results = self.corpus_manager.search_clinical("What is the sodium limit for high blood pressure?")
        assert len(results) > 0
        top_chunk, score = results[0]
        assert top_chunk.doc_id == "DOC-CLIN-02"
        assert score > 0.10

    def test_hybrid_search_clinical_maternal_child(self):
        """Maternal health query retrieves DOC-CLIN-07."""
        results = self.corpus_manager.search_clinical("How many ANC visits are recommended during pregnancy?")
        assert len(results) > 0
        top_chunk, score = results[0]
        assert top_chunk.doc_id == "DOC-CLIN-07"
        assert "Antenatal Care" in top_chunk.section_title or "Maternal" in top_chunk.title

    def test_hybrid_search_clinical_immunization(self):
        """Infant vaccination query retrieves DOC-CLIN-07."""
        results = self.corpus_manager.search_clinical("What vaccines are given at 6 weeks and 10 weeks?")
        assert len(results) > 0
        top_chunk, score = results[0]
        assert top_chunk.doc_id == "DOC-CLIN-07"
        assert "Immunization" in top_chunk.section_title

    def test_hybrid_search_vernacular_query(self):
        """Hindi Hinglish query for sugar/diabetes retrieves ICMR diabetes guideline."""
        results = self.corpus_manager.search_clinical("Shakkar kam karne ke liye diet tips")
        assert len(results) > 0
        top_chunk, score = results[0]
        assert top_chunk.doc_id == "DOC-CLIN-01"

    # ========================================================
    # 5. INTENT CLASSIFICATION & RED FLAGS FOR VERNACULAR
    # ========================================================
    def test_vernacular_emergency_triage(self):
        """P0 Red Flag: Hindi chest pain query immediately triggers emergency triage."""
        assert IntentClassifier.detect_emergency("Mujhe chhati me bohot tezz dard ho raha hai") is True
        assert IntentClassifier.classify_granular_intent("Mujhe chhati me dard ho raha hai") == ChatIntent.INTENT_EMERGENCY

    def test_vernacular_respiratory_emergency(self):
        """P0 Red Flag: Hindi shortness of breath query triggers emergency triage."""
        assert IntentClassifier.detect_emergency("Saans lene me bohot takleef ho rahi hai") is True
        assert IntentClassifier.classify_granular_intent("Saans lene me takleef hai") == ChatIntent.INTENT_EMERGENCY

    def test_vernacular_prescription_refusal(self):
        """Anti-Prescription safeguard triggers for Hindi medication requests."""
        assert IntentClassifier.detect_prescription_request("Doctor sahab mujhe bp ki konsi dawa leni chahiye?") is True

    # ========================================================
    # 6. END-TO-END RPC ORCHESTRATION WITH PHASE 5
    # ========================================================
    def test_orchestration_maternal_health_guidelines(self):
        """RPC orchestrate returns maternal guideline citations and grounded response."""
        payload = {
            "user_id": "6732f1a9b2c3d4e5f6000001",
            "user_role": "patient",
            "message": "What is the recommended antenatal care visit schedule for pregnant women?",
            "conversation_history": [],
            "patient_context": {"patientAge": 28, "patientGender": "female"},
        }
        resp = self.client.post(
            "/api/v1/chat/internal-orchestrate",
            headers={"X-Internal-Service-Key": self.secret},
            json=payload,
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["intent"] == "INTENT_CLINICAL_QA"
        assert data["is_emergency"] is False
        assert any(c["doc_id"] == "DOC-CLIN-07" for c in data["citations"])
        assert "4 antenatal care" in data["response_text"].lower() or "anc" in data["response_text"].lower()

    def test_orchestration_vernacular_emergency_p0(self):
        """RPC orchestrate immediately catches Hindi emergency and returns helpline 112."""
        payload = {
            "user_id": "6732f1a9b2c3d4e5f6000001",
            "user_role": "patient",
            "message": "Mere seene me bohot tezz dard ho raha hai aur chakkar aa rahe hain",
            "conversation_history": [],
            "patient_context": {},
        }
        resp = self.client.post(
            "/api/v1/chat/internal-orchestrate",
            headers={"X-Internal-Service-Key": self.secret},
            json=payload,
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["intent"] == "INTENT_EMERGENCY"
        assert data["is_emergency"] is True
        assert "112" in data["response_text"]
        assert "108" in data["response_text"]
