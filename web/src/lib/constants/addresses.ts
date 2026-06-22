// Plain array, not an enum: keys would equal values, and we only need iteration.
export const AddressScope = [
  "DAR",
  "EAN",
  "EMAIL",
  "MULTIFIELD_TEXT",
  "PHONE",
  "PNUMBER",
  "TEXT",
  "WWW",
] as const

export const isAddressTypeFacet = (userKey: string | undefined | null): boolean =>
  userKey === "employee_address_type" ||
  userKey === "org_unit_address_type" ||
  userKey === "manager_address_type"
