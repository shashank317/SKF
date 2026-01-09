from sqlalchemy import Column, Integer, String, Float, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class Configuration(Base):
    __tablename__ = "configurations"
    
    # primary key
    id = Column(Integer, primary_key=True, index=True)
    
    # timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # application step (step 1)
    part_number = Column(String, nullable=False)
    surface_treatment = Column(String)
    number_of_blocks = Column(Integer)
    
    # using JSON columns for flexible parameter storage
    geometry_params = Column(JSON)   # stores {"h": 25, "l": 100, ...}
    material_params = Column(JSON)   # stores {"lubrication_units": "...", "grease_type": "..."}
    advanced_params = Column(JSON, nullable=True) # for dynamic/optional parameters
    
    # metadata
    status = Column(String, default="draft")  # draft, completed, exported

    # relationships
    exports = relationship("Export", back_populates="configuration", cascade="all, delete-orphan")


class Export(Base):
    __tablename__ = "exports"
    
    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # link to configuration
    configuration_id = Column(Integer, ForeignKey("configurations.id"))
    
    # export details
    format = Column(String)  # "STEP", "IGES", "STL"
    status = Column(String)  # "pending", "processing", "completed", "failed"
    file_path = Column(String, nullable=True)
    
    # for C# service integration later
    job_id = Column(String, nullable=True)  # external job tracking
    error_message = Column(String, nullable=True)
    
    # relationships
    configuration = relationship("Configuration", back_populates="exports")
