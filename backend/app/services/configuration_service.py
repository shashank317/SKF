from sqlalchemy.orm import Session
from app.db.models import Configuration
from app.schemas.configuration import ConfigurationCreate, ConfigurationUpdate
from fastapi import HTTPException, status

def create_configuration(db: Session, config: ConfigurationCreate):
    # --- RULE 1: Check Number of Blocks ---
    # We pretend SKF only allows max 10 blocks on a rail.
    """Create a new configuration"""
    if config.number_of_blocks is not None and config.number_of_blocks >10:
        raise HTTPException(
            status_code=400,
            detail="Engineering Error: Maximum 10 blocks allowed per rail."
        )
    
    # --- RULE 2: Grease Logic ---
    # Example: If grease is 'High Temp', you can't use standard seals (mx-1)
    # (We are just making this up for the demo, but this is where the logic lives)
    if config.material_params:
        grease = config.material_params.get("GREASE")
        if grease =="LGHP 2" and config.surface_treatment == "standard":
            pass

    # --- IF RULES PASS, SAVE IT ---
    db_config = Configuration(**config.model_dump())
    db.add(db_config)
    db.commit()
    db.refresh(db_config)
    return db_config



  





def get_configuration(db: Session, config_id: int):
    """Get single configuration by ID"""
    return db.query(Configuration).filter(Configuration.id == config_id).first()

def get_configurations(db: Session, skip: int = 0, limit: int = 20):
    """get all configurations with pagination
    Args:
         skip: how many to skip( for page 2: skip=20)
         limit : how many to return
     """
    return db.query(Configuration).offset(skip).limit(limit).all()
     
def update_configuration(db: Session, config_id: int, config_update: ConfigurationUpdate):
    """Update existing configuration """
    db_config = get_configuration(db, config_id)
    if not db_config:
        return None

    update_data = config_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_config, key, value)

    db.commit()
    db.refresh(db_config)
    return db_config


def delete_configuration(db: Session, config_id: int):
    """Delete Configuration"""
    db_config = get_configuration(db, config_id)
    if db_config:
        db.delete(db_config)
        db.commit()
        return True
    return False

