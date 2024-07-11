import { _ } from "svelte-i18n"
import { capital } from "$lib/util/translationUtils"
import { get } from "svelte/store"

type Field = {
  value: string
  subString: string
}

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
  const csvHeader = headers.map((header) => capital(get(_)(header.value))).join(",")

  // Generate CSV rows
  const csvRows = data.map((item) => {
    const rowValues = headers.map((header) => {
      const value = getNestedValue(item, header)
      return JSON.stringify(value !== undefined ? value : "")
    })
    return rowValues.join(",")
  })

  return [csvHeader, ...csvRows].join("\n")
}

// Function to handle the download action
export const downloadHandler = (event: MouseEvent, data: any[], headers: Field[]) => {
  event.preventDefault()

  // Generate CSV and trigger download
  const csvData: string = json2csv(data, headers)
  const blob: Blob = new Blob([csvData], { type: "text/csv" })
  const link: HTMLAnchorElement = document.createElement("a")
  link.href = URL.createObjectURL(blob)
  link.download = "insights.csv"
  link.click()
}
