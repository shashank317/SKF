import { useState } from "react";
import Preview3D from "../components/configurator/Preview3D";
import InputPanel from "../components/configurator/InputPanel";
import logo from "../assets/CLOGO.png";

function Configurator() {
    const [formState, setFormState] = useState({});

    const handleParamChange = (key, value) => {
        setFormState(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleReset = () => {
        setFormState({});
    };

    // Simple validation: check if at least Part No is entered
    const isReady = formState['PN'] && formState['PN'].length > 0;
    const statusText = isReady ? "Valid input" : "Enter Part No.";

    return (
        <div className="configurator-page">
            {/* Top Bar */}
            <header className="configurator-header">
                <div className="header-left">
                    <img src={logo} alt="CADMAXX Logo" className="logo-img" style={{ height: '32px' }} />
                    <span style={{ marginLeft: '1px', color: 'var(--text-secondary)' }}> / Configurator</span>
                </div>

                <div className="header-right">
                    {/* later: theme toggle, back button */}
                </div>
            </header>

            {/* Main Work Area */}
            <div className="configurator-main">
                {/* Left: Inputs & Actions */}
                <div className="left-side">
                    <InputPanel values={formState} onChange={handleParamChange} />

                    <div className="actions-bar" style={{ padding: '0 20px 20px 20px' }}>
                        <button
                            className="btn btn-secondary"
                            onClick={handleReset}
                            style={{ width: '100%' }}
                        >
                            Reset Configuration
                        </button>
                    </div>
                </div>

                {/* Right: Results */}
                <section className="result-panel">
                    <h2>Result</h2>

                    <div className={`result-status ${isReady ? "valid" : ""}`}>
                        {statusText}
                    </div>


                    <div className="result-card">
                        <p className="result-label">Matched Part</p>
                        <p className="result-value">—</p>
                    </div>

                    <div className="preview-box" style={{
                        minHeight: "500px",
                        backgroundColor: "var(--surface)",
                        borderRadius: "8px",
                        overflow: "hidden"
                    }}>
                        <Preview3D />
                    </div>

                </section>
            </div>
        </div>
    );
}

export default Configurator;
