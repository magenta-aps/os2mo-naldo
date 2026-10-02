import { dateTimeFields } from "$lib/graphql/dateTimeFields.generated"
import { toCopenhagen, toMO } from "$lib/utils/date"
import { Temporal } from "temporal-polyfill"

// Converts every DateTime value in a response to Temporal.ZonedDateTime in
// Copenhagen. `dateTimeFields` are the names of the DateTime fields Naldo's
// queries select; `yarn generate` fails if a query uses one of the names for
// anything else (see codegen/dateTimeFields.cjs).

// A DateTime field holds a timestamp string, or a list of them.
const toMoments = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(toMoments)
  return typeof value === "string" ? toCopenhagen(value) : value
}

const convert = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(convert)
  if (value === null || typeof value !== "object") return value
  return Object.fromEntries(
    Object.entries(value).map(([key, inner]) => [
      key,
      dateTimeFields.includes(key) ? toMoments(inner) : convert(inner),
    ])
  )
}

export const convertDateTimes = <T>(data: T): T => convert(data) as T

// For outgoing variables. JSON.stringify writes a ZonedDateTime with Temporal's
// "[Europe/Copenhagen]" suffix, which MO can't read; MO takes the offset. A
// PlainDate's own "yyyy-MM-dd" is fine, since MO reads a day as midnight in
// Copenhagen.
export const jsonSerializer = {
  parse: JSON.parse,
  stringify: (value: unknown) =>
    JSON.stringify(value, function (this: Record<string, unknown>, key, inner) {
      const original = this[key]
      return original instanceof Temporal.ZonedDateTime ? toMO(original) : inner
    }),
}
