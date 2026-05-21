"""
Custom Model Generation API Route
Path: app/api/v1/routes/custom_model.py

Accepts dimension parameters from the frontend and invokes FreeCAD
via custom_inputs.py to generate a 3D model, returning the .glb binary directly.
"""
import os
import sys
import io
import zipfile
from pathlib import Path
from fastapi import APIRouter, HTTPException, status, Query
from fastapi.responses import FileResponse, StreamingResponse, JSONResponse

from app.schemas.custom_model import CustomModelRequest, TBoltModelRequest

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


def _next_output_num() -> int:
    """Return the next sequential number (1, 2, 3, ...) by scanning existing files."""
    existing = sorted(
        int(f.stem) for f in EXPORTS_DIR.iterdir()
        if f.is_file() and f.stem.isdigit()
    )
    return (existing[-1] + 1) if existing else 1


def _get_latest_output_num() -> int:
    """Return the latest sequential number (highest existing number)."""
    existing = sorted(
        int(f.stem) for f in EXPORTS_DIR.iterdir()
        if f.is_file() and f.stem.isdigit()
    )
    return existing[-1] if existing else 0


@router.get(
    "/download-latest-cad",
    summary="Download Latest Generated CAD Files",
    description="Download all files (GLB/STL/OBJ/FCStd + drawing PDF/SVG) for the latest generated model as a ZIP archive."
)
def download_latest_cad(file_num: int = Query(None, description="Optional specific file number to download")):
    """
    Download all available formats of the latest (or specified) generated model as a ZIP.
    """
    try:
        # Determine which file number to download
        if file_num is None:
            file_num = _get_latest_output_num()
        
        if file_num <= 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No generated models found. Please generate a model first."
            )
        
        # Find all files with this number (3D + drawing outputs).
        files_to_zip = []
        candidate_names = [
            f"{file_num}.glb",
            f"{file_num}.gltf",
            f"{file_num}.stl",
            f"{file_num}.obj",
            f"{file_num}.step",
            f"{file_num}.FCStd",
            f"{file_num}_drawing.pdf",
            f"{file_num}_drawing.svg",
        ]

        for name in candidate_names:
            file_path = EXPORTS_DIR / name
            if file_path.exists() and file_path.stat().st_size > 0:
                files_to_zip.append(file_path)
        
        if not files_to_zip:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No files found for model #{file_num}"
            )
        
        # Create ZIP in memory
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
            for file_path in files_to_zip:
                zip_file.write(file_path, file_path.name)
        
        zip_buffer.seek(0)
        
        return StreamingResponse(
            zip_buffer,
            media_type="application/zip",
            headers={
                "Content-Disposition": f"attachment; filename=model_{file_num}_cad_files.zip"
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create download: {str(e)}"
        )


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

        # Sequential filename: 1.glb, 2.glb, ...
        file_num = _next_output_num()
        output_filename = f"{file_num}.glb"
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
        success, error_output = custom_inputs.run_freecad_script(script_content, use_gui=False)

        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"FreeCAD failed to generate the model.\\nReason: {error_output}"
            )

        # Check which output files exist - prefer STL/OBJ (GLB direct export not supported in headless FreeCAD)
        glb_path = EXPORTS_DIR / output_filename
        stl_path = EXPORTS_DIR / output_filename.replace('.glb', '.stl')
        obj_path = EXPORTS_DIR / output_filename.replace('.glb', '.obj')

        # GLB direct export often produces a 0-byte file; only serve if non-empty
        if glb_path.exists() and glb_path.stat().st_size > 0:
            # Return JSON so the frontend can construct a direct /downloads/ URL
            return JSONResponse(content={
                "file_num": file_num,
                "format": "glb",
                "filename": output_filename
            })
        elif stl_path.exists():
            return FileResponse(
                path=str(stl_path),
                media_type="model/stl",
                filename=output_filename.replace('.glb', '.stl'),
                headers={"X-Model-Number": str(file_num)}
            )
        elif obj_path.exists():
            return FileResponse(
                path=str(obj_path),
                media_type="model/obj",
                filename=output_filename.replace('.glb', '.obj'),
                headers={"X-Model-Number": str(file_num)}
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"FreeCAD ran but no output file was produced.\nFreeCAD output: {error_output}"
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

@router.post(
    "/generate-tbolt",
    summary="Generate Custom T-Bolt Model",
    description="Generate a T-Bolt 3D model with custom dimensions using FreeCAD. Returns the .glb file directly.",
    response_class=FileResponse
)
def generate_tbolt(request: TBoltModelRequest):
    """
    Generate a custom T-Bolt component via FreeCAD.
    Returns the .glb binary file directly.
    """
    try:
        import t_bolt_inputs

        # Sequential filename: 1.glb, 2.glb, ...
        file_num = _next_output_num()
        output_filename = f"{file_num}.glb"
        output_path = str(EXPORTS_DIR / output_filename)

        script_content = t_bolt_inputs.generate_script(
            output_path=output_path,
            output_format="glb",
            m=request.m,
            l=request.l,
            head_width=request.head_width,
            head_height=request.head_height,
            slot_width=request.slot_width,
            thread_len=request.thread_length
        )

        success = t_bolt_inputs.run_freecad_script(script_content, use_gui=False)

        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="FreeCAD failed to generate the T-Bolt model. Is FreeCAD installed?"
            )

        glb_path = EXPORTS_DIR / output_filename
        stl_path = EXPORTS_DIR / output_filename.replace('.glb', '.stl')
        obj_path = EXPORTS_DIR / output_filename.replace('.glb', '.obj')

        if glb_path.exists() and glb_path.stat().st_size > 0:
            # Return JSON so the frontend can construct a direct /downloads/ URL
            return JSONResponse(content={
                "file_num": file_num,
                "format": "glb",
                "filename": output_filename
            })
        elif stl_path.exists():
            return FileResponse(
                path=str(stl_path),
                media_type="model/stl",
                filename=output_filename.replace('.glb', '.stl'),
                headers={"X-Model-Number": str(file_num)}
            )
        elif obj_path.exists():
            return FileResponse(
                path=str(obj_path),
                media_type="model/obj",
                filename=output_filename.replace('.glb', '.obj'),
                headers={"X-Model-Number": str(file_num)}
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="FreeCAD ran but no T-Bolt output file was produced."
            )

    except ImportError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to import t_bolt_inputs script: {str(e)}"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Model generation failed: {str(e)}"
        )

