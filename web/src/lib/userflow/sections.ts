import AddressFields from "$lib/components/forms/entity/AddressFields.svelte"
import EngagementFields from "$lib/components/forms/entity/EngagementFields.svelte"
import ItuserFields from "$lib/components/forms/entity/ItuserFields.svelte"
import ManagerFields from "$lib/components/forms/entity/ManagerFields.svelte"
import { addressInfo } from "$lib/stores/addressInfoStore"
import type { Validatable } from "$lib/stores/createStepStore"
import { engagementInfo } from "$lib/stores/engagementInfoStore"
import { ituserInfo } from "$lib/stores/ituserInfoStore"
import { managerInfo } from "$lib/stores/managerInfoStore"
import {
  addressRowSummary,
  engagementRowSummary,
  ituserRowSummary,
  managerRowSummary,
  type HubRowSummary,
} from "$lib/userflow/hubSummaries"
import {
  isEmptyAddress,
  isEmptyEngagement,
  isEmptyItuser,
  isEmptyManager,
} from "$lib/userflow/mappers"
import type { ComponentType } from "svelte"
import type { Readable } from "svelte/store"

// The hub's task-list sections: one per optional entity, in display order.
// The employee is not a section — it is the hub's anchor and lives directly
// on the page.

type ItemsStore = Readable<Validatable[]> & {
  addItem: () => void
  removeItem: (index: number) => void
  setValidated: (flags: boolean[]) => void
  revalidate: () => void
}

export type HubSectionDefinition = {
  id: "engagement" | "ituser" | "manager" | "address"
  // i18n entity key; the section heading uses the plural form, rows and the
  // add-action the singular.
  entityKey: string
  fields: ComponentType
  store: ItemsStore
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rowSummary: (item: any) => HubRowSummary
  // "Blank row" test: pristine items are neither created nor warned about.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  isEmpty: (item: any) => boolean
}

export const hubSections: HubSectionDefinition[] = [
  {
    id: "engagement",
    entityKey: "engagement",
    fields: EngagementFields,
    store: engagementInfo,
    rowSummary: engagementRowSummary,
    isEmpty: isEmptyEngagement,
  },
  {
    id: "ituser",
    entityKey: "ituser",
    fields: ItuserFields,
    store: ituserInfo,
    rowSummary: ituserRowSummary,
    isEmpty: isEmptyItuser,
  },
  {
    id: "manager",
    entityKey: "manager",
    fields: ManagerFields,
    store: managerInfo,
    rowSummary: managerRowSummary,
    isEmpty: isEmptyManager,
  },
  {
    id: "address",
    entityKey: "address",
    fields: AddressFields,
    store: addressInfo,
    rowSummary: addressRowSummary,
    isEmpty: isEmptyAddress,
  },
]
