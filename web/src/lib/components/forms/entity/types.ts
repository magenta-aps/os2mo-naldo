// Value shapes bound as each field group's `value`: the create routes seed a
// createDefaultXValues() object, the wizard binds a store item of the same
// shape plus its own extras.

export type EmployeeValues = {
  // Matches CprLookup's response shape; `name` is "" for fictional CPRs
  // (typed name) and non-empty for looked-up ones (derived name).
  cprNumber: { name: string; cpr_no: string }
  firstName: string
  lastName: string
  nicknameFirstname: string
  nicknameLastname: string
}

export const createDefaultEmployeeValues = (): EmployeeValues => ({
  cprNumber: { name: "", cpr_no: "" },
  firstName: "",
  lastName: "",
  nicknameFirstname: "",
  nicknameLastname: "",
})
