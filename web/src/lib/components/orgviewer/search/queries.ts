import type { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core"
import { parse } from "graphql"
import type { OrgViewerSearchAddress } from "./search"

// See components/orgviewer/tree/queries.ts for why this is parsed at
// load-time instead of pre-generated via `yarn generate`.

export type OrgViewerOrgUnitSearchQueryVariables = {
  query?: string | null
  ancestor?: string[] | null
}
export type OrgViewerOrgUnitSearchQuery = {
  org_units: {
    objects: { validities: { uuid: string; name: string; addresses: OrgViewerSearchAddress[] }[] }[]
  }
}

export const OrgViewerOrgUnitSearchDocument = parse(`
  query OrgViewerOrgUnitSearch($query: String, $ancestor: [UUID!]) {
    org_units(filter: { query: $query, ancestor: { uuids: $ancestor } }) {
      objects {
        validities {
          uuid
          name
          addresses(filter: { address_type: { scope: ["PHONE"] } }) {
            name
            visibility { scope }
          }
        }
      }
    }
  }
`) as unknown as DocumentNode<
  OrgViewerOrgUnitSearchQuery,
  OrgViewerOrgUnitSearchQueryVariables
>

export type OrgViewerEmployeeSearchQueryVariables = {
  query?: string | null
  includeEngagements: boolean
  includeAssociations: boolean
}
export type OrgViewerEmployeeSearchQuery = {
  employees: {
    objects: {
      validities: {
        uuid: string
        name: string
        nickname: string
        addresses: OrgViewerSearchAddress[]
        engagements?: { uuid: string }[]
        associations?: { uuid: string }[]
      }[]
    }[]
  }
}

export const OrgViewerEmployeeSearchDocument = parse(`
  query OrgViewerEmployeeSearch(
    $query: String
    $includeEngagements: Boolean!
    $includeAssociations: Boolean!
  ) {
    employees(filter: { query: $query }) {
      objects {
        validities {
          uuid
          name
          nickname
          addresses(filter: { address_type: { scope: ["PHONE"] } }) {
            name
            visibility { scope }
          }
          engagements @include(if: $includeEngagements) { uuid }
          associations @include(if: $includeAssociations) { uuid }
        }
      }
    }
  }
`) as unknown as DocumentNode<
  OrgViewerEmployeeSearchQuery,
  OrgViewerEmployeeSearchQueryVariables
>
