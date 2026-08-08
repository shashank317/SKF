# SKF CAD Configurator

Full-stack engineering configurator for creating and exporting CAD-oriented component configurations.

## Overview
This project addresses a common engineering workflow problem: collecting part parameters, validating them, and converting them into reproducible CAD outputs without manual handoff between multiple tools.  
It includes a React frontend for guided configuration and a FastAPI backend for persistence, export orchestration, and model-generation endpoints.

## Features
- Configuration CRUD API with SQLite persistence
- Export workflow tied to saved configurations
- DXF generation path in backend CAD engine
- FreeCAD-backed custom model generation endpoints (`/api/generate-cad`, `/api/generate-tbolt`)
- Download endpoint for generated CAD bundles (`/api/download-latest-cad`)
- Frontend flow for landing, selection, and configurator pages
- 3D model preview workflow in frontend

## Architecture
- **Frontend (`frontend/`)**: React + Vite SPA with route-based flows and API client services
- **Backend (`backend/`)**: FastAPI app with layered structure (`api`, `schemas`, `services`, `db`, `core`)
- **Storage**: SQLite database (`skf_configurator.db`) via SQLAlchemy
- **CAD generation**:
  - DXF generation via backend CAD engine
  - FreeCAD script orchestration for custom model generation
- **Generated assets**: Served from backend exports directory through `/downloads`

## Tech Stack
- **Languages**: Python, JavaScript
- **Backend**: FastAPI, SQLAlchemy, Pydantic
- **Frontend**: React, Vite, React Router
- **CAD/3D**: FreeCAD scripts, `ezdxf`, `@xeokit/xeokit-sdk`, Three.js
- **Database**: SQLite

## How It Works
1. User configures part parameters in the frontend.
2. Frontend sends configuration payloads to backend API.
3. Backend stores configuration records and returns IDs.
4. Export requests are created against stored configurations.
5. Backend generates export output and exposes files via `/downloads`.
6. Frontend retrieves generated files or ZIP bundles for download.

## Project Structure
```text
backend/
  app/
    api/v1/routes/
    core/
    db/
    schemas/
    services/
  scripts/
  exports/
frontend/
  src/
    features/
    components/
    services/
docs/
```

## Setup
### Backend
```bash
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Environment Variables
- `DATABASE_URL` (default: `sqlite:///./skf_configurator.db`)
- `BACKEND_CORS_ORIGINS` (default: `["http://localhost:5173"]`)
- `VITE_API_BASE_URL` (frontend; default: `http://localhost:8000/api/v1`)

## API / Usage
- API docs: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/health`
- Main API base: `http://localhost:8000/api/v1`

## Deployment
- Frontend: static build (`frontend/dist`) with SPA rewrites configured in `vercel.json`
- Backend: deploy as a FastAPI service (`uvicorn app.main:app`)
- Ensure CORS and `VITE_API_BASE_URL` point to deployed domains

## Engineering Decisions
- JSON columns are used for flexible configuration parameters that can evolve without rigid schema churn.
- A service layer separates route handlers from business logic for maintainability.
- CAD generation outputs are served through static mounts to simplify file delivery.
- The frontend and backend are split to keep UI iteration independent of CAD/API logic.

## Limitations
- Repository currently includes generated artifacts and environment files from earlier development cycles.
- FreeCAD automation paths are Windows-oriented in script discovery logic.
- SQLite is suitable for local/single-node workflows but not high-concurrency production use.
- Export format inputs are broader than the currently active generation implementations.

## Future Improvements
- Move generated CAD outputs and runtime files to ignored storage paths only.
- Add authenticated API access and audit-friendly request tracking.
- Introduce background job processing for long CAD generation tasks.
- Add integration tests covering configuration-to-export flow.
