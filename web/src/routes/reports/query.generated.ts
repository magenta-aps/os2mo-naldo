import type * as Types from '../../lib/graphql/types';

import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type GetFileNamesQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type GetFileNamesQuery = { files: { objects: Array<{ file_name: string }> } };

export type GetFileQueryVariables = Types.Exact<{
  file_name?: Types.InputMaybe<Array<Types.Scalars['String']['input']> | Types.Scalars['String']['input']>;
}>;


export type GetFileQuery = { files: { objects: Array<{ file_name: string, base64_contents: string }> } };


export const GetFileNamesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetFileNames"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"files"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"file_store"},"value":{"kind":"EnumValue","value":"EXPORTS"}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"objects"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"file_name"}}]}}]}}]}}]} as unknown as DocumentNode<GetFileNamesQuery, GetFileNamesQueryVariables>;
export const GetFileDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetFile"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"file_name"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"files"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"file_store"},"value":{"kind":"EnumValue","value":"EXPORTS"}},{"kind":"ObjectField","name":{"kind":"Name","value":"file_names"},"value":{"kind":"Variable","name":{"kind":"Name","value":"file_name"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"objects"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"file_name"}},{"kind":"Field","name":{"kind":"Name","value":"base64_contents"}}]}}]}}]}}]} as unknown as DocumentNode<GetFileQuery, GetFileQueryVariables>;