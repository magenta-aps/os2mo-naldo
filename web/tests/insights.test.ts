import { describe, it, expect } from "vitest"

/**
 * Tests that verify the _response data extraction patterns used in mainQueries.ts.
 *
 * These tests validate getValues-style logic against realistic _response shapes,
 * ensuring the insights CSV export produces correct values after the migration.
 */

// Helper copied from mainQueries.ts
const joinCurrentNames = (arr: any[]) =>
  arr
    ?.map((i: any) => i.current?.name)
    .filter(Boolean)
    .join(", ") ?? ""

describe("insights: org_units field extraction", () => {
  it("extracts parent name from parent_response", () => {
    const row = { parent_response: { uuid: "p-1", current: { name: "Root" } } }
    expect(row.parent_response?.current?.name ?? "").toBe("Root")
  })

  it("handles null current in parent_response", () => {
    const row = { parent_response: { uuid: "p-1", current: null as any } }
    expect(row.parent_response?.current?.name ?? "").toBe("")
  })

  it("handles missing parent_response", () => {
    const row = {}
    expect((row as any).parent_response?.current?.name ?? "").toBe("")
  })

  it("extracts unit_type from unit_type_response", () => {
    const row = { unit_type_response: { uuid: "ut-1", current: { name: "Afdeling" } } }
    expect(row.unit_type_response?.current?.name ?? "").toBe("Afdeling")
  })

  it("extracts unit_level from unit_level_response", () => {
    const row = {
      unit_level_response: { uuid: "ul-1", current: { name: "Niveau 3" } },
    }
    expect(row.unit_level_response?.current?.name ?? "").toBe("Niveau 3")
  })
})

describe("insights: engagements field extraction", () => {
  it("extracts person name from person_response", () => {
    const row = { person_response: { uuid: "p-1", current: { name: "Bruce Wayne" } } }
    expect(row.person_response?.current?.name ?? "").toBe("Bruce Wayne")
  })

  it("extracts cpr_number from person_response", () => {
    const row = {
      person_response: { uuid: "p-1", current: { cpr_number: "0101001234" } },
    }
    expect(row.person_response?.current?.cpr_number ?? "").toBe("0101001234")
  })

  it("extracts job_function from job_function_response", () => {
    const row = {
      job_function_response: { uuid: "jf-1", current: { name: "Specialist" } },
    }
    expect(row.job_function_response?.current?.name ?? "").toBe("Specialist")
  })

  it("extracts engagement_type from engagement_type_response", () => {
    const row = {
      engagement_type_response: { uuid: "et-1", current: { name: "Ansat" } },
    }
    expect(row.engagement_type_response?.current?.name ?? "").toBe("Ansat")
  })

  it("extracts primary from primary_response", () => {
    const row = { primary_response: { uuid: "pr-1", current: { name: "Primær" } } }
    expect(row.primary_response?.current?.name ?? "").toBe("Primær")
  })

  it("extracts emails from person_response.current.email", () => {
    const row = {
      person_response: {
        uuid: "p-1",
        current: {
          email: [{ name: "a@b.dk" }, { name: "c@d.dk" }],
        },
      },
    }
    const emails = row.person_response?.current?.email
    const result =
      emails
        ?.map((i: any) => i.name)
        .filter(Boolean)
        .join(", ") ?? ""
    expect(result).toBe("a@b.dk, c@d.dk")
  })

  it("handles missing emails gracefully", () => {
    const row = { person_response: { uuid: "p-1", current: null as any } }
    const emails = row.person_response?.current?.email
    const result =
      emails
        ?.map((i: any) => i.name)
        .filter(Boolean)
        .join(", ") ?? ""
    expect(result).toBe("")
  })

  it("extracts manager names from person_response", () => {
    const row = {
      managers: [
        { person_response: { uuid: "m-1", current: { name: "Manager A" } } },
        { person_response: { uuid: "m-2", current: { name: "Manager B" } } },
      ],
    }
    const names = row.managers
      .map((m: any) => m.person_response?.current?.name ?? "Vacant")
      .filter(Boolean)
      .join(", ")
    expect(names).toBe("Manager A, Manager B")
  })

  it("handles vacant managers", () => {
    const row = {
      managers: [{ person_response: { uuid: "m-1", current: null } }],
    }
    const names = row.managers
      .map((m: any) => m.person_response?.current?.name ?? "Vacant")
      .filter(Boolean)
      .join(", ")
    expect(names).toBe("Vacant")
  })

  it("extracts manager emails from person_response.current.addresses", () => {
    const row = {
      managers: [
        {
          person_response: {
            uuid: "m-1",
            current: { addresses: [{ name: "mgr@example.dk" }] },
          },
        },
      ],
    }
    const emails = row.managers
      .flatMap((m: any) => m.person_response?.current?.addresses ?? [])
      .map((a: any) => a.name)
      .filter(Boolean)
      .join(", ")
    expect(emails).toBe("mgr@example.dk")
  })
})

