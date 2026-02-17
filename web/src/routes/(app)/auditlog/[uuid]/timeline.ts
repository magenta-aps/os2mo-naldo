import { parseISO, addDays, isEqual, isAfter, compareAsc } from "date-fns"

// ==========================================
// VIS-TIMELINE TYPES
// ==========================================
// These define the structure required by the visualization library.

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
  tooltipData?: {
    actor: string
    attribute: string
    value: string
    start: Date
    end: Date
    note?: string
  }
}

// Represents a single logical period of validity for a specific attribute.
export interface TimelineInterval {
  start: Date
  end: Date
  value: string
  isChange: boolean
}

export interface Registration {
  id: string
  objectUuid: string
  registeredAt: Date
  actor: string
  note: string
  timelines: Record<string, TimelineInterval[]>
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

const FAR_FUTURE = new Date("2099-12-31")

/**
 * Normalizes incoming dates to ensure the timeline bar stays open-ended
 * if a date is missing (defaults to 2099).
 */
const normalizeDate = (input: any): Date => {
  if (!input) return FAR_FUTURE
  if (input instanceof Date) return input
  if (typeof input === "string") return parseISO(input)
  return FAR_FUTURE
}

/**
 * Checks if the 'newInterval' is a subset of any interval in 'history'.
 * Used to determine if a data point is a "Technical Split" (Gray) or a "Real Change" (Blue).
 */
const isCoveredByHistory = (
  newInterval: TimelineInterval,
  history: TimelineInterval[]
) => {
  return history.some((historyItem) => {
    // Values must match exactly
    if (historyItem.value !== newInterval.value) return false

    // Range Check: Is the new interval completely inside the history item?
    // Logic: History Start <= New Start  AND  History End >= New End
    const isStartInside = historyItem.start.getTime() <= newInterval.start.getTime()
    const isEndInside = historyItem.end.getTime() >= newInterval.end.getTime()

    return isStartInside && isEndInside
  })
}

/**
 * Recursively digs into data objects to find the best human-readable string.
 */
const extractDisplayValue = (data: any): string => {
  if (data === null || data === undefined) return "not_set"

  if (typeof data !== "object") {
    const s = String(data).trim()
    return s.length ? s : "not_set"
  }

  // Handle Lists
  if (Array.isArray(data)) {
    if (data.length === 0) return "not_set"
    return data.map((item) => extractDisplayValue(item)).join(", ")
  }

  // Handle Objects (Context-Aware)
  if ("name" in data && data.name) return String(data.name)
  if ("value" in data && data.value) return String(data.value)
  if (data.uuid) return String(data.uuid)

  return "Unknown Data"
}

/**
 * Merges adjacent intervals if they share the same Value AND Change Status.
 * This reduces visual clutter on the timeline.
 */
const consolidateIntervals = (entries: TimelineInterval[]): TimelineInterval[] => {
  if (!entries.length) return []
  const sorted = [...entries].sort((a, b) => compareAsc(a.start, b.start))

  const merged: TimelineInterval[] = []
  let current = sorted[0]

  for (let i = 1; i < sorted.length; i++) {
    const next = sorted[i]

    // Check adjacency (Are they right next to each other?)
    const isAdjacent =
      isEqual(next.start, addDays(current.end, 1)) ||
      next.start.getTime() === current.end.getTime()

    const isSameValue = current.value === next.value

    // Strict Check: Don't merge a "Blue" (New) item into a "Gray" (Old) item
    const isSameStatus = current.isChange === next.isChange

    if (isSameValue && isAdjacent && isSameStatus) {
      if (isAfter(next.end, current.end)) {
        current.end = next.end
      }
    } else {
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

  // Chronological sort is required for the history replay logic to work
  const sortedData = [...rawData].sort((a, b) => {
    const dateA = a.start ? new Date(a.start).getTime() : 0
    const dateB = b.start ? new Date(b.start).getTime() : 0
    return dateA - dateB
  })

  // Accumulates ALL valid intervals seen so far.
  // This allows a new "Split" (subset) to be covered by an "Old" (superset)
  // even if that superset was from 10 registrations ago.
  const globalHistory: Record<string, TimelineInterval[]> = {}

  sortedData.forEach((reg, index) => {
    if (!reg || !reg.validities) return

    const uniqueGroupId = `registration-${index}`
    const regTimestamp = reg.start ? parseISO(reg.start) : new Date()

    const registration: Registration = {
      id: uniqueGroupId,
      objectUuid: reg.uuid,
      registeredAt: regTimestamp,
      actor: reg.actor_object?.display_name || "Unknown",
      note: reg.note || "",
      timelines: {},
    }

    // Buffer for new items found in THIS registration cycle
    const currentRegistrationIntervals: Record<string, TimelineInterval[]> = {}

    // Process Validities
    reg.validities.forEach((validityBlock: any) => {
      const validFrom = normalizeDate(
        validityBlock.validity?.from ||
          validityBlock.person_validity?.from ||
          validityBlock.class_validity?.from
      )
      const validTo = normalizeDate(
        validityBlock.validity?.to ||
          validityBlock.person_validity?.to ||
          validityBlock.class_validity?.to
      )

      Object.keys(validityBlock).forEach((key) => {
        // Skip metadata keys
        if (["validity", "person_validity", "class_validity"].includes(key)) return

        const content = extractDisplayValue(validityBlock[key])

        // Init buffers
        if (!currentRegistrationIntervals[key]) currentRegistrationIntervals[key] = []
        if (!globalHistory[key]) globalHistory[key] = []

        const newInterval: TimelineInterval = {
          start: validFrom,
          end: validTo,
          value: content,
          isChange: false, // Calculated below
        }

        // Change Detection Logic
        // If this interval is NOT covered by history, it is a Change (Blue).
        const isExisting = isCoveredByHistory(newInterval, globalHistory[key])
        newInterval.isChange = !isExisting

        // Add to Output
        if (!registration.timelines[key]) registration.timelines[key] = []
        registration.timelines[key].push(newInterval)

        // Add to Buffer (to be merged into history later)
        currentRegistrationIntervals[key].push(newInterval)
      })
    })

    // Update Global History
    // We merge the new items into the history so they can "cover" future splits
    Object.keys(currentRegistrationIntervals).forEach((key) => {
      const oldHistory = globalHistory[key] || []
      globalHistory[key] = [...oldHistory, ...currentRegistrationIntervals[key]]
    })

    // Consolidate Visuals
    // Merges adjacent blocks to make the timeline look cleaner
    Object.keys(registration.timelines).forEach((key) => {
      registration.timelines[key] = consolidateIntervals(registration.timelines[key])
    })

    output.push(registration)
  })

  return output.reverse()
}
