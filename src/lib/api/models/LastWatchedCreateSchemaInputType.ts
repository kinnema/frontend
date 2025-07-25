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
 * @interface LastWatchedCreateSchemaInputType
 */
export interface LastWatchedCreateSchemaInputType {
    /**
     * 
     * @type {number}
     * @memberof LastWatchedCreateSchemaInputType
     */
    tmdbId: number;
    /**
     * 
     * @type {string}
     * @memberof LastWatchedCreateSchemaInputType
     */
    name: string;
    /**
     * 
     * @type {string}
     * @memberof LastWatchedCreateSchemaInputType
     */
    posterPath: string;
    /**
     * 
     * @type {number}
     * @memberof LastWatchedCreateSchemaInputType
     */
    season: number;
    /**
     * 
     * @type {number}
     * @memberof LastWatchedCreateSchemaInputType
     */
    episode: number;
    /**
     * 
     * @type {boolean}
     * @memberof LastWatchedCreateSchemaInputType
     */
    isWatched?: boolean | null;
    /**
     * 
     * @type {number}
     * @memberof LastWatchedCreateSchemaInputType
     */
    atSecond: number;
    /**
     * 
     * @type {number}
     * @memberof LastWatchedCreateSchemaInputType
     */
    totalSeconds: number;
    /**
     * 
     * @type {string}
     * @memberof LastWatchedCreateSchemaInputType
     */
    episodeName: string;
    /**
     * 
     * @type {number}
     * @memberof LastWatchedCreateSchemaInputType
     */
    network: number;
}

/**
 * Check if a given object implements the LastWatchedCreateSchemaInputType interface.
 */
export function instanceOfLastWatchedCreateSchemaInputType(value: object): value is LastWatchedCreateSchemaInputType {
    if (!('tmdbId' in value) || value['tmdbId'] === undefined) return false;
    if (!('name' in value) || value['name'] === undefined) return false;
    if (!('posterPath' in value) || value['posterPath'] === undefined) return false;
    if (!('season' in value) || value['season'] === undefined) return false;
    if (!('episode' in value) || value['episode'] === undefined) return false;
    if (!('atSecond' in value) || value['atSecond'] === undefined) return false;
    if (!('totalSeconds' in value) || value['totalSeconds'] === undefined) return false;
    if (!('episodeName' in value) || value['episodeName'] === undefined) return false;
    if (!('network' in value) || value['network'] === undefined) return false;
    return true;
}

export function LastWatchedCreateSchemaInputTypeFromJSON(json: any): LastWatchedCreateSchemaInputType {
    return LastWatchedCreateSchemaInputTypeFromJSONTyped(json, false);
}

export function LastWatchedCreateSchemaInputTypeFromJSONTyped(json: any, ignoreDiscriminator: boolean): LastWatchedCreateSchemaInputType {
    if (json == null) {
        return json;
    }
    return {
        
        'tmdbId': json['tmdbId'],
        'name': json['name'],
        'posterPath': json['poster_path'],
        'season': json['season'],
        'episode': json['episode'],
        'isWatched': json['isWatched'] == null ? undefined : json['isWatched'],
        'atSecond': json['atSecond'],
        'totalSeconds': json['totalSeconds'],
        'episodeName': json['episode_name'],
        'network': json['network'],
    };
}

export function LastWatchedCreateSchemaInputTypeToJSON(json: any): LastWatchedCreateSchemaInputType {
    return LastWatchedCreateSchemaInputTypeToJSONTyped(json, false);
}

export function LastWatchedCreateSchemaInputTypeToJSONTyped(value?: LastWatchedCreateSchemaInputType | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'tmdbId': value['tmdbId'],
        'name': value['name'],
        'poster_path': value['posterPath'],
        'season': value['season'],
        'episode': value['episode'],
        'isWatched': value['isWatched'],
        'atSecond': value['atSecond'],
        'totalSeconds': value['totalSeconds'],
        'episode_name': value['episodeName'],
        'network': value['network'],
    };
}

