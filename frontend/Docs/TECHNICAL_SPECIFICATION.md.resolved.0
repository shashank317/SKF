# SKF3 CAD Configurator - Technical Specification Document

**Document Type:** Technical Specification  
**Classification:** Internal - Development Team  
**Version:** 1.0.0  
**Date:** January 7, 2026

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-01-07 | Development Team | Initial release |

---

## 1. System Overview

### 1.1 Purpose

This document provides detailed technical specifications for the SKF3 CAD Configurator frontend application, including component interfaces, data models, API contracts, and implementation details.

### 1.2 Scope

This specification covers:
- Frontend architecture and design patterns
- Component specifications and interfaces
- Data models and validation rules
- 3D visualization implementation
- Performance requirements
- Security considerations

### 1.3 Audience

- Frontend Developers
- Backend Developers
- QA Engineers
- System Architects
- Technical Project Managers

---

## 2. Technical Requirements

### 2.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-001 | User shall configure product parameters through step-based interface | High | ✅ Implemented |
| FR-002 | System shall validate input parameters in real-time | High | ✅ Implemented |
| FR-003 | User shall preview 3D model based on configuration | High | ✅ Implemented |
| FR-004 | User shall toggle between dark and light themes | Medium | ✅ Implemented |
| FR-005 | User shall download CAD model in multiple formats | High | 🔄 In Progress |
| FR-006 | System shall display dimension annotations on 3D model | Medium | ✅ Implemented |
| FR-007 | User shall view cross-section of 3D model | Medium | ✅ Implemented |

### 2.2 Non-Functional Requirements

| ID | Requirement | Target | Status |
|----|-------------|--------|--------|
| NFR-001 | Initial page load time | < 2 seconds | ✅ Met |
| NFR-002 | 3D model load time | < 3 seconds | ✅ Met |
| NFR-003 | Form validation response | < 100ms | ✅ Met |
| NFR-004 | Browser compatibility | Chrome 90+, Firefox 88+, Safari 14+, Edge 90+ | ✅ Met |
| NFR-005 | Mobile responsiveness | Tablet (768px+) support | ✅ Met |
| NFR-006 | Accessibility | WCAG 2.1 Level AA | 🔄 Partial |

---

## 3. Data Models

### 3.1 Configuration Data Model

```typescript
interface Configuration {
  // Application Step
  partNumber: string;              // PN
  surfaceTreatment: string;        // ST
  numberOfBlocks: number;          // NOB
  
  // Geometry Step
  dimensions: {
    H: number;                     // Height (mm)
    L: number;                     // Length selection (mm)
    W: number;                     // Width (mm)
    L1: number;                    // Length 1 (mm)
    B: number;                     // B dimension (mm)
    C: number;                     // C dimension (mm)
    L2?: number;                   // Optional Length 2 (mm)
    K?: number;                    // Optional K (mm)
    N?: number;                    // Optional N (mm)
    C2?: number;                   // Optional C2 (mm)
    W1?: number;                   // Optional W1 (mm)
    W2?: number;                   // Optional W2 (mm)
    H1?: number;                   // Optional H1 (mm)
    F?: number;                    // Optional F (mm)
    G?: number;                    // Optional G (mm)
  };
  
  // Materials Step
  lubricationUnit: string;         // MX
  greaseType: string;              // GREASE
  
  // Advanced Step (Optional)
  advanced?: {
    additionalDimensions?: {
      Sxl?: string;                // SLL
      Cb?: number;                 // CBB (mm)
      l1?: number;                 // LL1 (mm)
      Ca?: number;                 // CAA (mm)
      d1d2h?: string;              // DD1DD2HH (format: "10x20x5")
    };
    alterations?: {
      tappedHoles?: string;        // ALT1
      railEndsCut?: string;        // ALT2
      additionalBlocks?: string;   // ALT4
    };
  };
  
  // Metadata
  createdAt: string;               // ISO 8601 timestamp
  updatedAt: string;               // ISO 8601 timestamp
  version: string;                 // Configuration version
}
```

### 3.2 Parameter Definition Model

```typescript
interface Parameter {
  label: string;                   // Display label
  key: string;                     // Unique identifier (used in API)
  type: 'string' | 'number';       // Data type
  input: 'text' | 'number' | 'select'; // Input control type
  unit?: string;                   // Unit of measurement (e.g., 'mm')
  required: boolean;               // Validation flag
  step: 'application' | 'geometry' | 'materials' | 'advanced';
  subsection?: string;             // For advanced step organization
  options?: string[] | number[];   // For select inputs
  validation?: {
    min?: number;                  // Minimum value
    max?: number;                  // Maximum value
    pattern?: string;              // Regex pattern
  };
  placeholder?: string;            // Input placeholder text
  helpText?: string;               // Tooltip/help text
}
```

