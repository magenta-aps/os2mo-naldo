import type * as Types from '../lib/graphql/types';

import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type GetConfigQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type GetConfigQuery = { configuration: { objects: Array<{ key: string, jsonified_value: string }> } };

export type VersionQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type VersionQuery = { version: { mo_version?: string | null } };


export const GetConfigDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetConfig"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"configuration"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"objects"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"jsonified_value"}}]}}]}}]}}]} as unknown as DocumentNode<GetConfigQuery, GetConfigQueryVariables>;
export const VersionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Version"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"version"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"mo_version"}}]}}]}}]} as unknown as DocumentNode<VersionQuery, VersionQueryVariables>;