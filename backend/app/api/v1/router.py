"""
API V1 Router - Aggregates all V1 routes
Path: app/api/v1/router.py
"""
from fastapi import APIRouter
from app.api.v1.routes import configurations, exports

# Create main API router
api_router = APIRouter()

# Include configuration routes
api_router.include_router(
    configurations.router,
    prefix="/configurations",
    tags=["Configurations"]
)

# Include export routes
api_router.include_router(
    exports.router,
    prefix="/exports",
    tags=["Exports"]
)
