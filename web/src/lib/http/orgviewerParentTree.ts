import { orgviewerGraphQLClient } from "$lib/http/orgviewerClient"
import type { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core"
import { parse } from "graphql"

// Forked from $lib/http/parentTree.ts's fetchParentTree, using the
// orgviewer service-account client instead of the interactive-login one.
// See queries.ts in components/orgviewer/tree for why this document is
// parsed at load time rather than pre-generated.

type OrgViewerParentQueryVariables = { uuid?: string[] | null }
type OrgViewerParentQuery = {
  org_units: { objects: { validities: { parent?: { uuid: string } | null }[] }[] }
}

const OrgViewerParentDocument = parse(`
  query OrgViewerParent($uuid: [UUID!]) {
    org_units(filter: { uuids: $uuid }) {
      objects {
        validities {
          parent { uuid }
        }
      }
    }
  }
`) as unknown as DocumentNode<OrgViewerParentQuery, OrgViewerParentQueryVariables>

const fetchParent = async (uuid: string): Promise<{ uuid: string } | null> => {
  const res = await orgviewerGraphQLClient().request(OrgViewerParentDocument, {
    uuid: [uuid],
  })
  const parent = res.org_units.objects[0]?.validities[0]?.parent
  return parent ? { uuid: parent.uuid } : null
}

export const fetchOrgViewerParentTree = async (
  uuid: string
): Promise<{ uuid: string }[]> => {
  const parent = await fetchParent(uuid)
  if (!parent) return []
  return [parent].concat(await fetchOrgViewerParentTree(parent.uuid))
}
