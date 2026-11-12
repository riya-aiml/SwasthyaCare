"""
SwasthyaCare AI Service — Internal Chat Orchestration Router
Sprint 10: Task S10-01
Guarded by verify_internal_rpc_key (X-Internal-Service-Key).
"""

from fastapi import APIRouter, Depends, status
from app.schemas.chat_assistant import (
    ChatOrchestrationRequest,
    ChatOrchestrationResponse,
)
from app.core.security import verify_internal_rpc_key
from app.services.chat_rag_service import chat_rag_service

router = APIRouter(
    prefix="/api/v1/chat",
    tags=["Internal Chat Assistant"],
)


@router.post(
    "/internal-orchestrate",
    response_model=ChatOrchestrationResponse,
    status_code=status.HTTP_200_OK,
    summary="Internal RPC for Chat Orchestration & Dual RAG",
    description="Internal server-to-server endpoint called by Express Gateway. Enforces dual-RAG retrieval and clinical safety.",
)
async def orchestrate_chat(
    request: ChatOrchestrationRequest,
    _authorized: bool = Depends(verify_internal_rpc_key),
) -> ChatOrchestrationResponse:
    """
    Processes chat requests using Dual-Corpus RAG, Intent Routing, and Priority 0 Red-Flag Triage.
    Requires X-Internal-Service-Key matching INTERNAL_AI_SERVICE_SECRET.
    """
    return await chat_rag_service.orchestrate(request)
