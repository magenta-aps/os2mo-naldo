import { fetchGraph } from "$lib/util/http"

interface Query {
  data: Data | null
  errors?: Error[]
}

interface Data {
  org_units: OrganisationUnitResponse[]
}

interface OrganisationUnitResponse {
  objects: OrganisationUnitElement[]
}

interface OrganisationUnitElement {
  parent: ParentOrganisationUnit | null
}

interface ParentOrganisationUnit {
  name: string
  uuid: string
}

interface Error {
  message: string
}

const query = (uuid: string): string => {
  return `
      query {
        org_units(uuids: "${uuid}") {
        objects {
          parent {
            name
            uuid
          }
        }
      }
    }`
}

const fetchParent = async (
  uuid: string
): Promise<ParentOrganisationUnit | undefined | null> => {
  const res = await fetchGraph(query(uuid))
  const json: Query = await res.json()

  return json.data?.org_units[0].objects[0].parent
}

export const fetchParentTree = async (
  uuid: string
): Promise<ParentOrganisationUnit[]> => {
  const parent = await fetchParent(uuid)

  if (!parent) {
    return []
  }

  return [parent].concat(await fetchParentTree(parent.uuid))
}