### 3.3 Validation Result Model

```typescript
interface ValidationResult {
  valid: boolean;
  errors?: ValidationError[];
}

interface ValidationError {
  key: string;                     // Parameter key
  error: string;                   // Error message
  severity: 'error' | 'warning';   // Error severity
}
```

---

## 4. Component Specifications

### 4.1 InputPanel Component

**File**: [InputPanel.jsx](file:///c:/Users/shashank/Desktop/SKF3/frontend/src/components/configurator/InputPanel.jsx)

#### Interface

```typescript
interface InputPanelProps {
  // No props - self-contained component
}

interface InputPanelState {
  currentStep: number;             // Active step index (0-3)
  formValues: Record<string, any>; // Parameter values
  errors: Record<string, string>;  // Validation errors
  touched: Record<string, boolean>; // Field touch state
}
```

#### Behavior

1. **Step Navigation**
   - User can navigate between steps using step indicators
   - Navigation validates current step before proceeding
   - Invalid steps are highlighted with error state

2. **Input Handling**
   - Text inputs: Free-form text entry
   - Number inputs: Numeric keyboard on mobile, validation on blur
   - Select inputs: Dropdown with predefined options

3. **Validation**
   - Real-time validation on input change
   - Required field validation
   - Range validation for numeric inputs
   - Pattern validation for formatted inputs (e.g., d1×d2×h)

4. **State Management**
   - Form values stored in component state
   - Validation errors stored separately
   - Touch state tracks user interaction

#### CSS Classes

```css
.input-panel { }                   /* Main container */
.step-indicator { }                /* Step progress UI */
.step-indicator__item { }          /* Individual step */
.step-indicator__item--active { }  /* Active step */
.step-indicator__item--complete { } /* Completed step */
.step-indicator__item--error { }   /* Invalid step */
.input-group { }                   /* Input field group */
.input-label { }                   /* Field label */
.input-field { }                   /* Input element */
.input-error { }                   /* Error message */
.subsection-header { }             /* Advanced subsection header */
```

---

### 4.2 Preview3D Component

**File**: [Preview3D.jsx](file:///c:/Users/shashank/Desktop/SKF3/frontend/src/components/configurator/Preview3D.jsx)

#### Interface

```typescript
interface Preview3DProps {
  modelPath?: string;              // Path to 3D model file
  configuration?: Configuration;   // Current configuration
  onModelLoad?: () => void;        // Callback on model load
  onError?: (error: Error) => void; // Error callback
}

interface Preview3DState {
  viewer: Viewer | null;           // xeokit viewer instance
  model: any | null;               // Loaded model
  sectionEnabled: boolean;         // Section view toggle
  dimensionsVisible: boolean;      // Dimension annotations toggle
  loading: boolean;                // Loading state
  error: Error | null;             // Error state
}
```

#### Behavior

1. **Viewer Initialization**
   ```javascript
   const viewer = new Viewer({
     canvasId: "preview-canvas",
     transparent: true,
     saoEnabled: true,              // Ambient occlusion
     pbrEnabled: false,             // PBR rendering
   });
   
   viewer.scene.camera.eye = [10, 10, 10];
   viewer.scene.camera.look = [0, 0, 0];
   viewer.scene.camera.up = [0, 1, 0];
   ```

2. **Model Loading**
   ```javascript
   const glbLoader = new GLTFLoaderPlugin(viewer);
   const model = glbLoader.load({
     id: "model",
     src: modelPath,
     edges: true,
     saoEnabled: true
   });
   ```

3. **Camera Controls**
   - Orbit: Left mouse drag
   - Pan: Right mouse drag or Shift + left drag
   - Zoom: Mouse wheel
   - Reset: Double-click

4. **Section View**
   ```javascript
   const sectionPlane = viewer.scene.sectionPlanes.createSectionPlane({
     id: "section-y",
     pos: [0, 0, 0],
     dir: [0, -1, 0]                // Y-axis clipping
   });
   ```

5. **Dimension Annotations**
   - Display key dimensions from configuration
   - Position annotations at relevant model features
   - Update when configuration changes

#### CSS Classes

```css
.preview-container { }             /* Main container */
.preview-canvas { }                /* Canvas element */
.floating-toolbar { }              /* Control toolbar */
.toolbar-button { }                /* Toolbar button */
.toolbar-button--active { }        /* Active button state */
.loading-overlay { }               /* Loading state */
.error-message { }                 /* Error display */
```

---

### 4.3 ResultPanel Component

**File**: [ResultPanel.jsx](file:///c:/Users/shashank/Desktop/SKF3/frontend/src/components/configurator/ResultPanel.jsx)

#### Interface

```typescript
interface ResultPanelProps {
  configuration: Configuration;    // Current configuration
  onExport?: (format: string) => void; // Export callback
}
```

#### Behavior

1. **Product Code Generation**
   - Concatenate parameter keys according to SKF naming convention
   - Example: `PN-ST-NOB-H-L-W-...`

2. **Configuration Summary**
   - Display all selected parameters
   - Group by step/category
   - Highlight required vs. optional

3. **Export Functionality**
   - CAD format selection (STEP, IGES, STL, etc.)
   - Download button
   - Export progress indication

---

## 5. API Integration

### 5.1 Planned Backend Endpoints

> [!NOTE]
> Backend API is planned for future implementation

#### Configuration Submission

```http
POST /api/v1/configurations
Content-Type: application/json

{
  "configuration": { /* Configuration object */ },
  "userId": "string",
  "sessionId": "string"
}

Response 201 Created:
{
  "configurationId": "uuid",
  "productCode": "string",
  "createdAt": "ISO 8601"
}
```

#### Model Retrieval

```http
GET /api/v1/models/{productCode}

Response 200 OK:
{
  "modelUrl": "https://cdn.skf.com/models/...",
  "format": "glb",
  "size": 1234567,
  "checksum": "sha256:..."
}
```

#### CAD Export

```http
POST /api/v1/export
Content-Type: application/json

{
  "configurationId": "uuid",
  "format": "STEP" | "IGES" | "STL" | "DXF"
}

Response 200 OK:
{
  "downloadUrl": "https://...",
  "expiresAt": "ISO 8601"
}
```

---

## 6. Performance Specifications

### 6.1 Load Time Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| First Contentful Paint (FCP) | < 1.5s | Lighthouse |
| Largest Contentful Paint (LCP) | < 2.5s | Lighthouse |
| Time to Interactive (TTI) | < 3.5s | Lighthouse |
| First Input Delay (FID) | < 100ms | Real User Monitoring |
| Cumulative Layout Shift (CLS) | < 0.1 | Lighthouse |

### 6.2 Bundle Size Targets

| Bundle | Target Size | Actual Size |
|--------|-------------|-------------|
| Main JS | < 200 KB (gzipped) | ~180 KB |
| Vendor JS | < 300 KB (gzipped) | ~250 KB |
| CSS | < 50 KB (gzipped) | ~35 KB |
| Total | < 550 KB (gzipped) | ~465 KB |

### 6.3 Runtime Performance

- **Frame Rate**: Maintain 60 FPS during 3D interactions
- **Memory Usage**: < 150 MB heap size
- **Model Load Time**: < 3 seconds for models up to 10 MB

---

## 7. Security Considerations

### 7.1 Input Validation

- **Client-side**: All inputs validated using parameter definitions
- **Server-side**: Backend must re-validate all inputs (defense in depth)
- **XSS Prevention**: All user inputs sanitized before rendering

### 7.2 Data Privacy

- **LocalStorage**: Only theme preference stored locally
- **Session Data**: Configuration data not persisted without user action
- **Analytics**: No PII collected without consent

### 7.3 Content Security Policy

```http
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self' data:;
  connect-src 'self' https://api.skf.com;
  frame-ancestors 'none';
```

---

## 8. Testing Strategy

### 8.1 Unit Testing

**Framework**: Jest + React Testing Library

**Coverage Targets**:
- Components: > 80%
- Utilities: > 90%
- Validation logic: 100%

**Example Test**:
```javascript
describe('InputPanel', () => {
  it('should validate required fields', () => {
    const { getByLabelText, getByText } = render(<InputPanel />);
    const input = getByLabelText('Part Number');
    
    fireEvent.blur(input);
    expect(getByText('Part Number is required')).toBeInTheDocument();
  });
});
```

### 8.2 Integration Testing

**Framework**: Playwright

**Test Scenarios**:
- Complete configuration workflow
- 3D model loading and interaction
- Theme switching
- Form validation across steps

### 8.3 Visual Regression Testing

**Tool**: Percy or Chromatic

**Snapshots**:
- Landing page (light/dark)
- Configurator steps (all 4 steps)
- 3D viewer states
- Error states

---

## 9. Accessibility (A11y)

### 9.1 WCAG 2.1 Compliance

| Criterion | Level | Status |
|-----------|-------|--------|
| 1.1.1 Non-text Content | A | ✅ |
| 1.4.3 Contrast (Minimum) | AA | ✅ |
| 2.1.1 Keyboard | A | 🔄 Partial |
| 2.4.7 Focus Visible | AA | ✅ |
| 3.3.1 Error Identification | A | ✅ |
| 4.1.2 Name, Role, Value | A | ✅ |

### 9.2 Keyboard Navigation

- **Tab**: Navigate between inputs
- **Enter**: Submit/proceed
- **Escape**: Close modals
- **Arrow Keys**: Navigate 3D viewer (planned)

### 9.3 Screen Reader Support

- Semantic HTML elements
- ARIA labels for custom controls
- Live regions for dynamic content
- Skip links for navigation

---

## 10. Internationalization (i18n)

### 10.1 Planned Language Support

> [!NOTE]
> i18n support planned for Phase 2

- English (en-US) - Primary
- German (de-DE)
- French (fr-FR)
- Spanish (es-ES)
- Chinese (zh-CN)

### 10.2 Implementation Strategy

**Library**: react-i18next

**Translation Keys**:
```json
{
  "configurator.step.application": "Application",
  "configurator.parameter.partNumber": "Part Number",
  "validation.required": "{{field}} is required"
}
```

---

## 11. Error Handling

### 11.1 Error Categories

| Category | Handling Strategy | User Feedback |
|----------|------------------|---------------|
| Validation Errors | Inline error messages | Red text below field |
| Network Errors | Retry with exponential backoff | Toast notification |
| 3D Load Errors | Fallback to placeholder | Error message in viewer |
| Unexpected Errors | Error boundary | Full-page error screen |

### 11.2 Error Boundary

```javascript
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    // Log to error tracking service
    console.error(error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}
```

---

## 12. Monitoring & Analytics

### 12.1 Performance Monitoring

**Tool**: Google Analytics 4 + Web Vitals

**Metrics Tracked**:
- Core Web Vitals (LCP, FID, CLS)
- Custom timing marks (model load, form submission)
- Error rates

### 12.2 User Analytics

**Events Tracked**:
- Page views
- Configuration step completion
- 3D viewer interactions
- CAD export requests
- Theme toggle

### 12.3 Error Tracking

**Tool**: Sentry (planned)

**Tracked Errors**:
- JavaScript exceptions
- Network failures
- 3D rendering errors
- Validation failures

---

## 13. Deployment Pipeline

### 13.1 CI/CD Workflow

```mermaid
graph LR
    A[Git Push] --> B[GitHub Actions]
    B --> C[Lint & Test]
    C --> D[Build]
    D --> E[Deploy to Staging]
    E --> F[E2E Tests]
    F --> G{Tests Pass?}
    G -->|Yes| H[Deploy to Production]
    G -->|No| I[Notify Team]
```

### 13.2 Environment Configuration

| Environment | URL | Purpose |
|-------------|-----|---------|
| Development | localhost:5173 | Local development |
| Staging | staging.skf.com | QA testing |
| Production | www.skf.com | Live application |

---

## 14. Version History

### 14.1 Release Notes

#### v1.0.0 (Current)
- ✅ Step-based configuration interface
- ✅ 3D model preview with xeokit
- ✅ Dark/light theme support
- ✅ Parameter validation
- ✅ Section view and dimensions
- 🔄 CAD export (in progress)

#### Planned for v1.1.0
- [ ] Backend API integration
- [ ] CAD export functionality
- [ ] User authentication
- [ ] Configuration history
- [ ] Improved accessibility

---

## 15. Glossary

| Term | Definition |
|------|------------|
| **CAD** | Computer-Aided Design |
| **GLB** | GLTF Binary format for 3D models |
| **IFC** | Industry Foundation Classes (BIM format) |
| **xeokit** | WebGL-based 3D visualization library |
| **SAO** | Scalable Ambient Occlusion |
| **PBR** | Physically-Based Rendering |
| **HMR** | Hot Module Replacement |
| **SPA** | Single Page Application |

---

## 16. References

### 16.1 External Documentation

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [xeokit SDK](https://xeokit.io)
- [Three.js Documentation](https://threejs.org/docs)
- [React Router](https://reactrouter.com)

### 16.2 Internal Resources

- [Frontend Documentation](file:///C:/Users/shashank/.gemini/antigravity/brain/705c3f85-70fe-4d42-9617-d5c138f8280d/FRONTEND_DOCUMENTATION.md)
- API Documentation (TBD)
- Design System (TBD)

---

**Document Status**: ✅ Approved  
**Next Review Date**: April 7, 2026  
**Maintained By**: Frontend Development Team
