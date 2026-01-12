/**
 * Configuration Utility Functions
 * Pure functions for validation and parameter retrieval.
 * now decoupled from specific product schemas.
 */

/**
 * Get parameters by step
 * @param {string} stepId 
 * @param {Object} schema - The product schema object containing .parameters
 */
export const getParametersByStep = (stepId, schema) => {
    if (!schema || !schema.parameters) return [];
    return Object.values(schema.parameters).filter(param => param.step === stepId);
};

/**
 * Get parameters by step and subsection
 * @param {string} stepId 
 * @param {string} subsection
 * @param {Object} schema
 */
export const getParametersBySubsection = (stepId, subsection, schema) => {
    if (!schema || !schema.parameters) return [];
    return Object.values(schema.parameters).filter(
        param => param.step === stepId && param.subsection === subsection
    );
};

/**
 * Validate a single parameter value
 * (Pure function, no dependency on schema structure)
 */
export const validateParameter = (param, value) => {
    // Check if required field is empty
    if (param.required && (value === undefined || value === null || value === '')) {
        return { valid: false, error: `${param.label} is required` };
    }

    // Skip validation if optional and empty
    if (value === undefined || value === null || value === '') {
        return { valid: true };
    }

    // Validate number inputs
    if (param.type === 'number' && param.validation) {
        const numValue = parseFloat(value);

        if (isNaN(numValue)) {
            return { valid: false, error: `${param.label} must be a valid number` };
        }

        if (param.validation.min !== undefined && numValue < param.validation.min) {
            return { valid: false, error: `${param.label} must be at least ${param.validation.min}` };
        }

        if (param.validation.max !== undefined && numValue > param.validation.max) {
            return { valid: false, error: `${param.label} must be at most ${param.validation.max}` };
        }
    }

    return { valid: true };
};

/**
 * Validate an entire step
 * @param {string} stepId
 * @param {Object} values - Form state
 * @param {Object} schema 
 */
export const validateStep = (stepId, values, schema) => {
    const stepParams = getParametersByStep(stepId, schema);
    const errors = [];

    stepParams.forEach(param => {
        const result = validateParameter(param, values[param.key]);
        if (!result.valid) {
            errors.push({ key: param.key, error: result.error });
        }
    });

    return {
        valid: errors.length === 0,
        errors
    };
};

/**
 * Get step status (complete, incomplete, invalid)
 * @param {string} stepId
 * @param {Object} values 
 * @param {Object} schema
 */
export const getStepStatus = (stepId, values, schema) => {
    const validation = validateStep(stepId, values, schema);
    const stepParams = getParametersByStep(stepId, schema);

    // Check if step is required
    const step = schema.steps.find(s => s.id === stepId);
    if (!step) return 'incomplete'; // Should not happen

    // If step is not required (advanced), it's always valid
    if (!step.required) {
        return 'complete';
    }

    // Check if any required fields are filled
    const hasAnyValue = stepParams.some(param => {
        const value = values[param.key];
        return value && value !== '';
    });

    if (!hasAnyValue) {
        return 'incomplete';
    }

    return validation.valid ? 'complete' : 'invalid';
};

/**
 * Get parameter by key
 */
export const getParameterByKey = (key, schema) => {
    if (!schema || !schema.parameters) return null;
    return Object.values(schema.parameters).find(param => param.key === key);
};
