import { _ } from "svelte-i18n"
import { capital } from "$lib/util/translationUtils"
import { get } from "svelte/store"
import { resolveFieldValue, type SelectedQuery, type Field } from "$lib/util/helpers"

// Function to convert JSON data to CSV format
export const json2csv = (data: any[], selectedQueries: SelectedQuery[]): string => {
  let csvHeader: string[] = []
  let csvRows: string[] = []
  let columnOffsets: number[] = [] // Keeps track of column start positions for each query

  // Calculate the number of columns for each query and where each starts
  selectedQueries.forEach((selectedQuery, index) => {
    const { chosenFields } = selectedQuery
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
  })

  let orgUnitData: string[] = new Array(csvHeader.length).fill("")

  // Prepare rows with empty cells where needed
  selectedQueries.forEach((selectedQuery, queryIndex) => {
    const { chosenFields, mainQuery } = selectedQuery
    const startOffset = columnOffsets[queryIndex]

    if (mainQuery?.operation === "org_units") {
      const unitData = data[0] // Assuming "org_units" data is at the top level

      chosenFields.forEach((field: Field, index) => {
        const fieldValue = resolveFieldValue(unitData, field)
        orgUnitData[startOffset + index] = fieldValue ? JSON.stringify(fieldValue) : ""
      })
    }

    if (mainQuery && mainQuery?.operation !== "org_units") {
      const itemsArray = data[0][mainQuery.operation]
      itemsArray.forEach((item: any) => {
        const row: string[] = [...orgUnitData]
        chosenFields.forEach((header, fieldIndex) => {
          const fieldValue = resolveFieldValue(item, header)
          // Move this
          let values: string[] = []

          if (header.value === "related_unit") {
            // TODO: Fix  this
          } else if (header.value === "validity") {
            // Handle validity, which has `from` and `to` values
            const fromValue = item.validity?.from || ""
            const toValue = item.validity?.to || ""
            values = [fromValue, toValue]
          } else {
            // Handle general case
            values = fieldValue ? [JSON.stringify(fieldValue)] : [""]
          }

          // // Insert values into the row array at the correct positions
          values.forEach((value, valueIndex) => {
            row[startOffset + fieldIndex + valueIndex] = value
          })
        })

        csvRows.push(row.join(","))
      })
    }
  })

  // Combine header and rows
  const csvData = [csvHeader.join(","), ...csvRows].join("\n")

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

  // Generate CSV and trigger download
  const csvData: string = json2csv(data, selectedQueries)
  const blob: Blob = new Blob([csvData], { type: "text/csv" })
  const link: HTMLAnchorElement = document.createElement("a")
  link.href = URL.createObjectURL(blob)
  link.download = filename ? `${filename}.csv` : "insights.csv"
  link.click()
}
