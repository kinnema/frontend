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
 * @interface Def3
 */
export interface Def3 {
    /**
     * 
     * @type {string}
     * @memberof Def3
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof Def3
     */
    username: string;
    /**
     * 
     * @type {string}
     * @memberof Def3
     */
    email: string;
}

/**
 * Check if a given object implements the Def3 interface.
 */
export function instanceOfDef3(value: object): value is Def3 {
    if (!('id' in value) || value['id'] === undefined) return false;
    if (!('username' in value) || value['username'] === undefined) return false;
    if (!('email' in value) || value['email'] === undefined) return false;
    return true;
}

export function Def3FromJSON(json: any): Def3 {
    return Def3FromJSONTyped(json, false);
}

export function Def3FromJSONTyped(json: any, ignoreDiscriminator: boolean): Def3 {
    if (json == null) {
        return json;
    }
    return {
        
        'id': json['id'],
        'username': json['username'],
        'email': json['email'],
    };
}

export function Def3ToJSON(json: any): Def3 {
    return Def3ToJSONTyped(json, false);
}

export function Def3ToJSONTyped(value?: Def3 | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'id': value['id'],
        'username': value['username'],
        'email': value['email'],
    };
}

