# Release Notes, Operational Runbook & Rollback Plan
## SwasthyaCare Conversational Health Assistant (v1.0.0-chatbot)

**Release Version:** v1.0.0-chatbot  
**Release Date:** 2026-11-12  
**Target Environments:** Staging / Production  
**Status:** READY FOR CONTROLLED RELEASE  

---

## 1. Feature Inventory (S9–S12 Delivery)

1. **Dual-Corpus RAG Knowledge Engine:**
   - Platform Corpus: Appointment booking, cancellation rules, live OPD queue tracking, and risk model documentation.
   - Healthcare Corpus: Peer-reviewed ICMR Type 2 Diabetes Guidelines, ICMR Hypertension-IV, WHO HEARTS Cardiovascular Prevention, Lifestyle & Nutrition, and NIMHANS Mental Health guidelines.
2. **Intent Classification & Clinical Safety Filters:**
   - 6 discrete intent paths: Emergency, App Action, App Navigation, Report Explanation, Clinical QA, and Chitchat.
   - Priority 0 Red-Flag Emergency Triage: Intercepts acute chest pain, stroke FAST symptoms, dyspnea, and mental health crises with direct Indian national emergency hotlines (112, 108, Tele-MANAS 14416).
   - Strict pharmacotherapy refusal: Zero drug dosage prescriptions or unmonitored medication alterations.
3. **Enterprise Express Gateway & MongoDB Persistence:**
   - Authenticated `/api/chat/*` routes with JWT verification and strict cross-patient IDOR protection.
   - Bounded conversation context window (10 turns).
   - Interactive two-step confirmation cards for consequential database mutations.
4. **Modern React Assistant UI:**
   - Floating quick-access trigger with live status indicators.
   - Multi-session consultation manager with new consultation creation.
   - Collapsible source citation drawers and thumbs-up/down feedback collection.

---

## 2. Configuration & Environment Variables

| Variable Name | Required | Default Value | Description |
| :--- | :---: | :--- | :--- |
| `PORT` | No | `5000` | Express Gateway listening port |
| `AI_SERVICE_URL` | No | `http://localhost:8000` | Base URL for FastAPI microservice |
| `INTERNAL_AI_SERVICE_SECRET` | Yes | `swasthya-internal-dev-key-2026` | Shared secret for server-to-server RPC |
| `LLM_PROVIDER` | No | `mock` | LLM adapter selection (`mock`, `anthropic`, `openai`) |
| `ANTHROPIC_API_KEY` | Optional | `""` | Anthropic API key for production Claude model |
| `OPENAI_API_KEY` | Optional | `""` | OpenAI API key for alternative GPT model |

---

## 3. Operational Runbook & Failover Protocols

### 3.1 LLM Provider Outage Failover
If external LLM provider latency exceeds 6,000ms or external APIs throw 5xx errors:
1. Express gateway automatically intercepts the timeout via `AbortController`.
2. Serves a resilient, safe clinical fallback directing patients to emergency numbers (112/108) and doctor discovery without crashing the session.
3. Operations team can toggle `LLM_PROVIDER=mock` to run 100% offline with zero external dependencies.

### 3.2 Rollback Procedure
If critical defects are identified post-deployment:
1. **Frontend Disable:** Toggle feature flag in `App.jsx`: `isAiAssistantOpen={false}` or hide floating trigger button.
2. **Backend Route Disable:** Comment out `app.use('/api/chat', chatRoutes);` in `server/src/app.js`.
3. **Database Safety:** Mongoose schemas preserve all existing tables (`appointments`, `users`, `riskAssessments`) untouched; no migrations require rollbacks.
