"""
Export API Routes
Path: app/api/v1/routes/exports.py
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.schemas.export import ExportCreate, ExportResponse, ExportUpdate
from app.services import export_service

router = APIRouter()


@router.post(
    "/",
    response_model=ExportResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Export",
    description="Create a new CAD export request for a configuration"
)
def create_export(
    export: ExportCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new export request.
    
    - **configuration_id**: ID of the configuration to export
    - **format**: Export format (STEP, IGES, STL, etc.)
    """
    try:
        return export_service.create_export(db=db, export=export)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create export: {str(e)}"
        )


@router.get(
    "/{export_id}",
    response_model=ExportResponse,
    summary="Get Export",
    description="Retrieve a specific export by ID"
)
def get_export(
    export_id: int,
    db: Session = Depends(get_db)
):
    """
    Get a specific export by ID.
    
    - **export_id**: The ID of the export to retrieve
    """
    export = export_service.get_export(db=db, export_id=export_id)
    if not export:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Export with ID {export_id} not found"
        )
    return export


@router.get(
    "/configuration/{configuration_id}",
    response_model=List[ExportResponse],
    summary="List Exports by Configuration",
    description="Retrieve all exports for a specific configuration"
)
def list_exports_by_configuration(
    configuration_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Get all exports for a specific configuration.
    
    - **configuration_id**: ID of the configuration
    - **skip**: Number of items to skip (for pagination)
    - **limit**: Number of items to return (max 100)
    """
    if limit > 100:
        limit = 100
    
    try:
        return export_service.get_exports_by_config(
            db=db,
            configuration_id=configuration_id,
            skip=skip,
            limit=limit
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve exports: {str(e)}"
        )


@router.patch(
    "/{export_id}",
    response_model=ExportResponse,
    summary="Update Export",
    description="Update export status and details (used by C# service)"
)
def update_export(
    export_id: int,
    export_update: ExportUpdate,
    db: Session = Depends(get_db)
):
    """
    Update export status and details.
    
    - **export_id**: The ID of the export to update
    - **status**: New status (pending, processing, completed, failed)
    - **file_path**: Path to generated file (when completed)
    - **job_id**: External job tracking ID (for C# service)
    - **error_message**: Error details (if failed)
    """
    export = export_service.update_export_status(
        db=db,
        export_id=export_id,
        export_update=export_update
    )
    if not export:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Export with ID {export_id} not found"
        )
    return export
