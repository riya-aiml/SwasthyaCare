"""
SwasthyaCare AI Service — Internal Chatbot RAG Router
Sprint 10: Tasks S10-01, S10-06, S10-07
Exposes internal RPC endpoint for conversational assistance.
Protected by X-Internal-Service-Key authentication.
"""

from fastapi import APIRouter, Depends, HTTPException, status
import logging

from app.core.security import verify_internal_rpc_key
from app.schemas.chat_assistant import (
    ChatCompletionRequest,
    ChatCompletionResponse
)
from app.services.chat_rag_service import chat_rag_service

logger = logging.getLogger("swasthyacare.internal_chat_api")

router = APIRouter(
    prefix="/internal/v1/chat",
    tags=["Internal Conversational Assistant"],
    dependencies=[Depends(verify_internal_rpc_key)]
)


@router.post(
    "/message",
    response_model=ChatCompletionResponse,
    summary="Task S10-06: Internal Chat Message Completion",
    description="Processes patient query with intent routing, emergency pre-check, and dual-scope grounded RAG."
)
async def process_chat_message(request: ChatCompletionRequest):
    """
    Executes grounded RAG assistant pipeline.
    """
    try:
        response = chat_rag_service.process_message(request)
        return response
    except Exception as e:
        logger.error(f"Error during chat RAG processing: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "CHAT_PROCESSING_FAILURE",
                "message": "An internal error occurred while generating the assistant response."
            }
        )
