import { fetchGraph } from "$lib/util/http"

interface Query {
  data: Data | null
  errors?: Error[]
}

interface Data {
  employees: EmployeeResponse[]
}

interface EmployeeResponse {
  objects: Employee[]
}

export interface Employee {
  name: string
  engagements: EngagementElement[]
  cpr_no: null | string
  addresses: Address[]
  associations: Association[]
  roles: Role[]
  leaves: Leave[]
  manager_roles: Manager[]
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
  to: null | string
  from: string
}

interface Association {
  org_unit: OrganisationUnit[]
  association_type: Class | null
  validity: Validity
}

interface OrganisationUnit {
  name: string
  uuid: null | string
}

interface EngagementElement {
  uuid: null | string
  org_unit: OrganisationUnit[]
  validity: Validity
  job_function: Class
}

interface Leave {
  validity: Validity
  leave_type: Class
  engagement: EngagementEngagement | null
}

interface EngagementEngagement {
  org_unit: Class[]
  job_function: Class
}

interface Manager {
  org_unit: OrganisationUnit[]
  validity: Validity
}

interface Role {
  role_type: Class
  org_unit: OrganisationUnit[]
  validity: Validity
}

interface Error {
  message: string
}

export const load = async (uuid: string): Promise<Employee> => {
  const query = `
    query {
      employees(uuids: "${uuid}") {
        objects {
          name
          engagements {
            uuid
            org_unit {
              name
              uuid
            }
            validity {
              to
              from
            }
            job_function {
              name
            }
          }
          cpr_no
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
          associations {
            org_unit {
              name
              uuid
            }
            association_type {
              name
            }
            validity {
              from
              to
            }
          }
          roles {
            role_type {
              name
            }
            org_unit {
              name
              uuid
            }
            validity {
              from
              to
            }
          }
          leaves {
            validity {
              from
              to
            }
            leave_type {
              name
            }
            engagement {
              org_unit {
                name
              }
              job_function {
                name
              }
            }
          }
          manager_roles {
            org_unit {
              name
              uuid
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
    return json.data.employees[0].objects[0]
  } else if (json.errors) {
    throw new Error(json.errors[0].message)
  } else {
    throw new Error("Unknown error during data fetching")
  }
}
