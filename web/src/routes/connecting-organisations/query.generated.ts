import type * as Types from '../../lib/graphql/types';

import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type OrgTreeRelatedQueryVariables = Types.Exact<{
  from_date: Types.Scalars['DateTime']['input'];
}>;


export type OrgTreeRelatedQuery = { __typename?: 'Query', related_units: { __typename?: 'RelatedUnitResponsePaged', objects: Array<{ __typename?: 'RelatedUnitResponse', objects: Array<{ __typename?: 'RelatedUnit', org_units: Array<{ __typename?: 'OrganisationUnit', uuid: any, name: string }> }> }> } };

export type RelatedUnitsQueryVariables = Types.Exact<{
  org_unit?: Types.InputMaybe<Array<Types.Scalars['UUID']['input']> | Types.Scalars['UUID']['input']>;
  fromDate?: Types.InputMaybe<Types.Scalars['DateTime']['input']>;
}>;


export type RelatedUnitsQuery = { __typename?: 'Query', related_units: { __typename?: 'RelatedUnitResponsePaged', objects: Array<{ __typename?: 'RelatedUnitResponse', objects: Array<{ __typename?: 'RelatedUnit', org_units: Array<{ __typename?: 'OrganisationUnit', name: string, uuid: any }>, validity: { __typename?: 'Validity', from: any, to?: any | null } }> }> } };

export type UpdateRelatedUnitsMutationVariables = Types.Exact<{
  input: Types.RelatedUnitsUpdateInput;
}>;


export type UpdateRelatedUnitsMutation = { __typename?: 'Mutation', related_units_update: { __typename?: 'RelatedUnitResponse', uuid: any } };


export const OrgTreeRelatedDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"OrgTreeRelated"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"from_date"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"related_units"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"from_date"},"value":{"kind":"Variable","name":{"kind":"Name","value":"from_date"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"objects"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"objects"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"org_units"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"uuid"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<OrgTreeRelatedQuery, OrgTreeRelatedQueryVariables>;
export const RelatedUnitsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"RelatedUnits"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"org_unit"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"fromDate"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"related_units"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"org_units"},"value":{"kind":"Variable","name":{"kind":"Name","value":"org_unit"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"from_date"},"value":{"kind":"Variable","name":{"kind":"Name","value":"fromDate"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"objects"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"objects"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"org_units"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"uuid"}}]}},{"kind":"Field","name":{"kind":"Name","value":"validity"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"from"}},{"kind":"Field","name":{"kind":"Name","value":"to"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<RelatedUnitsQuery, RelatedUnitsQueryVariables>;
export const UpdateRelatedUnitsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateRelatedUnits"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RelatedUnitsUpdateInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"related_units_update"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"uuid"}}]}}]}}]} as unknown as DocumentNode<UpdateRelatedUnitsMutation, UpdateRelatedUnitsMutationVariables>;