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

const query = (uuid: string, fromDate: string): string => {
  return `
      query {
        org_units(uuids: "${uuid}", from_date: "${fromDate}") {
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
  uuid: string,
  fromDate: string
): Promise<ParentOrganisationUnit | undefined | null> => {
  const res = await fetchGraph(query(uuid, fromDate))
  const json: Query = await res.json()

  return json.data?.org_units[0].objects[0].parent
}

export const fetchParentTree = async (
  uuid: string,
  fromDate: string
): Promise<ParentOrganisationUnit[]> => {
  const parent = await fetchParent(uuid, fromDate)

  if (!parent) {
    return []
  }

  return [parent].concat(await fetchParentTree(parent.uuid, fromDate))
}
