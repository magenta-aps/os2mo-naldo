/**
 * Retrieves the value at a given path of an object.
 *
 * @param obj - The object from which to retrieve the value.
 * @param path - The path (as a dot-separated string) to the value in the object.
 *
 * @returns The value at the specified path in the object, or `undefined` if the path does not exist.
 */
export const getValueAtPath = (obj: any, path: string) => {
  return path.split(".").reduce((o, p) => (o || {})[p], obj)
}

/**
 * Sorts an array of objects based on a specified property and sort direction.
 *
 * @param data - The array of objects to be sorted.
 * @param sortKey - The property of the objects by which to sort.
 * @param sortDirection - The direction to sort in. Usually 1 for ascending order and -1 for descending order.
 *
 * @returns A new array with the same objects as `data`, sorted according to `sortKey` and `sortDirection`.
 *
 * @template T - The type of objects in the `data` array.
 */
export const sortData = <T>(data: T[], sortKey: string, sortDirection: number): T[] => {
  return [...data].sort((a, b) => {
    let aVal = getValueAtPath(a, sortKey)
    let bVal = getValueAtPath(b, sortKey)

    // Has to be done to make the sorting case-insensitive whole generic
    // Ensure aVal and bVal are strings before calling toLowerCase()
    if (typeof aVal === "string") {
      aVal = aVal.toLowerCase()
    }
    if (typeof bVal === "string") {
      bVal = bVal.toLowerCase()
    }

    if (aVal < bVal) {
      return -sortDirection
    } else if (aVal > bVal) {
      return sortDirection
    }

    return 0
  })
}
