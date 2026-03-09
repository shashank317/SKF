import os
import sys
import subprocess
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

app = FastAPI(title="FreeCAD Model Generator")

# --------------- Serve index.html at root ---------------
STATIC_DIR = Path(__file__).resolve().parent / "static"


@app.get("/", response_class=HTMLResponse)
async def serve_index():
    index_file = STATIC_DIR / "index.html"
    return index_file.read_text(encoding="utf-8")


# --------------- Pydantic request model ---------------
class CADParams(BaseModel):
    roller_diameter: float
    bearing_width: float
    shaft_diameter: float
    overall_height: float
    base_width: float


# --------------- Constants ---------------
FREECAD_SCRIPT = str(Path(__file__).resolve().parent / "custom_inputs.py")
PYTHON_EXE = sys.executable  # Use the same Python that runs this server
OUTPUT_DIR = Path(__file__).resolve().parent / "output"
OUTPUT_DIR.mkdir(exist_ok=True)


def _next_output_path() -> Path:
    """Return the next sequential filename like output/1.glb, output/2.glb, …
    Scans all file types (.glb, .stl, .obj, .FCStd) to determine the next number."""
    existing = sorted(
        int(f.stem) for f in OUTPUT_DIR.iterdir()
        if f.is_file() and f.stem.isdigit()
    )
    next_num = (existing[-1] + 1) if existing else 1
    return OUTPUT_DIR / f"{next_num}.glb"


# --------------- POST endpoint ---------------
@app.post("/api/generate-cad")
async def generate_cad(params: CADParams):
    output_path = _next_output_path()

    command = [
        PYTHON_EXE,
        FREECAD_SCRIPT,
        "--roller-diameter", str(params.roller_diameter),
        "--bearing-width", str(params.bearing_width),
        "--shaft-diameter", str(params.shaft_diameter),
        "--overall-height", str(params.overall_height),
        "--base-width", str(params.base_width),
        "--output", str(output_path),
    ]

    try:
        result = subprocess.run(
            command,
            capture_output=True,
            text=True,
            timeout=300,
        )
    except subprocess.TimeoutExpired:
        raise HTTPException(status_code=504, detail="FreeCAD process timed out.")
    except FileNotFoundError:
        raise HTTPException(
            status_code=500,
            detail="FreeCAD executable not found. Check the installation path.",
        )

    # Log stdout/stderr for debugging
    print("=== subprocess stdout ===")
    print(result.stdout)
    print("=== subprocess stderr ===")
    print(result.stderr)
    print(f"=== return code: {result.returncode} ===")

    if result.returncode != 0:
        raise HTTPException(
            status_code=500,
            detail=f"FreeCAD exited with code {result.returncode}.\nstdout: {result.stdout}\nstderr: {result.stderr}",
        )

    # GLB is preferred, but FreeCADCmd (headless) falls back to STL/OBJ.
    # Serve whichever exists: .glb → .stl → .obj
    glb_path = output_path
    stl_path = output_path.with_suffix(".stl")
    obj_path = output_path.with_suffix(".obj")

    if glb_path.exists():
        return FileResponse(path=str(glb_path), media_type="model/gltf-binary", filename=glb_path.name)
    elif stl_path.exists():
        return FileResponse(path=str(stl_path), media_type="application/octet-stream", filename=stl_path.name)
    elif obj_path.exists():
        return FileResponse(path=str(obj_path), media_type="application/octet-stream", filename=obj_path.name)
    else:
        raise HTTPException(
            status_code=500,
            detail=f"FreeCAD completed but no output file was generated.\nstdout: {result.stdout}",
        )


# --------------- Serve other static assets (CSS, JS, etc.) ---------------
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")
