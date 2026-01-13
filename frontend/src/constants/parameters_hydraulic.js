/**
 * Hydraulic Component Parameters
 * Identification and metadata fields only.
 */
import { Tag, FileText } from 'lucide-react';

export const PARAMETERS = {
    // ============ STEP 1: IDENTIFICATION ============
    IDNR: {
        label: 'ID Number',
        key: 'IDNR',
        type: 'string',
        input: 'text',
        required: true,
        step: 'identification',
        placeholder: 'e.g., 12345'
    },

    ARTICLE_ID: {
        label: 'Article Number',
        key: 'ARTICLE_ID',
        type: 'string',
        input: 'text',
        required: true,
        step: 'identification',
        placeholder: 'e.g., HYD-001'
    },

    ARTICLE_NAME: {
        label: 'Type Code',
        key: 'ARTICLE_NAME',
        type: 'string',
        input: 'text',
        required: false,
        step: 'identification',
        placeholder: 'e.g., Hydraulic Cylinder'
    },

    MANUFACTURER_NAME: {
        label: 'Manufacturer',
        key: 'MANUFACTURER_NAME',
        type: 'string',
        input: 'text',
        required: false,
        step: 'identification',
        placeholder: 'e.g., SKF'
    },

    // ============ STEP 2: DESCRIPTION ============
    LOD: {
        label: 'Level of Detail',
        key: 'LOD',
        type: 'string',
        input: 'select',
        options: ['Low', 'Medium', 'High'],
        required: false,
        step: 'description'
    },

    DESCRIPTION_SHORT: {
        label: 'Short Description',
        key: 'DESCRIPTION_SHORT',
        type: 'string',
        input: 'textarea',
        required: false,
        step: 'description',
        placeholder: 'Brief product description...'
    },

    TENDER_TEXT: {
        label: 'Tender Text',
        key: 'TENDER_TEXT',
        type: 'string',
        input: 'textarea',
        required: false,
        step: 'description',
        placeholder: 'Detailed specification text...'
    }
};

export const STEPS = [
    {
        id: 'identification',
        title: 'Identification',
        icon: Tag,
        description: 'Article & Manufacturer Info',
        required: true
    },
    {
        id: 'description',
        title: 'Description',
        icon: FileText,
        description: 'Product Details',
        required: false
    }
];
