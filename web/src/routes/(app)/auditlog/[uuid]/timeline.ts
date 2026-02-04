import { parseISO, addDays, isEqual, isAfter, compareAsc } from "date-fns"

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
    start: Date
    end: Date
    note?: string
  }
}

// ==========================================
// INTERNAL DATA MODELS
// ==========================================

// Represents a single block of time for a specific attribute
export interface TimelineEntry {
  start: Date
  end: Date
  value: string
  color: "blue"
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

const FAR_FUTURE = new Date("2099-12-31")

/**
 * Normalizes incoming dates.
 * If a date is missing, it defaults to the "Far Future" so the timeline bar stays open-ended.
 * It also handles stripping milliseconds if the API returns complex ISO strings.
 */
const toDate = (d: any): Date => {
  if (!d) return FAR_FUTURE
  if (d instanceof Date) return d
  if (typeof d === "string") return parseISO(d)
  return FAR_FUTURE
}

/**
 * The "Smart" Extractor.
 * Recursively digs into data objects to find the best human-readable string.
 * It uses the 'key' to decide which strategy to use (Context-Aware).
 */
const extractValue = (data: any, key?: string): string => {
  // 1. Safety Checks
  // If data is null/undefined, or an empty primitive string, we explicitly mark it.
  if (data === null || data === undefined) return "not_set"
  if (typeof data !== "object") {
    const s = String(data).trim()
    return s.length ? s : "not_set"
  }

  // TODO: Check `leave`, `owner`, `rolebinding` and `related_units` when fixed.

  // 2. Recursive List Handling
  // If the data is an array (e.g. a list of persons), we map over it.
  // Crucial: We pass 'key' down so the items inside know their context.
  if (Array.isArray(data)) {
    if (data.length === 0) return "not_set"
    return data.map((item) => extractValue(item, key)).join(", ")
  }

  // 3. Context-Specific Strategies
  // Certain keys require very specific formatting logic.

  // KLE Aspects: Just want the name list
  if (key === "kle_aspects") {
    return data.map((kle_aspect: any) => kle_aspect.name)
  }

  // KLE Number: Combine User Key + Name
  if (key === "kle_number") {
    return `${data?.user_key} - ${data?.name}`
  }

  // 4. Generic Object Strategies (Priority Order)
  // If no specific key matched, we try to guess the best field to show.

  // Priority A: "Display Name" (Best for Actors/Persons)
  if (data.display_name) return data.display_name

  // Priority B: "Name" (Best for simple types)
  if (data.name) return data.name

  // Priority C: "Value + Value2" (Complex Addresses)
  // We check for both to ensure we don't accidentally display partial data.
  if ("value" in data && "value2" in data) {
    if (data.value2) {
      return `${data.value || ""} ${data.value2}`.trim()
    }
  }

  // Priority D: "Value" (Simple Addresses)
  if ("value" in data && data.value) return String(data.value)

  // Priority E: UUID Fallback (Last resort)
  if (data.uuid) return String(data.uuid)

  return "Unknown Data"
}

/**
 * clean up the timeline.
 * If two adjacent entries have the exact same value (e.g. "Active" -> "Active"),
 * we merge them into one long block instead of showing two separate blocks side-by-side.
 */
const consolidateEntries = (entries: TimelineEntry[]): TimelineEntry[] => {
  if (!entries.length) return []

  // Sort by start date to ensure linear processing
  const sorted = [...entries].sort((a, b) => compareAsc(a.start, b.start))

  const merged: TimelineEntry[] = []
  let current = sorted[0]

  for (let i = 1; i < sorted.length; i++) {
    const next = sorted[i]

    // Check if blocks touch each other (Next starts exactly 1 day after Current ends)
    const isAdjacent = isEqual(next.start, addDays(current.end, 1))
    // Check if they say the same thing
    const isSameValue = current.value === next.value

    if (isSameValue && isAdjacent) {
      // Merge: Extend the current block to encompass the next one
      if (isAfter(next.end, current.end)) {
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
      // Determine date range (Handle 'validity' vs 'person_validity' alias)
      const validFrom = toDate(
        validityBlock.validity?.from || validityBlock.person_validity?.from
      )
      const validTo = toDate(
        validityBlock.validity?.to || validityBlock.person_validity?.to
      )

      // Iterate over every key in the block (person, address, etc.)
      Object.keys(validityBlock).forEach((key) => {
        // Skip metadata keys, they aren't timeline rows
        if (key === "validity" || key === "person_validity") return

        if (!registration.timelines[key]) {
          registration.timelines[key] = []
        }

        // Add the entry
        registration.timelines[key].push({
          start: validFrom,
          end: validTo,
          // Extract the human-readable string, passing the key for context
          value: extractValue(validityBlock[key], key),
          color: "blue",
        })
      })
    })

    // --- STEP 2: Optimize ---
    // Run the consolidation to merge adjacent identical blocks
    Object.keys(registration.timelines).forEach((key) => {
      registration.timelines[key] = consolidateEntries(registration.timelines[key])
    })

    output.push(registration)
  })

  return output
}
