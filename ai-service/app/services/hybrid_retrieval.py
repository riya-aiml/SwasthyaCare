"""
SwasthyaCare AI Service — Hybrid RAG Retrieval Engine
Phase 5: BM25 Lexical + Dense Semantic Vector Search + Vernacular Normalization
Provides high-precision retrieval across Platform and Clinical corpora with Hindi/Hinglish support.
"""

import math
import re
import numpy as np
from typing import List, Tuple, Dict, Any, Optional
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import TruncatedSVD
from sklearn.metrics.pairwise import cosine_similarity


class VernacularNormalizer:
    """
    Normalizes and expands Hindi / Hinglish medical queries to English clinical terms.
    Enables accurate retrieval for vernacular Indian patient inputs.
    """

    TRANSLATION_MAP = {
        # Symptoms & Anatomy
        r"\b(chhati|seena)\b": "chest thoracic cardiac",
        r"\b(dard|dukh|peeda)\b": "pain ache discomfort",
        r"\b(saans|saas)\b": "breath breathing respiratory dyspnea",
        r"\b(takleef|dikkat|pareshani)\b": "difficulty trouble distress",
        r"\b(sar|sar\s+dard|matha)\b": "head headache cranial",
        r"\b(pet|pet\s+dard)\b": "stomach abdomen gastric abdominal",
        r"\b(khoon|rakta)\b": "blood hemorrhage",
        r"\b(khoon\s+ka\s+dabav|raktchap|raktchaap)\b": "blood pressure hypertension",
        r"\b(shakkar|chini|madhumeh)\b": "sugar diabetes glucose glycemia",
        r"\b(kam\s+karna|ghatana|ghataye|kam\s+kare)\b": "lower reduce decrease manage",
        r"\b(tanav|chinta|depression)\b": "stress anxiety mental wellness",
        r"\b(neend|soch)\b": "sleep insomnia rest",
        # Hospital Operations
        r"\b(daktar|chikitsak)\b": "doctor physician specialist",
        r"\b(dawa|dawai|goli|aushadhi)\b": "medicine drug pharmaceutical medication",
        r"\b(paisa|fees|shulka|kharcha)\b": "fees charges cost payment",
        r"\b(pariwar|ghar)\b": "family home",
        r"\b(bachha|shishu|balak)\b": "child infant pediatric baby",
        r"\b(garbh|garbhavastha|maata)\b": "pregnancy maternal antenatal anc",
        r"\b(teeka|teekakaran|tika)\b": "vaccine vaccination immunization schedule",
        r"\b(madad|sahayata)\b": "help assistance support",
        r"\b(aspataal|aspatal)\b": "hospital clinic opd",
    }

    @classmethod
    def expand_query(cls, query: str) -> str:
        """Expands vernacular words by appending equivalent clinical concepts."""
        expanded = query.lower()
        for pattern, replacement in cls.TRANSLATION_MAP.items():
            if re.search(pattern, expanded):
                expanded += " " + replacement
        return expanded


class BM25Index:
    """
    Standard Okapi BM25 implementation for lexical keyword retrieval.
    Optimized for short medical and operational query chunks with length normalization.
    """

    def __init__(self, k1: float = 1.5, b: float = 0.75):
        self.k1 = k1
        self.b = b
        self.doc_len: List[int] = []
        self.avg_doc_len: float = 0.0
        self.corpus_size: int = 0
        self.doc_freqs: Dict[str, int] = {}
        self.term_freqs: List[Dict[str, int]] = []
        self.vocab: set = set()

    def fit(self, tokenized_docs: List[List[str]]):
        self.corpus_size = len(tokenized_docs)
        if self.corpus_size == 0:
            return

        self.doc_len = [len(doc) for doc in tokenized_docs]
        self.avg_doc_len = sum(self.doc_len) / self.corpus_size if self.corpus_size > 0 else 0.0
        self.doc_freqs = {}
        self.term_freqs = []

        for doc in tokenized_docs:
            tf = {}
            for token in doc:
                tf[token] = tf.get(token, 0) + 1
            self.term_freqs.append(tf)

            for token in set(doc):
                self.doc_freqs[token] = self.doc_freqs.get(token, 0) + 1
                self.vocab.add(token)

    def _idf(self, term: str) -> float:
        n = self.doc_freqs.get(term, 0)
        return math.log(1.0 + (self.corpus_size - n + 0.5) / (n + 0.5))

    def score(self, query_tokens: List[str]) -> np.ndarray:
        if self.corpus_size == 0:
            return np.array([])

        scores = np.zeros(self.corpus_size)
        for token in query_tokens:
            if token not in self.vocab:
                continue
            idf = self._idf(token)
            for idx in range(self.corpus_size):
                tf = self.term_freqs[idx].get(token, 0)
                if tf == 0:
                    continue
                num = tf * (self.k1 + 1.0)
                denom = tf + self.k1 * (1.0 - self.b + self.b * (self.doc_len[idx] / self.avg_doc_len))
                scores[idx] += idf * (num / denom)
        return scores


