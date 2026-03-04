import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Layers, FileText, Link, PenTool, Info } from "lucide-react";
import Preview3D from "../components/Preview3D";
import InputPanel from "../components/InputPanel";
import logo from "../../../assets/CLOGO.png";
import "./ConfiguratorPage.css";
import { createConfiguration } from "../../../services/api";
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
    const containerRef = useRef(null);
    const [configId, setConfigId] = useState(null);
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

    const activeModelUrl = MODEL_PATHS[activeSchemaId];

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
            const rawL = formState.VAR04; // Total Length / Bearing Width
            const rawD = formState.VAR02; // Thread Size / Roller Diameter

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
        modelRefDimensionsRef.current = null; // Reset reference dimensions for new model
    };

    const handleApply = async () => {
        try {
            console.log("Saving configuration...", formState);
            // Default params structure required by backend
            const payload = {
                part_number: formState.part_number || "UNKNOWN",
                surface_treatment: formState.surface_treatment,
                number_of_blocks: formState.number_of_blocks ? parseInt(formState.number_of_blocks) : undefined,
                geometry_params: { ...formState },
                status: "draft",
                // We might want to send the schema_type if backend supports it later
                schema_type: activeSchemaId
            };

            const response = await createConfiguration(payload);
            console.log("Configuration saved:", response);
            setConfigId(response.id);
            setIsModelVisible(true);
            alert("Configuration saved to backend! ID: " + response.id);
        } catch (error) {
            console.error("Failed to save configuration:", error);
            alert("Error saving to backend: " + error.message);
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
        setIsModelVisible(false);
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
                        modelUrl={activeModelUrl}
                        modelScale={modelScale}
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
