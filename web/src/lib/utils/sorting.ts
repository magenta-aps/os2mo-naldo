/**
 * Retrieves the value at a specified path within an object.
 *
 * @param obj - The object from which the value is to be retrieved.
 * @param path - The string path within the object, where each property and array index is separated by a dot or enclosed in square brackets.
 * @return The value at the specified path within the object, or undefined if the path does not exist.
 *
 * @example
 * const obj = { a: [{ b: 2 }, { c: 3 }] };
 * const path = "a[1].c";
 * console.log(getValueAtPath(obj, path));  // Outputs: 3
 */
export const getValueAtPath = (obj: any, path: string) => {
  path = path.replace(/\[(\w+)\]/g, ".$1") // convert indexes to properties
  path = path.replace(/^\./, "") // strip a leading dot
  const pathKeys = path.split(".")
  for (const key of pathKeys) {
    if (key in obj) {
      obj = obj[key]
    } else {
      return
    }
  }
  return obj
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
