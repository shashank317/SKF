# SKF3 CAD Configurator - Detailed Project Context

**Date:** January 10, 2026
**Version:** 0.1.0-alpha
**Environment:** Windows (PowerShell)

## 1. Executive Overview
**SKF3 CAD Configurator** is a modern, full-stack web application for configuring SKF linear motion systems and generating engineering-grade 3D CAD files. It replaces legacy tools with a highly interactive, 3D-first experience.

---

## 2. Frontend Specifications
**Location:** `frontend/`

### 2.1 Core Tech Stack
*   **Runtime:** Node.js (v18+ recommended)
*   **Framework:** React v19.2.0
*   **Build Tool:** Vite v7.2.5 (Rolldown)
*   **Routing:** React Router DOM v7.11.0
*   **Language:** JavaScript (ES6+ Modules)

### 2.2 Visualization & UI Libraries
*   **3D Engine:** `@xeokit/xeokit-sdk` v2.6.101 (High-performance CAD rendering)
*   **3D Helpers:** `three` v0.182.0 (Used for environment/helper objects)
*   **Animations:** `framer-motion` (motion) v12.23.26, `gsap` v3.14.2
*   **Icons:** `lucide-react` v0.562.0

### 2.3 Component Architecture (`src/components/`)
*   **`Configurator/InputPanel.jsx`**: 
    *   **Logic**: Manages a 4-step wizard state (Application → Geometry → Materials → Fine Tuning).
    *   **Validation**: Real-time per-field validation using `constants/parameters.js`.
    *   **State**: Local React state for form values and errors.
*   **`Configurator/Preview3D.jsx`**:
    *   **Logic**: Wrapper around `xeokit` Viewer.
    *   **Key Methods**: `loadModel()` (.glb/.ifc), `createSectionPlane()` (clipping), `createAnnotation()` (dimensions).
    *   **Features**: Floating toolbar for View/Rotate/Section/Measure.
*   **`ConnectionTest.jsx`**:
    *   **Logic**: Polls backend `/health` endpoint every 30s. Visual connectivity indicator.

### 2.4 Design System (`src/styles/`)
*   **Methodology**: Vanilla CSS with CSS Variables (Custom Properties).
*   **Theming**: `theme.css` handles Light/Dark modes (colors, surface levels).
*   **Responsive**: Mobile-first breakpoints defined in `index.css`.

---

## 3. Backend Specifications
**Location:** `backend/`

### 3.1 Core Tech Stack
*   **Language:** Python 3.x
*   **Framework:** FastAPI v0.128.0
*   **Server:** Uvicorn v0.40.0 (ASGI)
*   **Validation:** Pydantic v2.12.5

### 3.2 Directory Structure
*   **`app/main.py`**: App entry point. Configures CORS (`localhost:5173`) and includes routers.
*   **`app/api/v1/router.py`**: Central router aggregating feature modules.
*   **`app/schemas/configuration.py`**:
    *   **`ConfigurationCreate`**: Input schema for POST.
    *   **`ConfigurationResponse`**: Output schema including `id`, `created_at`.
*   **`app/core/config.py`**: Settings (DB URL, API Version) using `pydantic-settings`.
*   **`app/db/`**: SQLAlchemy models and session handling (SQLite default).

### 3.3 Dependencies (`requirements.txt`)
*   `fastapi`, `uvicorn`, `pydantic`, `sqlalchemy`, `pydantic-settings`

---

## 4. Business Logic & Configuration (Data Models)
**Location:** `frontend/src/constants/parameters.js`

The configuration logic is strictly typed and defined as a constant object `PARAMETERS`.
*   **Step 1: Application**
    *   `PN` (Part No), `ST` (Surface Treatment), `NOB` (Num blocks: 1-10)
*   **Step 2: Geometry** (Unit: mm)
    *   `H`, `W`, `L1`, `B`, `C` (Required Dimensions)
    *   `L2`, `K`, `N`, `C2`, `W1`, `W2` (Optional Dimensions)
*   **Step 3: Materials**
    *   `MX` (Lubrication Units), `GREASE` (Type: LGMT 2, etc.)
*   **Step 4: Advanced**
    *   `DD1DD2HH` (Dimensions d1xd2xh), `ALT1` (Tapped Holes), `ALT2` (Rail Cuts)

---

## 5. API Specification (Alpha)
**Base URL:** `http://localhost:8000/api/v1`

### Endpoints
1.  **GET /health**
    *   **Response:** `{"status": "healthy", "service": "SKF..."}`
2.  **POST /configurations/**
    *   **Body:** JSON matching `ConfigurationCreate` schema.
    *   **Response:** Created config object with ID.
3.  **GET /exports/configuration/{id}**
    *   **Response:** List of available CAD formats and download URLs.

---

## 6. Development Workflow

### Starting the Project
**Option 1: Windows Batch Script (Recommended)**
```powershell
.\run_backend.bat  # Starts Backend (activates venv automatically)
cd frontend
npm run dev        # Starts Frontend
```

**Option 2: Manual Start**
*   **Backend:** `cd backend` -> `venv\Scripts\activate` -> `uvicorn app.main:app --reload`
*   **Frontend:** `cd frontend` -> `npm install` -> `npm run dev`

### Verification
*   Open `http://localhost:5173`.
*   Look for **"Backend Connected: ✅"** toast message.
*   Navigate to `/configurator` and test the detailed input form.
