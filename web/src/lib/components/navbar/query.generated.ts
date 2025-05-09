import type * as Types from '../../graphql/types';

import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type VersionQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type VersionQuery = { version: { mo_version?: string | null } };


export const VersionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Version"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"version"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"mo_version"}}]}}]}}]} as unknown as DocumentNode<VersionQuery, VersionQueryVariables>;