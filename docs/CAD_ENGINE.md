# CAD Engine

## Overview

The project currently has two CAD-generation paths:

1. Active backend export path (production path today): DXF generation with `ezdxf`
2. Standalone parametric scripting path (experimental/offline): FreeCAD Python scripts

This separation is important for onboarding: API exports are DXF today, while FreeCAD scripts are present but not yet fully wired into the active API path.

## CAD Pipeline (Active API Path)

```mermaid
flowchart LR
    A[Frontend: create export request] --> B[POST /api/v1/exports/]
    B --> C[export_service.create_export]
    C --> D[DXFGenerator.generate_linear_guide]
    D --> E[backend/exports/skf_config_{id}.dxf]
    E --> F[/downloads/skf_config_{id}.dxf]
```

Implementation references:

- `backend/app/services/export_service.py`
- `backend/app/core/cad_engine.py`
- `backend/app/main.py` (`app.mount("/downloads", StaticFiles(...))`)

## DXF Generator Behavior

`generate_linear_guide(config_id, geometry_params, application_params)` currently uses:

- `geometry_params.W` as rail width (default `20`)
- `geometry_params.LS` as rail length (default `500`)
- `application_params.NOB` as number of blocks (default `2`)
- `application_params.PN` as part number label in drawing text

It creates:

- Rail polyline
- Block polylines
- Centerline
- Dimension annotations
- Title text

and saves output as:

- `backend/exports/skf_config_{config_id}.dxf`

## Code Example (DXF Service Trigger)

```python
# backend/app/services/export_service.py
file_path = dxf_generator.generate_linear_guide(
    config_id=config.id,
    geometry_params=geometry_params,
    application_params=application_params
)
```

## Standalone FreeCAD Scripts (Not Main API Path Yet)

Files:

- `T_bolt.py`
- `pully1.py`
- Generated runner examples may appear in `backend/exports/run_*.py`

These scripts show robust parametric modeling patterns:

- create sketch
- apply geometric and dimensional constraints
- build solid features (revolve, pad, fillet)
- export mesh/CAD artifacts

Example pattern:

```python
def generate_part(params):
    H = params["H"]
    W = params["W"]
    # build constrained geometry
    # export model
```

## Export Formats

Current API reality:

- Request payload accepts `format` string (e.g., `"STEP"`, `"IGES"`, `"STL"`)
- Active generator currently produces DXF and returns `/downloads/*.dxf`

Future target (recommended):

- STEP
- DXF
- GLB

## Folder References

- CAD core: `backend/app/core/cad_engine.py`
- Export orchestration: `backend/app/services/export_service.py`
- Offline scripts: `backend/scripts/` and repo-root script files
- Output: `backend/exports/`

## API Example

```http
POST /api/v1/exports/
Content-Type: application/json

{
  "configuration_id": 45,
  "format": "STEP"
}
```

Typical current response:

```json
{
  "id": 17,
  "configuration_id": 45,
  "format": "STEP",
  "status": "completed",
  "file_path": "/downloads/skf_config_45.dxf",
  "job_id": null,
  "error_message": null,
  "created_at": "2026-03-05T10:30:00.000000"
}
```
