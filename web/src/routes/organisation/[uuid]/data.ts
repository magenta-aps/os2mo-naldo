import { fetchGraph } from "$lib/util/http"

export interface Query {
  data: Data | null
  errors?: Error[]
}

export interface Data {
  org_units: OrganisationUnitResponsePaged
}

export interface OrganisationUnitResponsePaged {
  objects: OrganisationUnitResponse[]
}

export interface OrganisationUnitResponse {
  objects: OrganisationUnitElement[]
}

export interface OrganisationUnitElement {
  name: string
  uuid: string
  unit_type: Class | null
  org_unit_level: Class | null
  parent: ParentOrganisationUnit | null
  validity: Validity
}

export interface Class {
  name: string
}

export interface ParentOrganisationUnit {
  name: string
  uuid: string
  parent: Class | null
}

export interface Validity {
  from: string
  to: null | string
}

export interface Error {
  message: string
}

const query = (uuid: string, from: string | null, to: string | null | undefined) => {
  let dynamicToDate: string

  switch (typeof to) {
    case "undefined":
      dynamicToDate = ""
      break

    case "object": // null
      if (to === null) {
        dynamicToDate = `, to_date: null`
        break
      }

    case "string":
      dynamicToDate = `, to_date: "${to}"`
      break

    default:
      throw Error(`Bad toDate: ${typeof to}, ${to}`)
  }

  const query = `
    {
      org_units(filter: {uuids: "${uuid}", from_date: ${
    from ? `"${from}"` : from
  }${dynamicToDate}}) {
        objects {
          objects {
            name
            uuid
            unit_type {
              name
            }
            org_unit_level {
              name
            }
            parent {
              name
              uuid
              parent {
                name
              }
            }
            validity {
              from
              to
            }
          }
        }
      }
    }
  `
  return query
}

export const load = async (
  uuid: string,
  fromDate: string
): Promise<{
  past: OrganisationUnitElement[]
  present: OrganisationUnitElement[]
  future: OrganisationUnitElement[]
}> => {
  const res = await fetchGraph(query(uuid, fromDate, undefined))
  const json: Query = await res.json()

  if (json.data) {
    const past: OrganisationUnitElement[] = []
    const present: OrganisationUnitElement[] = json.data.org_units.objects[0].objects
    const future: OrganisationUnitElement[] = []

    const presentTime = json.data.org_units.objects[0].objects[0].validity
    if (presentTime.to) {
      const newToDate = new Date(presentTime.to)
      newToDate.setDate(newToDate.getDate() + 2)
      presentTime.to = String(newToDate.toISOString().slice(0, 10)) // YYYY-MM-DD

      const futureRes = await fetchGraph(query((uuid = uuid), presentTime.to, null))
      const futureJson: Query = await futureRes.json()

      if (futureJson.data && futureJson.data.org_units.objects.length) {
        future.push(...futureJson.data.org_units.objects[0].objects)
      }
    }

    const pastRes = await fetchGraph(query(uuid, null, presentTime.from))
    const pastJson: Query = await pastRes.json()

    if (pastJson.data && pastJson.data.org_units.objects.length) {
      past.push(...pastJson.data.org_units.objects[0].objects)
    }

    return {
      past: past,
      present: present,
      future: future,
    }
  } else if (json.errors) {
    throw new Error(json.errors[0].message)
  } else {
    throw new Error("Unknown error during data fetching")
  }
}
