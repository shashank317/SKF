from sqlalchemy.orm import Session
from app.db.models import Configuration
from app.schemas.configuration import ConfigurationCreate, ConfigurationUpdate

def create_configuration(db: Session, config: ConfigurationCreate):
    """
    Create a new configuration in database
    
    Args:
        db: database session
        config: pydantic schema with data to save
        
    Returns:
        Configuration: the created database object
    """
    # convert pydantic schema to dict
    db_config = Configuration(**config.model_dump())
    
    # add to database
    db.add(db_config)
    db.commit()  # save to database
    db.refresh(db_config)  # reload to get id, timestamps
    
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

