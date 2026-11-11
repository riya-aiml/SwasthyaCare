# Chatbot Data Contracts & API Specifications
## MongoDB Mongoose Schemas, Pydantic v2 Contracts & REST Endpoints

**Document ID:** SWC-CB-SPEC-001  
**Sprint:** Sprint 9 — Discovery, Product Foundation & Safety Design (Tasks `S9-06`, `S9-07`)  
**Status:** ✅ APPROVED  
**Date:** 2026-11-11  
**Component:** SwasthyaCare Conversational AI Assistant Subsystem  

---

## 1. MongoDB Database Schemas (Mongoose)

### 1.1 `chatSessions` Collection
Represents an ongoing or historical conversation thread between an authenticated patient and the AI assistant.

```javascript
import mongoose from 'mongoose';

const chatSessionSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  title: {
    type: String,
    trim: true,
    default: 'New Health Conversation',
  },
  contextSummary: {
    type: String,
    trim: true,
  },
  lastMessageAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  status: {
    type: String,
    enum: ['active', 'archived', 'escalated'],
    default: 'active',
  },
  isPinned: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

// Compound index for strict patient isolation and fast sorting
chatSessionSchema.index({ patient: 1, lastMessageAt: -1 });

export default mongoose.model('ChatSession', chatSessionSchema);
```

---

### 1.2 `chatMessages` Collection
Immutable record of each conversational turn, including citations, action recommendations, and clinical safety flags.

```javascript
import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema({
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChatSession',
    required: true,
    index: true,
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  sender: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true,
  },
  content: {
    type: String,
    required: true,
    trim: true,
  },
  intent: {
    type: String,
    enum: [
      'APP_HELP',
      'HEALTH_INFO',
      'ASSESSMENT_EXPLAIN',
      'REPORT_EXPLAIN',
      'APPOINTMENT_ASSIST',
      'EMERGENCY_RED_FLAG',
      'OUT_OF_SCOPE',
      'SYSTEM_NOTICE'
    ],
    default: 'APP_HELP',
  },
  citations: [
    {
      sourceId: { type: String, required: true },
      title: { type: String, required: true },
      urlOrSection: { type: String },
    }
  ],
  actionSuggestion: {
    type: {
      type: String,
      enum: ['NAVIGATE_TAB', 'CONFIRM_BOOKING', 'CONFIRM_CANCEL', 'ESCALATE_DOCTOR', 'EMERGENCY_MODAL', 'NONE'],
      default: 'NONE',
    },
    label: { type: String },
    target: { type: String },
    payload: { type: mongoose.Schema.Types.Mixed },
  },
  isEmergency: {
    type: Boolean,
    default: false,
  },
  disclaimer: {
    type: String,
    default: 'EDUCATIONAL DECISION-SUPPORT PROTOTYPE ONLY: SwasthyaCare Assistant provides non-diagnostic health navigation.',
  },
  feedback: {
    rating: { type: String, enum: ['helpful', 'unhelpful', 'neutral', null], default: null },
    comment: { type: String, trim: true },
    submittedAt: { type: Date },
  },
}, { timestamps: true });

// Compound indexes for fast history retrieval
chatMessageSchema.index({ session: 1, createdAt: 1 });
chatMessageSchema.index({ patient: 1, createdAt: -1 });

export default mongoose.model('ChatMessage', chatMessageSchema);
```

---

## 2. Python FastAPI Request & Response Schemas (Pydantic v2)

Defined in `ai-service/app/schemas/chat_assistant.py`:

```python
from pydantic import BaseModel, Field
from typing import Literal, Optional, List, Dict, Any
from datetime import datetime, timezone

class Citation(BaseModel):
    source_id: str
    title: str
    url_or_section: Optional[str] = None

class ActionSuggestion(BaseModel):
    type: Literal['NAVIGATE_TAB', 'CONFIRM_BOOKING', 'CONFIRM_CANCEL', 'ESCALATE_DOCTOR', 'EMERGENCY_MODAL', 'NONE'] = 'NONE'
    label: Optional[str] = None
    target: Optional[str] = None
    payload: Optional[Dict[str, Any]] = None

class PatientContext(BaseModel):
    patient_id: str
    first_name: Optional[str] = None
    confirmed_vitals: Optional[Dict[str, Any]] = None
    latest_assessment: Optional[Dict[str, Any]] = None
    next_appointment: Optional[Dict[str, Any]] = None

class ChatCompletionRequest(BaseModel):
    session_id: str
    user_id: str
    message: str = Field(..., min_length=1, max_length=2000)
    locale: Literal['en', 'hi'] = 'en'
    patient_context: Optional[PatientContext] = None

class ChatCompletionResponse(BaseModel):
    response_id: str
    intent: Literal[
        'APP_HELP',
        'HEALTH_INFO',
        'ASSESSMENT_EXPLAIN',
        'REPORT_EXPLAIN',
        'APPOINTMENT_ASSIST',
        'EMERGENCY_RED_FLAG',
        'OUT_OF_SCOPE'
    ]
    content: str
    citations: List[Citation] = Field(default_factory=list)
    action_suggestion: ActionSuggestion = Field(default_factory=ActionSuggestion)
    is_emergency: bool = False
    disclaimer: str
    timestamp_utc: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
```

---

## 3. Public Express REST API Endpoints (`server/src/modules/chat/`)

All endpoints require JWT Bearer Authentication (`authenticate` middleware):

| HTTP Method | Route | Access Control | Purpose |
|---|---|---|---|
| `POST` | `/api/chat/sessions` | Patient | Creates a new chat session thread |
| `GET` | `/api/chat/sessions` | Patient | Lists all chat sessions belonging to the authenticated patient |
| `GET` | `/api/chat/sessions/:id` | Patient (Owner) | Retrieves session metadata with ownership verification |
| `DELETE` | `/api/chat/sessions/:id` | Patient (Owner) | Cascading deletion of a chat session and all messages (Right to Erasure) |
| `GET` | `/api/chat/sessions/:id/messages`| Patient (Owner) | Retrieves chronological message history |
| `POST` | `/api/chat/sessions/:id/messages`| Patient (Owner) | Sends a patient message, queries FastAPI via internal RPC, and returns structured answer |
| `POST` | `/api/chat/messages/:id/feedback`| Patient (Owner) | Submits feedback (`helpful` or `unhelpful`) |
| `GET` | `/api/chat/quick-actions` | Patient | Returns contextual quick prompt chips based on active page |

---

## 4. Error Handling & Fallback Protocol

* **FastAPI Service Outage (503 Fallback):**  
  If the internal AI service is unreachable, Express returns a clean response with an informative message:
  ```json
  {
    "success": true,
    "data": {
      "sender": "assistant",
      "content": "I am currently running in offline navigation mode. I can assist you with general application buttons and appointments, but advanced clinical retrieval is temporarily unavailable.",
      "citations": [],
      "actionSuggestion": { "type": "NONE" },
      "isEmergency": false
    }
  }
  ```
  The system never drops the user connection or fabricates clinical guidance during outages.
