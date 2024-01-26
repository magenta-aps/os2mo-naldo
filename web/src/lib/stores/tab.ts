import { writable } from "svelte/store"

export enum OrgTab {
  ORG_UNIT = "org_unit",
  ADDRESS = "address",
  ENGAGEMENT = "engagement",
  ASSOCIATION = "association",
  IT = "it",
  ROLE = "role",
  MANAGER = "manager",
  KLE = "kle",
  OWNER = "owner",
  RELATED_UNIT = "related_unit",
}

export const activeOrgTab = writable(OrgTab.ORG_UNIT)

export enum EmployeeTab {
  EMPLOYEE = "Medarbejder",
  ENGAGEMENT = "Engagementer",
  ADDRESS = "Adresser",
  ASSOCIATION = "Tilknytninger",
  ITASSOCIATION = "IT-Tilknytninger",
  ROLE = "Roller",
  IT = "IT",
  LEAVE = "Orlov",
  MANAGER = "Ledere",
  OWNER = "Ejere",
}

export const activeEmployeeTab = writable(EmployeeTab.EMPLOYEE)
