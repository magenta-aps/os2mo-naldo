import { env } from "$lib/env"
import { _ } from "svelte-i18n"
import { get } from "svelte/store"
import { capital } from "$lib/utils/helpers"
import type { MainQuery } from "$lib/utils/insights"

const t = (key: string, vars = {}) => capital(get(_)(key, vars))

const validityField = {
  label: "validity",
  query: "validity { from to }",
  getHeaders: () => [t("from"), t("to")],
  getValues: (row: any) => [row.validity?.from ?? "", row.validity?.to ?? ""],
}

const subjectField = {
  label: "subject",
  query: "__typename",
  getHeaders: () => [t("subject")],
  getValues: (row: any) => [row.__typename ?? ""],
}

// Helper to join array of objects by name
const joinNames = (arr: any[]) =>
  arr
    ?.map((i: any) => i.name)
    .filter(Boolean)
    .join(", ") ?? ""

const showExtension1 = env.PUBLIC_SHOW_EXTENSION_1

// Configuration

export const mainQueries: MainQuery[] = [
  {
    operation: "org_units",
    filter: "OrganisationUnitFilter",
    label: "unit",
    fields: [
      {
        label: "name",
        query: "name",
        getHeaders: () => [t("name")],
        getValues: (row) => [row.name ?? ""],
      },
      {
        label: "breadcrumbs",
        query: "ancestors { name }",
        getHeaders: (_, data) => {
          let maxBreadcrumbs = 0
          if (data) {
            data.forEach((u) => {
              if (u && u.ancestors.length)
                maxBreadcrumbs = Math.max(maxBreadcrumbs, u.ancestors.length)
            })
          }
          const count = maxBreadcrumbs || 0
          return Array.from(
            { length: count },
            (__, i) => `${t("unit", { values: { n: 1 } })} ${i + 1}`
          )
        },
        getValues: (row) => {
          // Returns array of strings. The CSV engine handles padding.
          return row.ancestors?.map((a: any) => a.name).reverse() ?? []
        },
      },
      {
        label: "parent",
        query: "parent { name }",
        getHeaders: () => [t("parent")],
        getValues: (row) => [row.parent?.name ?? ""],
      },
      {
        label: "unit_type",
        query: "unit_type { name }",
        getHeaders: () => [t("unit_type", { values: { n: 1 } })],
        getValues: (row) => [row.unit_type?.name ?? ""],
      },
      {
        label: "org_unit_level",
        query: "org_unit_level { name }",
        getHeaders: () => [t("org_unit_level", { values: { n: 1 } })],
        getValues: (row) => [row.org_unit_level?.name ?? ""],
      },
      validityField,
    ],
  },
  {
    operation: "engagements",
    filter: "EngagementFilter",
    label: "engagement",
    fields: [
      subjectField,
      {
        label: "name",
        query: "person { name }",
        getHeaders: () => [t("name")],
        getValues: (row) => [row.person?.[0]?.name ?? ""],
      },
      // --- Conditional Extension Logic ---
      ...(showExtension1
        ? [
            {
              label: "job_code",
              query: "job_function { name }",
              getHeaders: () => [t("job_code", { values: { n: 1 } })],
              getValues: (row: any) => [row.job_function?.name ?? ""],
            },
            {
              label: "job_function",
              query: "extension_1",
              getHeaders: () => [t("job_function", { values: { n: 1 } })],
              getValues: (row: any) => [row.extension_1 ?? ""],
            },
          ]
        : [
            {
              label: "job_function",
              query: "job_function { name }",
              getHeaders: () => [t("job_function", { values: { n: 1 } })],
              getValues: (row: any) => [row.job_function?.name ?? ""],
            },
          ]),
      {
        label: "user_key",
        query: "user_key",
        getHeaders: () => [t("user_key")],
        getValues: (row) => [row.user_key ?? ""],
      },
      {
        label: "cpr_number",
        query: "person { cpr_number }",
        getHeaders: () => [t("cpr_number")],
        getValues: (row) => [row.person?.[0]?.cpr_number ?? ""],
      },
      {
        label: "engagement_type",
        query: "engagement_type { name }",
        getHeaders: () => [t("engagement_type")],
        getValues: (row) => [row.engagement_type?.name ?? ""],
      },
      {
        label: "primary",
        query: "primary { name }",
        getHeaders: () => [t("primary")],
        getValues: (row) => [row.primary?.name ?? ""],
      },
      {
        label: "email",
        // Using GraphQL alias 'email' to make parsing easier
        query:
          'person { email: addresses(filter: { address_type: { scope: "EMAIL" } }) { name } }',
        getHeaders: () => [t("email")],
        getValues: (row) => {
          const emails = row.person?.[0]?.email
          return [joinNames(emails)]
        },
      },
      {
        label: "phone",
        // Using GraphQL alias 'phone' to make parsing easier
        query:
          'person { phone: addresses(filter: { address_type: { scope: "PHONE" } }) { name } }',
        getHeaders: () => [t("phone")],
        getValues: (row) => {
          const phones = row.person?.[0]?.phone
          return [joinNames(phones)]
        },
      },
      {
        label: "manager",
        query: "managers(exclude_self: true, inherit: true) { person { name } }",
        getHeaders: () => [t("manager", { values: { n: 1 } })],
        getValues: (row) => {
          // Giver det mening at skrive vakant, når der spørges om hvem personens leder er??
          const managerNames = row.managers
            .map((m: any) => m.person?.[0]?.name ?? t("vacant"))
            .filter(Boolean)
            .join(", ")
          return [managerNames]
        },
      },
      {
        label: "manager_email",
        query:
          'managers(exclude_self: true, inherit: true) { person { addresses(filter: { address_type: { scope: "EMAIL" } }) { name } } }',
        getHeaders: () => [t("manager_email")],
        getValues: (row) => {
          if (!row.managers) return [""]
          const emails = row.managers
            .flatMap((m: any) => m.person?.[0]?.addresses ?? [])
            .map((a: any) => a.name)
            .filter(Boolean)
            .join(", ")
          return [emails]
        },
      },
      validityField,
    ],
  },
  {
    operation: "associations",
    filter: "AssociationFilter",
    label: "association",
    fields: [
      subjectField,
      {
        label: "name",
        query: "person { name }",
        getHeaders: () => [t("name")],
        getValues: (row) => [row.person?.[0]?.name ?? ""],
      },
      {
        label: "association_type",
        query: "association_type { name }",
        getHeaders: () => [t("association_type")],
        getValues: (row) => [row.association_type?.name ?? ""],
      },
      {
        label: "substitute",
        query: "substitute { name }",
        getHeaders: () => [t("substitute")],
        getValues: (row) => [row.substitute?.[0]?.name ?? ""],
      },
      {
        label: "trade_union",
        query: "trade_union { name }",
        getHeaders: () => [t("trade_union")],
        getValues: (row) => [row.trade_union?.name ?? ""],
      },
      validityField,
    ],
  },
  {
    operation: "itusers",
    filter: "ITUserFilter",
    label: "ituser",
    fields: [
      subjectField,
      {
        label: "itsystem",
        query: "itsystem { name }",
        getHeaders: () => [t("itsystem", { values: { n: 1 } })],
        getValues: (row) => [row.itsystem?.name ?? ""],
      },
      {
        label: "account_name",
        query: "user_key",
        getHeaders: () => [t("account_name")],
        getValues: (row) => [row.user_key ?? ""],
      },
      {
        label: "rolebinding",
        query:
          "rolebindings(filter: { from_date: $date }) { role(filter: { from_date: $date }){ name }}",
        getHeaders: () => [t("rolebinding", { values: { n: 2 } })],
        getValues: (row) => {
          // row.rolebindings is an array of objects.
          // each object has a 'role' array.
          // We flatten everything to get a list of role names.
          const roles = row.rolebindings
            ?.flatMap((rb: any) => rb.role?.map((r: any) => r.name))
            .filter(Boolean)
            .join(", ")
          return [roles ?? ""]
        },
      },
      {
        label: "primary",
        query: "primary { name }",
        getHeaders: () => [t("primary")],
        getValues: (row) => [row.primary?.name ?? ""],
      },
      validityField,
    ],
  },
  {
    operation: "managers",
    filter: "ManagerFilter",
    label: "manager",
    fields: [
      subjectField,
      {
        label: "name",
        query: "person { name }",
        getHeaders: () => [t("name")],
        getValues: (row) => [row.person?.[0]?.name ?? t("vacant")],
      },
      {
        label: "manager_responsibility",
        query: "responsibilities { name }",
        getHeaders: () => [t("manager_responsibility")],
        getValues: (row) => [joinNames(row.responsibilities)],
      },
      {
        label: "manager_type",
        query: "manager_type { name }",
        getHeaders: () => [t("manager_type")],
        getValues: (row) => [row.manager_type?.name ?? ""],
      },
      {
        label: "manager_level",
        query: "manager_level { name }",
        getHeaders: () => [t("manager_level")],
        getValues: (row) => [row.manager_level?.name ?? ""],
      },
      validityField,
    ],
  },
  {
    operation: "owners",
    filter: "OwnerFilter",
    label: "owner",
    fields: [
      subjectField,
      {
        label: "name",
        query: "owner { name }",
        getHeaders: () => [t("name")],
        getValues: (row) => [row.owner?.[0]?.name ?? ""],
      },
      validityField,
    ],
  },
  {
    operation: "related_units",
    filter: "RelatedUnitFilter",
    label: "related_unit",
    fields: [
      subjectField,
      {
        label: "related_unit",
        query: "org_units { name }",
        getHeaders: () => [
          `${t("related_unit", { values: { n: 1 } })} 1`,
          `${t("related_unit", { values: { n: 1 } })} 2`,
        ],
        getValues: (row) => [
          row.org_units?.[0]?.name ?? "",
          row.org_units?.[1]?.name ?? "",
        ],
      },
    ],
  },
]
