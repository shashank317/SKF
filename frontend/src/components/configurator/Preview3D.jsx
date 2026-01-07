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
    PointerLens,
    NavCubePlugin,
    AxisGizmoPlugin,
    FastNavPlugin
} from "@xeokit/xeokit-sdk";
import "./Preview3D.css";

const modelPath = "/SSELBWN14-110.glb";

const Preview3D = ({ showModel }) => {
    const canvasRef = useRef(null);
    const viewerRef = useRef(null);
    const [sectionEnabled, setSectionEnabled] = useState(false);
    const [measurementMode, setMeasurementMode] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [activeInstruction, setActiveInstruction] = useState(null);
    const sectionPlanesPluginRef = useRef(null);
    const measurementsPluginRef = useRef(null);
    const measurementControlRef = useRef(null);

    useEffect(() => {
        if (!showModel) {
            if (viewerRef.current) {
                viewerRef.current.destroy();
                viewerRef.current = null;
            }
            return;
        }

        if (viewerRef.current) return;

        let modelRef = null;
        let timeoutId = null;

        const initializeViewer = () => {
            console.log("🎬 Initializing xeokit viewer...");

            if (viewerRef.current) return;

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

            const gltfLoader = new GLTFLoaderPlugin(viewer);

            const model = gltfLoader.load({
                id: "bearing",
                src: modelPath,
                edges: true,
                saoEnabled: false,
                pbrEnabled: false,
                backfaces: true
            });

            modelRef = model;

            model.on("loaded", () => {
                if (!viewerRef.current) return;
                console.log("✅ Model loaded successfully!");
                setIsLoading(false);
                viewer.cameraFlight.flyTo(model);
            });

            model.on("error", (error) => {
                console.error("❌ Error loading model:", error);
                setIsLoading(false);
                setActiveInstruction({
                    icon: <Info className="w-5 h-5 text-red-500" />,
                    text: "Load Error",
                    subtext: "Could not load 3D model"
                });
            });

            // Failsafe timeout
            timeoutId = setTimeout(() => {
                if (isLoading) {
                    console.warn("⚠️ Model load timed out");
                    setIsLoading(false);
                    setActiveInstruction({
                        icon: <Info className="w-5 h-5 text-orange-500" />,
                        text: "Load Warning",
                        subtext: "Model taking time to appear"
                    });
                }
            }, 8000);

            // Plugins
            const measurementsPlugin = new DistanceMeasurementsPlugin(viewer);
            measurementsPluginRef.current = measurementsPlugin;

            const pointerLens = new PointerLens(viewer);
            const measurementControl = new DistanceMeasurementsMouseControl(measurementsPlugin, {
                pointerLens: pointerLens
            });
            measurementControl.snapToVertex = true;
            measurementControl.snapToEdge = true;
            measurementControlRef.current = measurementControl;

            const sectionPlanesPlugin = new SectionPlanesPlugin(viewer, { overviewVisible: false });
            sectionPlanesPluginRef.current = sectionPlanesPlugin;
            sectionPlanesPlugin.createSectionPlane({
                id: "mySectionPlane",
                pos: [0, 0, 0],
                dir: [1, 0, 0],
                active: false
            });

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
        };

        // Check access then init
        setIsLoading(true);
        console.log(`🔍 Checking access to: ${modelPath}`);
        fetch(modelPath)
            .then(res => {
                if (!res.ok) throw new Error(res.statusText);
                console.log("✅ File accessible, starting viewer...");
                // initializeViewer(); // Intentionally called here
                return res.blob();
            })
            .then(() => {
                initializeViewer();
            })
            .catch(err => {
                console.error("❌ File access check failed:", err);
                setIsLoading(false);
                setActiveInstruction({
                    icon: <Info className="w-5 h-5 text-red-500" />,
                    text: "File Not Found",
                    subtext: "System could not locate model"
                });
            });

        return () => {
            if (timeoutId) clearTimeout(timeoutId);
            console.log("🧹 Cleaning up viewer");

            if (modelRef) {
                try { modelRef.destroy(); } catch (e) { }
            }
            if (viewerRef.current) {
                viewerRef.current.destroy();
                viewerRef.current = null;
            }
        };
    }, [showModel]);

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
        viewerRef.current.cameraFlight.flyTo({
            eye: [3, 3, 3], look: [0, 0, 0], up: [0, 1, 0], duration: 1
        });
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
                        onClick={() => {
                            const link = document.createElement('a');
                            link.href = modelPath;
                            link.download = 'SSELBWN14-110.glb';
                            link.click();
                        }}
                    >
                        <Download className="w-4 h-4" />
                        <span>Download CAD</span>
                    </button>
                    <div className="status-pill">
                        <div className={`status-dot ${isLoading ? 'loading' : 'ready'}`} />
                        <span className="status-text">
                            {isLoading ? 'Loading Engine' : 'System Ready'}
                        </span>
                    </div>
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
