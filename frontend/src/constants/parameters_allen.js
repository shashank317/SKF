/**
 * Allen Bolt Parameters
 * Specific parameters for M10 Allen Bolt configuration.
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
        placeholder: 'e.g., DIN 912'
    },

    MATERIAL: {
        label: 'Material',
        key: 'MAT',
        type: 'string',
        input: 'select',
        options: ['Steel 8.8', 'Steel 10.9', 'Steel 12.9', 'Stainless A2', 'Stainless A4'],
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
    M: {
        label: 'M (Thread Size)',
        key: 'VAR02',
        type: 'string',
        input: 'select',
        options: ['M3', 'M4', 'M5', 'M6', 'M8', 'M10', 'M12', 'M16', 'M20'],
        required: true,
        step: 'dimensions'
    },

    L: {
        label: 'L (Length)',
        key: 'VAR04',
        unit: 'mm',
        type: 'number',
        input: 'number',
        required: true,
        step: 'dimensions',
        validation: { min: 5, max: 200 }
    },

    MxP: {
        label: 'M×P (Thread Pitch)',
        key: 'FIX02',
        type: 'string',
        input: 'text',
        required: false,
        step: 'dimensions',
        placeholder: 'e.g., M10×1.5'
    },

    A: {
        label: 'A (Head Diameter)',
        key: 'FIX04',
        unit: 'mm',
        type: 'number',
        input: 'number',
        required: false,
        step: 'dimensions',
        validation: { min: 0 }
    },

    H: {
        label: 'H (Head Height)',
        key: 'FIX06',
        unit: 'mm',
        type: 'number',
        input: 'number',
        required: false,
        step: 'dimensions',
        validation: { min: 0 }
    },

    B: {
        label: 'B (Thread Length)',
        key: 'FIX08',
        unit: 'mm',
        type: 'number',
        input: 'number',
        required: false,
        step: 'dimensions',
        validation: { min: 0 }
    },

    d: {
        label: 'd (Shank Diameter)',
        key: 'FIX10',
        unit: 'mm',
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
        description: 'Thread size & lengths',
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
