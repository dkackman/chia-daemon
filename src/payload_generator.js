import yaml from 'js-yaml';
import fs from 'fs';
import path from 'path';
import _ from 'lodash';
import { fileURLToPath } from 'url';

/* jshint ignore:start */
const __dirname = path.dirname(fileURLToPath(import.meta.url));
/* jshint ignore:end */

export function makePayload(service, endpoint) {
    const properties = getPayloadDescriptor(service, endpoint);
    if (Object.keys(properties).length === 0) {
        return undefined;
    }

    const payload = {};
    Object.entries(properties).forEach(function ([property, typeDef]) {
        payload[property] = getDefaultValue(typeDef);
    });
    return payload;
}

export function getPayloadDescriptor(service, endpoint) {
    const spec = yaml.load(fs.readFileSync(path.resolve(__dirname, `openapi/${service}.yaml`), 'utf8'));
    const p = spec.paths[`/${endpoint}`]; // path names will have the slash in them
    if (_.isNil(p)) {
        return undefined;
    }

    return _.get(p, 'post.requestBody.content.application/json.schema.properties', {});
}

function getDefaultValue(typeDef) {
    if (typeDef.default !== undefined) {
        return typeDef.default;
    }

    if (typeDef.type === 'integer') {
        return 0;
    }

    if (typeDef.type === 'number') {
        return  0.0;
    }

    if (typeDef.type === 'string') {
        return '';
    }

    if (typeDef.type === 'boolean') {
        return false;
    }

    if (typeDef.type === 'object') {
        return getDefaultValue(typeDef.properties);
    }

    return {};
}
