"""
SwasthyaCare — Sprint 9 Chat Data Contracts & Pydantic Schema Unit Tests
Task: S9-08
Validates conversational schemas, intent enums, disclaimer defaults, and validation bounds.
"""

import unittest
import os
import sys

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from pydantic import ValidationError
from app.schemas.chat_assistant import (
    ChatOrchestrationRequest,
    ChatOrchestrationResponse,
    ChatIntent,
    MessageRole,
    ActionType,
    ActionProposal,
    CitationItem,
    ChatTurn,
    CLINICAL_CHAT_DISCLAIMER,
    PRESCRIPTION_REFUSAL_TEXT,
)


class TestSprint9ChatContracts(unittest.TestCase):

    def test_valid_chat_request(self):
        """Test valid chat orchestration request creation."""
        req = ChatOrchestrationRequest(
            user_id="672fbb001122334455667788",
            user_role="patient",
            message="What are symptoms of high blood pressure?",
            conversation_history=[
                ChatTurn(role=MessageRole.USER, content="Hello"),
                ChatTurn(role=MessageRole.ASSISTANT, content="Hello! How can I assist you?"),
            ],
            patient_context={"age": 45, "gender": "male"}
        )
        self.assertEqual(req.user_id, "672fbb001122334455667788")
        self.assertEqual(req.user_role, "patient")
        self.assertEqual(len(req.conversation_history), 2)
        self.assertEqual(req.patient_context["age"], 45)

    def test_empty_message_validation(self):
        """Test that empty messages are rejected."""
        with self.assertRaises(ValidationError):
            ChatOrchestrationRequest(
                user_id="672fbb001122334455667788",
                user_role="patient",
                message="",  # Empty string rejected by min_length=1
            )

    def test_message_length_exceeded_validation(self):
        """Test that messages over 1000 characters are rejected."""
        with self.assertRaises(ValidationError):
            ChatOrchestrationRequest(
                user_id="672fbb001122334455667788",
                user_role="patient",
                message="a" * 1001,  # Exceeds max_length=1000
            )

    def test_valid_chat_response_with_citations(self):
        """Test valid response with citations and default disclaimer."""
        resp = ChatOrchestrationResponse(
            intent=ChatIntent.INTENT_CLINICAL_QA,
            is_emergency=False,
            response_text="According to ICMR guidelines, normal BP is below 120/80 mmHg.",
            citations=[
                CitationItem(
                    doc_id="DOC-CLIN-02",
                    title="Indian Guidelines on Hypertension-IV",
                    source_organization="ICMR"
                )
            ],
            latency_ms=120,
            provider="deterministic-mock"
        )
        self.assertEqual(resp.intent, ChatIntent.INTENT_CLINICAL_QA)
        self.assertFalse(resp.is_emergency)
        self.assertEqual(len(resp.citations), 1)
        self.assertEqual(resp.citations[0].doc_id, "DOC-CLIN-02")
        self.assertEqual(resp.disclaimer, CLINICAL_CHAT_DISCLAIMER)

    def test_emergency_response_flags(self):
        """Test emergency response schema creation."""
        resp = ChatOrchestrationResponse(
            intent=ChatIntent.INTENT_EMERGENCY,
            is_emergency=True,
            response_text="CRITICAL ALERT: Call 112 or 108 immediately.",
            citations=[],
            latency_ms=45,
            provider="deterministic-mock"
        )
        self.assertEqual(resp.intent, ChatIntent.INTENT_EMERGENCY)
        self.assertTrue(resp.is_emergency)

    def test_action_proposal_schema(self):
        """Test bounded action proposal formatting."""
        proposal = ActionProposal(
            action_type=ActionType.BOOK_APPOINTMENT,
            target_resource="appointment",
            parameters={
                "doctor_name": "Dr. Sharma",
                "date": "2026-11-13",
                "time": "10:00 AM"
            },
            requires_confirmation=True,
            preview_summary="Appointment with Dr. Sharma on 2026-11-13 at 10:00 AM"
        )
        self.assertEqual(proposal.action_type, ActionType.BOOK_APPOINTMENT)
        self.assertTrue(proposal.requires_confirmation)
        self.assertIn("Dr. Sharma", proposal.parameters["doctor_name"])


if __name__ == "__main__":
    unittest.main()
