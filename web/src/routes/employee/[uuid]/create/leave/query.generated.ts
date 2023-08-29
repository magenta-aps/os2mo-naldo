import type * as Types from '../../../../../lib/graphql/types';

import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

export type LeaveDetailsQueryVariables = Types.Exact<{
    uuid?: Types.InputMaybe<Array<Types.Scalars['UUID']['input']> | Types.Scalars['UUID']['input']>;
    fromDate?: Types.InputMaybe<Types.Scalars['DateTime']['input']>;
}>;

export type LeaveDetailsQuery = {
    __typename?: 'Query',
    leaveTypes: Array<{ __typename?: 'LeaveType', name: string, uuid: any }>,
    employees: Array<{ __typename?: 'EmployeeResponse', objects: Array<{ __typename?: 'Employee', validity: { __typename?: 'OpenValidity', from?: any | null, to?: any | null } }> }>
};

export type CreateLeaveMutationVariables = Types.Exact<{
    input: Types.LeaveCreateInput;
}>;

export type CreateLeaveMutation = {
    __typename?: 'Mutation',
    leave_create: {
        __typename?: 'LeaveResponse',
        objects: Array<{
            __typename?: 'Leave',
            employee?: Array<{ __typename?: 'Employee', name: string }> | null,
            leaveType: { __typename?: 'LeaveType', name: string }
        }>
    }
};

export const LeaveDetailsDocument = {/*TODO*/} as unknown as DocumentNode<LeaveDetailsQuery, LeaveDetailsQueryVariables>;
export const CreateLeaveDocument = {/* TODO*/} as unknown as DocumentNode<CreateLeaveMutation, CreateLeaveMutationVariables>;
