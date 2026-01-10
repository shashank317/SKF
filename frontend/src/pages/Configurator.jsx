import { useState, useRef, useEffect } from "react";
import Preview3D from "../components/configurator/Preview3D";
import InputPanel from "../components/configurator/InputPanel";
import logo from "../assets/CLOGO.png";
import "./Configurator.css";
import { createConfiguration } from "../services/api";

function Configurator() {
    const [formState, setFormState] = useState({});
    const [leftWidth, setLeftWidth] = useState(30); // Percentage - 30% input, 70% preview
    const [isResizing, setIsResizing] = useState(false);
    const [activeTab, setActiveTab] = useState(null); // null = no tab panel open
    const [isModelVisible, setIsModelVisible] = useState(false);
    const containerRef = useRef(null);

    const handleApply = async () => {
        try {
            console.log("Saving configuration...", formState);
            // Default params structure required by backend
            const payload = {
                part_number: formState.part_number || "UNKNOWN",
                surface_treatment: formState.surface_treatment,
                number_of_blocks: formState.number_of_blocks ? parseInt(formState.number_of_blocks) : undefined,
                geometry_params: { ...formState }, // Sending all as geometry for now if specific mapping isn't there
                status: "draft"
            };

            const response = await createConfiguration(payload);
            console.log("Configuration saved:", response);
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
                    <img src={logo} alt="CADMAXX Logo" className="logo-img" style={{ height: '32px' }} />
                    <span style={{ marginLeft: '1px', color: 'var(--text-secondary)' }}> / Configurator</span>
                </div>

                <div className="header-right">
                    {/* Reset button moved to input panel */}
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
                    <Preview3D showModel={isModelVisible} />
                </section>
            </div>

            {/* Bottom Tabs Navigation */}
            <div className="bottom-tabs-navigation">
                <button
                    className={`bottom-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab(activeTab === 'overview' ? null : 'overview')}
                >
                    OVERVIEW
                </button>
                <button
                    className={`bottom-tab-btn ${activeTab === 'technical' ? 'active' : ''}`}
                    onClick={() => setActiveTab(activeTab === 'technical' ? null : 'technical')}
                >
                    TECHNICAL SPECIFICATION
                </button>
                <button
                    className={`bottom-tab-btn ${activeTab === 'compatible' ? 'active' : ''}`}
                    onClick={() => setActiveTab(activeTab === 'compatible' ? null : 'compatible')}
                >
                    COMPATIBLE PRODUCTS
                </button>
                <button
                    className={`bottom-tab-btn ${activeTab === 'mounting' ? 'active' : ''}`}
                    onClick={() => setActiveTab(activeTab === 'mounting' ? null : 'mounting')}
                >
                    MOUNTING
                </button>
                <button
                    className={`bottom-tab-btn ${activeTab === 'info' ? 'active' : ''}`}
                    onClick={() => setActiveTab(activeTab === 'info' ? null : 'info')}
                >
                    MORE INFORMATION
                </button>
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

export default Configurator;
