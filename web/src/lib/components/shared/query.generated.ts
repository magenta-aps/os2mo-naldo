import type * as Types from '../../graphql/types';

import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type OrgUnitQueryVariables = Types.Exact<{
  uuid?: Types.InputMaybe<Array<Types.Scalars['UUID']['input']> | Types.Scalars['UUID']['input']>;
  currentDate: Types.Scalars['DateTime']['input'];
}>;


export type OrgUnitQuery = { org_units: { objects: Array<{ current?: { name: string } | null }> } };

export type EmployeeQueryVariables = Types.Exact<{
  uuid?: Types.InputMaybe<Array<Types.Scalars['UUID']['input']> | Types.Scalars['UUID']['input']>;
  currentDate: Types.Scalars['DateTime']['input'];
}>;


export type EmployeeQuery = { employees: { objects: Array<{ current?: { name: string } | null }> } };


export const OrgUnitDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"OrgUnit"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"uuid"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"currentDate"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"org_units"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"uuids"},"value":{"kind":"Variable","name":{"kind":"Name","value":"uuid"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"objects"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"current"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"at"},"value":{"kind":"Variable","name":{"kind":"Name","value":"currentDate"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}}]} as unknown as DocumentNode<OrgUnitQuery, OrgUnitQueryVariables>;
export const EmployeeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Employee"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"uuid"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"currentDate"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"employees"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"uuids"},"value":{"kind":"Variable","name":{"kind":"Name","value":"uuid"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"objects"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"current"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"at"},"value":{"kind":"Variable","name":{"kind":"Name","value":"currentDate"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}}]} as unknown as DocumentNode<EmployeeQuery, EmployeeQueryVariables>;