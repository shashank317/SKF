# API Reference

## Base URLs

- API v1: `http://localhost:8000/api/v1`
- Health (root): `http://localhost:8000/health`
- Swagger: `http://localhost:8000/docs`

## Conventions

- Content type: `application/json`
- Pagination params where supported: `skip`, `limit`
- `limit` is capped at `100` on list endpoints

## Health Check

### `GET /health`

Response:

```json
{
  "status": "healthy",
  "service": "SKF CAD Configurator API",
  "version": "1.0.0"
}
```

---

## Configurations

### `POST /configurations/`

Create a configuration.

Request:

```json
{
  "part_number": "SKF-1029",
  "surface_treatment": "Standard",
  "number_of_blocks": 2,
  "geometry_params": {
    "H": 25,
    "W": 50,
    "LS": 500
  },
  "material_params": {
    "GREASE": "LGMT 2"
  },
  "advanced_params": {
    "ALT1": "M6"
  },
  "status": "draft"
}
```

Response (`201 Created`):

```json
{
  "id": 12,
  "part_number": "SKF-1029",
  "surface_treatment": "Standard",
  "number_of_blocks": 2,
  "geometry_params": {
    "H": 25,
    "W": 50,
    "LS": 500
  },
  "material_params": {
    "GREASE": "LGMT 2"
  },
  "advanced_params": {
    "ALT1": "M6"
  },
  "status": "draft",
  "created_at": "2026-03-05T09:00:00.000000",
  "updated_at": "2026-03-05T09:00:00.000000"
}
```

Validation note:

- `number_of_blocks > 10` returns HTTP `400` from service logic.

### `GET /configurations/`

List configurations.

Query params:

- `skip` (default `0`)
- `limit` (default `20`, max `100`)

### `GET /configurations/{config_id}`

Get one configuration by ID.

### `PATCH /configurations/{config_id}`

Partial update fields.

Example request:

```json
{
  "status": "completed",
  "surface_treatment": "Black Oxide"
}
```

### `DELETE /configurations/{config_id}`

Deletes configuration and related exports (cascade in SQLAlchemy relationship).

Response: `204 No Content`

---

## Exports

### `POST /exports/`

Create a CAD export request.

Request:

```json
{
  "configuration_id": 12,
  "format": "STEP"
}
```

Response (`201 Created`, typical):

```json
{
  "id": 20,
  "configuration_id": 12,
  "format": "STEP",
  "status": "completed",
  "file_path": "/downloads/skf_config_12.dxf",
  "job_id": null,
  "error_message": null,
  "created_at": "2026-03-05T09:10:00.000000"
}
```

### `GET /exports/{export_id}`

Get export by ID.

### `GET /exports/configuration/{configuration_id}`

List exports for one configuration.

Query params:

- `skip` (default `0`)
- `limit` (default `100`, max `100`)

### `PATCH /exports/{export_id}`

Update export status/details (useful for external workers or C# integration path).

Example request:

```json
{
  "status": "failed",
  "error_message": "Geometry invalid"
}
```

---

## Download Route

### `GET /downloads/{filename}`

Static file serving for generated CAD artifacts (currently DXF files).

Example:

- `GET /downloads/skf_config_12.dxf`

---

## Curl Examples

Create config:

```bash
curl -X POST "http://localhost:8000/api/v1/configurations/" ^
  -H "Content-Type: application/json" ^
  -d "{\"part_number\":\"SKF-1029\",\"geometry_params\":{\"W\":50,\"LS\":500}}"
```

Create export:

```bash
curl -X POST "http://localhost:8000/api/v1/exports/" ^
  -H "Content-Type: application/json" ^
  -d "{\"configuration_id\":12,\"format\":\"STEP\"}"
```

Health:

```bash
curl "http://localhost:8000/health"
```

## Folder References

- Routes: `backend/app/api/v1/routes/`
- Schemas: `backend/app/schemas/`
- Services: `backend/app/services/`
- Models: `backend/app/db/models.py`