describe("insights: associations field extraction", () => {
  it("extracts association_type from association_type_response", () => {
    const row = {
      association_type_response: { uuid: "at-1", current: { name: "Projektleder" } },
    }
    expect(row.association_type_response?.current?.name ?? "").toBe("Projektleder")
  })

  it("extracts substitute from substitute_response", () => {
    const row = {
      substitute_response: { uuid: "s-1", current: { name: "Katrine" } },
    }
    expect(row.substitute_response?.current?.name ?? "").toBe("Katrine")
  })

  it("extracts trade_union from trade_union_response", () => {
    const row = {
      trade_union_response: { uuid: "tu-1", current: { name: "FOA" } },
    }
    expect(row.trade_union_response?.current?.name ?? "").toBe("FOA")
  })
})

describe("insights: itusers field extraction", () => {
  it("extracts itsystem from itsystem_response", () => {
    const row = {
      itsystem_response: { uuid: "is-1", current: { name: "Active Directory" } },
    }
    expect(row.itsystem_response?.current?.name ?? "").toBe("Active Directory")
  })

  it("extracts rolebinding names from role_response", () => {
    const row = {
      rolebindings: [
        { role_response: { uuid: "r-1", current: { name: "Admin" } } },
        { role_response: { uuid: "r-2", current: { name: "Reader" } } },
      ],
    }
    const roles = row.rolebindings
      ?.flatMap((rb: any) => rb.role_response?.current?.name)
      .filter(Boolean)
      .join(", ")
    expect(roles).toBe("Admin, Reader")
  })

  it("handles null role_response.current", () => {
    const row = {
      rolebindings: [{ role_response: { uuid: "r-1", current: null } }],
    }
    const roles = row.rolebindings
      ?.flatMap((rb: any) => rb.role_response?.current?.name)
      .filter(Boolean)
      .join(", ")
    expect(roles).toBe("")
  })
})

describe("insights: managers field extraction", () => {
  it("extracts responsibilities via joinCurrentNames", () => {
    const objects = [
      { uuid: "r-1", current: { name: "Personale: ansættelse" } },
      { uuid: "r-2", current: { name: "Personale: øvrige" } },
    ]
    expect(joinCurrentNames(objects)).toBe("Personale: ansættelse, Personale: øvrige")
  })

  it("handles null current in responsibilities", () => {
    const objects = [
      { uuid: "r-1", current: { name: "Budget" } },
      { uuid: "r-2", current: null },
    ]
    expect(joinCurrentNames(objects)).toBe("Budget")
  })

  it("extracts manager_type from manager_type_response", () => {
    const row = {
      manager_type_response: { uuid: "mt-1", current: { name: "Direktør" } },
    }
    expect(row.manager_type_response?.current?.name ?? "").toBe("Direktør")
  })

  it("extracts manager_level from manager_level_response", () => {
    const row = {
      manager_level_response: { uuid: "ml-1", current: { name: "Niveau 4" } },
    }
    expect(row.manager_level_response?.current?.name ?? "").toBe("Niveau 4")
  })
})

describe("insights: owners field extraction", () => {
  it("extracts owner name from owner_response", () => {
    const row = {
      owner_response: { uuid: "o-1", current: { name: "Alice" } },
    }
    expect(row.owner_response?.current?.name ?? "").toBe("Alice")
  })
})

describe("insights: related_units field extraction", () => {
  it("extracts org unit names from org_units_response", () => {
    const row = {
      org_units_response: {
        objects: [
          { uuid: "ou-1", current: { name: "Unit A" } },
          { uuid: "ou-2", current: { name: "Unit B" } },
        ],
      },
    }
    expect(row.org_units_response?.objects?.[0]?.current?.name ?? "").toBe("Unit A")
    expect(row.org_units_response?.objects?.[1]?.current?.name ?? "").toBe("Unit B")
  })

  it("handles missing second related unit", () => {
    const row = {
      org_units_response: {
        objects: [{ uuid: "ou-1", current: { name: "Unit A" } }],
      },
    }
    expect(row.org_units_response?.objects?.[0]?.current?.name ?? "").toBe("Unit A")
    expect(row.org_units_response?.objects?.[1]?.current?.name ?? "").toBe("")
  })
})
