from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.schemas.configuration import ConfigurationCreate, ConfigurationResponse, ConfigurationUpdate
from app.srvices import configuration_services

router = APIRouter()

@router.post("/", response_model=ConfigurationResponse, status_code=201)
def creat_configuration(
    config: ConfigurationCreate,
    db: Session = Depends(get_db)
):
    """Create a new configuration.
    
    - **part_number**: Required product part number
    - **geometry_params**: JSON object with dimensions
    - **material_params**: JSON object with material specs
    """
return configuration_service.create_configuration(db=db, config=config) 

@router.get("/", response_model=List[ConfigurationResponse])
def list_configurations(
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db)

):

    """ 
List all configurations with pagination.

- **skip**: Number of items to skip (for pagination)
- **limit**: Number of items to return (for pagination)
"""
    return configuration_services.get_configutration(db=db, skip=skip, limit=limit)

@router.get("/{cofig_id}", response_model=ConfigurationResponse)
def get_configuration(
    config_id: int,
    db: Sessionm = Depends(get_db)
):
    """Get a specific configuration bu ID"""
    config = configuration_services.get_configuration(db=db, config_id=config_id)
    if not config:
        raise HTTPException(status_code=404, detail="configuration not found")
    return config

@router.patch("/{config_id}", response_model=ConfigurationResponse)
def update_configuration(
    config_id: int,
    config_update: ConfigurationUpdate,
    db: Session = Depends(get_db)
):
    """Update an existing configuration (partial update)."""
    config = configuration_service.update_configuration(
        db=db, 
        config_id=config_id, 
        config_update=config_update
    )
    if not config:
        raise HTTPException(status_code=404, detail="Configuration not found")
    return config

@router.delete("/{config_id}", status_code=204)
def delete_configuration(
    config_id: int,
    db: Session = Depends(get_db)
):
    """Delete a configuration."""
    success = configuration_service.delete_configuration(db=db, config_id=config_id)
    if not success:
        raise HTTPException(status_code=404, detail="Configuration not found")
    return None  # 204 No Content
