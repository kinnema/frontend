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
 * @interface LastWatchedPatchSchemaInputType
 */
export interface LastWatchedPatchSchemaInputType {
    /**
     * 
     * @type {number}
     * @memberof LastWatchedPatchSchemaInputType
     */
    season?: number | null;
    /**
     * 
     * @type {number}
     * @memberof LastWatchedPatchSchemaInputType
     */
    episode?: number | null;
    /**
     * 
     * @type {boolean}
     * @memberof LastWatchedPatchSchemaInputType
     */
    isWatched?: boolean | null;
    /**
     * 
     * @type {number}
     * @memberof LastWatchedPatchSchemaInputType
     */
    atSecond?: number | null;
}

/**
 * Check if a given object implements the LastWatchedPatchSchemaInputType interface.
 */
export function instanceOfLastWatchedPatchSchemaInputType(value: object): value is LastWatchedPatchSchemaInputType {
    return true;
}

export function LastWatchedPatchSchemaInputTypeFromJSON(json: any): LastWatchedPatchSchemaInputType {
    return LastWatchedPatchSchemaInputTypeFromJSONTyped(json, false);
}

export function LastWatchedPatchSchemaInputTypeFromJSONTyped(json: any, ignoreDiscriminator: boolean): LastWatchedPatchSchemaInputType {
    if (json == null) {
        return json;
    }
    return {
        
        'season': json['season'] == null ? undefined : json['season'],
        'episode': json['episode'] == null ? undefined : json['episode'],
        'isWatched': json['isWatched'] == null ? undefined : json['isWatched'],
        'atSecond': json['atSecond'] == null ? undefined : json['atSecond'],
    };
}

export function LastWatchedPatchSchemaInputTypeToJSON(json: any): LastWatchedPatchSchemaInputType {
    return LastWatchedPatchSchemaInputTypeToJSONTyped(json, false);
}

export function LastWatchedPatchSchemaInputTypeToJSONTyped(value?: LastWatchedPatchSchemaInputType | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'season': value['season'],
        'episode': value['episode'],
        'isWatched': value['isWatched'],
        'atSecond': value['atSecond'],
    };
}

