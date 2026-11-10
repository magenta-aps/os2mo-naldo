import { buildSchema, NoUnusedVariablesRule, parse, validate } from "graphql"
import { describe, expect, it } from "vitest"

// MO rejects an operation that declares a variable it never uses, and
// graphql-codegen hard-codes NoUnusedVariables as ignored. The rule reads only
// the document, so a stub schema stands in for MO's.
const schema = buildSchema("type Query { _: Int }")

const files = import.meta.glob<string>("/src/**/*.{svelte,ts}", {
  query: "?raw",
  import: "default",
  eager: true,
})

const documents = Object.entries(files).flatMap(([file, source]) =>
  [...source.matchAll(/gql`([\s\S]*?)`/g)].map((match, i) => ({
    name: `${file} #${i + 1}`,
    source: match[1],
  }))
)

describe("GraphQL documents", () => {
  it("finds the documents", () => {
    expect(documents.length).toBeGreaterThan(0)
  })

  it.each(documents)("$name uses every variable it declares", ({ source }) => {
    const errors = validate(schema, parse(source), [NoUnusedVariablesRule])
    expect(errors.map((error) => error.message)).toEqual([])
  })
})
