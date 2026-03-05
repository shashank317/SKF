# Developer Guide

## Who This Is For

New engineers joining SKF3 who need to:

- run frontend and backend locally
- understand code ownership boundaries
- add new parameters, endpoints, or CAD behavior

## Local Setup

## Prerequisites

- Python 3.10+
- Node.js 18+
- npm

Optional for advanced CAD scripting:

- FreeCAD installed locally

## Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Alternative on Windows:

```bash
run_backend.bat
```

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend default URL: `http://localhost:5173`

## Project Map for Developers

```text
backend/app/main.py                  FastAPI app, CORS, static mounts
backend/app/api/v1/routes/           API route definitions
backend/app/services/                Business logic
backend/app/core/cad_engine.py       DXF generation engine
backend/app/db/models.py             SQLAlchemy models
frontend/src/features/configurator/  Main configurator UI
frontend/src/services/api.js         Frontend API client
frontend/src/constants/              Product schemas and validation rules
```

## Development Workflow

1. Update frontend parameter definitions or UI behavior.
2. Save configuration via `POST /api/v1/configurations/`.
3. Trigger export via `POST /api/v1/exports/`.
4. Verify generated file path and download.
5. Validate behavior in DB (`backend/skf_configurator.db`) and exported files (`backend/exports/`).

## Adding a New CAD Component

### 1) Frontend schema

Add a new parameter file:

- `frontend/src/constants/parameters_<component>.js`

Register it in:

- `frontend/src/constants/schemas.js`

### 2) Configurator model mapping

Add model URL in:

- `frontend/src/features/configurator/pages/ConfiguratorPage.jsx`

### 3) Backend mapping

If component needs custom generation:

- Add service logic in `backend/app/services/export_service.py`
- Add generator code in `backend/app/core/` or `backend/scripts/`

### 4) API contract

If new payload fields are needed:

- update Pydantic schemas (`backend/app/schemas/`)
- update SQLAlchemy model if persistence changes are required

## Adding New API Endpoints

1. Create route in `backend/app/api/v1/routes/`.
2. Register route in `backend/app/api/v1/router.py`.
3. Add schema models in `backend/app/schemas/`.
4. Add service logic in `backend/app/services/`.
5. Validate via `http://localhost:8000/docs`.

## Example: Saving a Configuration

```javascript
// frontend/src/services/api.js
export async function createConfiguration(data) {
  return request("/configurations/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
```

## Example: Export Trigger

```javascript
const response = await createExport({
  configuration_id: configId,
  format: "STEP"
});
```

## Coding Standards

Backend:

- Type-aware schema-first APIs with Pydantic
- Keep endpoint logic thin; move logic to service layer
- Keep DB access inside service functions

Frontend:

- Keep schema definitions in constants
- Keep input validation centralized in `frontend/src/constants/parameters.js`
- Keep API requests in `frontend/src/services/api.js`

## Current Gaps to Be Aware Of

- No automated test suite committed yet.
- Export jobs are synchronous; no worker queue currently.
- `format` in export payload is accepted, but active pipeline writes DXF today.
- Some backend module files exist as placeholders and are intentionally empty.

## Useful Commands

Backend health:

```bash
curl http://localhost:8000/health
```

List configs:

```bash
curl http://localhost:8000/api/v1/configurations/
```

## Documentation Workflow

When you change API contracts or CAD behavior:

1. Update `docs/API_REFERENCE.md`
2. Update `docs/CAD_ENGINE.md`
3. Update `docs/ARCHITECTURE.md` if data flow changes
