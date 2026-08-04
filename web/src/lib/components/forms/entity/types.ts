// Value shapes for the shared per-entity field groups. Both consumers bind
// one of these as the group's `value`:
//   - the create routes seed a local `createDefaultXValues()` object
//   - the userflow wizard binds a store item (same shape + wizard-only extras)
// Keeping the shapes here, next to the field groups, is what stops the two
// consumers from drifting apart again.

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
