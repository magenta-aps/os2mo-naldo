import { graphQLClient } from "$lib/http/client"
import { Temporal } from "temporal-polyfill"
import { PrimaryManagersDocument } from "./query.generated"

export type PrimaryManager = {
  // null for a vacant manager.
  name: string | null
  from: Temporal.ZonedDateTime
  to: Temporal.ZonedDateTime | null | undefined
}

export type PrimaryManagerLookup = {
  orgUnit: string | undefined
  primary: string | undefined
  from: Temporal.ZonedDateTime | null | undefined
  to: Temporal.ZonedDateTime | null | undefined
  // The manager role being edited, which never conflicts with itself. The
  // person's other manager roles in the unit still do.
  exclude?: string
}

// MO does not enforce one primary manager per unit, so the forms do: returns
// the other manager roles of the unit holding the primary class in the period.
// Empty until the unit, the primary class and the start date are all chosen.
export const getPrimaryManagers = async (
  { orgUnit, primary, from, to, exclude }: PrimaryManagerLookup,
  signal?: AbortSignal
): Promise<PrimaryManager[]> => {
  if (!orgUnit || !primary || !from) return []
  const res = await graphQLClient(signal).request(PrimaryManagersDocument, {
    orgUnit: [orgUnit],
    primary: primary,
    fromDate: from,
    // undefined drops out of the variables, and MO reads an omitted to_date
    // as from_date + 1 ms; null is an open end.
    toDate: to ?? null,
  })
  return res.managers.objects
    .filter((manager) => manager.uuid !== exclude)
    .flatMap((manager) =>
      // The filter matches a manager primary at any point in the period, but
      // returns all its overlapping validities.
      manager.validities.filter((v) => v.primary_response?.uuid === primary)
    )
    .map((v) => ({
      name: v.person_response
        ? v.person_response.current?.name ?? v.person_response.uuid
        : null,
      from: v.validity.from,
      to: v.validity.to,
    }))
}
