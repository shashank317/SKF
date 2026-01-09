from sqlalchemy.orm import Session
from app.db.models import Export
from app.schemas.export import ExportCreate, ExportUpdate
from typing import List, Optional

def create_export(db: Session, export: ExportCreate) -> Export:
    """
    Create a new export request.
    
    Args:
        db: Database session
        export: Pydantic schema with export data (configuration_id, format)
        
    Returns:
        Export: The created database object
    """
    # Create database object from schema
    db_export = Export(
        configuration_id=export.configuration_id,
        format=export.format,
        status="pending"  # Default status
    )
    
    db.add(db_export)
    db.commit()
    db.refresh(db_export)
    
    return db_export

def get_export(db: Session, export_id: int) -> Optional[Export]:
    """
    Get a single export by ID.
    
    Args:
        db: Database session
        export_id: ID of the export to retrieve
        
    Returns:
        Export: The pending or completed export object, or None if not found
    """
    return db.query(Export).filter(Export.id == export_id).first()

def get_exports_by_config(db: Session, configuration_id: int, skip: int = 0, limit: int = 100) -> List[Export]:
    """
    Get all exports for a specific configuration.
    
    Args:
        db: Database session
        configuration_id: ID of the configuration to filter by
        skip: Pagination offset
        limit: Pagination limit
        
    Returns:
        List[Export]: List of export objects
    """
    return db.query(Export)\
        .filter(Export.configuration_id == configuration_id)\
        .offset(skip)\
        .limit(limit)\
        .all()

def update_export_status(db: Session, export_id: int, export_update: ExportUpdate) -> Optional[Export]:
    """
    Update export status and details (e.g. when C# service completes job).
    
    Args:
        db: Database session
        export_id: ID of the export to update
        export_update: Pydantic schema with fields to update (status, file_path, job_id, error_message)
        
    Returns:
        Export: The updated export object, or None if not found
    """
    db_export = get_export(db, export_id)
    if not db_export:
        return None
    
    # Get only the fields that were set in the update request
    update_data = export_update.model_dump(exclude_unset=True)
    
    # Update attributes
    for key, value in update_data.items():
        setattr(db_export, key, value)
        
    db.commit()
    db.refresh(db_export)
    
    return db_export
