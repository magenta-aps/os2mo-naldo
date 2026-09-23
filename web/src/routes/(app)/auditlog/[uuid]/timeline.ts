import { compareAsc, isAfter, isEqual, parseISO } from "date-fns"

// ==========================================
// VIS-TIMELINE DEFINITIONS
// ==========================================
// These interfaces define how the visual library (vis-timeline) expects data.

export interface TimelineGroup {
  id: string | number
  content: string // The label shown on the left (e.g., "Address", "Engagement")
  className?: string // CSS class for styling the row
  nestedGroups?: (string | number)[]
  showNested?: boolean
  style?: string
}

export interface TimelineItem {
  id: string | number
  group: string | number // Links this item to a specific row (Group ID)
  content: string // The text displayed inside the colored block
  start: Date | number
  end?: Date | number
  type?: "box" | "point" | "range" | "background"
  className?: string
  style?: string
  // Custom data we attach for the tooltip popup
  tooltipData?: {
    actor: string
    attribute: string
    value: string
    uuid?: string
    items?: TimelineListItem[]
    start: Date
    end: Date
    note?: string
  }
}

// ==========================================
// INTERNAL DATA MODELS
// ==========================================

// One element of a list-valued attribute (e.g. a manager's responsibilities)
export interface TimelineListItem {
  value: string
  uuid?: string
}

// Represents a single block of time for a specific attribute
export interface TimelineEntry {
  start: Date | null
  end: Date | null
  value: string
  uuid?: string
  // Set for a non-empty list; value then joins the item values
  items?: TimelineListItem[]
  changed?: boolean
}

