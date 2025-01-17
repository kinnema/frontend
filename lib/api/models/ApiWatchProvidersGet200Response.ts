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
import type { ApiWatchProvidersGet200ResponseProvidersInner } from './ApiWatchProvidersGet200ResponseProvidersInner';
import {
    ApiWatchProvidersGet200ResponseProvidersInnerFromJSON,
    ApiWatchProvidersGet200ResponseProvidersInnerFromJSONTyped,
    ApiWatchProvidersGet200ResponseProvidersInnerToJSON,
    ApiWatchProvidersGet200ResponseProvidersInnerToJSONTyped,
} from './ApiWatchProvidersGet200ResponseProvidersInner';

/**
 * 
 * @export
 * @interface ApiWatchProvidersGet200Response
 */
export interface ApiWatchProvidersGet200Response {
    /**
     * 
     * @type {Array<ApiWatchProvidersGet200ResponseProvidersInner>}
     * @memberof ApiWatchProvidersGet200Response
     */
    providers?: Array<ApiWatchProvidersGet200ResponseProvidersInner>;
}

/**
 * Check if a given object implements the ApiWatchProvidersGet200Response interface.
 */
export function instanceOfApiWatchProvidersGet200Response(value: object): value is ApiWatchProvidersGet200Response {
    return true;
}

export function ApiWatchProvidersGet200ResponseFromJSON(json: any): ApiWatchProvidersGet200Response {
    return ApiWatchProvidersGet200ResponseFromJSONTyped(json, false);
}

export function ApiWatchProvidersGet200ResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): ApiWatchProvidersGet200Response {
    if (json == null) {
        return json;
    }
    return {
        
        'providers': json['providers'] == null ? undefined : ((json['providers'] as Array<any>).map(ApiWatchProvidersGet200ResponseProvidersInnerFromJSON)),
    };
}

export function ApiWatchProvidersGet200ResponseToJSON(json: any): ApiWatchProvidersGet200Response {
    return ApiWatchProvidersGet200ResponseToJSONTyped(json, false);
}

export function ApiWatchProvidersGet200ResponseToJSONTyped(value?: ApiWatchProvidersGet200Response | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'providers': value['providers'] == null ? undefined : ((value['providers'] as Array<any>).map(ApiWatchProvidersGet200ResponseProvidersInnerToJSON)),
    };
}

