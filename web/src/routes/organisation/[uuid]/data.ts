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
  name: string
  uuid: null | string
  unit_type: Class | null
  org_unit_level: Class | null
  parent: ParentOrganisationUnit | null
  validity: Validity
}

interface Class {
  name: string
}

interface ParentOrganisationUnit {
  name: string
  uuid: null | string
  parent: Class | null
}

interface Validity {
  from: string
  to: null | string
}

interface Error {
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
      org_units(uuids: "${uuid}", from_date: ${
    from ? `"${from}"` : from
  }${dynamicToDate}) {
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
    const present: OrganisationUnitElement[] = json.data.org_units[0].objects
    const future: OrganisationUnitElement[] = []

    const presentTime = json.data.org_units[0].objects[0].validity
    if (presentTime.to) {
      const newToDate = new Date(presentTime.to)
      newToDate.setDate(newToDate.getDate() + 2)
      presentTime.to = String(newToDate.toISOString().slice(0, 10)) // YYYY-MM-DD

      const futureRes = await fetchGraph(query((uuid = uuid), presentTime.to, null))
      const futureJson: Query = await futureRes.json()

      if (futureJson.data && futureJson.data.org_units.length) {
        future.push(...futureJson.data.org_units[0].objects)
      }
    }

    const pastRes = await fetchGraph(query(uuid, null, presentTime.from))
    const pastJson: Query = await pastRes.json()

    if (pastJson.data && pastJson.data.org_units.length) {
      past.push(...pastJson.data.org_units[0].objects)
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
