import type * as Types from '../../graphql/types';

import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type PolicyByUuidQueryVariables = Types.Exact<{
  uuids?: Types.InputMaybe<Array<Types.Scalars['UUID']['input']> | Types.Scalars['UUID']['input']>;
}>;


export type PolicyByUuidQuery = { policies: { objects: Array<{ uuid: any, name: string, description?: string | null, start: any, end?: any | null, actors: Array<{ uuid: any, kind: Types.PolicyActorKind, value: string }> }> } };

export type SavePolicyMutationVariables = Types.Exact<{
  policy: Types.PolicyDeclareInput;
  actors: Types.PolicyActorsDeclareInput;
}>;


export type SavePolicyMutation = { policy_declare: { uuid: any, name: string }, policy_actors_declare: Array<{ uuid: any }> };


export const PolicyByUuidDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PolicyByUuid"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"uuids"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"policies"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"uuids"},"value":{"kind":"Variable","name":{"kind":"Name","value":"uuids"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"objects"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"uuid"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"start"}},{"kind":"Field","name":{"kind":"Name","value":"end"}},{"kind":"Field","name":{"kind":"Name","value":"actors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"uuid"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]}}]}}]}}]} as unknown as DocumentNode<PolicyByUuidQuery, PolicyByUuidQueryVariables>;
export const SavePolicyDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SavePolicy"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"policy"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"PolicyDeclareInput"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"actors"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"PolicyActorsDeclareInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"policy_declare"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"policy"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"uuid"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"policy_actors_declare"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"actors"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"uuid"}}]}}]}}]} as unknown as DocumentNode<SavePolicyMutation, SavePolicyMutationVariables>;