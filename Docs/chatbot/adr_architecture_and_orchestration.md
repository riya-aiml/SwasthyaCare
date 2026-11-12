# Architecture Decision Record (ADR-009)
## Hybrid Dual-RAG Architecture & Provider Adapter Abstraction for SwasthyaCare Assistant

**Status:** APPROVED  
**Date:** 2026-11-12  
**Deciders:** SwasthyaCare Architecture & Clinical AI Working Group  
**Task ID:** S9-04  

---

## 1. Context and Problem Statement

SwasthyaCare requires an intelligent, conversational conversational health assistant to support:
1. **Platform navigation and app operations:** Guiding patients through doctor discovery, OPD slot booking, follow-up recovery submissions, and risk assessment report explanations.
2. **Preventive health and clinical education:** Answering patient inquiries regarding diabetes, hypertension, cardiovascular health, and general wellness.

### Key Constraints:
- **Strict Clinical Safety (SaMD boundaries):** The model must never generate speculative diagnoses or prescribe medication.
- **Data Grounding:** Responses must cite verified medical and platform documentation.
- **Data Privacy & Compliance (HIPAA / DISHA):** Zero patient-identifiable data (PHI) can be sent to external LLM providers without explicit scrubbing.
- **Developer Experience & Offline Resilience:** Automated CI/CD test suites and local testing must function without active cloud LLM subscriptions or network access.

---

## 2. Considered Alternatives

### Alternative A: Direct Client-to-LLM with Function Calling
- **Description:** Frontend directly communicates with an external LLM API (e.g. OpenAI/Anthropic) using client-side keys and function calling.
- **Cons:** Critical security vulnerability (exposure of API keys in browser), complete bypass of Express authorization checks, inability to enforce patient data isolation, high risk of prompt injection manipulating hospital DB records.
- **Verdict:** REJECTED.

### Alternative B: Monolithic Single-Corpus RAG in Express
- **Description:** Express server embeds all clinical guides and platform docs into a single vector database (e.g., Pinecone or ChromaDB) and performs retrieval directly.
- **Cons:** Bloats Node.js process with vector math; mixing operational platform docs (booking rules) with clinical guidelines (ICMR diabetes protocols) leads to cross-domain retrieval pollution (e.g. explaining diabetes using appointment cancellation rules).
- **Verdict:** REJECTED.

### Alternative C: Gateway-Orchestrated Hybrid Dual-RAG with FastAPI Microservice (CHOSEN)
- **Description:**
  1. Express serves as the authenticated security gateway, persisting chat sessions in MongoDB and enforcing user identity (`req.user.id`).
  2. Express forwards sanitised, authenticated user queries to the Python FastAPI `ai-service` via internal RPC (`X-Internal-Service-Key`).
  3. `ai-service` executes intent classification and queries two **physically separated vector retrieval corpora**:
     - **Platform Corpus:** SwasthyaCare workflows, appointment policies, OPD queue mechanics, risk model explanations.
     - **Clinical Knowledge Corpus:** Peer-reviewed ICMR, WHO, and MoHFW clinical guidelines.
  4. The generation layer utilizes a **pluggable Provider Adapter** supporting Anthropic Claude, OpenAI, and a zero-dependency **Deterministic Fallback/Mock Adapter** for testing and offline environments.
- **Verdict:** ACCEPTED.

---

## 3. Decision & Technical Architecture

```
┌────────────────────────────────────────────────────────┐
│                   React 18 Frontend                    │
└───────────────────────────┬────────────────────────────┘
                            │ HTTPS / JWT Auth
                            ▼
┌────────────────────────────────────────────────────────┐
│                 Express Gateway (Node.js)              │
│  - JWT Verification & Role Check (Patient/Doctor)       │
│  - Session & Message Persistence (MongoDB)             │
│  - Context Bounding (Max 10 turns)                     │
│  - Mutation Safety Gate (Two-Step Confirmation)        │
└───────────────────────────┬────────────────────────────┘
                            │ Internal RPC + Secret Key
                            ▼
┌────────────────────────────────────────────────────────┐
│            FastAPI AI Microservice (Python)            │
│  ┌──────────────────────────────────────────────────┐  │
│  │             Intent & Safety Router               │  │
│  │   (Emergency Red Flags, App Navigation, Medical) │  │
│  └────────────────────────┬─────────────────────────┘  │
│                           │                            │
│         ┌─────────────────┴─────────────────┐          │
│         ▼                                   ▼          │
│  [ Platform Corpus ]             [ Healthcare Corpus ] │
│  (SwasthyaCare Workflows)        (ICMR / WHO Guidelines│
│         │                                   │          │
│         └─────────────────┬─────────────────┘          │
│                           ▼                            │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Pluggable LLM Provider Adapter           │  │
│  │  - Anthropic (Claude Sonnet 3.5 / 5.5)           │  │
│  │  - OpenAI (GPT-4o)                               │  │
│  │  - Deterministic Offline Fallback (Mock Engine)  │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

---

## 4. Provider Adapter Specifications

The provider interface requires uniform contracts across all implementations:

```python
class BaseLLMProvider(ABC):
    @abstractmethod
    async def generate_response(
        self,
        prompt: str,
        system_prompt: str,
        temperature: float = 0.1,
        max_tokens: int = 800,
    ) -> ProviderResponse:
        pass
```

### Provider Matrix:
1. **Anthropic Claude Adapter:** Primary cloud provider for production healthcare reasoning.
2. **OpenAI Adapter:** Alternative cloud provider for cross-vendor redundancy.
3. **Deterministic Mock/Fallback Adapter:** Default in `development` and `test` environments. Uses rule-based regex matching and semantic document scoring to return grounded responses without internet or API keys.

---

## 5. Consequences & Trade-offs

### Positive:
- **Zero Cloud Lock-in:** Switching providers or running fully offline requires changing a single environment variable (`LLM_PROVIDER=mock|anthropic|openai`).
- **Complete Test Determinism:** Unit and integration tests run in under 3 seconds without API flakiness.
- **Clinical Traceability:** Dual RAG guarantees that medical advice always carries specific document citations and disclaimers.

### Negative:
- Additional network hop between Express gateway and FastAPI service (~10–20ms).
- Maintaining two distinct vector corpora requires dual ingestion pipelines.
