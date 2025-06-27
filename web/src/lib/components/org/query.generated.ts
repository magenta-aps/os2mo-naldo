import type * as Types from '../../graphql/types';

import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type GetBreadcrumbsQueryVariables = Types.Exact<{
  uuid?: Types.InputMaybe<Array<Types.Scalars['UUID']['input']> | Types.Scalars['UUID']['input']>;
  currentDate?: Types.InputMaybe<Types.Scalars['DateTime']['input']>;
}>;


export type GetBreadcrumbsQuery = { org_units: { objects: Array<{ current?: { ancestors: Array<{ name: string, uuid: any }> } | null }> } };


export const GetBreadcrumbsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetBreadcrumbs"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"uuid"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"currentDate"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"org_units"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"uuids"},"value":{"kind":"Variable","name":{"kind":"Name","value":"uuid"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"from_date"},"value":{"kind":"Variable","name":{"kind":"Name","value":"currentDate"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"objects"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"current"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"at"},"value":{"kind":"Variable","name":{"kind":"Name","value":"currentDate"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"ancestors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"uuid"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetBreadcrumbsQuery, GetBreadcrumbsQueryVariables>;