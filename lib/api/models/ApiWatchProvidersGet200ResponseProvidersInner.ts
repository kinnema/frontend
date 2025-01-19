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
 * @interface ApiWatchProvidersGet200ResponseProvidersInner
 */
export interface ApiWatchProvidersGet200ResponseProvidersInner {
    /**
     * 
     * @type {string}
     * @memberof ApiWatchProvidersGet200ResponseProvidersInner
     */
    name?: string;
    /**
     * 
     * @type {number}
     * @memberof ApiWatchProvidersGet200ResponseProvidersInner
     */
    priority?: number;
    /**
     * 
     * @type {boolean}
     * @memberof ApiWatchProvidersGet200ResponseProvidersInner
     */
    isEnabled?: boolean;
    /**
     * 
     * @type {string}
     * @memberof ApiWatchProvidersGet200ResponseProvidersInner
     */
    providerUrl?: string;
}

/**
 * Check if a given object implements the ApiWatchProvidersGet200ResponseProvidersInner interface.
 */
export function instanceOfApiWatchProvidersGet200ResponseProvidersInner(value: object): value is ApiWatchProvidersGet200ResponseProvidersInner {
    return true;
}

export function ApiWatchProvidersGet200ResponseProvidersInnerFromJSON(json: any): ApiWatchProvidersGet200ResponseProvidersInner {
    return ApiWatchProvidersGet200ResponseProvidersInnerFromJSONTyped(json, false);
}

export function ApiWatchProvidersGet200ResponseProvidersInnerFromJSONTyped(json: any, ignoreDiscriminator: boolean): ApiWatchProvidersGet200ResponseProvidersInner {
    if (json == null) {
        return json;
    }
    return {
        
        'name': json['name'] == null ? undefined : json['name'],
        'priority': json['priority'] == null ? undefined : json['priority'],
        'isEnabled': json['isEnabled'] == null ? undefined : json['isEnabled'],
        'providerUrl': json['providerUrl'] == null ? undefined : json['providerUrl'],
    };
}

export function ApiWatchProvidersGet200ResponseProvidersInnerToJSON(json: any): ApiWatchProvidersGet200ResponseProvidersInner {
    return ApiWatchProvidersGet200ResponseProvidersInnerToJSONTyped(json, false);
}

export function ApiWatchProvidersGet200ResponseProvidersInnerToJSONTyped(value?: ApiWatchProvidersGet200ResponseProvidersInner | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'name': value['name'],
        'priority': value['priority'],
        'isEnabled': value['isEnabled'],
        'providerUrl': value['providerUrl'],
    };
}

