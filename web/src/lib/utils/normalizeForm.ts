export const normalizeEmployee = (e: any) => {
  return {
    to: e.validity?.to?.split("T")[0] ?? null,
    first_name: e.given_name ?? null,
    last_name: e.surname ?? null,
    nick_first_name: e.nickname_givenname ?? null,
    nick_last_name: e.nickname_surname ?? null,
  }
}

export const normalizeOrganisation = (o: any) => {
  return {
    to: o.validity?.to?.split("T")[0] ?? null,
    name: o.name ?? null,
    parent: o.parent_response?.uuid ?? undefined,
    unit_type: o.unit_type_response?.current?.name ?? null,
    org_unit_level: o.unit_level_response?.current?.name ?? "",
    time_planning: o.time_planning_response?.current?.name ?? "",
    user_key: o.user_key ?? "",
  }
}

export const normalizeEngagement = (e: any) => {
  return {
    to: e.validity?.to?.split("T")[0] ?? null,
    org_unit: e.org_unit_response?.uuid ?? null,
    job_function: e.job_function_response?.current?.name ?? null,
    engagement_type: e.engagement_type_response?.current?.name ?? null,
    user_key: e.user_key ?? null,
    primary: e.primary_response?.current?.name ?? "",
  }
}

export const normalizeAssociation = (a: any) => {
  return {
    to: a.validity?.to?.split("T")[0] ?? null,
    person: a.person_response?.uuid ?? null,
    org_unit: a.org_unit_response?.uuid ?? null,
    association_type: a.association_type_response?.current?.name ?? null,
    primary: a.primary_response?.current?.name ?? "",
    substitute: a.substitute_response?.current?.name ?? "",
    trade_union: a.trade_union_response?.current?.name ?? "",
  }
}

export const normalizeITUser = (i: any, note: string | null | undefined) => {
  return {
    to: i.validity?.to?.split("T")[0] ?? null,
    itsystem: i.itsystem_response?.current?.name ?? null,
    user_key: i.user_key ?? "",
    primary: i.primary_response?.current?.name ?? "",
    external_id: i.external_id ?? "",
    note: note ?? "",
    engagements:
      i.engagements
        ?.map((e: any) => e.validities[0]?.uuid)
        .filter(Boolean)
        .sort() ?? [],
  }
}

export const normalizeAddress = (a: any) => {
  return {
    to: a.validity?.to?.split("T")[0] ?? null,
    address_type: a.address_type_response?.current?.name ?? null,
    value: a.name ?? null,
    user_key: a.user_key ?? "",
    visibility: a.visibility_response?.current?.name ?? "",
    ituser: a.ituser?.[0]?.itsystem_response?.current?.name
      ? `${a.ituser[0].itsystem_response.current.name}, ${a.ituser[0].user_key}`
      : "",
  }
}

export const normalizeManager = (m: any) => {
  return {
    to: m.validity?.to?.split("T")[0] ?? null,
    person: m.person_response?.uuid ?? undefined,
    org_unit: m.org_unit_response?.uuid ?? null,
    manager_type: m.manager_type_response?.current?.name ?? null,
    manager_level: m.manager_level_response?.current?.name ?? null,
    responsibility: m.responsibilities_response.objects.map(
      (r: any) => r.current?.name
    ),
  }
}

export const normalizeOwner = (o: any) => {
  return {
    to: o.validity?.to?.split("T")[0] ?? null,
    person: o.owner_response?.uuid ?? undefined,
  }
}

export const normalizeLeave = (l: any) => {
  return {
    to: l.validity?.to?.split("T")[0] ?? null,
    leave_type: l.leave_type_response?.current?.name ?? null,
    engagement: l.engagement_response?.uuid ?? null,
  }
}

export const normalizeKLE = (k: any) => {
  return {
    to: k.validity?.to?.split("T")[0] ?? null,
    kle_number: k.kle_number_response?.current
      ? `${k.kle_number_response.current.user_key} - ${k.kle_number_response.current.name}`
      : null,
    kle_aspect: k.kle_aspects_response?.objects?.map((a: any) => a.current?.name),
  }
}

export const normalizeRolebinding = (r: any) => {
  return {
    to: r.validity?.to?.split("T")[0] ?? null,
    role: r.role_response?.current?.name ?? undefined,
  }
}
