import type { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core"
import { parse } from "graphql"
import type {
  OrgViewerAddress,
  OrgViewerAssociation,
  OrgViewerEngagement,
  OrgViewerManager,
} from "./organisation"

// See components/orgviewer/tree/queries.ts for why this is parsed at
// load-time instead of pre-generated via `yarn generate`.

type OrgViewerUnitDetailFields = {
  uuid: string
  name: string
  addresses: OrgViewerAddress[]
  associations: OrgViewerAssociation[]
  managers: OrgViewerManager[]
  engagements: OrgViewerEngagement[]
}

export type OrgViewerUnitDetailQueryVariables = {
  uuid?: string[] | null
  includeAssociations: boolean
  includeEngagements: boolean
}
export type OrgViewerUnitDetailQuery = {
  org_units: { objects: { validities: OrgViewerUnitDetailFields[] }[] }
}

export const OrgViewerUnitDetailDocument = parse(`
  query OrgViewerUnitDetail(
    $uuid: [UUID!]
    $includeAssociations: Boolean!
    $includeEngagements: Boolean!
  ) {
    org_units(filter: { uuids: $uuid }) {
      objects {
        validities {
          uuid
          name
          addresses {
            uuid
            name
            value
            visibility { name }
            address_type { uuid name user_key scope }
          }
          associations @include(if: $includeAssociations) {
            association_type { name }
            employee { uuid name nickname manager_roles { uuid } }
            substitute { uuid name nickname manager_roles { uuid } }
            dynamic_class { name parent { name } }
          }
          managers(inherit: true) @include(if: $includeEngagements) {
            org_unit_uuid
            manager_type { uuid name }
            employee { uuid name nickname manager_roles { uuid } }
          }
          engagements @include(if: $includeEngagements) {
            org_unit_uuid
            engagement_type_uuid
            employee { uuid name nickname manager_roles { uuid } }
            job_function { name }
            extension_1
            extension_3
          }
        }
      }
    }
  }
`) as unknown as DocumentNode<OrgViewerUnitDetailQuery, OrgViewerUnitDetailQueryVariables>
