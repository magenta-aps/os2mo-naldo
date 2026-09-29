import { toCopenhagenDay } from "$lib/utils/date"

type Bounds = { from?: string | null; to?: string | null }

// `validity` and its aliases (`person_validity`, `class_validity`) hold day
// bounds. Other timestamps, such as registration times, keep their time.
const isValidityKey = (key: string) => key === "validity" || key.endsWith("_validity")

const boundsToDays = (bounds: Bounds): Bounds => ({
  ...bounds,
  from: bounds.from ? toCopenhagenDay(bounds.from) : bounds.from,
  to: bounds.to ? toCopenhagenDay(bounds.to) : bounds.to,
})

const convert = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(convert)
  if (value === null || typeof value !== "object") return value
  return Object.fromEntries(
    Object.entries(value).map(([key, inner]) => [
      key,
      isValidityKey(key) && inner && typeof inner === "object"
        ? boundsToDays(inner as Bounds)
        : convert(inner),
    ])
  )
}

export const convertValiditiesToDays = <T>(data: T): T => convert(data) as T
