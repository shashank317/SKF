import { useEffect, useRef, useState } from "react";
import {
    Ruler,
    ScanLine,
    Loader2,
    Box,
    Info,
    Maximize2,
    Settings2,
    Download
} from "lucide-react";
import {
    Viewer,
    GLTFLoaderPlugin,
    SectionPlanesPlugin,
    DistanceMeasurementsPlugin,
    DistanceMeasurementsMouseControl,

    NavCubePlugin,
    AxisGizmoPlugin,
    FastNavPlugin
} from "@xeokit/xeokit-sdk";
import "./Preview3D.css";
import { createExport } from "../../services/api";

const Preview3D = ({ showModel, configId, modelUrl, modelScale = [1, 1, 1] }) => {
    const canvasRef = useRef(null);
    const viewerRef = useRef(null);
    const [sectionEnabled, setSectionEnabled] = useState(false);
    const [measurementMode, setMeasurementMode] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [activeInstruction, setActiveInstruction] = useState(null);
    const sectionPlanesPluginRef = useRef(null);
    const measurementsPluginRef = useRef(null);
    const measurementControlRef = useRef(null);

    // Download handler
    const handleDownload = async () => {
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
                // Force download by fetching as blob
                const downloadUrl = `http://localhost:8000${response.file_path}`;
                console.log("🚀 STARTING DOWNLOAD FLOW for:", downloadUrl);

                try {
                    const blobResponse = await fetch(downloadUrl);
                    if (!blobResponse.ok) throw new Error("Fetch failed");

                    const blob = await blobResponse.blob();
                    const url = window.URL.createObjectURL(blob);

                    console.log("✅ Blob created, clicking link...");
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', response.file_path.split('/').pop());
                    document.body.appendChild(link);
                    link.click();

                    // Cleanup
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(url);
                } catch (err) {
                    console.error("❌ Blob download failed, trying direct open...", err);
                    window.open(downloadUrl, '_blank');
                }
            } else {
                alert("Export started... check back later.");
            }

        } catch (error) {
            console.error("Export failed:", error);
            alert("Failed to generate download: " + error.message);
        }
    };

    // Serialize modelScale to prevent unnecessary reloads when parent re-renders (e.g. on resize)
    const modelScaleStr = JSON.stringify(modelScale || [1, 1, 1]);

    useEffect(() => {
        if (!showModel || !modelUrl) {
            if (viewerRef.current) {
                console.log("🧹 Cleanup: Destroying existing viewer (no model)");
                try { viewerRef.current.destroy(); } catch (e) { console.warn("Error destroying viewer", e); }
                viewerRef.current = null;
            }
            return;
        }

        let isMounted = true;
        let modelRef = null;
        let timeoutId = null;

        // Parse scale back from string to ensure value stability
        const currentScale = JSON.parse(modelScaleStr);

        // Cleanup function
        const cleanup = () => {
            console.log("🧹 Running cleanup sequence...");
            if (timeoutId) clearTimeout(timeoutId);

            // Explicitly destroy model first if exists
            if (modelRef) {
                try { modelRef.destroy(); } catch (e) { console.warn("Error destroying model", e); }
                modelRef = null;
            }

            // Destroy viewer plugins manually to be safe
            if (measurementsPluginRef.current) {
                try { measurementsPluginRef.current.destroy(); } catch (e) { }
                measurementsPluginRef.current = null;
            }
            if (sectionPlanesPluginRef.current) {
                try { sectionPlanesPluginRef.current.destroy(); } catch (e) { }
                sectionPlanesPluginRef.current = null;
            }

            // Destroy viewer
            if (viewerRef.current) {
                try { viewerRef.current.destroy(); } catch (e) { console.warn("Error destroying viewer", e); }
                viewerRef.current = null;
            }
        };

        // Ensure clean slate
        cleanup();

        const initializeViewer = () => {
            if (!isMounted) return;
            console.log("🎬 Initializing xeokit viewer with scale:", currentScale);

            try {
                const viewer = new Viewer({
                    canvasElement: canvasRef.current,
                    transparent: true,
                    backgroundColor: [248, 250, 252],
                    units: "millimeters"
                });

                viewerRef.current = viewer;

                // Camera setup
                viewer.camera.eye = [3, 3, 3];
                viewer.camera.look = [0, 0, 0];
                viewer.camera.up = [0, 1, 0];

                viewer.cameraControl.panEnabled = true;
                viewer.cameraControl.rotateEnabled = true;
                viewer.cameraControl.zoomEnabled = true;

                // Set up Plugins immediately
                const measurementsPlugin = new DistanceMeasurementsPlugin(viewer);
                measurementsPluginRef.current = measurementsPlugin;

                const measurementControl = new DistanceMeasurementsMouseControl(measurementsPlugin, {});
                measurementControl.snapToVertex = true;
                measurementControl.snapToEdge = true;
                measurementControlRef.current = measurementControl;

                const sectionPlanesPlugin = new SectionPlanesPlugin(viewer, { overviewVisible: false });
                sectionPlanesPluginRef.current = sectionPlanesPlugin;
                const sectionPlane = sectionPlanesPlugin.createSectionPlane({
                    id: "mySectionPlane",
                    pos: [0, 0, 0],
                    dir: [1, 0, 0],
                    active: false
                });

                // Explicitly disable just in case
                sectionPlane.active = false;

                new NavCubePlugin(viewer, {
                    canvasId: "navCubeCanvas",
                    visible: true,
                    cameraFly: true,
                    cameraFitFOV: 45,
                    cameraFlyDuration: 0.5,
                    fitVisible: false,
                    shadowVisible: true
                });

                new AxisGizmoPlugin(viewer, { canvasId: "axisGizmoCanvas" });

                new FastNavPlugin(viewer, {
                    hideEdges: true,
                    hideSAO: true,
                    hidePBR: false,
                    hideColorTexture: false,
                    hideTransparentObjects: false,
                    scaleCanvasResolution: true,
                    scaleCanvasResolutionFactor: 0.7,
                    delayBeforeRestore: true,
                    delayBeforeRestoreSeconds: 0.5
                });

                // Load Model
                const gltfLoader = new GLTFLoaderPlugin(viewer);

                console.log(`📥 Loading model: ${modelUrl}`);
                const model = gltfLoader.load({
                    id: "bearing",
                    src: modelUrl,
                    edges: true,
                    scale: currentScale,
                    saoEnabled: false,
                    pbrEnabled: false,
                    backfaces: true
                });

                modelRef = model;

                model.on("loaded", () => {
                    if (!isMounted || !viewerRef.current) return;
                    console.log("✅ Model loaded successfully!");
                    console.log("📏 Model AABB:", model.aabb);
                    console.log("📐 Model center:", model.center);
                    console.log("🔢 Num objects:", Object.keys(model.objects || {}).length);

                    // Check if model is far from origin and recenter camera appropriately
                    const aabb = model.aabb;
                    const centerX = (aabb[0] + aabb[3]) / 2;
                    const centerY = (aabb[1] + aabb[4]) / 2;
                    const centerZ = (aabb[2] + aabb[5]) / 2;

                    console.log("📍 Calculated center:", [centerX, centerY, centerZ]);

                    // Calculate model dimensions
                    const sizeX = aabb[3] - aabb[0];
                    const sizeY = aabb[4] - aabb[1];
                    const sizeZ = aabb[5] - aabb[2];
                    const maxSize = Math.max(sizeX, sizeY, sizeZ);
                    const distance = maxSize * 1.5;

                    console.log("📐 Model size:", [sizeX, sizeY, sizeZ], "Distance:", distance);

                    // Ensure all model objects are visible
                    Object.values(model.objects || {}).forEach(obj => {
                        if (obj) {
                            obj.visible = true;
                            obj.xrayed = false;
                            obj.highlighted = false;
                        }
                    });

                    if (timeoutId) clearTimeout(timeoutId);
                    setIsLoading(false);

                    // Position camera looking down at the model from an isometric angle
                    viewer.camera.eye = [
                        centerX + distance * 0.7,
                        centerY + distance * 0.7,
                        centerZ + distance * 0.7
                    ];
                    viewer.camera.look = [centerX, centerY, centerZ];
                    viewer.camera.up = [0, 1, 0];

                    console.log("📷 Camera eye:", viewer.camera.eye);
                    console.log("📷 Camera look:", viewer.camera.look);

                    // Fly to the model
                    viewer.cameraFlight.flyTo({
                        aabb: model.aabb,
                        fit: true,
                        fitFOV: 60,
                        duration: 0.5
                    });
                });

                model.on("error", (error) => {
                    if (!isMounted) return;
                    console.error("❌ Error loading model:", error);
                    if (timeoutId) clearTimeout(timeoutId);
                    setIsLoading(false);
                    setActiveInstruction({
                        icon: <Info className="w-5 h-5 text-red-500" />,
                        text: "Load Error",
                        subtext: "Could not load 3D model"
                    });
                });

            } catch (err) {
                console.error("❌ Critical Viewer Error:", err);
                setIsLoading(false);
            }
        };

        // Check access then init
        setIsLoading(true);
        console.log(`🔍 Checking access to: ${modelUrl}`);

        fetch(modelUrl)
            .then(res => {
                if (!isMounted) return;
                if (!res.ok) throw new Error(res.statusText + " (" + res.status + ")");
                console.log("✅ File accessible, starting viewer...");
                initializeViewer();
            })
            .catch(err => {
                if (!isMounted) return;
                console.error("❌ File access check failed:", err);
                setIsLoading(false);
                setActiveInstruction({
                    icon: <Info className="w-5 h-5 text-red-500" />,
                    text: "File Not Found",
                    subtext: "System could not locate model"
                });
            });

        // Failsafe timeout
        timeoutId = setTimeout(() => {
            if (isMounted && isLoading) {
                console.warn("⚠️ Model load timed out");
                setIsLoading(false);
                setActiveInstruction({
                    icon: <Info className="w-5 h-5 text-orange-500" />,
                    text: "Load Warning",
                    subtext: "Model taking longer than expected"
                });
            }
        }, 15000);

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

            <div className="floating-dock">
                <div className="dock-container">
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
