import { test as base, expect, type APIRequestContext } from "@playwright/test"
import { readFileSync } from "fs"

// In local dev the full stack (naldo + backend) is proxied through one port,
// so BASE_URL covers everything. In CI naldo runs at BASE_URL (localhost:4173)
// while the MO backend is a separate service — set MO_URL to point at it.
const MO_URL = process.env.MO_URL ?? process.env.BASE_URL ?? "http://localhost:5000"

function bearerToken(): string {
  return readFileSync("e2e-real/.auth/token.txt", "utf-8").trim()
}

// ── GraphQL helper ───────────────────────────────────────────────────────────

export async function gql<T = Record<string, unknown>>(
  request: APIRequestContext,
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const res = await request.post(`${MO_URL}/graphql/v29`, {
    data: { query, variables },
    headers: {
      "Content-Type": "application/json",
      Authorization: bearerToken(),
    },
  })
  const body = await res.json()
  if (body.errors?.length) {
    throw new Error(`GraphQL error: ${JSON.stringify(body.errors)}`)
  }
  return body.data as T
}

// ── Data creation helpers ────────────────────────────────────────────────────

export async function createEmployee(
  request: APIRequestContext,
  input: { given_name: string; surname: string }
): Promise<string> {
  const { employee_create } = await gql<{ employee_create: { uuid: string } }>(
    request,
    `mutation CreateEmployee($input: EmployeeCreateInput!) {
      employee_create(input: $input) { uuid }
    }`,
    { input }
  )
  return employee_create.uuid
}

export async function terminateEmployee(
  request: APIRequestContext,
  uuid: string,
  to: string
): Promise<void> {
  await gql(
    request,
    `mutation TerminateEmployee($input: EmployeeTerminateInput!) {
      employee_terminate(input: $input) { uuid }
    }`,
    { input: { uuid, to } }
  )
}

export async function createFacet(
  request: APIRequestContext,
  userKey: string
): Promise<string> {
  const { facet_create } = await gql<{ facet_create: { uuid: string } }>(
    request,
    `mutation CreateFacet($input: FacetCreateInput!) {
      facet_create(input: $input) { uuid }
    }`,
    {
      input: {
        user_key: userKey,
        validity: { from: "2000-01-01" },
      },
    }
  )
  return facet_create.uuid
}

export async function createClass(
  request: APIRequestContext,
  input: { name: string; user_key: string; facet_uuid: string }
): Promise<string> {
  const { class_create } = await gql<{ class_create: { uuid: string } }>(
    request,
    `mutation CreateClass($input: ClassCreateInput!) {
      class_create(input: $input) { uuid }
    }`,
    {
      input: {
        ...input,
        validity: { from: "2000-01-01" },
      },
    }
  )
  return class_create.uuid
}

export async function createOrgUnit(
  request: APIRequestContext,
  input: { name: string; org_unit_type: string; parent?: string }
): Promise<string> {
  const { org_unit_create } = await gql<{ org_unit_create: { uuid: string } }>(
    request,
    `mutation CreateOrgUnit($input: OrganisationUnitCreateInput!) {
      org_unit_create(input: $input) { uuid }
    }`,
    {
      input: {
        name: input.name,
        org_unit_type: input.org_unit_type,
        ...(input.parent ? { parent: input.parent } : {}),
        validity: { from: "2000-01-01" },
      },
    }
  )
  return org_unit_create.uuid
}

// ── Auto-restore fixture ─────────────────────────────────────────────────────

export const test = base.extend<{ _restore: void }>({
  _restore: [
    async ({ request }, use) => {
      const res = await request.post(`${MO_URL}/testing/database/restore`)
      if (!res.ok()) {
        throw new Error(`DB restore failed (${res.status()}): ${await res.text()}`)
      }
      // Restore terminates all DB connections; poll until the backend's
      // connection pool has recovered before the test starts making requests.
      for (let i = 0; i < 20; i++) {
        const health = await request.get(`${MO_URL}/health/ready`)
        if (health.status() === 204) break
        await new Promise((r) => setTimeout(r, 200))
      }
      await use()
    },
    { auto: true, scope: "test" },
  ],
})

export { expect }
