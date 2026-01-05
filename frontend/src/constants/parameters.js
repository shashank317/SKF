/**
 * SKF Product Configuration Parameters
 * These are the standard parameters for bearing/component configuration
 */

export const PARAMETERS = {
    // Product Identification
    PART_NO: { label: 'Part Number', key: 'PN', type: 'string' },

    // Surface Treatment
    SURFACE_TREATMENT: { label: 'Surface Treatment', key: 'ST', type: 'string' },

    // Lubrication
    MX: { label: 'MX (Lubrication Units)', key: 'MX', type: 'string' },
    GREASE_TYPE: { label: 'Grease Type Selection', key: 'GREASE', type: 'string' },

    // Configuration
    NO_OF_BLOCKS: { label: 'NO. of Blocks', key: 'NOB', type: 'number' },

    // Main Dimensions
    H: { label: 'H', key: 'H', unit: 'mm', type: 'number' },
    L_SELECTION: { label: 'L Selection', key: 'LS', unit: 'mm', type: 'number' },
    W: { label: 'W', key: 'W', unit: 'mm', type: 'number' },
    L1: { label: 'L1', key: 'L1', unit: 'mm', type: 'number' },
    B: { label: 'B', key: 'B', unit: 'mm', type: 'number' },
    C: { label: 'C', key: 'C', unit: 'mm', type: 'number' },
    L2: { label: 'L2', key: 'L2', unit: 'mm', type: 'number' },
    K: { label: 'K', key: 'K', unit: 'mm', type: 'number' },
    N: { label: 'N', key: 'N', unit: 'mm', type: 'number' },
    C2: { label: 'C2', key: 'C2', unit: 'mm', type: 'number' },
    W1: { label: 'W1', key: 'W1', unit: 'mm', type: 'number' },
    W2: { label: 'W2', key: 'W2', unit: 'mm', type: 'number' },
    H1: { label: 'H1', key: 'H1', unit: 'mm', type: 'number' },
    F: { label: 'F', key: 'F', unit: 'mm', type: 'number' },
    G: { label: 'G', key: 'G', unit: 'mm', type: 'number' },

    // Lowercase Dimensions
    SXL: { label: 'Sxl', key: 'SLL', type: 'string' },
    CB: { label: 'Cb', key: 'CBB', unit: 'mm', type: 'number' },
    L1_LOWER: { label: '(l1)', key: 'LL1', unit: 'mm', type: 'number' },
    CA: { label: 'Ca', key: 'CAA', unit: 'mm', type: 'number' },

    // Composite Dimensions
    D1_D2_H: { label: 'd1×d2×h', key: 'DD1DD2HH', unit: 'mm', type: 'string' },

    // Alterations
    TAPPED_HOLES: { label: 'Tapped Holes', key: 'ALT1', type: 'string' },
    RAIL_ENDS_CUT: { label: 'Rail Ends Cut Alteration', key: 'ALT2', type: 'string' },
    ADDITIONAL_BLOCKS: { label: 'Additional Blocks', key: 'ALT4', type: 'string' },
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

/**
 * Get parameters by category
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
