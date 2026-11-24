import { celSyntaxError } from "$lib/utils/cel"
import { describe, expect, it } from "vitest"

describe("celSyntaxError", () => {
  // Conditions from MO's own policy tests, and the kinds MO documents
  it.each([
    "true",
    '{"uuids": [token.uuid]}',
    '{"employee": {"uuids": [token.uuid]}}',
    '{"file_store": "INSIGHTS", "file_names": ["report.csv"]}',
    '{"collection": "OrganisationUnit", "filter": {"uuids": [args.input.org_unit]}}',
    '{"or": [{"collection": "Class", "filter": {}}, {"not": {"collection": "Facet", "filter": {}}}]}',
    'cel.bind(me, token.uuid, {"employee": {"uuids": [me]}})',
    'has(args.input.org_unit) ? {"collection": "OrganisationUnit", "filter": {}} : false',
    '{\n  "collection": "OrganisationUnit",\n  "filter": {}\n}',
  ])("accepts %s", (condition) => {
    expect(celSyntaxError(condition)).toBeUndefined()
  })

  it("points at a syntax error", () => {
    expect(celSyntaxError('{"uuids": [token.uuid]')).toMatch(
      /^Expected RBRACE, got EOF[\s\S]*\^/
    )
  })

  it("leaves an empty condition to the required check", () => {
    expect(celSyntaxError("  ")).toBeUndefined()
  })
})
