import type * as Types from '../../../../../../lib/graphql/types';

import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type ItUsersQueryVariables = Types.Exact<{
  uuid?: Types.InputMaybe<Array<Types.Scalars['UUID']['input']> | Types.Scalars['UUID']['input']>;
}>;


export type ItUsersQuery = { __typename?: 'Query', itusers: Array<{ __typename?: 'ITUserResponse', uuid: any, objects: Array<{ __typename?: 'ITUser', uuid?: any | null, primary_uuid?: any | null, user_key?: string | null, itsystem: { __typename?: 'ITSystem', name: string, uuid?: any | null }, validity: { __typename?: 'Validity', from: any, to?: any | null } }> }>, itsystems: Array<{ __typename?: 'ITSystem', name: string, uuid?: any | null }> };

export type UpdateItUserMutationVariables = Types.Exact<{
  input: Types.ItUserUpdateInput;
}>;


export type UpdateItUserMutation = { __typename?: 'Mutation', ituser_update: { __typename?: 'ITUserResponse', uuid: any } };


export const ItUsersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ITUsers"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"uuid"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"itusers"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"uuids"},"value":{"kind":"Variable","name":{"kind":"Name","value":"uuid"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"uuid"}},{"kind":"Field","name":{"kind":"Name","value":"objects"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"uuid"}},{"kind":"Field","name":{"kind":"Name","value":"primary_uuid"}},{"kind":"Field","name":{"kind":"Name","value":"itsystem"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"uuid"}}]}},{"kind":"Field","name":{"kind":"Name","value":"validity"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"from"}},{"kind":"Field","name":{"kind":"Name","value":"to"}}]}},{"kind":"Field","name":{"kind":"Name","value":"user_key"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"itsystems"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"uuid"}}]}}]}}]} as unknown as DocumentNode<ItUsersQuery, ItUsersQueryVariables>;
export const UpdateItUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateITUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ITUserUpdateInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"ituser_update"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"uuid"}}]}}]}}]} as unknown as DocumentNode<UpdateItUserMutation, UpdateItUserMutationVariables>;