interface FlattenedObject {
  [key: string]: any
}

interface Header {
  key: string
  label: string
}

// TODO: Allow multiple managers in CSV

// Function to flatten nested objects
export const flattenObject = (obj: any, parentKey: string = ""): FlattenedObject => {
  return Object.keys(obj).reduce((acc: FlattenedObject, key: string) => {
    const newKey = parentKey ? `${parentKey}.${key}` : key

    if (typeof obj[key] === "object" && obj[key] !== null) {
      Object.assign(acc, flattenObject(obj[key], newKey))
    } else {
      acc[newKey] = obj[key]
    }

    return acc
  }, {})
}

// Function to extract unique fields from an array of objects
export const extractFields = (data: any[]): string[] => {
  const flattenedData: FlattenedObject[] = data.map((item) => flattenObject(item))

  const allFields: string[] = flattenedData.reduce(
    (acc: string[], item: FlattenedObject) => {
      Object.keys(item).forEach((key) => {
        if (!acc.includes(key)) {
          acc.push(key)
        }
      })
      return acc
    },
    []
  )

  return allFields
}

// Function to convert JSON data to CSV format
export const json2csv = (data: any[], headers: Header[]): string => {
  // Filter headers based on the presence of data
  const includedHeaders: Header[] = headers.filter((header) =>
    data.some((item) => {
      const value = header.key
        .split(".")
        .reduce(
          (obj, key) => (obj && obj[key] !== undefined ? obj[key] : undefined),
          item
        )
      return value !== undefined
    })
  )

  // Generate CSV content
  const csvContent: string = [
    includedHeaders.map((header) => header.label).join(","),
    ...data.map((item) => {
      const rowValues: string[] = includedHeaders.map((header) => {
        const value = header.key
          .split(".")
          .reduce(
            (obj, key) => (obj && obj[key] !== undefined ? obj[key] : undefined),
            item
          )
        return JSON.stringify(value)
      })
      return rowValues.join(",")
    }),
  ].join("\n")

  return csvContent
}

// Function to handle the download action
export const downloadHandler = (
  event: MouseEvent,
  data: any[],
  allPossibleHeaders: Header[]
) => {
  event.preventDefault()

  const currentDataHeaders: Header[] = allPossibleHeaders.map((definedHeader) => {
    // Check if definedHeader.key is present in the data
    const matchedHeader = extractFields(data).includes(definedHeader.key)
      ? definedHeader
      : null
    return matchedHeader || { key: definedHeader.key, label: definedHeader.key }
  })

  // Generate CSV and trigger download
  const csvData: string = json2csv(data, currentDataHeaders)
  const blob: Blob = new Blob([csvData], { type: "text/csv" })
  const link: HTMLAnchorElement = document.createElement("a")
  link.href = URL.createObjectURL(blob)
  link.download = "insights.csv"
  link.click()
}
