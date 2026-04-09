/**
 * Verifies that `_response` fields return identical data to the deprecated
 * shorthand fields. This is the safety net for the _response migration.
 *
 * Each test queries both old and new fields side-by-side on the same objects
 * and asserts the UUIDs and names match.
 */
import { describe, it, expect, beforeAll } from "vitest"
import { getClient, isMoAvailable } from "./helpers/mo-client"
import type { GraphQLClient } from "graphql-request"
import { gql } from "graphql-request"

const canRun = await isMoAvailable()

describe.skipIf(!canRun)("_response field equivalence", () => {
  let client: GraphQLClient

  beforeAll(async () => {
    client = await getClient()
  })

  it("engagement: person, org_unit, job_function, engagement_type", async () => {
    const result: any = await client.request(gql`
      {
        engagements(limit: 5) {
          objects {
            validities {
              person(filter: { from_date: null, to_date: null }) {
                uuid
                name
              }
              person_response {
                uuid
                current {
                  name
                }
              }
              org_unit(filter: { from_date: null, to_date: null }) {
                uuid
                name
              }
              org_unit_response {
                uuid
                current {
                  name
                }
              }
              job_function {
                name
              }
              job_function_response {
                uuid
                current {
                  name
                }
              }
              engagement_type {
                name
              }
              engagement_type_response {
                uuid
                current {
                  name
                }
              }
            }
          }
        }
      }
    `)
    for (const obj of result.engagements.objects) {
      const v = obj.validities[0]
      if (v.person?.length > 0) {
        expect(v.person[0].uuid).toBe(v.person_response.uuid)
        expect(v.person[0].name).toBe(v.person_response.current?.name)
      }
      if (v.org_unit?.length > 0) {
        expect(v.org_unit[0].uuid).toBe(v.org_unit_response.uuid)
        expect(v.org_unit[0].name).toBe(v.org_unit_response.current?.name)
      }
      if (v.job_function) {
        expect(v.job_function.name).toBe(v.job_function_response.current?.name)
      }
      if (v.engagement_type) {
        expect(v.engagement_type.name).toBe(v.engagement_type_response.current?.name)
      }
    }
  })

  it("association: person, org_unit, association_type", async () => {
    const result: any = await client.request(gql`
      {
        associations(limit: 5) {
          objects {
            validities {
              person(filter: { from_date: null, to_date: null }) {
                uuid
                name
              }
              person_response {
                uuid
                current {
                  name
                }
              }
              org_unit(filter: { from_date: null, to_date: null }) {
                uuid
                name
              }
              org_unit_response {
                uuid
                current {
                  name
                }
              }
              association_type {
                name
              }
              association_type_response {
                uuid
                current {
                  name
                }
              }
            }
          }
        }
      }
    `)
    for (const obj of result.associations.objects) {
      const v = obj.validities[0]
      if (v.person?.length > 0) {
        expect(v.person[0].uuid).toBe(v.person_response.uuid)
        expect(v.person[0].name).toBe(v.person_response.current?.name)
      }
      if (v.org_unit?.length > 0) {
        expect(v.org_unit[0].uuid).toBe(v.org_unit_response.uuid)
        expect(v.org_unit[0].name).toBe(v.org_unit_response.current?.name)
      }
      if (v.association_type) {
        expect(v.association_type.name).toBe(v.association_type_response.current?.name)
      }
    }
  })

  it("org_unit: parent", async () => {
    const result: any = await client.request(gql`
      {
        org_units(limit: 5) {
          objects {
            validities {
              name
              parent {
                uuid
                name
              }
              parent_response {
                uuid
                current {
                  name
                }
              }
            }
          }
        }
      }
    `)
    for (const obj of result.org_units.objects) {
      const v = obj.validities[0]
      if (v.parent) {
        expect(v.parent.uuid).toBe(v.parent_response?.uuid)
        expect(v.parent.name).toBe(v.parent_response?.current?.name)
      }
    }
  })

  it("ituser: itsystem", async () => {
    const result: any = await client.request(gql`
      {
        itusers(limit: 5) {
          objects {
            validities {
              user_key
              itsystem {
                uuid
                name
              }
              itsystem_response {
                uuid
                current {
                  name
                }
              }
            }
          }
        }
      }
    `)
    for (const obj of result.itusers.objects) {
      const v = obj.validities[0]
      if (v.itsystem) {
        expect(v.itsystem.uuid).toBe(v.itsystem_response.uuid)
        expect(v.itsystem.name).toBe(v.itsystem_response.current?.name)
      }
    }
  })

  it("address: address_type, visibility", async () => {
    const result: any = await client.request(gql`
      {
        addresses(limit: 5) {
          objects {
            validities {
              address_type {
                name
              }
              address_type_response {
                uuid
                current {
                  name
                }
              }
              visibility {
                name
              }
              visibility_response {
                uuid
                current {
                  name
                }
              }
            }
          }
        }
      }
    `)
    for (const obj of result.addresses.objects) {
      const v = obj.validities[0]
      if (v.address_type) {
        expect(v.address_type.name).toBe(v.address_type_response.current?.name)
      }
      const visOld = v.visibility?.name ?? null
      const visNew = v.visibility_response?.current?.name ?? null
      expect(visOld).toBe(visNew)
    }
  })

  it("manager: manager_type, manager_level", async () => {
    const result: any = await client.request(gql`
      {
        managers(limit: 5) {
          objects {
            validities {
              manager_type {
                name
              }
              manager_type_response {
                uuid
                current {
                  name
                }
              }
              manager_level {
                name
              }
              manager_level_response {
                uuid
                current {
                  name
                }
              }
            }
          }
        }
      }
    `)
    for (const obj of result.managers.objects) {
      const v = obj.validities[0]
      if (v.manager_type) {
        expect(v.manager_type.name).toBe(v.manager_type_response.current?.name)
      }
      if (v.manager_level) {
        expect(v.manager_level.name).toBe(v.manager_level_response.current?.name)
      }
    }
  })
})
