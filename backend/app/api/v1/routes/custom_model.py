"""
Custom Model Generation API Route
Path: app/api/v1/routes/custom_model.py

Accepts dimension parameters from the frontend and invokes FreeCAD
via custom_inputs.py to generate a 3D model, returning the .glb binary directly.
"""
import os
import sys
import uuid
from pathlib import Path
from fastapi import APIRouter, HTTPException, status
from fastapi.responses import FileResponse

from app.schemas.custom_model import CustomModelRequest

router = APIRouter()

# Resolve paths relative to the backend root
BACKEND_DIR = Path(__file__).resolve().parents[4]  # backend/
SCRIPTS_DIR = BACKEND_DIR / "scripts"
EXPORTS_DIR = BACKEND_DIR / "exports"

# Ensure exports directory exists
EXPORTS_DIR.mkdir(parents=True, exist_ok=True)

# Add scripts dir to sys.path so we can import custom_inputs
if str(SCRIPTS_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPTS_DIR))


@router.post(
    "/generate-cad",
    summary="Generate Custom 3D Model",
    description="Generate a Roller Support 3D model with custom dimensions using FreeCAD. Returns the .glb file directly.",
    response_class=FileResponse
)
def generate_cad(request: CustomModelRequest):
    """
    Generate a custom stepped-revolution component via FreeCAD.
    Returns the .glb binary file directly.
    """
    try:
        # Import the generation functions from custom_inputs.py
        import custom_inputs

        # Unique filename to avoid collisions
        file_id = uuid.uuid4().hex[:8]
        output_filename = f"custom_model_{file_id}.glb"
        output_path = str(EXPORTS_DIR / output_filename)

        # Generate the FreeCAD script with the user's dimensions
        script_content = custom_inputs.generate_script(
            output_path=output_path,
            output_format="glb",
            d_shaft=request.shaft_diameter,
            w_bearing=request.bearing_width,
            w_base=request.base_width,
            h_overall=request.overall_height,
            d_roller=request.roller_diameter
        )

        # Run FreeCAD headless to produce the model
        success = custom_inputs.run_freecad_script(script_content, use_gui=False)

        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="FreeCAD failed to generate the model. Is FreeCAD installed?"
            )

        # Check which output files exist - prefer GLB, fall back to STL/OBJ
        glb_path = EXPORTS_DIR / output_filename
        stl_path = EXPORTS_DIR / output_filename.replace('.glb', '.stl')
        obj_path = EXPORTS_DIR / output_filename.replace('.glb', '.obj')

        if glb_path.exists():
            return FileResponse(
                path=str(glb_path),
                media_type="model/gltf-binary",
                filename=output_filename
            )
        elif stl_path.exists():
            # If GLB wasn't generated, return STL
            return FileResponse(
                path=str(stl_path),
                media_type="model/stl",
                filename=output_filename.replace('.glb', '.stl')
            )
        elif obj_path.exists():
            return FileResponse(
                path=str(obj_path),
                media_type="model/obj",
                filename=output_filename.replace('.glb', '.obj')
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="FreeCAD ran but no output file was produced."
            )

    except ImportError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to import custom_inputs script: {str(e)}"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Model generation failed: {str(e)}"
        )
