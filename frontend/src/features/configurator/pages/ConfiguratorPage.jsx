import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Layers, FileText, Link, PenTool, Info } from "lucide-react";
import Preview3D from "../components/Preview3D";
import InputPanel from "../components/InputPanel";
import logo from "../../../assets/CLOGO.png";
import "./ConfiguratorPage.css";
import { createConfiguration, generateCustomModel, generateTBoltModel } from "../../../services/api";
import { SCHEMAS, getSchemabyId } from "../../../constants/schemas";

function ConfiguratorPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const initialType = searchParams.get("type") || 'LINEAR_GUIDE';

    const [formState, setFormState] = useState({});
    const [activeSchemaId, setActiveSchemaId] = useState(initialType);
    const [leftWidth, setLeftWidth] = useState(30); // Percentage - 30% input, 70% preview
    const [isResizing, setIsResizing] = useState(false);
    const [activeTab, setActiveTab] = useState(null); // null = no tab panel open
    const [isModelVisible, setIsModelVisible] = useState(false);
    const [dynamicModelUrl, setDynamicModelUrl] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const containerRef = useRef(null);
    const [configId, setConfigId] = useState(null);
    const [submitErrors, setSubmitErrors] = useState([]);
    const [inlineErrors, setInlineErrors] = useState({});
    const modelRefDimensionsRef = useRef(null); // AABB from first model load (ref to avoid re-render loop)

    // Get current schema object
    const currentSchema = SCHEMAS[activeSchemaId];

    // Model Paths
    const MODEL_PATHS = {
        LINEAR_GUIDE: "/model.glb",
        HEX_BOLT: "/structural_hex_bolt.glb",
        ALLEN_BOLT: "/M10_Allen_bolt.glb",
        M8_BOLT: "/M8x16.glb",
        HYDRAULIC: "/hydralic.glb",
        LUBRICATION_SYSTEM: "/Lubrication_System.glb",
        T_BOLT: "/TBolt1-Body.glb",
        RS: "/Roller_supporter.glb"
    };

    const activeModelUrl = dynamicModelUrl || MODEL_PATHS[activeSchemaId];

    /**
     * Dynamic 3D Scaling Logic
     * ========================
     * Base Reference Calibration:
     * - LINEAR_GUIDE (SSELBWN14-110.glb): Base Length = 1000mm
     * - BOLTS: Scale at 1000:1 for unit conversion (model in meters, display in mm)
     * 
     * Strategy: Axis Scaling (X-axis stretch for length changes)
     * Note: This will stretch mounting holes into ovals on very long rails.
     */
    const BASE_LENGTHS = {
        LINEAR_GUIDE: 1000,  // Base model represents 1000mm rail
        HEX_BOLT: 1,
        ALLEN_BOLT: 1,
        M8_BOLT: 1,
        HYDRAULIC: 1,  // No scaling for hydraulic
        T_BOLT: 1,
        RS: 1
    };

    const calculateModelScale = () => {
        const baseLength = BASE_LENGTHS[activeSchemaId] || 1000;

        // T-Bolt and Roller Support: scale based on user dimensions
        // Uses the AABB from the first model load as reference
        if (['T_BOLT', 'RS'].includes(activeSchemaId)) {
            if (!modelRefDimensionsRef.current) {
                // First load: use uniform 1000x (meters → mm), AABB will be captured
                return [1000, 1000, 1000];
            }

            // Get user inputs
            const rawL = formState.bearing_width; // Total Length / Bearing Width
            const rawD = formState.roller_diameter; // Thread Size / Roller Diameter

            let inputL = parseFloat(rawL);
            let inputD = parseFloat(rawD);

            // Handle "M10" style strings
            if (isNaN(inputD) && typeof rawD === 'string') {
                inputD = parseFloat(rawD.replace(/[^\d.]/g, ''));
            }

            // If no valid inputs yet, show at natural size
            if ((isNaN(inputL) || inputL <= 0) && (isNaN(inputD) || inputD <= 0)) {
                return [1000, 1000, 1000];
            }

            // Reference dimensions from AABB (in mm, since first load was at 1000x)
            const refX = modelRefDimensionsRef.current.sizeX;
            const refY = modelRefDimensionsRef.current.sizeY;
            const refZ = modelRefDimensionsRef.current.sizeZ;

            // Determine which axis is length (longest) and which is diameter
            const refLength = Math.max(refX, refY, refZ);
            const refDiameter = Math.min(refX, refY, refZ);

            // Calculate scale ratios
            const ratioL = (!isNaN(inputL) && inputL > 0) ? inputL / refLength : 1;
            const ratioD = (!isNaN(inputD) && inputD > 0) ? inputD / refDiameter : 1;

            // Apply ratio to the correct axes
            // Longest axis gets length ratio, shortest axes get diameter ratio
            let scale;
            if (refX === refLength) {
                scale = [1000 * ratioL, 1000 * ratioD, 1000 * ratioD];
            } else if (refY === refLength) {
                scale = [1000 * ratioD, 1000 * ratioL, 1000 * ratioD];
            } else {
                scale = [1000 * ratioD, 1000 * ratioD, 1000 * ratioL];
            }

            console.log(`🔩 ${activeSchemaId} Dynamic Scale:`, { refLength, refDiameter, inputL, inputD, ratioL, ratioD, scale });
            return scale;
        }

        // For standard bolts: Scale based on Diameter (D) and Length (L)
        // Base Model: M8x16 (D=8mm, L=16mm)
        if (['HEX_BOLT', 'ALLEN_BOLT', 'M8_BOLT'].includes(activeSchemaId)) {
            const rawL = formState.L || formState.VAR04;
            const rawD = formState.D || formState.VAR02 || formState.FIX10;

            let inputL = parseFloat(rawL);
            let inputD = parseFloat(rawD);

            if (isNaN(inputD) && typeof rawD === 'string') {
                inputD = parseFloat(rawD.replace(/[^\d.]/g, ''));
            }

            const targetL = (!isNaN(inputL) && inputL > 0) ? inputL : 16;
            const targetD = (!isNaN(inputD) && inputD > 0) ? inputD : 8;

            const BASE_L = 16;
            const BASE_D = 8;

            const ratioL = targetL / BASE_L;
            const ratioD = targetD / BASE_D;

            const scale = [1000 * ratioD, 1000 * ratioL, 1000 * ratioD];
            console.log(`🔩 ${activeSchemaId} Scale:`, { targetL, targetD, ratioL, ratioD, scale });
            return scale;
        }

        // For linear guides, scale X-axis based on user input
        if (activeSchemaId === 'LINEAR_GUIDE') {
            const inputLength = parseFloat(formState.LS || formState.L);

            // Validation: default to 1.0 if invalid input
            if (isNaN(inputLength) || inputLength <= 0) {
                return [1, 1, 1];
            }

            const scaleX = inputLength / baseLength;
            // Clamp to reasonable bounds (0.1x to 10x) to prevent extreme distortion
            const clampedScaleX = Math.max(0.1, Math.min(10, scaleX));

            return [clampedScaleX, 1, 1];
        }

        // For hydraulic components: No dynamic scaling, just unit conversion
        if (activeSchemaId === 'HYDRAULIC') {
            return [1000, 1000, 1000];
        }

        // For lubrication system: Scale based on BED_WIDTH and BED_HEIGHT
        if (activeSchemaId === 'LUBRICATION_SYSTEM') {
            const bedWidth = parseFloat(formState.BED_WIDTH) || 1;
            const bedHeight = parseFloat(formState.BED_HEIGHT) || 1;

            // Clamp to reasonable bounds (0.5x to 5x)
            const clampedWidth = Math.max(0.5, Math.min(5, bedWidth));
            const clampedHeight = Math.max(0.5, Math.min(5, bedHeight));

            console.log("🛢️ Lubrication System Scale:", [clampedWidth, clampedHeight, 1]);
            return [clampedWidth, clampedHeight, 1];
        }

        return [1, 1, 1];
    };

    const modelScale = calculateModelScale();

    const handleSchemaChange = (e) => {
        const newSchemaId = e.target.value;
        setActiveSchemaId(newSchemaId);
        setFormState({}); // Clear form on schema change
        setIsModelVisible(false); // Hide 3D model
        setSubmitErrors([]); // Clear errors
        setInlineErrors({});
        if (dynamicModelUrl) {
            if (typeof dynamicModelUrl === 'object') URL.revokeObjectURL(dynamicModelUrl.url);
            else URL.revokeObjectURL(dynamicModelUrl);
        }
        setDynamicModelUrl(null); // Reset dynamic model URL
        modelRefDimensionsRef.current = null; // Reset reference dimensions for new model
    };

    // --- Dynamic Validation Effect (Replicating @free index.html logic) ---
    useEffect(() => {
        if (activeSchemaId === 'RS') {
            const rd = parseFloat(formState.roller_diameter);
            const bw = parseFloat(formState.bearing_width);
            const sd = parseFloat(formState.shaft_diameter);
            const oh = parseFloat(formState.overall_height);
            const bsw = parseFloat(formState.base_width);

            const errors = [];

            // Baseline ranges
            if (isNaN(sd) || sd < 5 || sd > 200) errors.push({ field: "shaft_diameter", msg: "Shaft diameter must be between 5 and 200 mm" });
            if (isNaN(bw) || bw < 5 || bw > 200) errors.push({ field: "bearing_width", msg: "Bearing width must be between 5 and 200 mm" });
            if (isNaN(oh) || oh < 20 || oh > 500) errors.push({ field: "overall_height", msg: "Overall height must be between 20 and 500 mm" });
            if (isNaN(bsw) || bsw < 20 || bsw > 500) errors.push({ field: "base_width", msg: "Base width must be between 20 and 500 mm" });
            if (isNaN(rd) || rd < 30 || rd > 1000) errors.push({ field: "roller_diameter", msg: "Roller diameter must be between 30 and 1000 mm" });

            // Cross-field constraints
            if (!isNaN(sd) && sd <= 0) errors.push({ field: "shaft_diameter", msg: "Shaft diameter must be greater than 0" });
            if (!isNaN(oh) && oh < 10) errors.push({ field: "overall_height", msg: "Overall height must be at least 10 mm" });
            if (!isNaN(rd) && !isNaN(sd) && rd <= sd) errors.push({ field: "roller_diameter", msg: "Roller diameter must be larger than shaft diameter" });
            if (!isNaN(bsw) && !isNaN(sd) && bsw <= sd) errors.push({ field: "base_width", msg: "Base width must be larger than shaft diameter" });
            if (!isNaN(bw) && !isNaN(oh) && bw >= oh) errors.push({ field: "bearing_width", msg: "Bearing width must be less than overall height" });
            if (!isNaN(rd) && !isNaN(bsw) && rd - bsw < 10) errors.push({ field: "roller_diameter", msg: "Roller diameter minus base width must be at least 10 mm" });

            const newInline = {};
            const newSummary = [];

            errors.forEach(({ field, msg }) => {
                if (!newInline[field]) newInline[field] = msg; // First error for this field goes inline
                else newSummary.push(msg); // Overflow errors go to summary box
            });

            setInlineErrors(newInline);
            setSubmitErrors(newSummary);

        } else if (activeSchemaId === 'T_BOLT') {
            const l = parseFloat(formState.VAR04);
            const w = parseFloat(formState.FIX02);
            const k = parseFloat(formState.FIX04);
            const m = formState.VAR02 || 'M10';
            const threadLength = parseFloat(formState.FIX08);
            const threadRad = parseFloat(m.replace('M', '')) / 2.0;

            const errors = [];

            if (isNaN(l) || l <= 0) errors.push({ field: "VAR04", msg: "Total Length (L) must be greater than 0" });
            if (isNaN(w) || w <= 0) errors.push({ field: "FIX02", msg: "Head Width (W) must be greater than 0" });
            if (isNaN(k) || k <= 0) errors.push({ field: "FIX04", msg: "Head Height (K) must be greater than 0" });
            if (!isNaN(w) && w / 2.0 <= threadRad) errors.push({ field: "FIX02", msg: "Head Width must be larger than Thread Size" });
            if (!isNaN(threadLength) && !isNaN(l) && threadLength > l) errors.push({ field: "FIX08", msg: "Thread Length cannot be strictly greater than Total Length" });

            const newInline = {};
            const newSummary = [];
            errors.forEach(({ field, msg }) => {
                if (!newInline[field]) newInline[field] = msg;
                else newSummary.push(msg);
            });
            setInlineErrors(newInline);
            setSubmitErrors(newSummary);
        } else {
            setInlineErrors({});
            setSubmitErrors([]);
        }
    }, [formState, activeSchemaId]);

    const handleApply = async () => {
        try {
            console.log("Saving configuration...", formState);
            setSubmitErrors([]);

            // --- RS Schema: Generate custom 3D model via FreeCAD ---
            if (activeSchemaId === 'RS') {
                if (Object.keys(inlineErrors).length > 0 || submitErrors.length > 0) {
                    alert("Please fix the validation errors before applying.");
                    return;
                }

                setIsGenerating(true);
                const modelPayload = {
                    roller_diameter: parseFloat(formState.roller_diameter) || 0,
                    bearing_width: parseFloat(formState.bearing_width) || 0,
                    shaft_diameter: parseFloat(formState.shaft_diameter) || 0,
                    overall_height: parseFloat(formState.overall_height) || 0,
                    base_width: parseFloat(formState.base_width) || 0,
                };

                console.log("Generating custom RS model...", modelPayload);
                const result = await generateCustomModel(modelPayload);
                console.log("Model payload info:", result);

                // Set the blob object as the model source for the 3D viewer
                setDynamicModelUrl(result);
                setIsModelVisible(true);
                setIsGenerating(false);
                return;
            }

            // --- T_BOLT Schema: Generate custom 3D model via FreeCAD ---
            if (activeSchemaId === 'T_BOLT') {
                if (Object.keys(inlineErrors).length > 0 || submitErrors.length > 0) {
                    alert("Please fix the validation errors before applying.");
                    return;
                }

                setIsGenerating(true);
                const modelPayload = {
                    m: formState.VAR02 || 'M10',
                    l: parseFloat(formState.VAR04) || 20,
                    head_width: parseFloat(formState.FIX02) || 12,
                    head_height: parseFloat(formState.FIX04) || 6,
                    slot_width: parseFloat(formState.FIX06) || 10,
                    thread_length: parseFloat(formState.FIX08) || 15,
                };

                console.log("Generating custom T-Bolt model...", modelPayload);
                const result = await generateTBoltModel(modelPayload);
                console.log("Model payload info:", result);

                // Set the blob object as the model source for the 3D viewer
                setDynamicModelUrl(result);
                setIsModelVisible(true);
                setIsGenerating(false);
                return;
            }

            // --- All other schemas: Save configuration to DB ---
            const payload = {
                part_number: formState.part_number || "UNKNOWN",
                surface_treatment: formState.surface_treatment,
                number_of_blocks: formState.number_of_blocks ? parseInt(formState.number_of_blocks) : undefined,
                geometry_params: { ...formState },
                status: "draft",
                schema_type: activeSchemaId
            };

            const response = await createConfiguration(payload);
            console.log("Configuration saved:", response);
            setConfigId(response.id);
            setIsModelVisible(true);
            alert("Configuration saved to backend! ID: " + response.id);
        } catch (error) {
            console.error("Failed to save/generate:", error);
            setIsGenerating(false);
            alert("Error: " + error.message);
        }
    };

    const handleParamChange = (key, value) => {
        setFormState(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleReset = () => {
        setFormState({});
        setSubmitErrors([]);
        setInlineErrors({});
        setIsModelVisible(false);
        setDynamicModelUrl(null);
    };

    // Resize handler
    const handleMouseDown = (e) => {
        e.preventDefault();
        setIsResizing(true);
    };

    const handleMouseMove = (e) => {
        if (!isResizing || !containerRef.current) return;

        const container = containerRef.current;
        const containerRect = container.getBoundingClientRect();
        const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;

        // Constrain between 20% and 80%
        if (newLeftWidth >= 20 && newLeftWidth <= 80) {
            setLeftWidth(newLeftWidth);
        }
    };

    const handleMouseUp = () => {
        setIsResizing(false);
    };

    // Add/remove event listeners for resize
    useEffect(() => {
        if (isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
        } else {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };
    }, [isResizing]);


    return (
        <div className="configurator-page">
            {/* Top Bar */}
            <header className="configurator-header">
                <div className="header-left">
                    <button
                        className="back-to-select-btn"
                        onClick={() => navigate('/select')}
                        title="Back to Selection"
                    >
                        ←
                    </button>
                    <img src={logo} alt="CADMAXX Logo" className="logo-img" style={{ height: '32px' }} />
                    <span style={{ marginLeft: '1px', color: 'var(--text-secondary)' }}> / Configurator</span>
                </div>

                <div className="header-right">
                    {/* Component Selector */}
                    <div className="product-selector">
                        <span className="selector-label">Product Family:</span>
                        <select
                            className="schema-select"
                            value={activeSchemaId}
                            onChange={handleSchemaChange}
                        >
                            <option value="LINEAR_GUIDE">Linear Guide Systems</option>
                            <option value="HEX_BOLT">Structural Hex Bolts (ISO)</option>
                            <option value="ALLEN_BOLT">M10 Allen Bolt</option>
                            <option value="M8_BOLT">M8x16 Bolt</option>
                            <option value="HYDRAULIC">Hydraulic Component</option>
                            <option value="LUBRICATION_SYSTEM">Lubrication System</option>
                            <option value="T_BOLT">T-Bolt</option>
                            <option value="RS">Roller Support</option>
                        </select>
                    </div>
                </div>
            </header>

            {/* Main Work Area */}
            <div
                className="configurator-main"
                ref={containerRef}
                style={{
                    gridTemplateColumns: `${leftWidth}% 4px ${100 - leftWidth}%`
                }}
            >
                {/* Left: Inputs & Actions */}
                <div className="left-side">
                    <InputPanel
                        schema={currentSchema}
                        values={formState}
                        onChange={handleParamChange}
                        onReset={handleReset}
                        onApply={handleApply}
                        submitErrors={submitErrors}
                        inlineErrors={inlineErrors}
                    />
                </div>

                {/* Resize Handle */}
                <div
                    className={`resize-handle ${isResizing ? 'resizing' : ''}`}
                    onMouseDown={handleMouseDown}
                >
                    <div className="resize-handle-bar">
                        <div className="resize-handle-icon">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M6 4L2 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M10 4L14 8L10 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Right: 3D Preview */}
                <section className="result-panel result-panel-3d">
                    <Preview3D
                        showModel={isModelVisible}
                        configId={configId}
                        modelUrl={dynamicModelUrl?.url || dynamicModelUrl}
                        modelFormat={dynamicModelUrl?.format || 'gltf'}
                        modelScale={modelScale}
                        schemaId={activeSchemaId}
                        onModelInfo={(info) => {
                            if (!modelRefDimensionsRef.current) {
                                console.log('📐 Captured reference dimensions:', info);
                                modelRefDimensionsRef.current = info;
                            }
                        }}
                    />
                </section>
            </div>

            {/* Bottom Tabs Navigation */}
            <div className="bottom-tabs-container">
                <div className="bottom-tabs-navigation">
                    <button
                        className={`bottom-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                        onClick={() => setActiveTab(activeTab === 'overview' ? null : 'overview')}
                    >
                        <Layers className="tab-icon" size={16} />
                        <span>OVERVIEW</span>
                    </button>
                    <button
                        className={`bottom-tab-btn ${activeTab === 'technical' ? 'active' : ''}`}
                        onClick={() => setActiveTab(activeTab === 'technical' ? null : 'technical')}
                    >
                        <FileText className="tab-icon" size={16} />
                        <span>TECHNICAL SPECIFICATION</span>
                    </button>
                    <button
                        className={`bottom-tab-btn ${activeTab === 'compatible' ? 'active' : ''}`}
                        onClick={() => setActiveTab(activeTab === 'compatible' ? null : 'compatible')}
                    >
                        <Link className="tab-icon" size={16} />
                        <span>COMPATIBLE PRODUCTS</span>
                    </button>
                    <button
                        className={`bottom-tab-btn ${activeTab === 'mounting' ? 'active' : ''}`}
                        onClick={() => setActiveTab(activeTab === 'mounting' ? null : 'mounting')}
                    >
                        <PenTool className="tab-icon" size={16} />
                        <span>MOUNTING</span>
                    </button>
                    <button
                        className={`bottom-tab-btn ${activeTab === 'info' ? 'active' : ''}`}
                        onClick={() => setActiveTab(activeTab === 'info' ? null : 'info')}
                    >
                        <Info className="tab-icon" size={16} />
                        <span>MORE INFORMATION</span>
                    </button>
                </div>
            </div>

            {/* Tab Content Sections */}
            {activeTab && (
                <div className="tab-content-panel">
                    <div className="tab-content-inner">
                        <h2>
                            {activeTab === 'overview' && 'Product Overview'}
                            {activeTab === 'technical' && 'Technical Specification'}
                            {activeTab === 'compatible' && 'Compatible Products'}
                            {activeTab === 'mounting' && 'Mounting Instructions'}
                            {activeTab === 'info' && 'More Information'}
                        </h2>
                        <div className="work-in-progress">
                            <div className="wip-icon">🚧</div>
                            <div className="wip-text">WORKING ON IT</div>
                            <p className="wip-subtitle">This section is under development</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Footer */}
            <footer className="configurator-footer">
                <div className="footer-content">
                    <span className="footer-brand">CADMAXX ENGINEERING</span>
                    <span className="footer-divider">—</span>
                    <span className="footer-text">Developed by Internal Systems Group</span>
                </div>
            </footer>
        </div>
    );
}

export default ConfiguratorPage;
