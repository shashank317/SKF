from sqlalchemy.orm import Session
from app.db.models import Export, Configuration
from app.schemas.export import ExportCreate, ExportUpdate
from app.core.cad_engine import dxf_generator
from typing import List, Optional


def create_export(db: Session, export: ExportCreate) -> Export:
    """
    Create a new export request and generate the CAD file.
    
    Args:
        db: Database session
        export: Pydantic schema with export data (configuration_id, format)
        
    Returns:
        Export: The created database object with file_path populated
    """
    # Create database object from schema
    db_export = Export(
        configuration_id=export.configuration_id,
        format=export.format,
        status="processing"  # Default status
    )
    
    db.add(db_export)
    db.commit()
    db.refresh(db_export)
    
    try:
        # Fetch the configuration to get parameters
        config = db.query(Configuration).filter(
            Configuration.id == export.configuration_id
        ).first()
        
        if not config:
            db_export.status = "failed"
            db_export.error_message = f"Configuration {export.configuration_id} not found"
            db.commit()
            return db_export
        
        # Extract parameters for CAD generation
        geometry_params = config.geometry_params or {}
        application_params = {
            'NOB': config.number_of_blocks or 2,
            'PN': config.part_number or f'SKF-{config.id}',
            'ST': config.surface_treatment
        }
        
        # Generate the real DXF file
        file_path = dxf_generator.generate_linear_guide(
            config_id=config.id,
            geometry_params=geometry_params,
            application_params=application_params
        )
        
        # Update the record with success
        db_export.status = "completed"
        db_export.file_path = file_path
        db.commit()
        db.refresh(db_export)
        
    except Exception as e:
        # Handle any errors during generation
        db_export.status = "failed"
        db_export.error_message = str(e)
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
