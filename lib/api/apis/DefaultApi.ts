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


import * as runtime from '../runtime';
import type {
  ApiAuthLoginPost200Response,
  ApiAuthLoginPostRequest,
  ApiFavoritesGet200ResponseInner,
  ApiFavoritesPostRequest,
  ApiLastWatchedTmdbIdGet404Response,
  CreateUserInputType,
  LastWatchedCreateSchemaInputType,
  LastWatchedCreateSchemaOutputType,
  LastWatchedPatchSchemaInputType,
  LastWatchedPatchSchemaOutputType,
  LastWatchedSchemaOutputType,
} from '../models/index';
import {
    ApiAuthLoginPost200ResponseFromJSON,
    ApiAuthLoginPost200ResponseToJSON,
    ApiAuthLoginPostRequestFromJSON,
    ApiAuthLoginPostRequestToJSON,
    ApiFavoritesGet200ResponseInnerFromJSON,
    ApiFavoritesGet200ResponseInnerToJSON,
    ApiFavoritesPostRequestFromJSON,
    ApiFavoritesPostRequestToJSON,
    ApiLastWatchedTmdbIdGet404ResponseFromJSON,
    ApiLastWatchedTmdbIdGet404ResponseToJSON,
    CreateUserInputTypeFromJSON,
    CreateUserInputTypeToJSON,
    LastWatchedCreateSchemaInputTypeFromJSON,
    LastWatchedCreateSchemaInputTypeToJSON,
    LastWatchedCreateSchemaOutputTypeFromJSON,
    LastWatchedCreateSchemaOutputTypeToJSON,
    LastWatchedPatchSchemaInputTypeFromJSON,
    LastWatchedPatchSchemaInputTypeToJSON,
    LastWatchedPatchSchemaOutputTypeFromJSON,
    LastWatchedPatchSchemaOutputTypeToJSON,
    LastWatchedSchemaOutputTypeFromJSON,
    LastWatchedSchemaOutputTypeToJSON,
} from '../models/index';

export interface ApiAuthLoginPostOperationRequest {
    apiAuthLoginPostRequest: ApiAuthLoginPostRequest;
}

export interface ApiAuthRegisterPostRequest {
    createUserInputType: CreateUserInputType;
}

export interface ApiFavoritesIdDeleteRequest {
    id: string;
}

export interface ApiFavoritesPostOperationRequest {
    apiFavoritesPostRequest: ApiFavoritesPostRequest;
}

export interface ApiLastWatchedIdDeleteRequest {
    id: string;
}

export interface ApiLastWatchedIdPatchRequest {
    id: string;
    lastWatchedPatchSchemaInputType?: LastWatchedPatchSchemaInputType;
}

export interface ApiLastWatchedPostRequest {
    lastWatchedCreateSchemaInputType: LastWatchedCreateSchemaInputType;
}

export interface ApiLastWatchedTmdbIdGetRequest {
    tmdbId: number;
}

/**
 * 
 */
export class DefaultApi extends runtime.BaseAPI {

