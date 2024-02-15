import { writable } from "svelte/store"

export enum OrgTab {
  ORG_UNIT = "unit",
  ADDRESS = "address",
  ENGAGEMENT = "engagement",
  ASSOCIATION = "association",
  IT = "ituser",
  ROLE = "role",
  MANAGER = "manager",
  KLE = "kle",
  OWNER = "owner",
  RELATED_UNIT = "related_unit",
}

export const activeOrgTab = writable(OrgTab.ORG_UNIT)

export enum EmployeeTab {
  EMPLOYEE = "employee",
  ENGAGEMENT = "engagement",
  ADDRESS = "address",
  ASSOCIATION = "association",
  ITASSOCIATION = "itassociation",
  ROLE = "role",
  IT = "ituser",
  LEAVE = "leave",
  MANAGER = "manager",
  OWNER = "owner",
}

export const activeEmployeeTab = writable(EmployeeTab.EMPLOYEE)
