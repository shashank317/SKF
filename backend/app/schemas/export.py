from pydantic import BaseModel
from datetime import datetime
from typing import Optional

# 1. BASE SCHEMA (shared fields)
class ExportBase(BaseModel):
    format: str
    status: Optional[str] = "pending"
    file_path: Optional[str] = None
    job_id: Optional[str] = None
    error_message: Optional[str] = None
    configuration_id: int

# 2. CREATE SCHEMA (for POST requests)
class ExportCreate(BaseModel):
    configuration_id: int
    format: str
    # status defaults to pending, others are None initially

# 3. UPDATE SCHEMA (for internal updates like status change)
class ExportUpdate(BaseModel):
    status: Optional[str] = None
    file_path: Optional[str] = None
    job_id: Optional[str] = None
    error_message: Optional[str] = None

# 4. RESPONSE SCHEMA (what API returns)
class ExportResponse(ExportBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True
