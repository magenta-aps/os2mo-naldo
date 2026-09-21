import { getContext, setContext } from "svelte"

// An expandable row can change the values in the row above it. With the default
// auto table layout the browser re-measures every column on each change, so the
// whole table jumps. A row that does this holds the lock while it is open, and
// the table pins its columns to the widths they had at that moment.
export type ColumnLock = {
  // Call before the DOM changes, so the widths measured are the ones on screen
  hold: () => void
  release: () => void
}

const key = "columnLock"

export const setColumnLock = (lock: ColumnLock) => setContext(key, lock)

// undefined outside a table that offers one, so callers stay optional
export const getColumnLock = () => getContext<ColumnLock | undefined>(key)
