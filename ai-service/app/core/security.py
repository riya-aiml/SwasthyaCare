"""
SwasthyaCare AI Service — Internal RPC Security
Task: ML-S6-07
Enforces server-to-server mutual authentication between Express Gateway and FastAPI.
"""

import os
from fastapi import Header, HTTPException, status

INTERNAL_SECRET_ENV_VAR = "INTERNAL_AI_SERVICE_SECRET"
DEFAULT_INTERNAL_SECRET = "swasthya-internal-dev-key-2026"


async def verify_internal_rpc_key(
    x_internal_service_key: str = Header(
        None,
        alias="X-Internal-Service-Key",
        description="Shared secret key for server-to-server internal RPC calls"
    )
) -> bool:
    """
    Verifies that the request originates from an authorized internal service (Express Gateway).
    Rejects unauthorized or missing keys with HTTP 403 Forbidden.
    """
    expected_secret = os.getenv(INTERNAL_SECRET_ENV_VAR, DEFAULT_INTERNAL_SECRET)

    if not x_internal_service_key or x_internal_service_key != expected_secret:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "error": "FORBIDDEN_INTERNAL_ACCESS",
                "message": "Access denied: Missing or invalid internal service key. Direct external calls to internal ML endpoints are strictly prohibited."
            }
        )
    return True
