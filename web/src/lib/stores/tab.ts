import { writable } from "svelte/store"

export enum OrgTab {
  ORG_UNIT = "Enhed",
  ADDRESS = "Adresser",
  ENGAGEMENT = "Engagementer",
  ASSOCIATION = "Tilknytninger",
  IT = "IT",
  ROLE = "Roller",
  MANAGER = "Ledere",
  KLE = "KLE-opmærkninger",
  OWNER = "Ejere",
  RELATED_UNIT = "Relateret",
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
