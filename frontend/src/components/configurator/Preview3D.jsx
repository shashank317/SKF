import { useEffect, useRef, useState } from "react";
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

const Preview3D = () => {
    const canvasRef = useRef(null);
    const viewerRef = useRef(null);
    const [sectionEnabled, setSectionEnabled] = useState(false);
    const [measurementMode, setMeasurementMode] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const sectionPlanesPluginRef = useRef(null);
    const measurementsPluginRef = useRef(null);
    const measurementControlRef = useRef(null);

    useEffect(() => {
        if (viewerRef.current) return;

        console.log("🎬 Initializing xeokit viewer...");

        const viewer = new Viewer({
            canvasElement: canvasRef.current,
            transparent: true,
            backgroundColor: [245, 247, 250]
        });

        viewerRef.current = viewer;
        console.log("✅ Viewer created");

        // Camera setup
        viewer.camera.eye = [3, 3, 3];
        viewer.camera.look = [0, 0, 0];
        viewer.camera.up = [0, 1, 0];

        // Enable camera controls (orbit, pan, zoom)
        viewer.cameraControl.panEnabled = true;
        viewer.cameraControl.rotateEnabled = true;
        viewer.cameraControl.zoomEnabled = true;

        // GLTF Loader - using GLB because XKT file was empty
        const gltfLoader = new GLTFLoaderPlugin(viewer);

        console.log("📦 Loading GLB model from:", "/src/assets/SSELBWN14-110.glb");

        let modelRef = null;

        const model = gltfLoader.load({
            id: "bearing",
            src: "/src/assets/SSELBWN14-110.glb",
            edges: true,              // Emphasize edges for professional CAD look
            saoEnabled: true,         // Scalable Ambient Obscurance for depth
            edgeThreshold: 15,        // Optimized for cylindrical geometry
            pbrEnabled: true,         // Physically-based rendering
            backfaces: true           // Show all surfaces
        });

        modelRef = model;

        // Listen for load events
        model.on("loaded", () => {
            if (!viewerRef.current) return; // Viewer was destroyed

            console.log("✅ Model loaded successfully!");
            console.log("Model bounds:", viewer.scene.getAABB());
            console.log("Num objects:", Object.keys(viewer.scene.objects).length);

            setIsLoading(false);

            // Fit camera to model
            viewer.cameraFlight.flyTo(model);
        });

        model.on("error", (error) => {
            console.error("❌ Error loading model:", error);
        });

        // Initialize measurements plugin
        const measurementsPlugin = new DistanceMeasurementsPlugin(viewer);
        measurementsPluginRef.current = measurementsPlugin;

        // Initialize pointer lens for precise measurement positioning
        const pointerLens = new PointerLens(viewer);

        // Initialize measurement control for interactive measurements
        const measurementControl = new DistanceMeasurementsMouseControl(measurementsPlugin, {
            pointerLens: pointerLens
        });

        // Enable snapping to vertices and edges
        measurementControl.snapToVertex = true;
        measurementControl.snapToEdge = true;

        measurementControlRef.current = measurementControl;

        // Initialize SectionPlanesPlugin (proper API from docs)
        const sectionPlanesPlugin = new SectionPlanesPlugin(viewer, {
            overviewVisible: false
        });
        sectionPlanesPluginRef.current = sectionPlanesPlugin;

        // Create section plane (initially inactive)
        sectionPlanesPlugin.createSectionPlane({
            id: "mySectionPlane",
            pos: [0, 0, 0],
            dir: [1, 0, 0],
            active: false
        });

        // Initialize NavCube for orientation control
        new NavCubePlugin(viewer, {
            canvasId: "navCubeCanvas",
            visible: true,
            cameraFly: true,           // Smooth camera transitions
            cameraFitFOV: 45,          // Good viewing angle for bearings
            cameraFlyDuration: 0.5,    // Quick but smooth (0.5 seconds)
            fitVisible: false,         // Fit entire scene
            shadowVisible: true        // Show cube shadow
        });

        // Initialize AxisGizmo for XYZ axis display
        new AxisGizmoPlugin(viewer, {
            canvasId: "axisGizmoCanvas"
        });

        // Initialize FastNav for smoother interaction with large models
        new FastNavPlugin(viewer, {
            hideEdges: true,                    // Hide edges while moving
            hideSAO: true,                      // Hide ambient shadows while moving
            hidePBR: false,                     // Keep PBR (bearing needs good materials)
            hideColorTexture: false,            // Keep textures
            hideTransparentObjects: false,      // Keep transparency
            scaleCanvasResolution: true,        // Scale resolution for performance
            scaleCanvasResolutionFactor: 0.7,   // 70% resolution while moving (good balance)
            defaultScaleCanvasResolutionFactor: 1.0, // Full resolution when stopped
            delayBeforeRestore: true,           // Delay before restoring quality
            delayBeforeRestoreSeconds: 0.5      // 0.5s delay
        });

        // Cleanup - proper memory management
        return () => {
            console.log("🧹 Cleaning up viewer");

            // Destroy model first to cancel any pending operations
            if (modelRef) {
                try {
                    modelRef.destroy();
                } catch (e) {
                    // Model may already be destroyed
                }
            }

            // Then destroy viewer
            if (viewer) {
                viewer.destroy();
            }

            viewerRef.current = null;
        };
    }, []);

    // Toggle section cut
    const toggleSection = () => {
        if (sectionPlanesPluginRef.current) {
            const sectionPlane = sectionPlanesPluginRef.current.sectionPlanes["mySectionPlane"];
            if (sectionPlane) {
                const newState = !sectionEnabled;
                sectionPlane.active = newState;
                setSectionEnabled(newState);

                // Show interactive 3D gizmo when section is enabled
                if (newState) {
                    sectionPlanesPluginRef.current.showControl("mySectionPlane");
                } else {
                    sectionPlanesPluginRef.current.hideControl();
                }
            }
        }
    };

    // Toggle interactive measurement mode
    const toggleMeasurementMode = () => {
        if (measurementControlRef.current) {
            const newState = !measurementMode;
            setMeasurementMode(newState);

            if (newState) {
                // Activate: click on model to create measurements
                measurementControlRef.current.activate();
                console.log("📏 Measurement mode activated - click two points on the model");
            } else {
                // Deactivate
                measurementControlRef.current.deactivate();
                console.log("📏 Measurement mode deactivated");
            }
        }
    };

    return (
        <div style={{ width: "100%", height: "100%", position: "relative" }}>
            <canvas
                ref={canvasRef}
                style={{ width: "100%", height: "100%" }}
            />

            {/* NavCube canvas - positioned in bottom-right corner */}
            <canvas
                id="navCubeCanvas"
                style={{
                    position: "absolute",
                    bottom: "20px",
                    right: "20px",
                    width: "200px",
                    height: "200px",
                    zIndex: 100
                }}
            />

            {/* AxisGizmo canvas - positioned in bottom-left corner */}
            <canvas
                id="axisGizmoCanvas"
                style={{
                    position: "absolute",
                    bottom: "20px",
                    left: "20px",
                    width: "120px",
                    height: "120px",
                    zIndex: 100
                }}
            />

            {/* Loading indicator */}
            {isLoading && (
                <div style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    padding: "20px 40px",
                    borderRadius: "8px",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                    fontSize: "16px",
                    fontWeight: "500",
                    color: "#333"
                }}>
                    Loading 3D Model...
                </div>
            )}

            {/* Floating toolbar for controls */}
            <div style={{
                position: "absolute",
                top: "20px",
                right: "20px",
                display: "flex",
                gap: "10px",
                flexDirection: "column"
            }}>
                <button
                    onClick={toggleSection}
                    style={{
                        padding: "10px 16px",
                        backgroundColor: sectionEnabled ? "#3b82f6" : "#fff",
                        color: sectionEnabled ? "#fff" : "#333",
                        border: "1px solid #ddd",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: "500"
                    }}
                >
                    {sectionEnabled ? "Hide Section" : "Section View"}
                </button>

                <button
                    onClick={toggleMeasurementMode}
                    style={{
                        padding: "10px 16px",
                        backgroundColor: measurementMode ? "#10b981" : "#fff",
                        color: measurementMode ? "#fff" : "#333",
                        border: "1px solid #ddd",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: "500"
                    }}
                >
                    {measurementMode ? "Stop Measuring" : "Measure"}
                </button>
            </div>
        </div>
    );
};

export default Preview3D;
