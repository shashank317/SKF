/**
 * Fastener (Bolt) Parameters
 * M16 Hex Bolt Domain Logic
 */
import { Tag, Ruler, Settings } from 'lucide-react';

export const PARAMETERS = {
    // ============ STEP 1: IDENTIFICATION ============
    THREAD_SIZE: {
        label: 'Thread Size',
        key: 'THREAD_SIZE',
        type: 'string',
        input: 'select',
        options: ['M16'],
        required: true,
        step: 'identification'
    },

    STANDARD: {
        label: 'Standard',
        key: 'STANDARD',
        type: 'string',
        input: 'select',
        options: ['ISO 4014', 'ISO 4017'],
        required: true,
        step: 'identification'
    },

    // ============ STEP 2: GEOMETRY ============
    // Core ISO dimensions
    LENGTH_L: {
        label: 'Bolt Length (L)',
        key: 'L',
        unit: 'mm',
        type: 'number',
        input: 'number',
        required: true,
        step: 'geometry',
        validation: { min: 10, max: 300 }
    },

    HEAD_WIDTH_S: {
        label: 'Hex Width (s)',
        key: 'S',
        unit: 'mm',
        type: 'number',
        input: 'number',
        required: true,
        step: 'geometry',
        validation: { min: 24, max: 24 }, // Fixed for M16
        placeholder: '24'
    },

    HEAD_HEIGHT_K: {
        label: 'Head Height (k)',
        key: 'K',
        unit: 'mm',
        type: 'number',
        input: 'number',
        required: true,
        step: 'geometry',
        validation: { min: 10, max: 10 }, // Fixed for M16
        placeholder: '10'
    },

    // ============ STEP 3: THREAD ============
    THREAD_PITCH: {
        label: 'Thread Pitch',
        key: 'P',
        unit: 'mm',
        type: 'number',
        input: 'select',
        options: [2.0, 1.5],
        required: true,
        step: 'thread'
    },

    THREAD_LENGTH: {
        label: 'Thread Length',
        key: 'LT',
        unit: 'mm',
        type: 'number',
        input: 'number',
        required: true,
        step: 'thread',
        validation: { min: 10 }
    },

    THREAD_TYPE: {
        label: 'Thread Type',
        key: 'THREAD_TYPE',
        type: 'string',
        input: 'select',
        options: ['coarse', 'fine'],
        required: true,
        step: 'thread'
    }
};

export const STEPS = [
    {
        id: 'identification',
        title: 'Identification',
        icon: Tag,
        description: 'Standard & Thread Size',
        required: true
    },
    {
        id: 'geometry',
        title: 'Geometry',
        icon: Ruler,
        description: 'Length & Head Dimensions',
        required: true
    },
    {
        id: 'thread',
        title: 'Thread',
        icon: Settings,
        description: 'Pitch & Threading Specs',
        required: true
    }
];
