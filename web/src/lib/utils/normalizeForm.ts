import { formatKleNumberTitleAndUuid } from "$lib/utils/helpers"

export const normalizeEngagement = (e: any) => {
  return {
    to: e.validity?.to?.split("T")[0] ?? null,
    org_unit: e.org_unit?.[0]?.uuid ?? null,
    job_function: e.job_function?.name ?? null,
    engagement_type: e.engagement_type?.name ?? null,
    user_key: e.user_key ?? null,
    primary: e.primary?.name ?? "",
  }
}

export const normalizeAssociation = (a: any) => {
  return {
    to: a.validity?.to?.split("T")[0] ?? null,
    person: a.person?.[0]?.uuid ?? null,
    org_unit: a.org_unit?.[0]?.uuid ?? null,
    association_type: a.association_type?.name ?? null,
    primary: a.primary?.name ?? "",
    substitute: a.substitute?.name ?? "",
    trade_union: a.trade_union?.name ?? "",
  }
}

export const normalizeITUser = (i: any, note: string | null | undefined) => {
  return {
    to: i.validity?.to?.split("T")[0] ?? null,
    itsystem: i.itsystem?.name ?? null,
    user_key: i.user_key ?? "",
    primary: i.primary?.name ?? "",
    note: note ?? "",
  }
}

export const normalizeAddress = (a: any) => {
  return {
    to: a.validity?.to?.split("T")[0] ?? null,
    address_type: a.address_type?.name ?? null,
    value: a.name ?? null,
    user_key: a.user_key ?? "",
    visibility: a.visibility?.name ?? "",
  }
}

export const normalizeManager = (m: any) => {
  return {
    to: m.validity?.to?.split("T")[0] ?? null,
    person: m.person?.[0]?.uuid ?? null,
    org_unit: m.org_unit?.[0]?.uuid ?? null,
    manager_type: m.manager_type?.name ?? null,
    manager_level: m.manager_level?.name ?? null,
    responsibility: m.responsibilities.map((r: any) => r.name),
  }
}

export const normalizeOwner = (o: any) => {
  return {
    to: o.validity?.to?.split("T")[0] ?? null,
    person: o.owner?.[0]?.uuid ?? undefined,
  }
}

export const normalizeLeave = (l: any) => {
  return {
    to: l.validity?.to?.split("T")[0] ?? null,
    leave_type: l.leave_type?.name ?? null,
    engagement: l.engagement?.uuid ?? null,
  }
}

export const normalizeKLE = (k: any) => {
  return {
    to: k.validity?.to?.split("T")[0] ?? null,
    kle_number: formatKleNumberTitleAndUuid(k.kle_number)[0].name ?? null,
    kle_aspect: k.kle_aspects.map((a: any) => a.name),
  }
}
