/* tslint:disable */
/* eslint-disable */
/**
 * Kinnema
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: 1.0.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { mapValues } from '../runtime';
/**
 * 
 * @export
 * @interface WatchProviderInnerSchema
 */
export interface WatchProviderInnerSchema {
    /**
     * 
     * @type {string}
     * @memberof WatchProviderInnerSchema
     */
    name?: string;
    /**
     * 
     * @type {number}
     * @memberof WatchProviderInnerSchema
     */
    priority?: number;
    /**
     * 
     * @type {boolean}
     * @memberof WatchProviderInnerSchema
     */
    isEnabled?: boolean;
}

/**
 * Check if a given object implements the WatchProviderInnerSchema interface.
 */
export function instanceOfWatchProviderInnerSchema(value: object): value is WatchProviderInnerSchema {
    return true;
}

export function WatchProviderInnerSchemaFromJSON(json: any): WatchProviderInnerSchema {
    return WatchProviderInnerSchemaFromJSONTyped(json, false);
}

export function WatchProviderInnerSchemaFromJSONTyped(json: any, ignoreDiscriminator: boolean): WatchProviderInnerSchema {
    if (json == null) {
        return json;
    }
    return {
        
        'name': json['name'] == null ? undefined : json['name'],
        'priority': json['priority'] == null ? undefined : json['priority'],
        'isEnabled': json['isEnabled'] == null ? undefined : json['isEnabled'],
    };
}

export function WatchProviderInnerSchemaToJSON(json: any): WatchProviderInnerSchema {
    return WatchProviderInnerSchemaToJSONTyped(json, false);
}

export function WatchProviderInnerSchemaToJSONTyped(value?: WatchProviderInnerSchema | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'name': value['name'],
        'priority': value['priority'],
        'isEnabled': value['isEnabled'],
    };
}

