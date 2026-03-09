"""
Pydantic Schemas for Custom Model Generation
Path: app/schemas/custom_model.py
"""
from pydantic import BaseModel, Field


class CustomModelRequest(BaseModel):
    """Request body for generating a custom Roller Support model via FreeCAD."""
    roller_diameter: float = Field(..., gt=0, description="D - Roller Diameter (mm)")
    bearing_width: float = Field(..., gt=0, description="B - Bearing Width (mm)")
    shaft_diameter: float = Field(..., gt=0, description="d - Shaft Diameter (mm)")
    overall_height: float = Field(..., gt=0, description="H - Overall Height (mm)")
    base_width: float = Field(..., gt=0, description="W - Base Width (mm)")

class TBoltModelRequest(BaseModel):
    """Request body for generating a custom T-Bolt model via FreeCAD."""
    m: str = Field(..., description="M - Thread Size (e.g., M10)")
    l: float = Field(..., gt=0, description="L - Total Length (mm)")
    head_width: float = Field(..., gt=0, description="W - Head Width (mm)")
    head_height: float = Field(..., gt=0, description="K - Head Height (mm)")
    slot_width: float = Field(..., gt=0, description="T - T-Slot Width (mm)")
    thread_length: float = Field(..., gt=0, description="B - Thread Length (mm)")

