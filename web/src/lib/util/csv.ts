import { _ } from "svelte-i18n"
import { capital } from "$lib/util/translationUtils"
import { get } from "svelte/store"
import { resolveFieldValue, type Field } from "$lib/util/helpers"

// Helper function to get nested value based on the parsed subString
const getNestedValue = (item: any, field: Field): any => {
  return resolveFieldValue(item, field)
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
      }
      // Create two columns for validity from/to
      else if (header.value === "validity") {
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
          return values.map((value: string[]) => (value ? value : ""))
        } else if (header.value === "validity") {
          // TODO: Should we format the date?
          return values.map((value: string[]) => (value ? value : ""))
        } else {
          // Return single value for non-array cases
          return JSON.stringify(values ? values : "")
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
