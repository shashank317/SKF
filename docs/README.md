# SKF3 CAD Configurator Documentation

Interactive CAD configuration platform for engineering components.

## Overview

SKF is a full-stack system with a React frontend and a FastAPI backend. Engineers configure component parameters in the UI, save configurations, and trigger CAD exports.

Current implementation highlights:

- Configuration CRUD APIs with SQLite persistence
- DXF generation pipeline (active) using `ezdxf`
- 3D model preview in browser using `xeokit` and GLB assets
- Export download routing via `/downloads/*`

## Tech Stack

Backend:

- Python
- FastAPI
- SQLAlchemy
- Pydantic
- ezdxf

Frontend:

- React
- Vite
- xeokit-sdk
- React Router

CAD:

- Active in API: DXF export from `backend/app/core/cad_engine.py`
- Experimental/offline scripts: FreeCAD scripts in repository root (`T_bolt.py`, `pully1.py`)

## Repository Structure

```text
backend/
  app/
    api/v1/routes/
    core/
    db/
    schemas/
    services/
  exports/
  scripts/
frontend/
  src/
    features/
    components/
    constants/
    services/
docs/
```

## Documentation Index

- [Project Idea](./PROJECT_IDEA.md)
- [System Architecture](./ARCHITECTURE.md)
- [CAD Engine](./CAD_ENGINE.md)
- [API Reference](./API_REFERENCE.md)
- [Developer Guide](./DEVELOPER_GUIDE.md)
- [Deployment](./DEPLOYMENT.md)
- [Troubleshooting](./TROUBLESHOOTING.md)

## Quick Start

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Backend:

- API root: `http://localhost:8000`
- OpenAPI docs: `http://localhost:8000/docs`
- Health: `http://localhost:8000/health`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend:

- `http://localhost:5173`

## End-to-End API Example

Create a configuration:

```http
POST /api/v1/configurations/
Content-Type: application/json

{
  "part_number": "SKF-1029",
  "surface_treatment": "Standard",
  "number_of_blocks": 2,
  "geometry_params": {
    "H": 25,
    "W": 50,
    "LS": 500
  }
}
```

Trigger export:

```http
POST /api/v1/exports/
Content-Type: application/json

{
  "configuration_id": 12,
  "format": "STEP"
}
```

Current backend behavior:

- The export service currently generates DXF and returns `file_path` like `/downloads/skf_config_12.dxf`

## Notes for New Engineers

- Health endpoint is root-level (`/health`), not under `/api/v1`.
- The frontend default API base is `http://localhost:8000/api/v1`.
- Export format is accepted in request payload, but active generation path is DXF today.
