import { parse } from "@marcbachmann/cel-js"

// A syntax error in the condition, caught before MO is asked. Only syntax:
// which names a condition may use is MO's to decide when saving.
export const celSyntaxError = (condition: string): string | undefined => {
  if (!condition.trim()) return undefined
  try {
    parse(condition)
    return undefined
  } catch (err) {
    return err instanceof Error ? err.message : String(err)
  }
}
