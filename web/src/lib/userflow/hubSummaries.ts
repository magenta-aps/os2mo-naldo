import type { AddressInfo } from "$lib/stores/addressInfoStore"
import type { EngagementInfo } from "$lib/stores/engagementInfoStore"
import type { ItuserInfo } from "$lib/stores/ituserInfoStore"
import type { ManagerInfo } from "$lib/stores/managerInfoStore"

// One-line summaries for the hub's task rows. Pure so they are unit-testable;
// "∞" marks an open end date and "—" a not-yet-chosen part, keeping the
// functions free of i18n.

export type HubRowSummary = { title: string; meta: string }

const span = (fromDate: string, toDate: string) =>
  `${fromDate || "—"} → ${toDate || "∞"}`

export const engagementRowSummary = (engagement: EngagementInfo): HubRowSummary => ({
  title: `${engagement.jobFunction?.name || "—"} — ${engagement.orgUnit?.name || "—"}`,
  meta: [span(engagement.fromDate, engagement.toDate), engagement.engagementType?.name]
    .filter(Boolean)
    .join(" · "),
})

export const ituserRowSummary = (ituser: ItuserInfo): HubRowSummary => {
  const roleCount = ituser.rolebindings.filter(
    (rolebinding) => rolebinding.role?.uuid
  ).length
  return {
    title: `${ituser.itSystem?.name || "—"} · ${ituser.user_key || "—"}`,
    meta: [
      span(ituser.fromDate, ituser.toDate),
      roleCount ? `${roleCount} × rolebinding` : undefined,
      ituser.primary?.name,
    ]
      .filter(Boolean)
      .join(" · "),
  }
}

export const managerRowSummary = (manager: ManagerInfo): HubRowSummary => ({
  title: `${manager.managerType?.name || "—"} — ${manager.orgUnit?.name || "—"}`,
  meta: [span(manager.fromDate, manager.toDate), manager.managerLevel?.name]
    .filter(Boolean)
    .join(" · "),
})

export const addressRowSummary = (address: AddressInfo): HubRowSummary => ({
  title: `${address.addressType?.name || "—"}: ${
    address.addressValue.name || address.addressValue.value || "—"
  }`,
  meta: [span(address.fromDate, address.toDate), address.visibility?.name]
    .filter(Boolean)
    .join(" · "),
})
