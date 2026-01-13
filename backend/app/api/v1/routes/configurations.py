"""
Configuration API Routes
Path: app/api/v1/routes/configurations.py
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.schemas.configuration import (
    ConfigurationCreate,
    ConfigurationResponse,
    ConfigurationUpdate
)
from app.services import configuration_service

router = APIRouter()


@router.post(
    "/",
    response_model=ConfigurationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Configuration",
    description="Create a new bearing configuration with part number and parameters"
)
def create_configuration(
    config: ConfigurationCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new configuration.
    
    - **part_number**: Required product part number
    - **geometry_params**: JSON object with dimensions
    - **material_params**: JSON object with material specs
    - **advanced_params**: Optional additional parameters
    - **status**: Configuration status (default: "draft")
    """
    try:
        return configuration_service.create_configuration(db=db, config=config)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create configuration: {str(e)}"
        )


@router.get(
    "/",
    response_model=List[ConfigurationResponse],
    summary="List Configurations",
    description="Retrieve all configurations with pagination support"
)
def list_configurations(
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """
    List all configurations with pagination.
    
    - **skip**: Number of items to skip (for pagination)
    - **limit**: Number of items to return (max 100)
    """
    if limit > 100:
        limit = 100
    
    try:
        return configuration_service.get_configurations(db=db, skip=skip, limit=limit)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve configurations: {str(e)}"
        )


@router.get(
    "/{config_id}",
    response_model=ConfigurationResponse,
    summary="Get Configuration",
    description="Retrieve a specific configuration by ID"
)
def get_configuration(
    config_id: int,
    db: Session = Depends(get_db)       
):
    """
    Get a specific configuration by ID.
    
    - **config_id**: The ID of the configuration to retrieve
    """
    config = configuration_service.get_configuration(db=db, config_id=config_id)
    if not config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Configuration with ID {config_id} not found"
        )
    return config


@router.patch(
    "/{config_id}",
    response_model=ConfigurationResponse,
    summary="Update Configuration",
    description="Partially update an existing configuration"
)
def update_configuration(
    config_id: int,
    config_update: ConfigurationUpdate,
    db: Session = Depends(get_db)
):
    """
    Update an existing configuration (partial update).
    
    - **config_id**: The ID of the configuration to update
    - Only provided fields will be updated
    """
    config = configuration_service.update_configuration(
        db=db,
        config_id=config_id,
        config_update=config_update
    )
    if not config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Configuration with ID {config_id} not found"
        )
    return config


@router.delete(
    "/{config_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete Configuration",
    description="Delete a configuration and all associated exports"
)
def delete_configuration(
    config_id: int,
    db: Session = Depends(get_db)
):
    """
    Delete a configuration.
    
    - **config_id**: The ID of the configuration to delete
    - This will also delete all associated exports (cascade delete)
    """
    success = configuration_service.delete_configuration(db=db, config_id=config_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Configuration with ID {config_id} not found"
        )
    return None  # 204 No Content
