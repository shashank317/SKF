/**
 * Product Schema Registry
 * Maps Product IDs to their specific parameter configurations.
 * This allows the configurator to switch context completely (e.g. Rails vs Bolts).
 */

import { PARAMETERS as LINEAR_PARAMS, STEPS as LINEAR_STEPS } from './parameters_linear';
import { PARAMETERS as BOLT_PARAMS, STEPS as BOLT_STEPS } from './parameters_fastener';
import { PARAMETERS as ALLEN_PARAMS, STEPS as ALLEN_STEPS } from './parameters_allen';
import { PARAMETERS as M8_PARAMS, STEPS as M8_STEPS } from './parameters_m8';
import { PARAMETERS as HYDRAULIC_PARAMS, STEPS as HYDRAULIC_STEPS } from './parameters_hydraulic';

export const SCHEMAS = {
    LINEAR_GUIDE: {
        id: 'linear_guide',
        name: 'Linear Guide System',
        steps: LINEAR_STEPS,
        parameters: LINEAR_PARAMS
    },
    HEX_BOLT: {
        id: 'hex_bolt',
        name: 'Structural Hex Bolt',
        steps: BOLT_STEPS,
        parameters: BOLT_PARAMS
    },
    ALLEN_BOLT: {
        id: 'allen_bolt',
        name: 'M10 Allen Bolt',
        steps: ALLEN_STEPS,
        parameters: ALLEN_PARAMS
    },
    M8_BOLT: {
        id: 'm8_bolt',
        name: 'M8x16 Bolt',
        steps: M8_STEPS,
        parameters: M8_PARAMS
    },
    HYDRAULIC: {
        id: 'hydraulic',
        name: 'Hydraulic Component',
        steps: HYDRAULIC_STEPS,
        parameters: HYDRAULIC_PARAMS
    }
};

export const DEFAULT_SCHEMA = 'LINEAR_GUIDE';

export const getSchemabyId = (id) => {
    return Object.values(SCHEMAS).find(s => s.id === id) || SCHEMAS[DEFAULT_SCHEMA];
};
