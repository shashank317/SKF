/**
 * Product Schema Registry
 * Maps Product IDs to their specific parameter configurations.
 * This allows the configurator to switch context completely (e.g. Rails vs Bolts).
 */

import { PARAMETERS as LINEAR_PARAMS, STEPS as LINEAR_STEPS } from './parameters_linear';
import { PARAMETERS as BOLT_PARAMS, STEPS as BOLT_STEPS } from './parameters_fastener';

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
    }
};

export const DEFAULT_SCHEMA = 'LINEAR_GUIDE';

export const getSchemabyId = (id) => {
    return Object.values(SCHEMAS).find(s => s.id === id) || SCHEMAS[DEFAULT_SCHEMA];
};
