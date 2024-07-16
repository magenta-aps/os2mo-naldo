import { _ } from "svelte-i18n"
import { capital } from "$lib/util/translationUtils"
import { get } from "svelte/store"
import type { Field } from "$lib/util/helpers"

// TODO: Find better way to support `related_unit`..

// Helper function to parse the nested structure from subString
const parseSubString = (subString: string): string[] => {
  // Convert subString to a path-like structure, e.g., "parent {name}"
  return subString
    .replace(/\{|\}/g, "") // Remove braces
    .split(/\s+/) // Split by spaces
    .filter((part) => part.length > 0) // Remove empty parts
}

// Helper function to get nested value based on the parsed subString
const getNestedValue = (item: any, field: Field): any => {
  const keys = parseSubString(field.subString)

  if (field.value === "related_unit") {
    // :puke:
    return [item.org_units[0].name, item.org_units[1].name]
  } else if (field.value === "validity") {
    // :puke:
    return [item.validity.from, item.validity.to]
  }

  return keys.reduce((acc, key) => {
    if (acc && typeof acc === "object" && acc[key] !== undefined && acc[key] !== null) {
      return acc[key]
    }
    return null
  }, item)
}

// Function to convert JSON data to CSV format
export const json2csv = (data: any[], headers: Field[]): string => {
  // Generate CSV header from subString field
  const csvHeader = headers
    .flatMap((header) => {
      const headerText = capital(get(_)(header.value, { values: { n: 1 } }))
      if (header.value === "related_unit") {
        // Create two columns for related_unit :puke:
        return [`${headerText} 1`, `${headerText} 2`]
      } else if (header.value === "validity") {
        return [`${capital(get(_)("from"))}`, `${capital(get(_)("to"))}`]
      }
      return headerText
    })
    .join(",")

  // Generate CSV rows
  const csvRows = data.map((item) => {
    return headers
      .flatMap((header) => {
        const values = getNestedValue(item, header)
        if (header.value === "related_unit") {
          // Handle related_unit case with two columns :puke:
          return values.map((value: string[]) => (value ? value : null))
        } else if (header.value === "validity") {
          // TODO: Should we format the date?
          return values.map((value: string[]) => (value ? value : null))
        } else {
          // Return single value for non-array cases
          return JSON.stringify(values ? values : null)
        }
      })
      .join(",") // Join values for each row
  })

  return [csvHeader, ...csvRows].join("\n")
}

// Function to handle the download action
export const downloadHandler = (
  event: MouseEvent,
  data: any[],
  headers: Field[],
  filename: string
) => {
  event.preventDefault()

  // Generate CSV and trigger download
  const csvData: string = json2csv(data, headers)
  const blob: Blob = new Blob([csvData], { type: "text/csv" })
  const link: HTMLAnchorElement = document.createElement("a")
  link.href = URL.createObjectURL(blob)
  link.download = filename ? `${filename}.csv` : "insights.csv"
  link.click()
}
