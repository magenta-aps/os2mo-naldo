import { fetchGraph } from "$lib/util/http"
import type { PageLoad } from "./$types"
import { date } from "$lib/stores/date"

export const ssr = false

interface Query {
  data: Data | null
  errors?: Error[]
}

interface Data {
  org_units: OrganisationUnitResponse[]
}

interface OrganisationUnitResponse {
  objects: OrganisationUnitResponseOrganisationUnit[]
}

interface OrganisationUnitResponseOrganisationUnit {
  addresses: Address[]
  name: string
  uuid: null | string
  children: OrganisationUnitOrganisationUnit[]
}

interface Address {
  name: null | string
  address_type: Class
}

interface Class {
  name: string
  scope: null | string
}

interface OrganisationUnitOrganisationUnit {
  name: string
  uuid: null | string
}

interface Error {
  message: string
}

export const load: PageLoad = async () => {
  let fromDate = ""
  date.subscribe((v) => (fromDate = v))

  const query = `{
    org_units(parents: null, from_date: "${fromDate}") {
      objects {
        addresses {
          name
          address_type {
            name
            scope
          }
        }
        name
        uuid
        children {
          name
          uuid
        }
      }
    }
  }`

  const res = await fetchGraph(query)
  const json: Query = await res.json()

  if (json.data) {
    return json.data
  } else if (json.errors) {
    throw new Error(json.errors[0].message)
  } else {
    throw new Error("Unknown error during data fetching")
  }
}