class SemanticVectorIndex:
    """
    Dense Semantic Vector Space Index using Latent Semantic Analysis (TF-IDF + TruncatedSVD).
    Computes continuous conceptual similarity to bridge terminology gaps.
    """

    def __init__(self, n_components: int = 32):
        self.n_components = n_components
        self.vectorizer: Optional[TfidfVectorizer] = None
        self.svd: Optional[TruncatedSVD] = None
        self.chunk_vectors: Optional[np.ndarray] = None

    def fit(self, texts: List[str]):
        if not texts:
            return

        self.vectorizer = TfidfVectorizer(
            ngram_range=(1, 2),
            stop_words="english",
            max_features=1000,
            sublinear_tf=True,
        )
        tfidf_matrix = self.vectorizer.fit_transform(texts)

        # Adapt SVD components to available feature/sample dimensions
        max_comps = min(self.n_components, tfidf_matrix.shape[0] - 1, tfidf_matrix.shape[1] - 1)
        if max_comps >= 2:
            self.svd = TruncatedSVD(n_components=max_comps, random_state=42)
            self.chunk_vectors = self.svd.fit_transform(tfidf_matrix)
        else:
            self.chunk_vectors = tfidf_matrix.toarray()
            self.svd = None

    def score(self, query_text: str) -> np.ndarray:
        if self.vectorizer is None or self.chunk_vectors is None or len(self.chunk_vectors) == 0:
            return np.array([])

        q_vec = self.vectorizer.transform([query_text])
        if self.svd:
            q_dense = self.svd.transform(q_vec)
        else:
            q_dense = q_vec.toarray()

        similarities = cosine_similarity(q_dense, self.chunk_vectors)[0]
        # Normalize negative similarities to 0.0
        return np.clip(similarities, 0.0, 1.0)


class HybridCorpusIndex:
    """
    Combines BM25 Lexical search and Semantic Vector Embeddings
    with Vernacular Query Normalization and Reciprocal Rank / Linear Fusion.
    """

    def __init__(self, alpha: float = 0.5):
        """
        alpha: weight given to BM25 lexical score (1 - alpha given to semantic score).
        """
        self.alpha = alpha
        self.chunks: List[Any] = []
        self.bm25 = BM25Index()
        self.semantic = SemanticVectorIndex(n_components=32)

    @staticmethod
    def tokenize(text: str) -> List[str]:
        cleaned = re.sub(r"[^\w\s]", " ", text.lower())
        return [w for w in cleaned.split() if len(w) > 2]

    def build_index(self, chunks: List[Any]):
        self.chunks = chunks
        if not chunks:
            return

        # Prepare texts and tokens
        full_texts = []
        tokenized_docs = []

        for chk in chunks:
            # Emphasize title and section headers by concatenating with text
            header_prefix = f"{chk.title} {chk.section_title} " * 2
            doc_text = f"{header_prefix} {chk.text}"
            full_texts.append(doc_text)
            tokenized_docs.append(self.tokenize(doc_text))

        self.bm25.fit(tokenized_docs)
        self.semantic.fit(full_texts)

    def search(
        self,
        query: str,
        top_k: int = 2,
        threshold: float = 0.12,
    ) -> List[Tuple[Any, float]]:
        if not self.chunks:
            return []

        # 1. Expand query with vernacular terms
        normalized_query = VernacularNormalizer.expand_query(query)
        q_tokens = self.tokenize(normalized_query)

        # 2. Compute BM25 Lexical Scores
        bm25_raw = self.bm25.score(q_tokens)
        max_bm25 = np.max(bm25_raw) if len(bm25_raw) > 0 and np.max(bm25_raw) > 0 else 1.0
        bm25_norm = bm25_raw / max_bm25 if max_bm25 > 0 else bm25_raw

        # 3. Compute Semantic Vector Cosine Similarities
        semantic_sim = self.semantic.score(normalized_query)
        if len(semantic_sim) == 0:
            semantic_sim = np.zeros(len(self.chunks))

        # 4. Fused Hybrid Scoring
        hybrid_scores = (self.alpha * bm25_norm) + ((1.0 - self.alpha) * semantic_sim)

        # 5. Filter by relevance threshold and rank
        scored_pairs = []
        for idx, score in enumerate(hybrid_scores):
            if score >= threshold:
                scored_pairs.append((self.chunks[idx], float(score)))

        scored_pairs.sort(key=lambda x: x[1], reverse=True)
        return scored_pairs[:top_k]
