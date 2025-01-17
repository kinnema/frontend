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
 * @interface Def2
 */
export interface Def2 {
    /**
     * 
     * @type {string}
     * @memberof Def2
     */
    email: string;
    /**
     * 
     * @type {string}
     * @memberof Def2
     */
    password: string;
}

/**
 * Check if a given object implements the Def2 interface.
 */
export function instanceOfDef2(value: object): value is Def2 {
    if (!('email' in value) || value['email'] === undefined) return false;
    if (!('password' in value) || value['password'] === undefined) return false;
    return true;
}

export function Def2FromJSON(json: any): Def2 {
    return Def2FromJSONTyped(json, false);
}

export function Def2FromJSONTyped(json: any, ignoreDiscriminator: boolean): Def2 {
    if (json == null) {
        return json;
    }
    return {
        
        'email': json['email'],
        'password': json['password'],
    };
}

export function Def2ToJSON(json: any): Def2 {
    return Def2ToJSONTyped(json, false);
}

export function Def2ToJSONTyped(value?: Def2 | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'email': value['email'],
        'password': value['password'],
    };
}

