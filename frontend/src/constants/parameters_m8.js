/**
 * M8x16 Bolt Parameters
 * Specific parameters for M8x16 Bolt configuration.
 */
import { Layers, Ruler, Package } from 'lucide-react';

export const PARAMETERS = {
    // ============ STEP 1: IDENTIFICATION ============
    ARTNR: {
        label: 'Artikelnummer',
        key: 'ARTNR',
        type: 'string',
        input: 'text',
        required: true,
        step: 'identification',
        placeholder: 'e.g., 123456'
    },

    WERKSTOFF: {
        label: 'Material',
        key: 'WERKSTOFF',
        type: 'string',
        input: 'select',
        options: ['Steel', 'Stainless Steel', 'Brass'],
        required: true,
        step: 'identification'
    },

    GUETE: {
        label: 'Quality',
        key: 'GUETE',
        type: 'string',
        input: 'select',
        options: ['8.8', '10.9', '12.9', 'A2-70', 'A4-80'],
        required: true,
        step: 'identification'
    },

    OBERFLAECHE: {
        label: 'Surface',
        key: 'OBERFLAECHE',
        type: 'string',
        input: 'select',
        options: ['Plain', 'Zinc Plated', 'Black Oxide', 'Chrome'],
        required: true,
        step: 'identification'
    },

    VERPACKUNG: {
        label: 'Packaging',
        key: 'VERPACKUNG',
        type: 'string',
        input: 'select',
        options: ['100 pcs/box', '500 pcs/box', 'Bulk'],
        required: false,
        step: 'identification'
    },

    SFSNR: {
        label: 'SFS - FN Nr.',
        key: 'SFSNR',
        type: 'string',
        input: 'text',
        required: false,
        step: 'identification',
        placeholder: 'Internal Reference'
    },

    // ============ STEP 2: DIMENSIONS ============
    D: {
        label: 'Nominal thread diameter (D)',
        key: 'D',
        unit: 'mm',
        type: 'number',
        input: 'number',
        required: true,
        step: 'dimensions',
        validation: { min: 1 }
    },

    D3: {
        label: 'Nominal core diameter (D3)',
        key: 'D3',
        unit: 'mm',
        type: 'number',
        input: 'number',
        required: false,
        step: 'dimensions',
        validation: { min: 1 }
    },

    P: {
        label: 'Pitch of bolt (P)',
        key: 'P',
        unit: 'mm',
        type: 'number',
        input: 'number',
        required: true,
        step: 'dimensions',
        validation: { min: 0.1 }
    },

    L: {
        label: 'Nominal length (L)',
        key: 'L',
        unit: 'mm',
        type: 'number',
        input: 'number',
        required: true,
        step: 'dimensions',
        validation: { min: 1 }
    },

    B: {
        label: 'Thread length (B)',
        key: 'B',
        unit: 'mm',
        type: 'number',
        input: 'number',
        required: false,
        step: 'dimensions',
        validation: { min: 0 }
    },

    A: {
        label: 'Distance (A)',
        key: 'A',
        unit: 'mm',
        type: 'number',
        input: 'number',
        required: false,
        step: 'dimensions',
        validation: { min: 0 }
    },

    C: {
        label: 'Washer/Flange Height (C)',
        key: 'C',
        unit: 'mm',
        type: 'number',
        input: 'number',
        required: false,
        step: 'dimensions',
        validation: { min: 0 }
    },

    TRANS_DIA: {
        label: 'Transition Diameter',
        key: 'TRANS_DIA',
        unit: 'mm',
        type: 'number',
        input: 'number',
        required: false,
        step: 'dimensions',
        validation: { min: 0 }
    }
};

export const STEPS = [
    {
        id: 'identification',
        title: 'Identification',
        icon: Layers,
        description: 'Article, Material & Quality',
        required: true
    },
    {
        id: 'dimensions',
        title: 'Dimensions',
        icon: Ruler,
        description: 'Sizes & Lengths',
        required: true
    }
];
