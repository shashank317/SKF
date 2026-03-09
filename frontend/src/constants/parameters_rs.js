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
        key: 'roller_diameter',
        unit: 'mm',
        type: 'number',
        input: 'number',
        required: true,
        step: 'dimensions',
        validation: { min: 30, max: 1000 }
    },

    BEARING_WIDTH: {
        label: 'B (Bearing Width)',
        key: 'bearing_width',
        unit: 'mm',
        type: 'number',
        input: 'number',
        required: true,
        step: 'dimensions',
        validation: { min: 5, max: 200 }
    },

    SHAFT_DIA: {
        label: 'd (Shaft Diameter)',
        key: 'shaft_diameter',
        unit: 'mm',
        type: 'number',
        input: 'number',
        required: false,
        step: 'dimensions',
        validation: { min: 5, max: 200 }
    },

    OVERALL_HEIGHT: {
        label: 'H (Overall Height)',
        key: 'overall_height',
        unit: 'mm',
        type: 'number',
        input: 'number',
        required: false,
        step: 'dimensions',
        validation: { min: 20, max: 500 }
    },

    BASE_WIDTH: {
        label: 'W (Base Width)',
        key: 'base_width',
        unit: 'mm',
        type: 'number',
        input: 'number',
        required: false,
        step: 'dimensions',
        validation: { min: 20, max: 500 }
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
