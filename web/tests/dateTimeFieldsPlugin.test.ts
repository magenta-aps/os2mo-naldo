import { createRequire } from "module"
import { describe, expect, it } from "vitest"

// The plugin runs under codegen as CommonJS; the schema and documents have to
// come from the same copy of graphql.
const require = createRequire(import.meta.url)
const { buildSchema, parse } = require("graphql")
const { plugin } = require("../codegen/dateTimeFields.cjs")

const schema = buildSchema(`
  scalar DateTime
  type Validity { from: DateTime, to: DateTime }
  type Registration { start: DateTime, note: String }
  type Engagement { name: String, validity: Validity, registrations: [Registration] }
  type Query { engagements: [Engagement] }
`)

const generate = (...queries: string[]) =>
  plugin(
    schema,
    queries.map((query, i) => ({
      document: parse(query),
      location: `query${i}.svelte`,
    }))
  )

describe("dateTimeFields plugin", () => {
  it("lists the DateTime fields the queries select", () => {
    expect(
      generate(
        `query { engagements { validity { from to } } }`,
        `query { engagements { registrations { start note } } }`
      )
    ).toContain(`export const dateTimeFields = ["from", "start", "to"]`)
  })

  it("fails on an alias that gives another field a DateTime name", () => {
    expect(() =>
      generate(`query { engagements { validity { from } from: name } }`)
    ).toThrow(`query0.svelte: "from" is not a DateTime field here`)
  })

  it("fails on an aliased DateTime field", () => {
    expect(() =>
      generate(`query { engagements { validity { start: from } } }`)
    ).toThrow(`query0.svelte: DateTime field "from" is aliased as "start"`)
  })
})
