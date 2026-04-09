/**
 * Basic GraphQL connectivity tests.
 *
 * Verifies that we can authenticate with Keycloak and execute queries
 * against the MO GraphQL API. If these fail, something is fundamentally
 * wrong with the MO instance or auth setup.
 *
 * Skipped automatically when MO is not reachable.
 */
import { describe, it, expect, beforeAll } from "vitest"
import { getClient, isMoAvailable } from "./helpers/mo-client"
import type { GraphQLClient } from "graphql-request"
import { gql } from "graphql-request"

const canRun = await isMoAvailable()

describe.skipIf(!canRun)("GraphQL connectivity", () => {
  let client: GraphQLClient

  beforeAll(async () => {
    client = await getClient()
  })

  it("authenticates and reaches the GraphQL API", async () => {
    const result: any = await client.request(gql`
      {
        __typename
      }
    `)
    expect(result.__typename).toBe("Query")
  })

  it("can query org_units", async () => {
    const result: any = await client.request(gql`
      {
        org_units(limit: 1) {
          objects {
            validities {
              uuid
              name
            }
          }
        }
      }
    `)
    expect(result.org_units.objects).toBeInstanceOf(Array)
  })

  it("can query employees", async () => {
    const result: any = await client.request(gql`
      {
        employees(limit: 1) {
          objects {
            validities {
              uuid
              name
            }
          }
        }
      }
    `)
    expect(result.employees.objects).toBeInstanceOf(Array)
  })

  it("can query facets and their classes", async () => {
    const result: any = await client.request(gql`
      {
        facets {
          objects {
            validities {
              uuid
              user_key
              classes {
                uuid
                name
              }
            }
          }
        }
      }
    `)
    expect(result.facets.objects.length).toBeGreaterThan(0)
  })
})
