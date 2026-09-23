import { describe, expect, it } from "vitest"
import { transformAuditLog } from "../src/routes/(app)/auditlog/[uuid]/timeline"

const responsibility = (uuid: string, name: string) => ({ uuid, current: { name } })

const registration = (start: string, responsibilities: object[]) => ({
  uuid: "manager-1",
  start,
  actor_object: { display_name: "bruce" },
  validities: [
    {
      responsibilities_response: { objects: responsibilities },
      validity: { from: "2020-01-01T00:00:00+01:00", to: null },
    },
  ],
})

describe("transformAuditLog list attributes", () => {
  it("keeps each item's uuid instead of joining them", () => {
    const [reg] = transformAuditLog([
      registration("2024-01-01T00:00:00+01:00", [
        responsibility("r-1", "Personale"),
        responsibility("r-2", "Budget"),
      ]),
    ])
    const [entry] = reg.timelines.responsibilities
    expect(entry.uuid).toBeUndefined()
    expect(entry.value).toBe("Personale, Budget")
    expect(entry.items).toEqual([
      { value: "Personale", uuid: "r-1" },
      { value: "Budget", uuid: "r-2" },
    ])
  })

  it("marks an empty list as not set", () => {
    const [reg] = transformAuditLog([registration("2024-01-01T00:00:00+01:00", [])])
    const [entry] = reg.timelines.responsibilities
    expect(entry.value).toBe("not_set")
    expect(entry.items).toBeUndefined()
  })

  it("does not mark a reordered list as changed", () => {
    const [newer] = transformAuditLog([
      registration("2024-01-01T00:00:00+01:00", [
        responsibility("r-1", "Personale"),
        responsibility("r-2", "Budget"),
      ]),
      registration("2024-02-01T00:00:00+01:00", [
        responsibility("r-2", "Budget"),
        responsibility("r-1", "Personale"),
      ]),
    ])
    expect(newer.timelines.responsibilities[0].changed).toBeUndefined()
  })

  it("marks a list with an added item as changed", () => {
    const [newer] = transformAuditLog([
      registration("2024-01-01T00:00:00+01:00", [responsibility("r-1", "Personale")]),
      registration("2024-02-01T00:00:00+01:00", [
        responsibility("r-1", "Personale"),
        responsibility("r-2", "Budget"),
      ]),
    ])
    expect(newer.timelines.responsibilities[0].changed).toBe(true)
  })
})
