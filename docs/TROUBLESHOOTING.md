# Troubleshooting

## 1) Backend Does Not Start

Symptom:

- `ModuleNotFoundError` (for `fastapi`, `uvicorn`, etc.)

Cause:

- Virtual environment is not activated or dependencies are missing.

Fix:

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Quick check:

- Open `http://localhost:8000/health`

## 2) Frontend Shows "Backend Disconnected"

Symptom:

- Connection toast shows disconnected.

Cause:

- Backend not running, wrong API base URL, or blocked by CORS.

Fix:

1. Verify backend health:
   - `http://localhost:8000/health`
2. Verify frontend API base:
   - `frontend/src/services/api.js`
3. Verify CORS:
   - `backend/app/core/config.py` (`BACKEND_CORS_ORIGINS`)

Important:

- Health endpoint is `/health` (root), not `/api/v1/health`.

## 3) Export Requested as STEP But DXF Is Returned

Symptom:

- Frontend sends `"format": "STEP"` but downloaded file is `.dxf`.

Cause:

- Current backend export path uses `DXFGenerator` regardless of requested format.

Fix:

- This is expected with current implementation.
- To support true multi-format export, extend `export_service.py` to route by format and implement generators per format.

## 4) Download URL 404

Symptom:

- `/downloads/<file>` returns not found.

Cause:

- File was not generated, generation failed, or wrong file path.

Fix:

1. Check export status in API response (`failed` or `completed`).
2. Check filesystem output in `backend/exports/`.
3. Confirm static mount exists in `backend/app/main.py`:
   - `app.mount("/downloads", StaticFiles(directory=...))`

## 5) FreeCAD Path or Command Issues

Symptom:

- Standalone scripts fail to launch FreeCAD executables.

Cause:

- FreeCAD not installed in expected location.

Fix:

1. Install FreeCAD.
2. Update executable paths in scripts such as `pully1.py`.
3. Validate `FreeCAD.exe` / `FreeCADCmd.exe` paths manually.

## 6) 3D Viewer Loads Blank or Fails

Symptom:

- Canvas appears blank, model does not render, or loader never finishes.

Cause:

- Incorrect `modelUrl`, missing asset in `frontend/public`, browser WebGL issue, or viewer init error.

Fix:

1. Verify model exists under `frontend/public/`.
2. Check selected model mapping in:
   - `frontend/src/features/configurator/pages/ConfiguratorPage.jsx`
3. Open browser dev tools:
   - check network request for `.glb`
   - check console logs from `Preview3D.jsx`

## 7) Validation Rejects Configuration

Symptom:

- API returns `400 Engineering Error: Maximum 10 blocks allowed per rail.`

Cause:

- `number_of_blocks` exceeded allowed value in service logic.

Fix:

- Keep `number_of_blocks <= 10`
- Update logic in `backend/app/services/configuration_service.py` if business rule changes.

## 8) Strange Characters in Logs/UI

Symptom:

- Garbled symbols like `â†` or `âœ`.

Cause:

- Encoding mismatch in terminal/editor.

Fix:

- Use UTF-8 encoding in editor.
- Ensure terminal code page supports UTF-8.
- Prefer ASCII for system-level script output when possible.

## 9) Useful Diagnostic Commands

Backend route check:

```bash
curl http://localhost:8000/openapi.json
```

List configurations:

```bash
curl http://localhost:8000/api/v1/configurations/
```

Create export quickly:

```bash
curl -X POST "http://localhost:8000/api/v1/exports/" ^
  -H "Content-Type: application/json" ^
  -d "{\"configuration_id\":1,\"format\":\"STEP\"}"
```
