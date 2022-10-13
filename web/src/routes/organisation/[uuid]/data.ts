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

export interface OrganisationUnitElement {
  name: string
  unit_type: Class | null
  org_unit_level: Class | null
  parent: ParentOrganisationUnit | null
  validity: Validity
  addresses: Address[]
  engagements: Engagement[]
  associations: Association[]
  itusers: ITUser[]
  roles: Role[]
  managers: Manager[]
}

interface Address {
  name: null | string
  address_type: Class
  visibility: Class | null
  validity: Validity
}

interface Class {
  name: string
}

interface Validity {
  from: string
  to: null | string
}

interface Association {
  association_type: Class | null
  employee: Employee[]
  substitute: Class[]
  validity: Validity
}

interface Employee {
  name: string
  uuid: null | string
}

interface Engagement {
  job_function: Class
  engagement_type: Class
  employee: Employee[]
  validity: Validity
  uuid: null | string
}

interface ITUser {
  itsystem: Class
  validity: Validity
  user_key: null | string
}

interface Manager {
  employee: Employee[]
  responsibilities: Class[]
  manager_level: Class | null
  manager_type: Class | null
  validity: Validity
}

interface ParentOrganisationUnit {
  name: string
  uuid: null | string
  parent: Class | null
}

interface Role {
  employee: Employee[]
  role_type: Class
  validity: Validity
}

interface Error {
  message: string
}

export const load = async (uuid: string): Promise<OrganisationUnitElement> => {
  const query = `
    query {
      org_units(uuids: "${uuid}") {
        objects {
          name
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
          addresses {
            name
            address_type {
              name
            }
            visibility {
              name
            }
            validity {
              from
              to
            }
          }
          engagements {
            job_function {
              name
            }
            engagement_type {
              name
            }
            employee {
              name
              uuid
            }
            validity {
              from
              to
            }
            uuid
          }
          associations {
            association_type {
              name
            }
            employee {
              name
              uuid
            }
            substitute {
              name
            }
            validity {
              from
              to
            }
          }
          itusers {
            itsystem {
              name
            }
            validity {
              from
              to
            }
            user_key
          }
          roles {
            employee {
              name
              uuid
            }
            role_type {
              name
            }
            validity {
              from
              to
            }
          }
          managers {
            employee {
              name
              uuid
            }
            responsibilities {
              name
            }
            manager_level {
              name
            }
            manager_type {
              name
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
  const res = await fetchGraph(query)
  const json: Query = await res.json()
  if (json.data) {
    return json.data.org_units[0].objects[0]
  } else if (json.errors) {
    throw new Error(json.errors[0].message)
  } else {
    throw new Error("Unknown error during data fetching")
  }
}
