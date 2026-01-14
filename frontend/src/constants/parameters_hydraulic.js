/**
 * Hydraulic Component Parameters - RainSystem AF 150-2
 * Based on Wilo RainSystem specifications.
 */
import { Tag, Droplets, Zap, Gauge, Box } from 'lucide-react';

export const PARAMETERS = {
    // ============ STEP 1: IDENTIFICATION ============
    ARTICLE_NAME: {
        label: 'Product Name',
        key: 'ARTICLE_NAME',
        type: 'string',
        input: 'text',
        defaultValue: 'RainSystem AF 150-2 Medana',
        required: true,
        step: 'identification'
    },
    MANUFACTURER: {
        label: 'Manufacturer',
        key: 'MANUFACTURER',
        type: 'string',
        input: 'text',
        defaultValue: 'WILO SE',
        readOnly: true, // Fixed for this system
        step: 'identification'
    },
    IDNR: {
        label: 'Article Number',
        key: 'IDNR',
        type: 'string',
        input: 'select',
        options: ['4254792', '4254793', '4254794', '4254795'],
        defaultValue: '4254792',
        description: 'Select specific SKU variant',
        step: 'identification'
    },

    // ============ STEP 2: HYDRAULIC SPECS ============
    RESERVOIR_VOLUME: {
        label: 'Reservoir Volume (L)',
        key: 'RESERVOIR_VOLUME',
        type: 'number',
        input: 'number',
        defaultValue: 150,
        min: 100,
        max: 500,
        step: 'hydraulics',
        description: 'Main replenishment reservoir capacity'
    },
    PUMP_TYPE: {
        label: 'Pump Type',
        key: 'PUMP_TYPE',
        type: 'string',
        input: 'select',
        options: ['Medana CH1-LSP', 'Medana CH1-LCV', 'Helix V'],
        defaultValue: 'Medana CH1-LSP',
        step: 'hydraulics'
    },
    EXPANSION_TANK: {
        label: 'Expansion Tank (L)',
        key: 'EXPANSION_TANK',
        type: 'number',
        input: 'number',
        defaultValue: 8,
        step: 'hydraulics',
        description: 'Diaphragm expansion tank volume'
    },

    // ============ STEP 3: ELECTRICS & CONTROL ============
    MOTOR_CLASS: {
        label: 'Motor Efficiency',
        key: 'MOTOR_CLASS',
        type: 'string',
        input: 'select',
        options: ['IE2', 'IE3', 'IE4'],
        defaultValue: 'IE2',
        step: 'electrics'
    },
    CONTROL_UNIT: {
        label: 'Control Unit',
        key: 'CONTROL_UNIT',
        type: 'string',
        input: 'text',
        defaultValue: 'EC-Rain Easy Control',
        step: 'electrics'
    },
    SENSOR_RANGE: {
        label: 'Sensor Range (m)',
        key: 'SENSOR_RANGE',
        type: 'string',
        input: 'text',
        defaultValue: '0 - 5 m',
        step: 'electrics'
    },
    VOLTAGE: {
        label: 'Voltage (V)',
        key: 'VOLTAGE',
        type: 'number',
        input: 'number',
        defaultValue: 230,
        step: 'electrics',
        unit: 'V'
    },
    SPEED: {
        label: 'Speed (RPM)',
        key: 'SPEED',
        type: 'number',
        input: 'number',
        defaultValue: 2900,
        step: 'electrics',
        unit: 'rpm'
    }
};

export const STEPS = [
    {
        id: 'identification',
        title: 'Identification',
        icon: Tag,
        description: 'Product Selection',
        required: true
    },
    {
        id: 'hydraulics',
        title: 'Hydraulics',
        icon: Droplets,
        description: 'Tank & Pump Specs',
        required: true
    },
    {
        id: 'electrics',
        title: 'Electrics',
        icon: Zap,
        description: 'Motor & Control',
        required: false
    }
];
