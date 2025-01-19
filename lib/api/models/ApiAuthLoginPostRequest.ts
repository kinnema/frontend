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
 * @interface ApiAuthLoginPostRequest
 */
export interface ApiAuthLoginPostRequest {
    /**
     * 
     * @type {string}
     * @memberof ApiAuthLoginPostRequest
     */
    email: string;
    /**
     * 
     * @type {string}
     * @memberof ApiAuthLoginPostRequest
     */
    password: string;
}

/**
 * Check if a given object implements the ApiAuthLoginPostRequest interface.
 */
export function instanceOfApiAuthLoginPostRequest(value: object): value is ApiAuthLoginPostRequest {
    if (!('email' in value) || value['email'] === undefined) return false;
    if (!('password' in value) || value['password'] === undefined) return false;
    return true;
}

export function ApiAuthLoginPostRequestFromJSON(json: any): ApiAuthLoginPostRequest {
    return ApiAuthLoginPostRequestFromJSONTyped(json, false);
}

export function ApiAuthLoginPostRequestFromJSONTyped(json: any, ignoreDiscriminator: boolean): ApiAuthLoginPostRequest {
    if (json == null) {
        return json;
    }
    return {
        
        'email': json['email'],
        'password': json['password'],
    };
}

export function ApiAuthLoginPostRequestToJSON(json: any): ApiAuthLoginPostRequest {
    return ApiAuthLoginPostRequestToJSONTyped(json, false);
}

export function ApiAuthLoginPostRequestToJSONTyped(value?: ApiAuthLoginPostRequest | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'email': value['email'],
        'password': value['password'],
    };
}