// Represents one entire "Registration" event from the audit log
export interface Registration {
  id: string
  objectUuid: string
  registeredAt: Date
  actor: string
  note: string
  // A map where Key = Attribute Name (e.g. "person") and Value = List of time entries
  timelines: Record<string, TimelineEntry[]>
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

export const FAR_PAST = new Date("1900-01-01")
export const FAR_FUTURE = new Date("2099-12-31")

/**
 * Strips the "<type>__" alias prefix and the _response(s) suffix so translation
 * keys stay clean. The query aliases a field as "<type>__<field>" when its type
 * differs between registration types, since GraphQL cannot merge those.
 */
const toLabel = (key: string): string =>
  key.replace(/^[a-z]+__/, "").replace(/_responses?$/, "")

/**
 * Parses a validity block into nullable from/to dates.
 */
const parseValidity = (block: any): { from: Date | null; to: Date | null } => {
  const key = Object.keys(block).find((k) => toLabel(k) === "validity")
  const v = key ? block[key] : undefined
  return {
    from: v?.from ? parseISO(v.from) : null,
    to: v?.to ? parseISO(v.to) : null,
  }
}

/**
 * The "Smart" Extractor.
 * Recursively digs into data objects to find the best human-readable string.
 * It uses the 'key' to decide which strategy to use (Context-Aware).
 */
const extractValue = (data: any): string => {
  // 1. Safety Checks
  // If data is null/undefined, or an empty primitive string, we explicitly mark it.
  if (data === null || data === undefined) return "not_set"
  if (typeof data !== "object") {
    const s = String(data).trim()
    return s.length ? s : "not_set"
  }

  // 2. Paged _response: { objects: [...] }
  if ("objects" in data && Array.isArray(data.objects)) {
    return extractValue(data.objects)
  }

  // 3. Recursive List Handling
  // If the data is an array (e.g. a list of persons), we map over it.
  if (Array.isArray(data)) {
    if (data.length === 0) return "not_set"
    return data.map((item) => extractValue(item)).join(", ")
  }

  // 4. _response shape: { uuid, current: { name }, validities: [...] }
  // current can be null if there's no active validity (e.g. terminated or future-only entity)
  if ("current" in data) {
    if (data.current) return extractValue(data.current)
    // No current name — fall back to UUID so the user can use the link to investigate
    if (data.uuid) return String(data.uuid)
    return "not_set"
  }

  // "name" or "value" (Values of address-objects)
  if ("name" in data && data.name) return String(data.name)
  if ("value" in data && data.value) return String(data.value)

  // user_key fallback (e.g. engagements don't have "name")
  if ("user_key" in data && data.user_key) return String(data.user_key)

  // UUID Fallback (Last resort)
  if (data.uuid) return String(data.uuid)

  return "Unknown Data"
}

/**
 * Extracts the UUID from a data object.
 */
const extractUuid = (data: any): string | undefined => {
  if (data === null || data === undefined || typeof data !== "object") return undefined
  return data.uuid
}

/**
 * Returns the elements of a list-valued attribute: a plain array or a
 * paged _response ({ objects: [...] }). Undefined for anything else.
 */
const extractList = (data: any): any[] | undefined => {
  if (Array.isArray(data)) return data
  if (data && typeof data === "object" && Array.isArray(data.objects))
    return data.objects
  return undefined
}

/**
 * What two entries are compared on. Lists compare as sets, so the same items
 * in another order count as the same value.
 */
const entryIdentity = (e: TimelineEntry): string =>
  e.items
    ? e.items
        .map((item) => item.uuid ?? item.value)
        .sort()
        .join(",")
    : e.uuid ?? e.value

/**
 * clean up the timeline.
 * If two adjacent entries have the exact same value (e.g. "Active" -> "Active"),
 * we merge them into one long block instead of showing two separate blocks side-by-side.
 */
const consolidateEntries = (entries: TimelineEntry[]): TimelineEntry[] => {
  if (!entries.length) return []

  // Sort by start date to ensure linear processing
  const sorted = [...entries].sort((a, b) =>
    compareAsc(a.start ?? FAR_PAST, b.start ?? FAR_PAST)
  )

  const merged: TimelineEntry[] = []
  let current = sorted[0]

  for (let i = 1; i < sorted.length; i++) {
    const next = sorted[i]

    // Check if blocks touch each other (Next starts exactly where Current ends)
    const isAdjacent = isEqual(next.start ?? FAR_PAST, current.end ?? FAR_FUTURE)
    // Check if they say the same thing (compare on UUID when available)
    const isSameValue = entryIdentity(current) === entryIdentity(next)

    if (isSameValue && isAdjacent) {
      // Merge: Extend the current block to encompass the next one
      if (isAfter(next.end ?? FAR_FUTURE, current.end ?? FAR_FUTURE)) {
        current.end = next.end
      }
    } else {
      // No merge: Push current to results and start a new block
      merged.push(current)
      current = next
    }
  }

  merged.push(current)
  return merged
}

// ==========================================
// MAIN TRANSFORMER
// ==========================================

export const transformAuditLog = (rawData: any[]): Registration[] => {
  const output: Registration[] = []

  rawData.forEach((reg, index) => {
    // Skip broken or empty records
    if (!reg || !reg.validities) return

    const uniqueGroupId = `registration-${index}`
    // Use the registration time for sorting, fallback to now if missing
    const regTimestamp = reg.start ? parseISO(reg.start) : new Date()

    const registration: Registration = {
      id: uniqueGroupId,
      objectUuid: reg.uuid,
      registeredAt: regTimestamp,
      actor: reg.actor_object?.display_name || "Unknown",
      note: reg.note || "",
      timelines: {},
    }

    // --- STEP 1: Collect Raw Data ---
    reg.validities.forEach((validityBlock: any) => {
      const { from, to } = parseValidity(validityBlock)

      // Iterate over every key in the block (person, address, etc.)
      Object.keys(validityBlock).forEach((key) => {
        const label = toLabel(key)
        // The validity is the block's period, not a timeline row
        if (label === "validity") return

        if (!registration.timelines[label]) {
          registration.timelines[label] = []
        }

        // Add the entry
        const data = validityBlock[key]
        const list = extractList(data)
        const items = list?.map((item) => ({
          value: extractValue(item),
          uuid: extractUuid(item),
        }))
        registration.timelines[label].push(
          items?.length
            ? {
                start: from,
                end: to,
                value: items.map((item) => item.value).join(", "),
                items,
              }
            : {
                start: from,
                end: to,
                value: extractValue(data),
                uuid: extractUuid(data),
              }
        )
      })
    })

    // --- STEP 2: Optimize ---
    // Run the consolidation to merge adjacent identical blocks
    Object.keys(registration.timelines).forEach((key) => {
      registration.timelines[key] = consolidateEntries(registration.timelines[key])
    })

    output.push(registration)
  })

  // Compare each individual interval against the previous registration.
  // Only mark an entry as changed if that exact [start, end, compareKey] block didn't exist before.
  // We compare on UUID when available (stable reference), falling back to value for primitives.
  for (let i = 1; i < output.length; i++) {
    const prev = output[i - 1]
    const curr = output[i]

    Object.keys(curr.timelines).forEach((key) => {
      const compareKey = (e: TimelineEntry) =>
        `${entryIdentity(e)}|${e.start?.getTime()}|${e.end?.getTime()}`

      const prevSet = new Set((prev.timelines[key] || []).map(compareKey))

      curr.timelines[key].forEach((e) => {
        if (!prevSet.has(compareKey(e))) {
          e.changed = true
        }
      })
    })
  }

  return output.reverse()
}
