import { _ } from "svelte-i18n"
import { capital } from "$lib/util/translationUtils"
import { get } from "svelte/store"
import { resolveFieldValue, type SelectedQuery, type Field } from "$lib/util/helpers"

const SEPARATOR = ";"

// Function to convert JSON data to CSV format
export const json2csv = (data: any[], selectedQueries: SelectedQuery[]): string => {
  let csvHeader: string[] = []
  let csvRows: string[] = []
  let columnOffsets: number[] = [] // Keeps track of column start positions for each query
  let maxBreadcrumbs = 0

  // Check if `org_units` is the only subject
  const hasOtherQueries = selectedQueries.some(
    (query) => query.mainQuery?.operation !== "org_units"
  )

  // First, handle the org_unit headers and data
  let orgUnitDataTemplate: string[] = []
  const orgUnitsQuery = selectedQueries.find(
    (query) => query.mainQuery?.operation === "org_units"
  )

  if (orgUnitsQuery) {
    const { chosenFields } = orgUnitsQuery

    // Create headers for org_units
    const orgUnitHeader = chosenFields.flatMap((header) => {
      if (header.value === "breadcrumbs") {
        data.forEach((orgUnit) => {
          if (orgUnit && orgUnit.ancestors && Array.isArray(orgUnit.ancestors)) {
            maxBreadcrumbs = Math.max(maxBreadcrumbs, orgUnit.ancestors.length)
          }
        })
        return Array.from({ length: maxBreadcrumbs }, (_, i) => `Org unit ${i + 1}`)
      }
      if (header.value === "validity") {
        return [`${capital(get(_)("from"))}`, `${capital(get(_)("to"))}`]
      }
      return capital(get(_)(header.value, { values: { n: 1 } }))
    })

    // Add org_unit headers at the start
    csvHeader = csvHeader.concat(orgUnitHeader)

    // Create a template for orgUnitData rows, initialized with empty strings
    orgUnitDataTemplate = new Array(orgUnitHeader.length).fill("")
  }

  // Then, handle the rest of the selected queries and calculate headers
  selectedQueries.forEach((selectedQuery, index) => {
    const { chosenFields, mainQuery } = selectedQuery

    // Skip org_units because it's already handled
    if (mainQuery?.operation !== "org_units") {
      const currentHeader = chosenFields.flatMap((header) => {
        const headerText = capital(get(_)(header.value, { values: { n: 1 } }))
        if (header.value === "related_unit") {
          return [`${headerText} 1`, `${headerText} 2`]
        } else if (header.value === "validity") {
          return [`${capital(get(_)("from"))}`, `${capital(get(_)("to"))}`]
        }
        return headerText
      })

      // Set column offset for this query
      columnOffsets[index] = csvHeader.length
      csvHeader = csvHeader.concat(currentHeader)
    }
  })

  // Now, process each org unit
  data.forEach((orgUnit) => {
    if (orgUnit) {
      let orgUnitData: string[] = [...orgUnitDataTemplate] // Start with empty orgUnitData

      // If org_units query exists, fill in the orgUnitData
      if (orgUnitsQuery) {
        const { chosenFields } = orgUnitsQuery

        let currentOffset = 0 // Start of org unit fields in the row

        chosenFields.forEach((field: Field) => {
          let values: string[] = []
          const fieldValue = resolveFieldValue(orgUnit, field)

          if (field.value === "breadcrumbs") {
            // Create breadcrumbs
            values = Array.isArray(fieldValue)
              ? fieldValue.map((ancestor: { name: string }) => ancestor.name)
              : []
            // Add empty string to match `maxBreadcrumbs` length
            values = [...values, ...new Array(maxBreadcrumbs - values.length).fill("")]
          } else if (field.value === "validity") {
            // Handle validity field
            values = [orgUnit.validity?.from || "", orgUnit.validity?.to || ""]
          } else {
            // Handle general case
            values = fieldValue ? [fieldValue] : [""]
          }

          // Insert values into the orgUnitData array
          values.forEach((value) => {
            orgUnitData[currentOffset] = escapeCsv(value)
            currentOffset++
          })
        })
        // If only `org_units` is present in the query, push it to the row.
        // This is done, since if we have other queries, we want the orgUnitData to on every row, and not by itself.
        if (!hasOtherQueries) {
          csvRows.push(orgUnitData.join(SEPARATOR))
        }
      }

      // Process the rest of the queries and create rows
      selectedQueries.forEach((selectedQuery, queryIndex) => {
        const { chosenFields, mainQuery } = selectedQuery
        const startOffset = columnOffsets[queryIndex]

        if (mainQuery && mainQuery.operation !== "org_units") {
          const itemsArray = orgUnit[mainQuery.operation]

          if (itemsArray && Array.isArray(itemsArray)) {
            if (itemsArray.length) {
              itemsArray.forEach((item: any) => {
                // Filter out items that are not in the current org_unit / skip if operation is related_units
                if (
                  mainQuery.operation !== "related_units" &&
                  item.org_unit_uuid !== orgUnit.uuid
                ) {
                  return
                }
                const row: string[] = [...orgUnitData] // Start each row with orgUnitData

                let currentOffset = startOffset
                chosenFields.forEach((header) => {
                  const fieldValue = resolveFieldValue(item, header)
                  let values: string[] = []

                  if (header.value === "related_unit") {
                    // Handle related units
                    values = [
                      item.org_units[0]?.name || "",
                      item.org_units[1]?.name || "",
                    ]
                  } else if (header.value === "validity") {
                    // Handle validity field
                    const fromValue = item.validity?.from || ""
                    const toValue = item.validity?.to || ""
                    values = [fromValue, toValue]
                  } else {
                    // Handle general case
                    values = fieldValue ? [fieldValue] : [""]
                  }

                  // Insert values into the row array at the correct positions
                  values.forEach((value) => {
                    row[currentOffset] = escapeCsv(value)
                    currentOffset++
                  })
                })

                const csvRow = row.join(SEPARATOR)
                // Remove row if it's empty
                if (csvRow.replace(new RegExp(SEPARATOR, "g"), "").trim() !== "") {
                  csvRows.push(csvRow)
                }
              })
            } else {
              const row: string[] = [...orgUnitData]
              const csvRow = row.join(SEPARATOR)
              // Remove row if it's empty
              if (csvRow.replace(new RegExp(SEPARATOR, "g"), "").trim() !== "") {
                csvRows.push(csvRow)
              }
            }
          }
        }
      })
    }
  })

  // Combine header and rows
  const csvData = [csvHeader.join(SEPARATOR), ...csvRows].join("\n")

  return csvData
}

// Function to handle the download action
export const downloadHandler = (
  event: MouseEvent,
  data: any[],
  selectedQueries: SelectedQuery[],
  filename: string
) => {
  event.preventDefault()
  if (!data) {
    throw new Error("Data was empty")
  }

  // Generate CSV and trigger download
  const csvData: string = json2csv(data, selectedQueries)
  const BOM = "\uFEFF"
  const blob: Blob = new Blob([BOM + csvData], { type: "text/csv;charset=utf-8;" })
  const link: HTMLAnchorElement = document.createElement("a")
  link.href = URL.createObjectURL(blob)
  link.download = filename ? `${filename}.csv` : "insights.csv"
  link.click()
}

const escapeCsv = (value: any): string => {
  if (value === null || value === undefined) return ""
  const str = String(value)
  if (str.includes(SEPARATOR) || str.includes("\n") || str.includes('"')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}
