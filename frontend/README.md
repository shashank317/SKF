# SKF CAD Configurator Frontend

React frontend for guided engineering configuration and CAD workflow interaction.

## Overview
This frontend provides a route-based user interface where users can navigate from landing and selection pages into a configuration flow, then submit parameters to backend APIs and retrieve generated CAD outputs.

## Features
- Multi-page flow using React Router (`/`, `/select`, `/configurator`)
- Backend connectivity check component
- Configuration form workflow and API integration
- 3D preview integration path for generated model assets
- CAD generation and download interactions via backend endpoints

## Architecture
- `src/App.jsx`: route registration and global app layout
- `src/features/`: feature-oriented structure for landing, selection, configurator
- `src/components/`: shared components
- `src/services/api.js`: API client wrapper and endpoint-specific calls
- `src/context/`: theme provider

## Tech Stack
- React
- Vite
- React Router
- @xeokit/xeokit-sdk
- Three.js
- ESLint

## How It Works
1. UI collects user parameters and actions.
2. Frontend sends requests to backend API routes.
3. Backend responses update UI state and model/download actions.
4. Generated files are fetched from backend download endpoints.

## Project Structure
```text
frontend/
  src/
    features/
      landing/
      selection/
      configurator/
    components/
    services/
    context/
    styles/
  public/
  package.json
```

## Setup
```bash
cd frontend
npm install
npm run dev
```

### Environment Variables
- `VITE_API_BASE_URL` (default fallback in code: `http://localhost:8000/api/v1`)

## API / Usage
- Development UI: `http://localhost:5173`
- Backend API expected at: `http://localhost:8000`
- Health check request is routed to backend root `/health`

## Deployment
- Build command: `npm run build`
- Output directory: `dist/`
- Root `vercel.json` provides SPA rewrite behavior for client-side routes

## Engineering Decisions
- Feature-oriented folder structure keeps domain UI concerns grouped.
- API calls are centralized in one service module for consistent error handling.
- Backend URL fallback enables local setup with minimal configuration.

## Limitations
- Frontend behavior assumes backend endpoints and download paths follow current API contracts.
- No authentication or user-specific data isolation in current flow.

## Future Improvements
- Add typed API contracts and runtime response guards.
- Add automated UI/integration tests for critical flows.
- Improve handling and user feedback for long-running CAD generation requests.