    /**
     */
    async apiAuthGetRaw(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>> {
        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        const response = await this.request({
            path: `/api/auth/`,
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.VoidApiResponse(response);
    }

    /**
     */
    async apiAuthGet(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void> {
        await this.apiAuthGetRaw(initOverrides);
    }

    /**
     */
    async apiAuthLoginPostRaw(requestParameters: ApiAuthLoginPostOperationRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<ApiAuthLoginPost200Response>> {
        if (requestParameters['apiAuthLoginPostRequest'] == null) {
            throw new runtime.RequiredError(
                'apiAuthLoginPostRequest',
                'Required parameter "apiAuthLoginPostRequest" was null or undefined when calling apiAuthLoginPost().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        const response = await this.request({
            path: `/api/auth/login`,
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: ApiAuthLoginPostRequestToJSON(requestParameters['apiAuthLoginPostRequest']),
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => ApiAuthLoginPost200ResponseFromJSON(jsonValue));
    }

    /**
     */
    async apiAuthLoginPost(requestParameters: ApiAuthLoginPostOperationRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<ApiAuthLoginPost200Response> {
        const response = await this.apiAuthLoginPostRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     */
    async apiAuthLogoutDeleteRaw(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>> {
        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        const response = await this.request({
            path: `/api/auth/logout`,
            method: 'DELETE',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.VoidApiResponse(response);
    }

    /**
     */
    async apiAuthLogoutDelete(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void> {
        await this.apiAuthLogoutDeleteRaw(initOverrides);
    }

    /**
     */
    async apiAuthRegisterPostRaw(requestParameters: ApiAuthRegisterPostRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>> {
        if (requestParameters['createUserInputType'] == null) {
            throw new runtime.RequiredError(
                'createUserInputType',
                'Required parameter "createUserInputType" was null or undefined when calling apiAuthRegisterPost().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        const response = await this.request({
            path: `/api/auth/register`,
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: CreateUserInputTypeToJSON(requestParameters['createUserInputType']),
        }, initOverrides);

        return new runtime.VoidApiResponse(response);
    }

    /**
     */
    async apiAuthRegisterPost(requestParameters: ApiAuthRegisterPostRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void> {
        await this.apiAuthRegisterPostRaw(requestParameters, initOverrides);
    }

    /**
     */
    async apiFavoritesGetRaw(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Array<ApiFavoritesGet200ResponseInner>>> {
        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        const response = await this.request({
            path: `/api/favorites/`,
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => jsonValue.map(ApiFavoritesGet200ResponseInnerFromJSON));
    }

    /**
     */
    async apiFavoritesGet(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Array<ApiFavoritesGet200ResponseInner>> {
        const response = await this.apiFavoritesGetRaw(initOverrides);
        return await response.value();
    }

    /**
     */
    async apiFavoritesIdDeleteRaw(requestParameters: ApiFavoritesIdDeleteRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<ApiFavoritesGet200ResponseInner>> {
        if (requestParameters['id'] == null) {
            throw new runtime.RequiredError(
                'id',
                'Required parameter "id" was null or undefined when calling apiFavoritesIdDelete().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        const response = await this.request({
            path: `/api/favorites/{id}`.replace(`{${"id"}}`, encodeURIComponent(String(requestParameters['id']))),
            method: 'DELETE',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => ApiFavoritesGet200ResponseInnerFromJSON(jsonValue));
    }

    /**
     */
    async apiFavoritesIdDelete(requestParameters: ApiFavoritesIdDeleteRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<ApiFavoritesGet200ResponseInner> {
        const response = await this.apiFavoritesIdDeleteRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     */
    async apiFavoritesPostRaw(requestParameters: ApiFavoritesPostOperationRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<ApiFavoritesGet200ResponseInner>> {
        if (requestParameters['apiFavoritesPostRequest'] == null) {
            throw new runtime.RequiredError(
                'apiFavoritesPostRequest',
                'Required parameter "apiFavoritesPostRequest" was null or undefined when calling apiFavoritesPost().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        const response = await this.request({
            path: `/api/favorites/`,
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: ApiFavoritesPostRequestToJSON(requestParameters['apiFavoritesPostRequest']),
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => ApiFavoritesGet200ResponseInnerFromJSON(jsonValue));
    }

    /**
     */
    async apiFavoritesPost(requestParameters: ApiFavoritesPostOperationRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<ApiFavoritesGet200ResponseInner> {
        const response = await this.apiFavoritesPostRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     */
    async apiLastWatchedGetRaw(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Array<LastWatchedSchemaOutputType>>> {
        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        const response = await this.request({
            path: `/api/last_watched/`,
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => jsonValue.map(LastWatchedSchemaOutputTypeFromJSON));
    }

    /**
     */
    async apiLastWatchedGet(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Array<LastWatchedSchemaOutputType>> {
        const response = await this.apiLastWatchedGetRaw(initOverrides);
        return await response.value();
    }

    /**
     */
    async apiLastWatchedIdDeleteRaw(requestParameters: ApiLastWatchedIdDeleteRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>> {
        if (requestParameters['id'] == null) {
            throw new runtime.RequiredError(
                'id',
                'Required parameter "id" was null or undefined when calling apiLastWatchedIdDelete().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        const response = await this.request({
            path: `/api/last_watched/{id}`.replace(`{${"id"}}`, encodeURIComponent(String(requestParameters['id']))),
            method: 'DELETE',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.VoidApiResponse(response);
    }

    /**
     */
    async apiLastWatchedIdDelete(requestParameters: ApiLastWatchedIdDeleteRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void> {
        await this.apiLastWatchedIdDeleteRaw(requestParameters, initOverrides);
    }

    /**
     */
    async apiLastWatchedIdPatchRaw(requestParameters: ApiLastWatchedIdPatchRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<LastWatchedPatchSchemaOutputType>> {
        if (requestParameters['id'] == null) {
            throw new runtime.RequiredError(
                'id',
                'Required parameter "id" was null or undefined when calling apiLastWatchedIdPatch().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        const response = await this.request({
            path: `/api/last_watched/{id}`.replace(`{${"id"}}`, encodeURIComponent(String(requestParameters['id']))),
            method: 'PATCH',
            headers: headerParameters,
            query: queryParameters,
            body: LastWatchedPatchSchemaInputTypeToJSON(requestParameters['lastWatchedPatchSchemaInputType']),
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => LastWatchedPatchSchemaOutputTypeFromJSON(jsonValue));
    }

    /**
     */
    async apiLastWatchedIdPatch(requestParameters: ApiLastWatchedIdPatchRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<LastWatchedPatchSchemaOutputType> {
        const response = await this.apiLastWatchedIdPatchRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     */
    async apiLastWatchedPostRaw(requestParameters: ApiLastWatchedPostRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<LastWatchedCreateSchemaOutputType>> {
        if (requestParameters['lastWatchedCreateSchemaInputType'] == null) {
            throw new runtime.RequiredError(
                'lastWatchedCreateSchemaInputType',
                'Required parameter "lastWatchedCreateSchemaInputType" was null or undefined when calling apiLastWatchedPost().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        const response = await this.request({
            path: `/api/last_watched/`,
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: LastWatchedCreateSchemaInputTypeToJSON(requestParameters['lastWatchedCreateSchemaInputType']),
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => LastWatchedCreateSchemaOutputTypeFromJSON(jsonValue));
    }

    /**
     */
    async apiLastWatchedPost(requestParameters: ApiLastWatchedPostRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<LastWatchedCreateSchemaOutputType> {
        const response = await this.apiLastWatchedPostRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     */
    async apiLastWatchedTmdbIdGetRaw(requestParameters: ApiLastWatchedTmdbIdGetRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<LastWatchedSchemaOutputType>> {
        if (requestParameters['tmdbId'] == null) {
            throw new runtime.RequiredError(
                'tmdbId',
                'Required parameter "tmdbId" was null or undefined when calling apiLastWatchedTmdbIdGet().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        const response = await this.request({
            path: `/api/last_watched/{tmdbId}`.replace(`{${"tmdbId"}}`, encodeURIComponent(String(requestParameters['tmdbId']))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => LastWatchedSchemaOutputTypeFromJSON(jsonValue));
    }

    /**
     */
    async apiLastWatchedTmdbIdGet(requestParameters: ApiLastWatchedTmdbIdGetRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<LastWatchedSchemaOutputType> {
        const response = await this.apiLastWatchedTmdbIdGetRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     */
    async openapiYamlGetRaw(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>> {
        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        const response = await this.request({
            path: `/openapi.yaml/`,
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.VoidApiResponse(response);
    }

    /**
     */
    async openapiYamlGet(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void> {
        await this.openapiYamlGetRaw(initOverrides);
    }

}
