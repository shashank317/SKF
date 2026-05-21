import { useEffect, useRef, useState } from "react";
import {
    Ruler,
    ScanLine,
    Loader2,
    Box,
    Info,
    Maximize2,
    Settings2,
    Download,
    GripVertical
} from "lucide-react";
import {
    Viewer,
    GLTFLoaderPlugin,
    STLLoaderPlugin,
    SectionPlanesPlugin,
    DistanceMeasurementsPlugin,
    DistanceMeasurementsMouseControl,

    NavCubePlugin,
    AxisGizmoPlugin,
    FastNavPlugin
} from "@xeokit/xeokit-sdk";
import "./Preview3D.css";
import { createExport, downloadLatestCadFiles } from "../../../services/api";

const Preview3D = ({ showModel, configId, modelUrl, modelFormat = 'gltf', modelScale = [1, 1, 1], onModelInfo, schemaId }) => {
    const canvasRef = useRef(null);
    const viewerRef = useRef(null);
    const [sectionEnabled, setSectionEnabled] = useState(false);
    const [measurementMode, setMeasurementMode] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [activeInstruction, setActiveInstruction] = useState(null);
    const sectionPlanesPluginRef = useRef(null);
    const measurementsPluginRef = useRef(null);
    const measurementControlRef = useRef(null);

    // Inspector State
    const [hoveredEntity, setHoveredEntity] = useState(null);
    const [selectedEntity, setSelectedEntity] = useState(null);

    // Dock drag state
    const [dockPosition, setDockPosition] = useState({ x: null, y: null });
    const [isDragging, setIsDragging] = useState(false);
    const dragOffset = useRef({ x: 0, y: 0 });

    // Download handler
    const handleDownload = async () => {
        // For T-Bolt and Roller Support, download all latest generated files as ZIP
        if (schemaId === 'T_BOLT' || schemaId === 'RS') {
            try {
                console.log("Downloading latest CAD files for schema:", schemaId);
                const result = await downloadLatestCadFiles();
                console.log("Download completed:", result);
            } catch (error) {
                console.error("Download failed:", error);
                alert("Failed to download CAD files: " + error.message);
            }
            return;
        }
        
        // For other schemas, use the existing export flow
        if (!configId) {
            alert("Please apply the configuration first to generate the CAD file.");
            return;
        }

        try {
            console.log("Initiating export for Config ID:", configId);
            const response = await createExport({
                configuration_id: configId,
                format: "STEP"
            });

            console.log("Export response:", response);

            if (response.status === "completed" && response.file_path) {
                const downloadUrl = `http://localhost:8000${response.file_path}`;
                window.open(downloadUrl, '_blank');
            } else {
                alert("Export started... check back later.");
            }

        } catch (error) {
            console.error("Export failed:", error);
            alert("Failed to generate download: " + error.message);
        }
    };

    // Serialize modelScale to prevent unnecessary reloads
    const modelScaleStr = JSON.stringify(modelScale || [1, 1, 1]);

    useEffect(() => {
        if (!showModel || !modelUrl) {
            if (viewerRef.current) {
                viewerRef.current.destroy();
                viewerRef.current = null;
            }
            return;
        }

        let isMounted = true;
        let modelRef = null;

        const cleanup = () => {
            try {
                if (modelRef) { modelRef.destroy(); modelRef = null; }
                if (viewerRef.current) { viewerRef.current.destroy(); viewerRef.current = null; }
            } catch (e) {
                console.warn("Cleanup warning:", e.message);
            }
        };
        cleanup();

        const initializeViewer = () => {
            if (!isMounted) return;

            try {
                const viewer = new Viewer({
                    canvasElement: canvasRef.current,
                    transparent: true,
                    backgroundColor: [248, 250, 252],
                    units: "millimeters"
                });

                viewerRef.current = viewer;

                // Configure highlight material (yellow semi-transparent)
                viewer.scene.highlightMaterial.fill = true;
                viewer.scene.highlightMaterial.fillAlpha = 0.3;
                viewer.scene.highlightMaterial.fillColor = [1.0, 0.9, 0.0]; // Yellow
                viewer.scene.highlightMaterial.edges = true;
                viewer.scene.highlightMaterial.edgeAlpha = 1.0;
                viewer.scene.highlightMaterial.edgeColor = [1.0, 0.8, 0.0]; // Slightly darker yellow edges
                viewer.scene.highlightMaterial.edgeWidth = 2;

                // Configure selected material (stronger yellow)
                viewer.scene.selectedMaterial.fill = true;
                viewer.scene.selectedMaterial.fillAlpha = 0.5;
                viewer.scene.selectedMaterial.fillColor = [1.0, 0.85, 0.0]; // Deep yellow
                viewer.scene.selectedMaterial.edges = true;
                viewer.scene.selectedMaterial.edgeAlpha = 1.0;
                viewer.scene.selectedMaterial.edgeColor = [1.0, 0.6, 0.0]; // Orange edges
                viewer.scene.selectedMaterial.edgeWidth = 3;

                // Basic camera setup
                viewer.camera.eye = [3, 3, 3];
                viewer.camera.look = [0, 0, 0];
                viewer.camera.up = [0, 1, 0];
                viewer.camera.near = 0.1;
                viewer.camera.far = 100000;

                viewer.cameraControl.panEnabled = true;
                viewer.cameraControl.rotateEnabled = true;
                viewer.cameraControl.zoomEnabled = true;

                // Plugins - MUST store in refs for toggle functions to work
                const measurementsPlugin = new DistanceMeasurementsPlugin(viewer);
                measurementsPluginRef.current = measurementsPlugin;

                const measurementControl = new DistanceMeasurementsMouseControl(measurementsPlugin, {});
                measurementControl.snapToVertex = true;
                measurementControl.snapToEdge = true;
                measurementControlRef.current = measurementControl;

                const sectionPlanesPlugin = new SectionPlanesPlugin(viewer, { overviewVisible: false });
                sectionPlanesPluginRef.current = sectionPlanesPlugin;

                new NavCubePlugin(viewer, { canvasId: "navCubeCanvas", visible: true });
                new AxisGizmoPlugin(viewer, { canvasId: "axisGizmoCanvas" });

                // Track currently selected entity
                let currentlySelectedId = null;

                // Click handler - fires when an entity is picked
                viewer.cameraControl.on("picked", (pickResult) => {
                    const entity = pickResult.entity;

                    // Debug logging
                    console.log("=== PICK DEBUG ===");
                    console.log("entity.id:", entity.id);
                    console.log("currentlySelectedId:", currentlySelectedId);

                    // Toggle selection
                    if (currentlySelectedId === entity.id) {
                        // Clicking same entity - deselect
                        entity.highlighted = false;
                        entity.selected = false;
                        currentlySelectedId = null;
                        setSelectedEntity(null);
                        console.log(`❌ Deselected: ${entity.id}`);
                    } else {
                        // New selection - clear previous and select new
                        if (currentlySelectedId) {
                            const prevEntity = viewer.scene.objects[currentlySelectedId];
                            if (prevEntity) {
                                prevEntity.highlighted = false;
                                prevEntity.selected = false;
                            }
                        }
                        
                        entity.highlighted = true;
                        entity.selected = true;
                        currentlySelectedId = entity.id;
                        setSelectedEntity(entity.id);
                        console.log(`✅ Selected: ${entity.id}`);
                    }
                });

                // Click on empty space - clear selection
                viewer.cameraControl.on("pickedNothing", () => {
                    if (currentlySelectedId) {
                        const prevEntity = viewer.scene.objects[currentlySelectedId];
                        if (prevEntity) {
                            prevEntity.highlighted = false;
                            prevEntity.selected = false;
                        }
                        currentlySelectedId = null;
                        setSelectedEntity(null);
                        console.log("🔲 Cleared selection (clicked empty space)");
                    }
                });

                // Load Model
                const currentScale = JSON.parse(modelScaleStr);
                const baseUri = modelUrl.substring(0, modelUrl.lastIndexOf("/") + 1) || "/";
                console.log(`📥 Loading model: ${modelUrl} (Format: ${modelFormat}, baseUri: ${baseUri})`);

                let model;
                const loadModel = (m) => {
                    model = m;
                    modelRef = m;
                    m.on("loaded", () => {
                        if (!isMounted) return;
                        console.log("✅ Model loaded successfully!");

                        const aabb = m.aabb;
                        const sizeX = aabb[3] - aabb[0];
                        const sizeY = aabb[4] - aabb[1];
                        const sizeZ = aabb[5] - aabb[2];
                        const maxSize = Math.max(sizeX, sizeY, sizeZ);
                        const distance = maxSize * 1.5;
                        const centerX = (aabb[0] + aabb[3]) / 2;
                        const centerY = (aabb[1] + aabb[4]) / 2;
                        const centerZ = (aabb[2] + aabb[5]) / 2;

                        // Report model dimensions back to parent
                        if (onModelInfo) {
                            console.log(`📐 Model AABB: X=${sizeX.toFixed(2)}, Y=${sizeY.toFixed(2)}, Z=${sizeZ.toFixed(2)}`);
                            onModelInfo({ sizeX, sizeY, sizeZ, aabb });
                        }

                        viewer.camera.eye = [centerX + distance, centerY + distance, centerZ + distance];
                        viewer.camera.look = [centerX, centerY, centerZ];

                        viewer.cameraFlight.flyTo({ aabb: m.aabb, fit: true, fitFOV: 60, duration: 0.5 });

                        // Create section plane at model center (inactive by default)
                        if (sectionPlanesPluginRef.current && !sectionPlanesPluginRef.current.sectionPlanes["mySectionPlane"]) {
                            sectionPlanesPluginRef.current.createSectionPlane({
                                id: "mySectionPlane",
                                pos: [centerX, centerY, centerZ],
                                dir: [1, 0, 0],
                                active: false
                            });
                            console.log("✂️ Section plane created at:", [centerX, centerY, centerZ]);
                        }

                        setIsLoading(false);
                    });

                    m.on("error", (err) => {
                        if (!isMounted) return;
                        console.error("❌ Model loading error:", err);
                        setIsLoading(false);
                    });
                };

                // Load model based on format
                const isBlobUrl = modelUrl.startsWith("blob:");

                if (modelFormat === 'stl') {
                    const stlLoader = new STLLoaderPlugin(viewer);
                    if (isBlobUrl) {
                        // Blob URLs break xeokit's XHR (it appends cache-buster params).
                        // Fetch the blob, convert to ArrayBuffer, and pass as raw data.
                        fetch(modelUrl)
                            .then(r => r.arrayBuffer())
                            .then(buf => {
                                if (!isMounted) return;
                                loadModel(stlLoader.load({
                                    id: "bearing",
                                    stl: buf,
                                    edges: true,
                                    smoothNormals: true
                                }));
                            })
                            .catch(err => {
                                console.error("Failed to fetch STL blob:", err);
                                setIsLoading(false);
                            });
                    } else {
                        loadModel(stlLoader.load({
                            id: "bearing",
                            src: modelUrl,
                            edges: true,
                            smoothNormals: true
                        }));
                    }
                } else {
                    const gltfLoader = new GLTFLoaderPlugin(viewer);
                    if (isBlobUrl) {
                        // Blob URLs break xeokit's XHR (it appends cache-buster params).
                        // Fetch the blob, convert to ArrayBuffer, and pass as raw GLB data.
                        fetch(modelUrl)
                            .then(r => r.arrayBuffer())
                            .then(buf => {
                                if (!isMounted) return;
                                loadModel(gltfLoader.load({
                                    id: "bearing",
                                    glb: buf,
                                    edges: true,
                                    scale: currentScale,
                                    saoEnabled: false,
                                    pbrEnabled: false,
                                    backfaces: true,
                                    performance: false,
                                    combineGeometries: false,
                                    quantizeGeometry: false
                                }));
                            })
                            .catch(err => {
                                console.error("Failed to fetch GLB blob:", err);
                                setIsLoading(false);
                            });
                    } else {
                        loadModel(gltfLoader.load({
                            id: "bearing",
                            src: modelUrl,
                            baseUri: baseUri,
                            edges: true,
                            scale: currentScale,
                            saoEnabled: false,
                            pbrEnabled: false,
                            backfaces: true,
                            performance: false,
                            combineGeometries: false,
                            quantizeGeometry: false
                        }));
                    }
                }

            } catch (err) {
                console.error("Viewer error:", err);
                setIsLoading(false);
            }
        };

        setIsLoading(true);
        initializeViewer();

        return () => {
            isMounted = false;
            cleanup();
        };
    }, [showModel, modelUrl, modelScaleStr]); // Add modelScale to deps

    // Prevent default scroll behavior on the canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const handleWheel = (e) => {
            e.preventDefault();
        };

        canvas.addEventListener('wheel', handleWheel, { passive: false });

        return () => {
            canvas.removeEventListener('wheel', handleWheel);
        };
    }, [showModel, isLoading]);

    const toggleSection = () => {
        if (!sectionPlanesPluginRef.current) return;

        const newState = !sectionEnabled;
        setSectionEnabled(newState);

        const plane = sectionPlanesPluginRef.current.sectionPlanes["mySectionPlane"];
        if (plane) {
            plane.active = newState;
        }

        if (newState) {
            sectionPlanesPluginRef.current.showControl("mySectionPlane");
            setActiveInstruction({
                icon: <ScanLine className="w-5 h-5 text-blue-500" />,
                text: "Section View Active",
                subtext: "Drag handles to slice model"
            });
        } else {
            sectionPlanesPluginRef.current.hideControl();
            setActiveInstruction(null);
        }
    };

    const toggleMeasurementMode = () => {
        if (!measurementControlRef.current) return;
        const newState = !measurementMode;
        setMeasurementMode(newState);
        if (newState) {
            measurementControlRef.current.activate();
            setActiveInstruction({
                icon: <Ruler className="w-5 h-5 text-blue-500" />,
                text: "Measurement Mode",
                subtext: "Click two points to measure"
            });
        } else {
            measurementControlRef.current.deactivate();
            measurementsPluginRef.current.clear();
            if (activeInstruction?.text === "Measurement Mode") {
                setActiveInstruction(null);
            }
        }
    };

    const resetView = () => {
        if (!viewerRef.current) return;

        const scene = viewerRef.current.scene;
        const model = scene.models["bearing"];

        if (model) {
            viewerRef.current.cameraFlight.flyTo({
                modelId: model.id,
                fit: true,
                fitFOV: 45,
                duration: 1
            });
        }
    };

    // Dock drag handlers
    const handleDockMouseDown = (e) => {
        e.preventDefault();
        setIsDragging(true);
        const dockElement = e.target.closest('.floating-dock');
        if (dockElement) {
            const rect = dockElement.getBoundingClientRect();
            dragOffset.current = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        }
    };

    const handleDockMouseMove = (e) => {
        if (!isDragging) return;
        const parent = canvasRef.current?.parentElement;
        if (!parent) return;

        const parentRect = parent.getBoundingClientRect();
        const newX = e.clientX - parentRect.left - dragOffset.current.x;
        const newY = e.clientY - parentRect.top - dragOffset.current.y;

        setDockPosition({ x: newX, y: newY });
    };

    const handleDockMouseUp = () => {
        setIsDragging(false);
    };

    // Attach global mouse move/up listeners when dragging
    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleDockMouseMove);
            document.addEventListener('mouseup', handleDockMouseUp);
            document.body.style.cursor = 'grabbing';
            document.body.style.userSelect = 'none';
        } else {
            document.removeEventListener('mousemove', handleDockMouseMove);
            document.removeEventListener('mouseup', handleDockMouseUp);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        }

        return () => {
            document.removeEventListener('mousemove', handleDockMouseMove);
            document.removeEventListener('mouseup', handleDockMouseUp);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };
    }, [isDragging]);

    if (!showModel) {
        return (
            <div className="preview3d-container placeholder-view">
                <div className="preview3d-header">
                    <div className="header-left">
                        <h1 className="header-title">
                            <Box className="header-icon" />
                            Component Inspector
                        </h1>
                    </div>
                </div>
                <div className="placeholder-content">
                    <Box className="placeholder-icon" size={64} strokeWidth={1} />
                    <h2>Ready to Configure</h2>
                    <p>Enter your specifications in the input panel and click "Apply Configuration" to generate the 3D preview.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="preview3d-container">
            <div className="preview3d-header">
                <div className="header-left">
                    <h1 className="header-title">
                        <Box className="header-icon" />
                        Component Inspector
                    </h1>
                    <p className="header-subtitle">
                        SSELBWN14-110 / Engineering View
                    </p>
                    <p className="header-subtitle" style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {isLoading ? 'Scanning model...' : `Objects detected: ${Object.keys(viewerRef.current?.scene?.models["bearing"]?.objects || {}).length}`}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        className="download-cad-btn"
                        onClick={handleDownload}
                    >
                        <Download className="w-4 h-4" />
                        <span>Download CAD</span>
                    </button>
                </div>
            </div>

            <div className="canvas-wrapper">
                <canvas ref={canvasRef} className="main-canvas" />
                <canvas id="navCubeCanvas" className="navcube-canvas" />
                <canvas id="axisGizmoCanvas" className="axisgizmo-canvas" />

                {isLoading && (
                    <div className="loading-overlay">
                        <div className="loading-content">
                            <Loader2 className="loading-spinner" />
                            <div className="loading-text">Initializing 3D Environment...</div>
                        </div>
                    </div>
                )}

                {activeInstruction && (
                    <div className="instruction-toast">
                        <div className="toast-content">
                            {activeInstruction.icon || <Info className="toast-icon" />}
                            <span className="toast-text">{activeInstruction.text || activeInstruction}</span>
                        </div>
                        {activeInstruction.subtext && (
                            <div className="toast-subtext">{activeInstruction.subtext}</div>
                        )}
                    </div>
                )}
            </div>

            <div
                className={`floating-dock ${isDragging ? 'dragging' : ''}`}
                style={dockPosition.x !== null ? {
                    left: `${dockPosition.x}px`,
                    top: `${dockPosition.y}px`,
                    transform: 'none'
                } : {}}
            >
                <div className="dock-container">
                    {/* Drag Handle */}
                    <div
                        className="dock-drag-handle"
                        onMouseDown={handleDockMouseDown}
                        title="Drag to reposition"
                    >
                        <GripVertical className="btn-icon" strokeWidth={1.5} />
                    </div>
                    <div className="dock-divider" />
                    <Tooltip text="Section Cut (X-Axis)">
                        <button onClick={toggleSection} className={`dock-btn ${sectionEnabled ? 'active section-active' : ''}`}>
                            <ScanLine className="btn-icon" strokeWidth={1.5} />
                            {sectionEnabled && <span className="pulse-indicator" />}
                        </button>
                    </Tooltip>
                    <div className="dock-divider" />
                    <Tooltip text="Measurement Tool">
                        <button onClick={toggleMeasurementMode} className={`dock-btn ${measurementMode ? 'active measure-active' : ''}`}>
                            <Ruler className="btn-icon" strokeWidth={1.5} />
                            {measurementMode && <span className="pulse-indicator measure-pulse" />}
                        </button>
                    </Tooltip>
                    <div className="dock-divider" />
                    <Tooltip text="Reset View">
                        <button onClick={resetView} className="dock-btn">
                            <Maximize2 className="btn-icon" strokeWidth={1.5} />
                        </button>
                    </Tooltip>
                    <Tooltip text="Settings">
                        <button className="dock-btn settings-btn">
                            <Settings2 className="btn-icon" strokeWidth={1.5} />
                        </button>
                    </Tooltip>
                </div>
            </div>
        </div>
    );
};

const Tooltip = ({ text, children }) => {
    return (
        <div className="tooltip-wrapper">
            {children}
            <div className="tooltip-container">
                <div className="tooltip-content">{text}</div>
                <div className="tooltip-arrow" />
            </div>
        </div>
    );
};

export default Preview3D;
