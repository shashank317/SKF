/**
 * T-Bolt Parameters
 * Specific parameters for T-Bolt (hammer-head bolt) configuration.
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
        placeholder: 'e.g., DIN 787'
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
        options: ['M6', 'M8', 'M10', 'M12', 'M14', 'M16', 'M20'],
        required: true,
        step: 'dimensions'
    },

    L: {
        label: 'L (Total Length)',
        key: 'VAR04',
        unit: 'mm',
        type: 'number',
        input: 'number',
        required: true,
        step: 'dimensions',
        validation: { min: 20, max: 300 }
    },

    HEAD_WIDTH: {
        label: 'W (Head Width)',
        key: 'FIX02',
        unit: 'mm',
        type: 'number',
        input: 'number',
        required: false,
        step: 'dimensions',
        validation: { min: 0 },
        placeholder: 'T-slot head width'
    },

    HEAD_HEIGHT: {
        label: 'K (Head Height)',
        key: 'FIX04',
        unit: 'mm',
        type: 'number',
        input: 'number',
        required: false,
        step: 'dimensions',
        validation: { min: 0 }
    },

    SLOT_WIDTH: {
        label: 'T (T-Slot Width)',
        key: 'FIX06',
        unit: 'mm',
        type: 'number',
        input: 'number',
        required: false,
        step: 'dimensions',
        validation: { min: 0 },
        placeholder: 'e.g., 10, 12, 14'
    },

    THREAD_LENGTH: {
        label: 'B (Thread Length)',
        key: 'FIX08',
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
        description: 'Thread, length & head specs',
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
