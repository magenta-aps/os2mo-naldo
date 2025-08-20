import { env } from "$env/dynamic/public"
import { _ } from "svelte-i18n"
import { get } from "svelte/store"
import { capital } from "$lib/utils/helpers"

export type Field = {
  value: string
  subString: string
}

export type MainQuery = {
  operation: string
  filter: string
  value: string
  n: number
  fields: Field[]
}

export type SelectedQuery = {
  mainQuery?: MainQuery
  chosenFields: Field[]
}

export const resolveFieldValue = (searchObject: any, header: Field) => {
  if (!searchObject) {
    return
  }
  if (header.subString === "name") {
    return searchObject.name ?? ""
  } else if (header.value === "breadcrumbs") {
    return searchObject.ancestors.reverse()
  } else if (header.value === "cpr_number") {
    return searchObject.person[0].cpr_number
  } else if (
    header.value === "name" &&
    header.subString !== "name" &&
    searchObject.person
  ) {
    return searchObject.person[0]?.name ?? ""
  } else if (header.value === "email" || header.value === "phone") {
    if (searchObject.person && searchObject.person[0][header.value]) {
      return (
        searchObject.person[0][header.value]
          .map((address: { name: string }) => address.name)
          .join(", ") ?? ""
      )
    } else {
      return ""
    }
  } else if (
    header.value === "name" &&
    header.subString !== "name" &&
    searchObject.owner
  ) {
    return searchObject.owner[0]?.name ?? ""
  } else if (
    header.value === "manager" &&
    header.subString !== "name" &&
    searchObject.managers
  ) {
    return searchObject.managers
      .map(
        (manager: { person: { name: string }[] }) =>
          manager.person?.[0].name ?? capital(get(_)("vacant"))
      )
      .join(", ")
  } else if (header.value === "subject") {
    return searchObject.__typename
  } else if (header.value === "validity") {
    return [searchObject.validity?.from ?? "", searchObject.validity?.to ?? ""]
  } else if (header.value === "substitute" && searchObject.substitute) {
    return searchObject.substitute[0]?.name ?? ""
  } else if (header.value === "account_name" && searchObject.user_key) {
    return searchObject.user_key ?? ""
  } else if (header.value === "ituser" && searchObject.ituser) {
    return searchObject.ituser[0].user_key ?? ""
  } else if (header.value === "role" && searchObject.role) {
    return searchObject.role[0].name ?? ""
  } else if (header.value === "user_key") {
    return searchObject.user_key ?? ""
  } else if (
    env.PUBLIC_SHOW_EXTENSION_1 === "true" &&
    header.value === "job_function" &&
    header.subString === "extension_1"
  ) {
    return searchObject.extension_1 ?? ""
  } else if (
    env.PUBLIC_SHOW_EXTENSION_1 === "true" &&
    header.value === "job_code" &&
    searchObject.job_function
  ) {
    return searchObject.job_function?.name ?? ""
  } else if (header.value === "related_unit") {
    return [
      searchObject.org_units[0]?.name ?? "",
      searchObject.org_units[1]?.name ?? "",
    ]
  } else if (header.value === "manager_responsibility") {
    return searchObject.responsibilities
      .map((responsibility: { name: string }) => responsibility.name)
      .join(", ")
  } else if (header.value === "manager_email") {
    return searchObject.managers
      .flatMap((manager: { person: { addresses: { name: string }[] }[] }) =>
        manager.person?.[0].addresses.map((address) => address.name ?? "")
      )
      .join(", ")
  } else {
    return searchObject[header.value]?.name ?? ""
  }
}
