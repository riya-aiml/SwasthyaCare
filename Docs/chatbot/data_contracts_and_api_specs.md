# Data Contracts & API Specifications
## SwasthyaCare Conversational Health Assistant

**Sprint:** Sprint 9  
**Task ID:** S9-08  
**Status:** APPROVED  
**Target Implementation:** Sprint 10 (FastAPI), Sprint 11 (Express & React)  

---

## 1. Express Gateway REST API (Client ➔ Express)

All routes require JWT authentication via `Authorization: Bearer <token>` unless explicitly noted.

### 1.1 `POST /api/chat/sessions`
Initializes a new conversational session for the authenticated user.

* **Headers:** `Authorization: Bearer <jwt_token>`
* **Request Body:**
  ```json
  {
    "title": "Discussion regarding blood pressure (Optional)",
    "language": "en"
  }
  ```
* **Success Response (201 Created):**
  ```json
  {
    "success": true,
    "data": {
      "session": {
        "_id": "6732ef10a45b9a1122334455",
        "user": "672fbb001122334455667788",
        "role": "patient",
        "title": "Discussion regarding blood pressure",
        "status": "active",
        "messageCount": 0,
        "createdAt": "2026-11-12T10:00:00.000Z",
        "updatedAt": "2026-11-12T10:00:00.000Z"
      }
    }
  }
  ```

---

### 1.2 `GET /api/chat/sessions`
Retrieves all active sessions belonging to the authenticated user (sorted by `updatedAt` descending).

* **Query Parameters:** `page` (default 1), `limit` (default 20, max 50).
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "sessions": [
        {
          "_id": "6732ef10a45b9a1122334455",
          "title": "Discussion regarding blood pressure",
          "messageCount": 4,
          "lastMessagePreview": "According to ICMR guidelines, reducing sodium...",
          "updatedAt": "2026-11-12T10:05:00.000Z"
        }
      ],
      "pagination": { "page": 1, "limit": 20, "total": 1 }
    }
  }
  ```

---

### 1.3 `POST /api/chat/sessions/:sessionId/messages`
Sends a user message within an existing session and triggers assistant response generation.

* **URL Parameters:** `sessionId` (MongoDB ObjectId, must belong to `req.user.id`).
* **Request Body:**
  ```json
  {
    "message": "What is considered a normal systolic blood pressure for adults?"
  }
  ```
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "userMessage": {
        "_id": "6732ef15a45b9a1122334456",
        "sessionId": "6732ef10a45b9a1122334455",
        "role": "user",
        "content": "What is considered a normal systolic blood pressure for adults?",
        "createdAt": "2026-11-12T10:05:10.000Z"
      },
      "assistantMessage": {
        "_id": "6732ef16a45b9a1122334457",
        "sessionId": "6732ef10a45b9a1122334455",
        "role": "assistant",
        "content": "According to ICMR and Indian Guidelines on Hypertension (IGH-IV), a normal systolic blood pressure for healthy adults is typically below 120 mmHg [DOC-CLIN-02]. Values between 120-139 mmHg are considered pre-hypertensive.",
        "intent": "INTENT_CLINICAL_QA",
        "isEmergency": false,
        "citations": [
          {
            "docId": "DOC-CLIN-02",
            "title": "Indian Guidelines on Hypertension-IV",
            "sourceOrganization": "ICMR / API"
          }
        ],
        "actionProposal": null,
        "createdAt": "2026-11-12T10:05:11.200Z"
      }
    }
  }
  ```

---

### 1.4 `POST /api/chat/messages/:messageId/feedback`
Records thumbs-up/down feedback for model audit and quality tuning.

* **Request Body:**
  ```json
  {
    "rating": "helpful",
    "comment": "Clear explanation with citation."
  }
  ```
* **Success Response (200 OK):** `{"success": true, "message": "Feedback recorded."}`

---

## 2. FastAPI AI Microservice Internal RPC (Express ➔ FastAPI)

* **Endpoint:** `POST /api/v1/chat/internal-orchestrate`
* **Port:** 8000
* **Security Header:** `X-Internal-Service-Key: <INTERNAL_AI_SERVICE_SECRET>`

### 2.1 Request Schema (`ChatOrchestrationRequest`)
```json
{
  "user_id": "672fbb001122334455667788",
  "user_role": "patient",
  "message": "Can you book an appointment with Dr. Sharma for cardiology tomorrow?",
  "conversation_history": [
    {
      "role": "user",
      "content": "Hi, who are the available cardiologists?"
    },
    {
      "role": "assistant",
      "content": "Dr. Sharma is available tomorrow morning from 10:00 AM."
    }
  ],
  "patient_context": {
    "full_name": "Rohan Verma",
    "age": 42,
    "gender": "male"
  }
}
```

### 2.2 Response Schema (`ChatOrchestrationResponse`)
```json
{
  "intent": "INTENT_APP_ACTION",
  "is_emergency": false,
  "response_text": "I can help you prepare an appointment request with Dr. Sharma for tomorrow. Please confirm the details below to proceed.",
  "citations": [
    {
      "doc_id": "DOC-PLAT-01",
      "title": "Doctor Booking & Slot Management",
      "source_organization": "SwasthyaCare Platform"
    }
  ],
  "action_proposal": {
    "action_type": "BOOK_APPOINTMENT",
    "target_resource": "appointment",
    "parameters": {
      "doctor_name": "Dr. Sharma",
      "specialization": "Cardiology",
      "date": "2026-11-13",
      "time_slot": "10:00 AM"
    },
    "requires_confirmation": true
  },
  "latency_ms": 112,
  "provider": "deterministic-mock",
  "model_version": "v1.0.0-rag"
}
```

---

## 3. Standard HTTP Error Codes

| Status Code | Error Identifier | Description / Handling |
| :--- | :--- | :--- |
| `400 Bad Request` | `VALIDATION_ERROR` | Empty message, missing fields, or invalid message payload. |
| `401 Unauthorized` | `UNAUTHORIZED` | Missing, expired, or invalid JWT token. |
| `403 Forbidden` | `FORBIDDEN_RESOURCE` | Attempting to access another user's session ID (IDOR defense). |
| `404 Not Found` | `SESSION_NOT_FOUND` | Session does not exist or has been deleted. |
| `429 Too Many Requests` | `RATE_LIMIT_EXCEEDED`| Exceeded 30 requests per minute per user. |
| `502 Bad Gateway` | `AI_SERVICE_UNAVAILABLE` | FastAPI service unreachable or timed out (>8000ms). Express falls back to safe cached response. |
