/**
 * RS (Roller Support) Parameters
 * Specific parameters for Roller Support component configuration.
 */
import { Layers, Ruler, Settings } from 'lucide-react';

export const PARAMETERS = {
    // ============ STEP 1: IDENTIFICATION ============
    MODEL: {
        label: 'Model',
        key: 'MODEL',
        type: 'string',
        input: 'text',
        required: true,
        step: 'identification',
        placeholder: 'e.g., RS-200'
    },

    MATERIAL: {
        label: 'Material',
        key: 'MAT',
        type: 'string',
        input: 'select',
        options: ['Cast Iron', 'Steel', 'Stainless Steel', 'Aluminium'],
        required: true,
        step: 'identification'
    },

    CODE: {
        label: 'Code',
        key: 'CODE',
        type: 'string',
        input: 'text',
        required: false,
        step: 'identification',
        placeholder: 'Product code'
    },

    // ============ STEP 2: DIMENSIONS ============
    ROLLER_DIA: {
        label: 'D (Roller Diameter)',
        key: 'VAR02',
        unit: 'mm',
        type: 'number',
        input: 'number',
        required: true,
        step: 'dimensions',
        validation: { min: 10, max: 500 }
    },

    BEARING_WIDTH: {
        label: 'B (Bearing Width)',
        key: 'VAR04',
        unit: 'mm',
        type: 'number',
        input: 'number',
        required: true,
        step: 'dimensions',
        validation: { min: 5, max: 200 }
    },

    SHAFT_DIA: {
        label: 'd (Shaft Diameter)',
        key: 'FIX02',
        unit: 'mm',
        type: 'number',
        input: 'number',
        required: false,
        step: 'dimensions',
        validation: { min: 0 }
    },

    OVERALL_HEIGHT: {
        label: 'H (Overall Height)',
        key: 'FIX04',
        unit: 'mm',
        type: 'number',
        input: 'number',
        required: false,
        step: 'dimensions',
        validation: { min: 0 }
    },

    BASE_WIDTH: {
        label: 'W (Base Width)',
        key: 'FIX06',
        unit: 'mm',
        type: 'number',
        input: 'number',
        required: false,
        step: 'dimensions',
        validation: { min: 0 }
    },

    LOAD_CAPACITY: {
        label: 'Load Capacity',
        key: 'FIX08',
        unit: 'kN',
        type: 'number',
        input: 'number',
        required: false,
        step: 'dimensions',
        validation: { min: 0 }
    },

    // ============ STEP 3: DOCUMENTATION ============
    PDF: {
        label: 'PDF Document',
        key: 'FIX95',
        type: 'string',
        input: 'text',
        required: false,
        step: 'documentation',
        placeholder: 'Link or reference'
    }
};

export const STEPS = [
    {
        id: 'identification',
        title: 'Identification',
        icon: Layers,
        description: 'Model, material & code',
        required: true
    },
    {
        id: 'dimensions',
        title: 'Dimensions',
        icon: Ruler,
        description: 'Roller, shaft & base specs',
        required: true
    },
    {
        id: 'documentation',
        title: 'Documentation',
        icon: Settings,
        description: 'PDF & references',
        required: false
    }
];
