import { useState, useEffect } from 'react';
import {
    Check,
    Lock,
    AlertCircle,
    ChevronDown,
    ChevronRight,
} from 'lucide-react';
import {
    getParametersByStep,
    getParametersBySubsection,
    getStepStatus,
    validateParameter
} from '../../constants/parameters';
import './InputPanel.css';

/* ========================================
   FORM FIELD COMPONENT
   ======================================== */
const FormField = ({ param, value, onChange, error }) => {
    const hasValue = value !== undefined && value !== '';
    const isSelect = param.input === 'select';

    return (
        <div className="form-field">
            <label className="form-label">
                {param.label}
                {param.required && <span className="required-star">*</span>}
            </label>

            <div className="input-wrapper">
                {isSelect ? (
                    <div className="select-wrapper">
                        <select
                            className={`form-input form-select ${error ? 'error' : ''}`}
                            value={value || ''}
                            onChange={(e) => onChange(param, e.target.value)}
                        >
                            <option value="">Select option...</option>
                            {param.options.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                        <ChevronDown className="select-icon" />
                    </div>
                ) : (
                    <div className="input-container">
                        <input
                            type={param.input === 'number' ? 'number' : 'text'}
                            className={`form-input ${error ? 'error' : ''}`}
                            placeholder={param.placeholder || "—"}
                            value={value || ''}
                            onChange={(e) => onChange(param, e.target.value)}
                            min={param.validation?.min}
                            max={param.validation?.max}
                            step="any"
                        />
                        {param.unit && (
                            <span className="input-unit">{param.unit}</span>
                        )}
                    </div>
                )}
            </div>

            {error && (
                <div className="error-text">
                    <AlertCircle className="error-icon" />
                    {error}
                </div>
            )}
        </div>
    );
};

/* ========================================
   STEP HEADER COMPONENT
   ======================================== */
const StepHeader = ({ step, status, isLocked, isActive, onClick }) => {
    const Icon = step.icon;

    const getStatusClass = () => {
        if (isLocked) return 'locked';
        if (status === 'complete') return 'complete';
        if (status === 'invalid') return 'invalid';
        if (isActive) return 'active';
        return 'incomplete';
    };

    return (
        <button
            onClick={onClick}
            disabled={isLocked}
            className={`step-header ${getStatusClass()}`}
        >
            <div className="step-header-left">
                {/* Icon Circle */}
                <div className={`step-icon-circle ${getStatusClass()}`}>
                    {status === 'complete' && !isActive ? (
                        <Check className="step-icon" />
                    ) : isLocked ? (
                        <Lock className="step-icon" />
                    ) : (
                        <Icon className="step-icon" />
                    )}
                </div>

                {/* Text */}
                <div className="step-text">
                    <h3 className="step-title">{step.title}</h3>
                    <p className="step-description">{step.description}</p>
                </div>
            </div>

            {/* Right Arrow */}
            {!isLocked && (
                <div className={`step-chevron ${isActive ? 'rotated' : ''}`}>
                    <ChevronRight className="chevron-icon" />
                </div>
            )}
        </button>
    );
};

/* ========================================
   MAIN INPUT PANEL COMPONENT
   ======================================== */
const InputPanel = ({ schema, values, onChange, onReset, onApply }) => {
    const [activeStepId, setActiveStepId] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({});

    // Set initial active step when schema loads
    useEffect(() => {
        if (schema && schema.steps.length > 0) {
            setActiveStepId(schema.steps[0].id);
        }
    }, [schema]);

    if (!schema) return <div>Loading Configuration...</div>;

    const STEPS = schema.steps || [];

    // Check if a step is locked
    const isStepLocked = (stepIndex) => {
        if (stepIndex === 0) return false;
        const previousStep = STEPS[stepIndex - 1];
        const previousStatus = getStepStatus(previousStep.id, values, schema);
        return previousStatus !== 'complete';
    };

    // Handle input change with validation
    const handleChange = (param, value) => {
        onChange(param.key, value);
        const validation = validateParameter(param, value);
        setFieldErrors(prev => ({
            ...prev,
            [param.key]: validation.valid ? null : validation.error
        }));
    };

    // Render step content
    const renderSectionContent = (stepId) => {
        // Advanced mode special rendering (Specific to Linear Guide, but we can genericize later)
        if (stepId === 'advanced') {
            const additional = getParametersBySubsection('advanced', 'additional', schema);
            const alterations = getParametersBySubsection('advanced', 'alterations', schema);

            return (
                <div className="advanced-content">
                    {additional.length > 0 && (
                        <div className="subsection-group">
                            <h4 className="subsection-title">Additional Dimensions</h4>
                            <div className="fields-grid cols-2">
                                {additional.map(p => (
                                    <FormField
                                        key={p.key}
                                        param={p}
                                        value={values[p.key]}
                                        onChange={handleChange}
                                        error={fieldErrors[p.key]}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                    {alterations.length > 0 && (
                        <div className="subsection-group">
                            <h4 className="subsection-title">Alterations</h4>
                            <div className="fields-grid cols-2">
                                {alterations.map(p => (
                                    <FormField
                                        key={p.key}
                                        param={p}
                                        value={values[p.key]}
                                        onChange={handleChange}
                                        error={fieldErrors[p.key]}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            );
        }

        // Standard rendering
        const params = getParametersByStep(stepId, schema);
        const gridClass = params.length > 4 ? 'cols-3' : 'cols-2';

        return (
            <div className={`fields-grid ${gridClass}`}>
                {params.map(p => (
                    <FormField
                        key={p.key}
                        param={p}
                        value={values[p.key]}
                        onChange={handleChange}
                        error={fieldErrors[p.key]}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="input-panel-modern">
            <div className="panel-header">
                <div className="panel-header-content">
                    <div>
                        <h2 className="panel-title">Configuration</h2>
                        <p className="panel-subtitle">Configure your {schema.name} specifications.</p>
                    </div>
                    {onReset && (
                        <button className="btn btn-reset-panel" onClick={onReset}>
                            Reset Configuration
                        </button>
                    )}
                </div>
            </div>

            <div className="steps-container-modern">
                {STEPS.map((step, index) => {
                    const locked = isStepLocked(index);
                    const status = getStepStatus(step.id, values, schema);
                    const isActive = activeStepId === step.id && !locked;

                    return (
                        <div key={step.id} className="step-wrapper">
                            {/* Connector Line */}
                            {index !== STEPS.length - 1 && (
                                <div className={`step-connector ${status === 'complete' && !locked ? 'complete' : ''}`} />
                            )}

                            <StepHeader
                                step={step}
                                status={status}
                                isLocked={locked}
                                isActive={isActive}
                                onClick={() => !locked && setActiveStepId(isActive ? null : step.id)}
                            />

                            {/* Content Area */}
                            <div className={`step-content-wrapper ${isActive ? 'expanded' : 'collapsed'}`}>
                                <div className="step-content-box">
                                    {isActive && renderSectionContent(step.id)}

                                    {/* Next Button */}
                                    {!locked && status === 'complete' && index < STEPS.length - 1 && (
                                        <div className="next-button-wrapper">
                                            <button
                                                onClick={() => setActiveStepId(STEPS[index + 1].id)}
                                                className="next-button"
                                            >
                                                Next Step
                                                <ChevronRight className="next-icon" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}

                {onApply && (
                    <div className="panel-actions-bottom">
                        <button className="btn btn-apply" onClick={onApply}>
                            Apply Configuration
                            <ChevronRight size={16} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InputPanel;
