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
 * @interface CreateUserInputType
 */
export interface CreateUserInputType {
    /**
     * 
     * @type {string}
     * @memberof CreateUserInputType
     */
    email: string;
    /**
     * 
     * @type {string}
     * @memberof CreateUserInputType
     */
    password: string;
    /**
     * 
     * @type {string}
     * @memberof CreateUserInputType
     */
    username: string;
}

/**
 * Check if a given object implements the CreateUserInputType interface.
 */
export function instanceOfCreateUserInputType(value: object): value is CreateUserInputType {
    if (!('email' in value) || value['email'] === undefined) return false;
    if (!('password' in value) || value['password'] === undefined) return false;
    if (!('username' in value) || value['username'] === undefined) return false;
    return true;
}

export function CreateUserInputTypeFromJSON(json: any): CreateUserInputType {
    return CreateUserInputTypeFromJSONTyped(json, false);
}

export function CreateUserInputTypeFromJSONTyped(json: any, ignoreDiscriminator: boolean): CreateUserInputType {
    if (json == null) {
        return json;
    }
    return {
        
        'email': json['email'],
        'password': json['password'],
        'username': json['username'],
    };
}

export function CreateUserInputTypeToJSON(json: any): CreateUserInputType {
    return CreateUserInputTypeToJSONTyped(json, false);
}

export function CreateUserInputTypeToJSONTyped(value?: CreateUserInputType | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'email': value['email'],
        'password': value['password'],
        'username': value['username'],
    };
}

