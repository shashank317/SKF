# SKF3 CAD Configurator - Codebase Context (Full Dump)

**Date:** January 10, 2026
**Version:** 0.1.0-alpha
**Environment:** Windows (PowerShell)

## 1. Project Directory Structure
```
skf3/
├── backend/
│   ├── app/
│   │   ├── api/v1/
│   │   │   └── router.py
│   │   ├── core/
│   │   │   └── config.py
│   │   ├── db/
│   │   ├── schemas/
│   │   │   └── configuration.py
│   │   └── main.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── configurator/
│   │   │   │   ├── InputPanel.jsx
│   │   │   │   ├── Preview3D.jsx
│   │   │   │   └── ResultPanel.jsx
│   │   │   └── ConnectionTest.jsx
│   │   ├── constants/
│   │   │   └── parameters.js
│   │   ├── services/
│   │   │   └── api.js
│   │   └── App.jsx
│   └── package.json
└── run_backend.bat
```

---

## 2. Backend Logic (FastAPI)

### `backend/requirements.txt`
```text
annotated-doc==0.0.4
annotated-types==0.7.0
anyio==4.12.1
click==8.3.1
colorama==0.4.6
fastapi==0.128.0
h11==0.16.0
idna==3.11
pydantic==2.12.5
pydantic-settings==2.1.0
pydantic_core==2.41.5
sqlalchemy==2.0.23
starlette==0.50.0
typing-inspection==0.4.2
typing_extensions==4.15.0
uvicorn==0.40.0
```

### `backend/app/main.py`
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine, Base
from app.core.config import settings
from app.api.v1.router import api_router
from app.db import models

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Backend API for SKF bearing configuration and CAD export",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")

@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "Welcome to SKF CAD Configurator API",
        "version": settings.VERSION,
        "docs": "/docs",
        "redoc": "/redoc"
    }

@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION
    }
```

### `backend/app/api/v1/router.py`
```python
from fastapi import APIRouter
from app.api.v1.routes import configurations, exports

api_router = APIRouter()

api_router.include_router(
    configurations.router,
    prefix="/configurations",
    tags=["Configurations"]
)

api_router.include_router(
    exports.router,
    prefix="/exports",
    tags=["Exports"]
)
```

### `backend/app/schemas/configuration.py`
```python
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ConfigurationBase(BaseModel):
    part_number: str
    surface_treatment: Optional[str] = None
    number_of_blocks: Optional[int] = None
    geometry_params: Optional[dict] = None
    material_params: Optional[dict] = None
    advanced_params: Optional[dict] = None
    status: Optional[str] = "draft"

class ConfigurationCreate(ConfigurationBase):
    pass

class ConfigurationUpdate(BaseModel):
    part_number: Optional[str] = None
    surface_treatment: Optional[str] = None
    number_of_blocks: Optional[int] = None
    geometry_params: Optional[dict] = None
    material_params: Optional[dict] = None
    advanced_params: Optional[dict] = None
    status: Optional[str] = None
    
class ConfigurationResponse(ConfigurationBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
```

---

## 3. Frontend Logic (React)

### `frontend/src/App.jsx`
```javascript
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import Configurator from "./pages/Configurator";
import ConnectionTest from "./components/ConnectionTest";

function App() {
  return (
    <BrowserRouter>
      <ConnectionTest />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/configurator" element={<Configurator />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

### `frontend/src/services/api.js`
```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

console.log("🔌 Connecting to API:", API_BASE_URL);

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = { "Content-Type": "application/json", ...options.headers };
  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    let errorMessage = `API Error: ${response.status} ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData.detail) errorMessage = errorData.detail;
    } catch {}
    throw new Error(errorMessage);
  }
  if (response.status === 204) return null;
  return response.json();
}

export async function getHealth() {
  const rootUrl = API_BASE_URL.replace("/api/v1", "");
  const response = await fetch(`${rootUrl}/health`);
  return response.json();
}

export async function createConfiguration(data) {
  return request("/configurations/", { method: "POST", body: JSON.stringify(data) });
}
```

### `frontend/src/components/configurator/InputPanel.jsx`
**Key Features**: Validates inputs based on `parameters.js`, manages step state.
*(Source omitted for brevity, logic follows standard React controlled forms)*

### `frontend/src/components/configurator/Preview3D.jsx`
**Key Features**: Uses `xeokit-sdk` to load `.glb` models, supports section cuts and dimensions.
```javascript
// Initialization snippet
const viewer = new Viewer({
    canvasElement: canvasRef.current,
    transparent: true,
    backgroundColor: [248, 250, 252],
    units: "millimeters"
});
const gltfLoader = new GLTFLoaderPlugin(viewer);
const model = gltfLoader.load({
    id: "bearing",
    src: modelPath,
    edges: true
});
```
