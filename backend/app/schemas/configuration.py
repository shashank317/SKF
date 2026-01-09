# schemas/configuration.py

from pydantic import BaseModel
from datetime import datetime
from typing import Optional

# 1. BASE SCHEMA (shared fields)
class ConfigurationBase(BaseModel):
    part_number: str
    surface_treatment: Optional[str] = None
    number_of_blocks: Optional[int] = None
    geometry_params: Optional[dict] = None
    material_params: Optional[dict] = None
    advanced_params: Optional[dict] = None
    status: Optional[str] = "draft"

# 2. CREATE SCHEMA (for POST requests)
class ConfigurationCreate(ConfigurationBase):
    pass  # inherits everything from Base

# 3. UPDATE SCHEMA (for PATCH/PUT requests)
class ConfigurationUpdate(BaseModel):
    part_number: Optional[str] = None
    surface_treatment: Optional[str] = None
    number_of_blocks: Optional[int] = None
    geometry_params: Optional[dict] = None
    material_params: Optional[dict] = None
    advanced_params: Optional[dict] = None
    status: Optional[str] = None
    
# 4. RESPONSE SCHEMA (what API returns)
class ConfigurationResponse(ConfigurationBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True  # allows reading from SQLAlchemy models