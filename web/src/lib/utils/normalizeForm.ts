export const normalizeEngagement = (e) => {
  return {
    to: e.validity?.to?.split("T")[0] ?? null,
    org_unit: e.org_unit?.[0]?.uuid ?? null,
    job_function: e.job_function?.name ?? null,
    engagement_type: e.engagement_type?.name ?? null,
    user_key: e.user_key ?? null,
    primary: e.primary?.name ?? "",
  }
}

export const normalizeAddress = (a) => {
  return {
    to: a.validity?.to?.split("T")[0] ?? null,
    address_type: a.address_type?.name ?? null,
    value: a.name ?? null,
    // Support the case where user_key defaults to the value when created
    user_key: a.user_key == a.name ? "" : a.user_key,
    visibility: a.visibility?.name ?? "",
  }
}
