/**
 * SKF Product Configuration Parameters
 * Step-based configurator with typed inputs and validation
 */

export const PARAMETERS = {
    // ============ STEP 1: APPLICATION ============
    PART_NO: {
        label: 'Part Number',
        key: 'PN',
        type: 'string',
        input: 'text',
        required: true,
        step: 'application',
        placeholder: 'e.g., SKF-123456'
    },

    SURFACE_TREATMENT: {
        label: 'Surface Treatment',
        key: 'ST',
        type: 'string',
        input: 'select',
        options: ['Standard', 'Zinc Plated', 'Black Oxide', 'Chrome Plated', 'Nickel Plated'],
        required: true,
        step: 'application'
    },

    NO_OF_BLOCKS: {
        label: 'Number of Blocks',
        key: 'NOB',
        type: 'number',
        input: 'number',
        required: true,
        step: 'application',
        validation: { min: 1, max: 10 }
    },

    // ============ STEP 2: GEOMETRY ============
    H: {
        label: 'H',
        key: 'H',
        unit: 'mm',
        type: 'number',
        input: 'number',
        required: true,
        step: 'geometry',
        validation: { min: 0 }
    },

    L_SELECTION: {
        label: 'L Selection',
        key: 'LS',
        unit: 'mm',
        type: 'number',
        input: 'select',
        options: [100, 200, 300, 400, 500, 600, 800, 1000, 1200, 1500],
        required: true,
        step: 'geometry'
    },

    W: {
        label: 'W',
        key: 'W',
        unit: 'mm',
        type: 'number',
        input: 'number',
        required: true,
        step: 'geometry',
        validation: { min: 0 }
    },

    L1: {
        label: 'L1',
        key: 'L1',
        unit: 'mm',
        type: 'number',
        input: 'number',
        required: true,
        step: 'geometry',
        validation: { min: 0 }
    },

    B: {
        label: 'B',
        key: 'B',
        unit: 'mm',
        type: 'number',
        input: 'number',
        required: true,
        step: 'geometry',
        validation: { min: 0 }
    },

    C: {
        label: 'C',
        key: 'C',
        unit: 'mm',
        type: 'number',
        input: 'number',
        required: true,
        step: 'geometry',
        validation: { min: 0 }
    },

    L2: {
        label: 'L2',
        key: 'L2',
        unit: 'mm',
        type: 'number',
        input: 'number',
        required: false,
        step: 'geometry',
        validation: { min: 0 }
    },

    K: {
        label: 'K',
        key: 'K',
        unit: 'mm',
        type: 'number',
        input: 'number',
        required: false,
        step: 'geometry',
        validation: { min: 0 }
    },

    N: {
        label: 'N',
        key: 'N',
        unit: 'mm',
        type: 'number',
        input: 'number',
        required: false,
        step: 'geometry',
        validation: { min: 0 }
    },

    C2: {
        label: 'C2',
        key: 'C2',
        unit: 'mm',
        type: 'number',
        input: 'number',
        required: false,
        step: 'geometry',
        validation: { min: 0 }
    },

    W1: {
        label: 'W1',
        key: 'W1',
        unit: 'mm',
        type: 'number',
        input: 'number',
        required: false,
        step: 'geometry',
        validation: { min: 0 }
    },

    W2: {
        label: 'W2',
        key: 'W2',
        unit: 'mm',
        type: 'number',
        input: 'number',
        required: false,
        step: 'geometry',
        validation: { min: 0 }
    },

    H1: {
        label: 'H1',
        key: 'H1',
        unit: 'mm',
        type: 'number',
        input: 'number',
        required: false,
        step: 'geometry',
        validation: { min: 0 }
    },

    F: {
        label: 'F',
        key: 'F',
        unit: 'mm',
        type: 'number',
        input: 'number',
        required: false,
        step: 'geometry',
        validation: { min: 0 }
    },

    G: {
        label: 'G',
        key: 'G',
        unit: 'mm',
        type: 'number',
        input: 'number',
        required: false,
        step: 'geometry',
        validation: { min: 0 }
    },

    // ============ STEP 3: MATERIALS ============
    MX: {
        label: 'Lubrication Units',
        key: 'MX',
        type: 'string',
        input: 'select',
        options: ['None', 'MX-1', 'MX-2', 'MX-3', 'MX-4'],
        required: true,
        step: 'materials'
    },

    GREASE_TYPE: {
        label: 'Grease Type',
        key: 'GREASE',
        type: 'string',
        input: 'select',
        options: ['LGMT 2', 'LGMT 3', 'LGHP 2', 'LGEP 2', 'LGWA 2'],
        required: true,
        step: 'materials'
    },

    // ============ STEP 4: ADVANCED (FINE TUNING) ============
    // Additional Dimensions
    SXL: {
        label: 'Sxl',
        key: 'SLL',
        type: 'string',
        input: 'text',
        required: false,
        step: 'advanced',
        subsection: 'additional'
    },

    CB: {
        label: 'Cb',
        key: 'CBB',
        unit: 'mm',
        type: 'number',
        input: 'number',
        required: false,
        step: 'advanced',
        subsection: 'additional',
        validation: { min: 0 }
    },

    L1_LOWER: {
        label: '(l1)',
        key: 'LL1',
        unit: 'mm',
        type: 'number',
        input: 'number',
        required: false,
        step: 'advanced',
        subsection: 'additional',
        validation: { min: 0 }
    },

    CA: {
        label: 'Ca',
        key: 'CAA',
        unit: 'mm',
        type: 'number',
        input: 'number',
        required: false,
        step: 'advanced',
        subsection: 'additional',
        validation: { min: 0 }
    },

    D1_D2_H: {
        label: 'd1×d2×h',
        key: 'DD1DD2HH',
        unit: 'mm',
        type: 'string',
        input: 'text',
        required: false,
        step: 'advanced',
        subsection: 'additional',
        placeholder: 'e.g., 10x20x5'
    },

    // Alterations
    TAPPED_HOLES: {
        label: 'Tapped Holes',
        key: 'ALT1',
        type: 'string',
        input: 'select',
        options: ['None', 'M4', 'M5', 'M6', 'M8'],
        required: false,
        step: 'advanced',
        subsection: 'alterations'
    },

    RAIL_ENDS_CUT: {
        label: 'Rail Ends Cut',
        key: 'ALT2',
        type: 'string',
        input: 'select',
        options: ['None', '45° Chamfer', '90° Cut', 'Rounded'],
        required: false,
        step: 'advanced',
        subsection: 'alterations'
    },

    ADDITIONAL_BLOCKS: {
        label: 'Additional Blocks',
        key: 'ALT4',
        type: 'string',
        input: 'select',
        options: ['None', '+1 Block', '+2 Blocks', '+3 Blocks'],
        required: false,
        step: 'advanced',
        subsection: 'alterations'
    }
};

