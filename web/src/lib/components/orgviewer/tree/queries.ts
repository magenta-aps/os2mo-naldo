import type { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core"
import { parse } from "graphql"

// NOTE: this repo normally generates typed query documents via
// `yarn generate` (graphql-codegen against a live OS2MO schema endpoint -
// see codegen.yml). No backend was reachable while writing this file, so
// these documents are parsed at module-load time with the same `graphql`
// package codegen uses internally, instead of being pre-parsed into a
// static AST literal at build time. Functionally identical - once a live
// backend is available, running `yarn generate` will fold these into
// src/lib/components/orgviewer/tree/query.generated.ts and this file can be
// deleted.

type OrgViewerUnitFields = {
  uuid: string
  name: string
  user_key: string
  parent?: { uuid: string } | null
  org_unit_level?: { uuid: string } | null
  has_children: boolean
  child_count: number
  associations: { uuid: string }[]
  engagements: { uuid: string; engagement_type_uuid: string }[]
}

const UNIT_FIELDS = `
  uuid
  name
  user_key
  has_children
  child_count
  parent { uuid }
  org_unit_level { uuid }
  associations { uuid }
  engagements { uuid engagement_type_uuid }
`

export type OrgViewerUnitByUuidQueryVariables = { uuid?: string[] | null }
export type OrgViewerUnitByUuidQuery = {
  org_units: { objects: { validities: OrgViewerUnitFields[] }[] }
}

export const OrgViewerUnitByUuidDocument = parse(`
  query OrgViewerUnitByUuid($uuid: [UUID!]) {
    org_units(filter: { uuids: $uuid }) {
      objects {
        validities {
          ${UNIT_FIELDS}
        }
      }
    }
  }
`) as unknown as DocumentNode<OrgViewerUnitByUuidQuery, OrgViewerUnitByUuidQueryVariables>

export type OrgViewerUnitChildrenQueryVariables = { uuid?: string[] | null }
export type OrgViewerUnitChildrenQuery = {
  org_units: { objects: { validities: OrgViewerUnitFields[] }[] }
}

export const OrgViewerUnitChildrenDocument = parse(`
  query OrgViewerUnitChildren($uuid: [UUID!]) {
    org_units(filter: { parent: { uuids: $uuid } }) {
      objects {
        validities {
          ${UNIT_FIELDS}
        }
      }
    }
  }
`) as unknown as DocumentNode<
  OrgViewerUnitChildrenQuery,
  OrgViewerUnitChildrenQueryVariables
>
