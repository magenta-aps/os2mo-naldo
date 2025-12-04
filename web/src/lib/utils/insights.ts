// 1. Define what the 't' function looks like:
// It takes a string 'key' and optional 'vars', and returns a string.
export type Translator = (key: string, vars?: any) => string

export type Field = {
  label: string // The internal ID used for translations/keys
  query: string // The GraphQL fragment (e.g., "job_function { name }")

  /**
   * Returns an array of strings for the CSV Header row.
   * We pass the dataset in case we need to calculate dynamic columns (like Breadcrumbs)
   */
  getHeaders: (t: Translator, data?: any[]) => string[]

  /**
   * Returns an array of strings for the CSV Row.
   * Returns array because some fields (like Validity) span multiple columns.
   */
  getValues: (row: any, t?: Translator) => string[]
}

export type MainQuery = {
  operation: string // GraphQL operation name (e.g. "org_units")
  filter: string // Filter type (e.g. "OrganisationUnitFilter")
  label: string // Label key for translation (e.g. "unit")
  fields: Field[]
}

export type SelectedQuery = {
  mainQuery?: MainQuery
  chosenFields: Field[]
}
