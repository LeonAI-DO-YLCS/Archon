"""
LMStudio API endpoints for model discovery and health management.

Provides REST endpoints for interacting with LMStudio instances:
- Model discovery via OpenAI-compatible /v1/models endpoint
- Health monitoring and status checking
- Instance validation
"""

from typing import Any

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from ..config.logfire_config import get_logger
from ..services.provider_discovery_service import provider_discovery_service

logger = get_logger(__name__)

router = APIRouter(prefix="/api/lmstudio", tags=["lmstudio"])


class InstanceValidationRequest(BaseModel):
    """Request for validating an LMStudio instance."""
    instance_url: str = Field(..., description="URL of the LMStudio instance (e.g., http://localhost:1234/v1)")


class InstanceValidationResponse(BaseModel):
    """Response for instance validation."""
    is_valid: bool
    instance_url: str
    response_time_ms: float | None
    models_available: int
    error_message: str | None


class ModelDiscoveryResponse(BaseModel):
    """Response for model discovery."""
    total_models: int
    models: list[dict[str, Any]]
    
    
@router.post("/validate", response_model=InstanceValidationResponse)
async def validate_instance_endpoint(request: InstanceValidationRequest) -> InstanceValidationResponse:
    """
    Validate an LMStudio instance by attempting to list models.
    """
    try:
        logger.info(f"Validating LMStudio instance: {request.instance_url}")
        
        # Clean up URL
        instance_url = request.instance_url.rstrip('/')
        if not instance_url.startswith(('http://', 'https://')):
             raise HTTPException(status_code=400, detail="Invalid URL format")
             
        # Use provider discovery service to check health/availability
        # We treat LMStudio as a custom OpenAI-compatible provider for validation
        status = await provider_discovery_service.check_provider_health(
            "lmstudio", 
            {"base_url": instance_url}
        )
        
        return InstanceValidationResponse(
            is_valid=status.is_available,
            instance_url=instance_url,
            response_time_ms=status.response_time_ms,
            models_available=status.models_available,
            error_message=status.error_message
        )

    except Exception as e:
        logger.error(f"Error validating LMStudio instance: {e}")
        return InstanceValidationResponse(
            is_valid=False,
            instance_url=request.instance_url,
            response_time_ms=None,
            models_available=0,
            error_message=str(e)
        )


@router.get("/models", response_model=ModelDiscoveryResponse)
async def discover_models_endpoint(
    instance_url: str = Query(..., description="LMStudio instance URL"),
) -> ModelDiscoveryResponse:
    """
    Discover models from an LMStudio instance.
    """
    try:
        logger.info(f"Discovering models from {instance_url}")
        
        models = await provider_discovery_service.discover_lmstudio_models(instance_url)
        
        return ModelDiscoveryResponse(
            total_models=len(models),
            models=[{
                "name": m.name,
                "context_window": m.context_window,
                "supports_vision": m.supports_vision,
                "supports_embeddings": m.supports_embeddings
            } for m in models]
        )

    except Exception as e:
        logger.error(f"Error in LMStudio model discovery: {e}")
        raise HTTPException(status_code=500, detail=f"Model discovery failed: {str(e)}")
