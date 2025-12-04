import { get } from "svelte/store"
import { _ } from "svelte-i18n"
import type { SelectedQuery } from "$lib/utils/insights"

const SEPARATOR = ";"

/**
 * The entry point for the button click.
 */
export const downloadHandler = (
  event: MouseEvent,
  data: any[],
  selectedQueries: SelectedQuery[],
  filename: string
) => {
  event.preventDefault()

  if (!data || data.length === 0) {
    throw new Error("Data was empty")
  }

  const csvData: string = json2csv(data, selectedQueries)
  const BOM = "\uFEFF"
  const blob: Blob = new Blob([BOM + csvData], { type: "text/csv;charset=utf-8;" })

  const url = URL.createObjectURL(blob)
  const link: HTMLAnchorElement = document.createElement("a")
  link.href = url
  link.download = filename ? `${filename}.csv` : "insights.csv"

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * The Engine: Converts JSON data to CSV string based on the Config
 */
export const json2csv = (data: any[], selectedQueries: SelectedQuery[]): string => {
  const t = get(_)
  let csvHeaders: string[] = []
  let csvRows: string[] = []

  // --- 0. ORGANIZE ORDER ---
  // Ensure "org_units" always comes first in the columns, regardless of UI selection order
  const orderedQueries = [
    ...selectedQueries.filter((q) => q.mainQuery?.operation === "org_units"),
    ...selectedQueries.filter((q) => q.mainQuery?.operation !== "org_units"),
  ]

  // --- 1. GENERATE HEADERS ---
  // We use 'orderedQueries' so the headers respect the forced order
  orderedQueries.forEach((query) => {
    query.chosenFields.forEach((field) => {
      const headers = field.getHeaders(t, data)
      csvHeaders.push(...headers)
    })
  })

  // --- 2. GENERATE ROWS ---
  data.forEach((orgUnit) => {
    if (!orgUnit) return

    // Identify sub-queries to iterate over
    const subQueries = orderedQueries.filter(
      (q) => q.mainQuery?.operation !== "org_units"
    )

    if (subQueries.length === 0) {
      // CASE A: User only requested Org Units.
      csvRows.push(generateRow(t, data, orderedQueries, orgUnit, undefined, undefined))
    } else {
      // CASE B: User requested subqueries.
      subQueries.forEach((activeSubQuery) => {
        if (!activeSubQuery.mainQuery) return

        const operation = activeSubQuery.mainQuery.operation
        const items = getItems(orgUnit, operation)

        if (Array.isArray(items) && items.length > 0) {
          // Items exist. Create rows.
          items.forEach((item: any) => {
            // Filter Logic to ensure objects that has been moved are filtered
            // e.g. an engagement that has been moved to another unit
            if (operation !== "related_units" && item.org_unit_uuid !== orgUnit.uuid) {
              return
            }
            csvRows.push(
              generateRow(t, data, orderedQueries, orgUnit, activeSubQuery, item)
            )
          })
        } else {
          // Items do NOT exist (Empty Unit). Create 1 "Empty" row so the Unit still appears.
          csvRows.push(
            generateRow(t, data, orderedQueries, orgUnit, activeSubQuery, null)
          )
        }
      })
    }
  })

  return [csvHeaders.join(SEPARATOR), ...csvRows].join("\n")
}

/**
 * Extracts items based on the operation, handling special nested cases.
 */
const getItems = (orgUnit: any, operation: string) => {
  // SPECIAL CASE: IT Users are nested inside engagements (aliased as 'it')
  if (operation === "itusers") {
    if (!orgUnit.it) return []

    return orgUnit.it.flatMap((engagement: any) => {
      if (!engagement.itusers) return []

      // Map the wrappers -> current -> AND inject the Org Unit UUID
      // We inject the UUID so the standard filter logic (item.org_unit_uuid === unit.uuid) passes.
      return engagement.itusers
        .map((wrapper: any) => {
          const user = wrapper.current
          if (!user) return null
          return { ...user, org_unit_uuid: orgUnit.uuid }
        })
        .filter(Boolean)
    })
  }

  // STANDARD CASE: Direct property access
  return orgUnit[operation]
}

/**
 * Helper to build a single CSV row ensuring columns align with headers
 */
const generateRow = (
  t: any,
  data: any[],
  orderedQueries: SelectedQuery[],
  orgUnit: any,
  activeSubQuery: SelectedQuery | undefined,
  activeItem: any
): string => {
  let rowValues: string[] = []

  // Global Column Loop: iterate through 'orderedQueries' to match header order
  orderedQueries.forEach((query) => {
    // Case 1: Org Unit Data (Always fill)
    if (query.mainQuery?.operation === "org_units") {
      rowValues.push(...extractValues(t, data, query, orgUnit))
    }
    // Case 2: Active Sub-Query Data (Fill if we have an item)
    else if (query === activeSubQuery && activeItem) {
      rowValues.push(...extractValues(t, data, query, activeItem))
    }
    // Case 3: Other Sub-Queries (Pad with empty strings)
    else {
      rowValues.push(...padValues(t, data, query))
    }
  })

  return rowValues.map(escapeCsv).join(SEPARATOR)
}

const extractValues = (
  t: any,
  data: any[],
  query: SelectedQuery,
  sourceData: any
): string[] => {
  let values: string[] = []
  query.chosenFields.forEach((field) => {
    const fieldValues = field.getValues(sourceData, t)

    const expectedCount = field.getHeaders(t, data).length
    while (fieldValues.length < expectedCount) {
      fieldValues.push("")
    }
    values.push(...fieldValues)
  })
  return values
}

const padValues = (t: any, data: any[], query: SelectedQuery): string[] => {
  let padding: string[] = []
  query.chosenFields.forEach((field) => {
    const expectedCount = field.getHeaders(t, data).length
    padding.push(...new Array(expectedCount).fill(""))
  })
  return padding
}

const escapeCsv = (value: any): string => {
  if (value === null || value === undefined) return ""
  const str = String(value)
  if (str.includes(SEPARATOR) || str.includes("\n") || str.includes('"')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}