/**
 * Step definitions
 */
import { Layers, Ruler, Beaker, Sliders } from 'lucide-react';

export const STEPS = [
    {
        id: 'application',
        title: 'Application',
        icon: Layers,
        description: 'Basic identification & block count',
        required: true
    },
    {
        id: 'geometry',
        title: 'Geometry',
        icon: Ruler,
        description: 'Physical dimensions & measurements',
        required: true
    },
    {
        id: 'materials',
        title: 'Materials',
        icon: Beaker,
        description: 'Lubrication & treatment',
        required: true
    },
    {
        id: 'advanced',
        title: 'Fine Tuning',
        icon: Sliders,
        description: 'Advanced alterations & options',
        required: false
    }
];

/**
 * Get parameters by step
 */
export const getParametersByStep = (stepId) => {
    return Object.values(PARAMETERS).filter(param => param.step === stepId);
};

/**
 * Get parameters by step and subsection (for advanced step)
 */
export const getParametersBySubsection = (stepId, subsection) => {
    return Object.values(PARAMETERS).filter(
        param => param.step === stepId && param.subsection === subsection
    );
};

/**
 * Validate a single parameter value
 */
export const validateParameter = (param, value) => {
    // Check if required field is empty
    if (param.required && (!value || value === '')) {
        return { valid: false, error: `${param.label} is required` };
    }

    // Skip validation if optional and empty
    if (!value || value === '') {
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
 */
export const validateStep = (stepId, values) => {
    const stepParams = getParametersByStep(stepId);
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
 */
export const getStepStatus = (stepId, values) => {
    const validation = validateStep(stepId, values);
    const stepParams = getParametersByStep(stepId);

    // Check if step is required
    const step = STEPS.find(s => s.id === stepId);

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
 * Legacy function for backward compatibility
 */
export const getParametersByCategory = () => {
    return {
        identification: [PARAMETERS.PART_NO],
        treatment: [PARAMETERS.SURFACE_TREATMENT],
        lubrication: [PARAMETERS.MX, PARAMETERS.GREASE_TYPE],
        configuration: [PARAMETERS.NO_OF_BLOCKS],
        mainDimensions: [
            PARAMETERS.H,
            PARAMETERS.L_SELECTION,
            PARAMETERS.W,
            PARAMETERS.L1,
            PARAMETERS.B,
            PARAMETERS.C,
            PARAMETERS.L2,
            PARAMETERS.K,
            PARAMETERS.N,
            PARAMETERS.C2,
            PARAMETERS.W1,
            PARAMETERS.W2,
            PARAMETERS.H1,
            PARAMETERS.F,
            PARAMETERS.G,
        ],
        additionalDimensions: [
            PARAMETERS.SXL,
            PARAMETERS.CB,
            PARAMETERS.L1_LOWER,
            PARAMETERS.CA,
            PARAMETERS.D1_D2_H,
        ],
        alterations: [
            PARAMETERS.TAPPED_HOLES,
            PARAMETERS.RAIL_ENDS_CUT,
            PARAMETERS.ADDITIONAL_BLOCKS,
        ],
    };
};

/**
 * Get parameter by key
 */
export const getParameterByKey = (key) => {
    return Object.values(PARAMETERS).find(param => param.key === key);
};

/**
 * Get all dimensional parameters
 */
export const getDimensionalParameters = () => {
    return Object.values(PARAMETERS).filter(param => param.unit === 'mm');
};
