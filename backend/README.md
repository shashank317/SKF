# SKF CAD Configurator Backend

FastAPI backend for configuration management and CAD export orchestration.

## Overview
This service manages engineering configurations, stores parameterized records, and coordinates CAD export generation. It separates HTTP routes, schemas, data models, and business services to keep API behavior maintainable as model-generation features evolve.

## Features
- Configuration CRUD endpoints
- Export lifecycle endpoints (create/read/update)
- SQLite persistence via SQLAlchemy
- Static download serving for generated files
- Custom FreeCAD model-generation routes for roller and T-bolt workflows
- OpenAPI documentation via FastAPI

## Architecture
- `app/main.py`: app setup, CORS, router mounting, `/downloads` static mount
- `app/api/v1/routes/`: API route handlers
- `app/services/`: business logic for configurations and exports
- `app/db/`: SQLAlchemy models and DB session handling
- `app/schemas/`: request/response validation models
- `scripts/`: FreeCAD automation scripts invoked by custom model routes
- `exports/`: generated output files

## Tech Stack
- Python
- FastAPI
- SQLAlchemy
- Pydantic
- Uvicorn
- ezdxf

## How It Works
1. Clients create/update configurations through `/api/v1/configurations`.
2. Configurations are persisted with JSON parameter groups.
3. Export requests are submitted to `/api/v1/exports`.
4. Export service loads configuration data and invokes CAD generation.
5. Generated files are exposed through `/downloads`.

## Project Structure
```text
backend/
  app/
    api/v1/
    core/
    db/
    schemas/
    services/
  scripts/
  exports/
  requirements.txt
```

## Setup
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

### Environment Variables
- `DATABASE_URL` (default: `sqlite:///./skf_configurator.db`)
- `BACKEND_CORS_ORIGINS` (default: `["http://localhost:5173"]`)

## API / Usage
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
- Health: `http://localhost:8000/health`
- API base: `http://localhost:8000/api/v1`

## Deployment
Current repository includes local/direct deployment workflow via Uvicorn.  
For hosted environments, run the same ASGI app with a process manager and set CORS + environment variables for deployed domains.

## Engineering Decisions
- Flexible parameter sections are stored as JSON columns to support evolving configuration inputs.
- Service modules isolate business rules from HTTP concerns.
- Static-file mounting is used for generated export delivery to avoid bespoke file-serving logic.

## Limitations
- CAD generation reliability depends on local FreeCAD availability and script compatibility.
- SQLite default is not ideal for multi-instance deployments.
- Generated exports currently accumulate in repository paths unless externalized.

## Future Improvements
- Queue-based asynchronous export jobs with status tracking.
- Stronger validation and normalization for geometry/material payloads.
- Configurable storage backend for generated files.
