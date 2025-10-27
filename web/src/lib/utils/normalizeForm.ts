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
