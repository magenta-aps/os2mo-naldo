import type { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core"
import { parse } from "graphql"
import type { OrgViewerAddress } from "$lib/components/orgviewer/organisation"
import type { PersonAssociation, PersonEngagement } from "./person"

// See components/orgviewer/tree/queries.ts for why this is parsed at
// load-time instead of pre-generated via `yarn generate`.

type PersonDetailFields = {
  uuid: string
  name: string
  nickname: string
  addresses: OrgViewerAddress[]
  engagements: PersonEngagement[]
  associations: PersonAssociation[]
}

export type OrgViewerPersonDetailQueryVariables = {
  uuid?: string[] | null
  includeAssociations: boolean
  includeEngagements: boolean
}
export type OrgViewerPersonDetailQuery = {
  employees: { objects: { validities: PersonDetailFields[] }[] }
}

export const OrgViewerPersonDetailDocument = parse(`
  query OrgViewerPersonDetail(
    $uuid: [UUID!]
    $includeAssociations: Boolean!
    $includeEngagements: Boolean!
  ) {
    employees(filter: { uuids: $uuid }) {
      objects {
        validities {
          uuid
          name
          nickname
          addresses {
            uuid
            name
            value
            visibility { name }
            address_type { uuid name user_key scope }
          }
          associations @include(if: $includeAssociations) {
            org_unit_uuid
            association_type { name }
            substitute { uuid name nickname }
            dynamic_class { name parent { name } }
          }
          engagements @include(if: $includeEngagements) {
            org_unit_uuid
            engagement_type { name }
            job_function { name }
            extension_1
            extension_3
          }
        }
      }
    }
  }
`) as unknown as DocumentNode<
  OrgViewerPersonDetailQuery,
  OrgViewerPersonDetailQueryVariables
>

export type OrgViewerPersonWorkAddressQueryVariables = { uuid?: string[] | null }
export type OrgViewerPersonWorkAddressQuery = {
  employees: {
    objects: {
      validities: {
        engagements: { org_unit: { addresses: OrgViewerAddress[] }[] }[]
      }[]
    }[]
  }
}

export const OrgViewerPersonWorkAddressDocument = parse(`
  query OrgViewerPersonWorkAddress($uuid: [UUID!]) {
    employees(filter: { uuids: $uuid }) {
      objects {
        validities {
          engagements {
            org_unit {
              addresses {
                uuid
                name
                value
                address_type { uuid name user_key scope }
              }
            }
          }
        }
      }
    }
  }
`) as unknown as DocumentNode<
  OrgViewerPersonWorkAddressQuery,
  OrgViewerPersonWorkAddressQueryVariables
>
