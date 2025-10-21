export type FrontendGraphQLErrorContext = {
  status?: number
  description: string
  error_key: string
  [key: string]: any
}

export type FrontendGraphQLError = {
  response: {
    data: null
    errors: Array<{
      message: string
      locations: { line: number; column: number }[]
      path: string[]
      extensions: { error_context: FrontendGraphQLErrorContext }
    }>
    status: number
    headers: Record<string, any>
  }
  request: {
    query?: string
    variables?: any
  }
  message?: string
}

/**
 * Creates a frontend GraphQL-style error.
 *
 * @param error_key - Short identifier for the error (like backend codes)
 * @param description - Human-readable description
 * @param context - Extra context to attach to the error
 * @param variables - Optional payload (e.g., what was sent to API)
 * @param query - Optional GraphQL query string
 */
export function makeGraphQLError(
  error_key: string,
  description: string,
  context: Record<string, any> = {},
  variables?: any,
  query?: string
): FrontendGraphQLError {
  const status = context.status ?? 400

  const error_context: FrontendGraphQLErrorContext = {
    error: true,
    description,
    error_key,
    ...context,
  }

  return {
    message: `Error: ErrorCodes.${error_key}`,
    response: {
      data: null,
      errors: [
        {
          message: `ErrorCodes.${error_key}`,
          locations: [{ line: 2, column: 3 }],
          path: ["frontend_validation"],
          extensions: { error_context },
        },
      ],
      status,
      headers: {},
    },
    request: {
      query,
      variables,
    },
  }
}
/**
 * Creates a frontend no-op error in the same format as backend GraphQL errors.
 *
 * @param description - Human-readable message
 * @param variables - Optional payload
 * @param context - Extra context info
 */
export function makeFrontendNoopError(
  description: string,
  variables?: any,
  context: Record<string, any> = {}
) {
  return makeGraphQLError(
    "V_NO_EFFECT_CHANGE",
    description,
    { validity_change: "noop", ...context },
    variables
  )
}

/**
 * Generic frontend no-op detector.
 * Compares the original object with the new form data for relevant fields.
 *
 * @param original - The original object from the API
 * @param newData - The form submission payload
 * @param keysToCompare - The fields to check for changes
 */
export function isNoopToDateEdit<T extends Record<string, any>>(
  original: T,
  newData: Partial<T>, // allow optional fields
  keysToCompare: (keyof T)[]
): boolean {
  const originalTo = original.validity?.to
  const newTo = newData.validity?.to ?? originalTo
  console.log(originalTo)
  console.log(newTo)

  if (!originalTo || !newTo) return false

  const toDateShrinks = new Date(newTo) <= new Date(originalTo)

  const otherFieldsUnchanged = !keysToCompare.some((key) => {
    const orig = original[key]
    const curr = newData[key] ?? orig // fallback to original if missing

    if (typeof orig === "object" && typeof curr === "object")
      return JSON.stringify(orig) !== JSON.stringify(curr)

    return orig !== curr
  })

  return toDateShrinks
}
