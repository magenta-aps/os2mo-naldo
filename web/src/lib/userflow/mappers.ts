import { env } from "$lib/env"
import type {
  AddressCreateInput,
  EmployeeCreateInput,
  EngagementCreateInput,
  ItUserCreateInput,
  ManagerCreateInput,
  RoleBindingCreateInput,
} from "$lib/graphql/types"
import type { AddressInfo } from "$lib/stores/addressInfoStore"
import type { EmployeeInfo } from "$lib/stores/employeeInfoStore"
import type { EngagementInfo } from "$lib/stores/engagementInfoStore"
import type { ItuserInfo } from "$lib/stores/ituserInfoStore"
import type { ManagerInfo } from "$lib/stores/managerInfoStore"
import { normalizeCpr } from "$lib/utils/cpr"
import { v4 as uuidv4 } from "uuid"

// Pure mapping from the wizard's stores to the UserFlowCreate mutation
// variables. Pure and uuid-injected so the whole payload is unit-testable.

// Uuids are minted once per wizard run (not stored on the items, not
// re-minted per summary visit): children reference the employee/ituser they
// belong to within the same mutation, and retrying after a partial failure —
// including going back to fix an item and returning to the summary —
// re-sends the same uuids, erroring loudly on what already exists instead of
// creating a duplicate person. resetUserflowStores() clears them for the
// next run.
export type UserflowUuids = { employee: string; itusers: string[] }

export const mintUserflowUuids = (
  ituserCount: number,
  genUuid: () => string = uuidv4
): UserflowUuids => ({
  employee: genUuid(),
  itusers: Array.from({ length: ituserCount }, () => genUuid()),
})

let mintedEmployee: string | null = null
// Keyed by the item's client identity (_key), not its index, so removing an
// ituser between summary visits can never re-pair a minted uuid with a
// different item on retry.
const mintedItusers = new Map<string, string>()

export const getUserflowUuids = (
  ituserKeys: string[],
  genUuid: () => string = uuidv4
): UserflowUuids => {
  if (!mintedEmployee) {
    mintedEmployee = genUuid()
  }
  return {
    employee: mintedEmployee,
    itusers: ituserKeys.map((key) => {
      const existing = mintedItusers.get(key)
      if (existing) return existing
      const fresh = genUuid()
      mintedItusers.set(key, fresh)
      return fresh
    }),
  }
}

export const resetUserflowUuids = () => {
  mintedEmployee = null
  mintedItusers.clear()
}

export type UserflowStores = {
  employee: EmployeeInfo
  engagements: EngagementInfo[]
  itusers: ItuserInfo[]
  managers: ManagerInfo[]
  addresses: AddressInfo[]
}

export type SkippedItem = {
  entityKey: "engagement" | "ituser" | "manager" | "address"
  index: number
}

export type UserflowPayload = {
  employeeInput: EmployeeCreateInput
  engagementInput: EngagementCreateInput[]
  ituserInput: ItUserCreateInput[]
  rolebindingInput: RoleBindingCreateInput[]
  managerInput: ManagerCreateInput[]
  addressInput: AddressCreateInput[]
}

// "Empty" = indistinguishable from a pristine item: the user typed nothing
// worth warning about. Dates are ignored (they are seeded), and the
// Skattestyrelsen-seeded account name counts as untouched.
export const isEmptyEngagement = (engagement: EngagementInfo): boolean =>
  !engagement.orgUnit?.uuid &&
  !engagement.jobFunction?.uuid &&
  !engagement.engagementType?.uuid &&
  !engagement.primary?.uuid &&
  !engagement.user_key &&
  !engagement.extension1 &&
  !engagement.extension4

export const isEmptyItuser = (ituser: ItuserInfo): boolean =>
  !ituser.itSystem?.uuid &&
  (!ituser.user_key ||
    (!!env.PUBLIC_SKATTESTYRELSEN_USERFLOW &&
      ituser.user_key === "nanoq-brugernavn")) &&
  !ituser.externalId &&
  !ituser.notes &&
  !ituser.primary?.uuid &&
  ituser.rolebindings.every((rolebinding) => !rolebinding.role?.uuid)

export const isEmptyManager = (manager: ManagerInfo): boolean =>
  !manager.orgUnit?.uuid &&
  !manager.managerType?.uuid &&
  !manager.managerLevel?.uuid &&
  !manager.responsibilities.length

export const isEmptyAddress = (address: AddressInfo): boolean =>
  !address.visibility?.uuid &&
  !address.addressType?.uuid &&
  !address.addressValue.value &&
  !address.user_key

export const buildUserflowPayload = (
  stores: UserflowStores,
  uuids: UserflowUuids
): { payload: UserflowPayload; skipped: SkippedItem[] } => {
  const skipped: SkippedItem[] = []

  const employeeInput: EmployeeCreateInput = {
    uuid: uuids.employee,
    cpr_number: normalizeCpr(stores.employee.cprNumber.cpr_no),
    given_name: stores.employee.firstName,
    surname: stores.employee.lastName,
    nickname_given_name: stores.employee.nicknameFirstname,
    nickname_surname: stores.employee.nicknameLastname,
  }

  const engagementInput: EngagementCreateInput[] = []
  stores.engagements.forEach((engagement, index) => {
    if (!engagement.validated) {
      if (!isEmptyEngagement(engagement))
        skipped.push({ entityKey: "engagement", index })
      return
    }
    engagementInput.push({
      person: uuids.employee,
      user_key: engagement.user_key,
      org_unit: engagement.orgUnit?.uuid,
      engagement_type: engagement.engagementType?.uuid,
      job_function: engagement.jobFunction?.uuid,
      primary: engagement.primary?.uuid || null,
      ...(engagement.extension1 && { extension_1: engagement.extension1 }),
      ...(engagement.extension4 && { extension_4: engagement.extension4 }),
      validity: {
        from: engagement.fromDate,
        to: engagement.toDate || null,
      },
    })
  })

  const ituserInput: ItUserCreateInput[] = []
  const rolebindingInput: RoleBindingCreateInput[] = []
  stores.itusers.forEach((ituser, index) => {
    if (!ituser.validated) {
      if (!isEmptyItuser(ituser)) skipped.push({ entityKey: "ituser", index })
      return
    }
    const ituserUuid = uuids.itusers[index]
    ituserInput.push({
      person: uuids.employee,
      uuid: ituserUuid,
      itsystem: ituser.itSystem?.uuid,
      user_key: ituser.user_key,
      note: ituser.notes,
      ...(ituser.externalId && { external_id: ituser.externalId }),
      primary: ituser.primary?.uuid || null,
      validity: {
        from: ituser.fromDate,
        to: ituser.toDate || null,
      },
    })

    rolebindingInput.push(
      ...ituser.rolebindings
        .filter((rolebinding) => rolebinding.role?.uuid)
        .map((rolebinding) => ({
          ituser: ituserUuid,
          role: rolebinding.role?.uuid,
          // Use ituser dates
          validity: {
            from: ituser.fromDate,
            to: ituser.toDate || null,
          },
        }))
    )
  })

  const managerInput: ManagerCreateInput[] = []
  stores.managers.forEach((manager, index) => {
    if (!manager.validated) {
      if (!isEmptyManager(manager)) skipped.push({ entityKey: "manager", index })
      return
    }
    managerInput.push({
      person: uuids.employee,
      org_unit: manager.orgUnit?.uuid,
      manager_type: manager.managerType?.uuid,
      manager_level: manager.managerLevel?.uuid,
      responsibility: manager.responsibilities.map(
        (responsibility) => responsibility.uuid
      ),
      validity: {
        from: manager.fromDate,
        to: manager.toDate ? manager.toDate : null,
      },
    })
  })

  const addressInput: AddressCreateInput[] = []
  stores.addresses.forEach((address, index) => {
    if (!address.validated) {
      if (!isEmptyAddress(address)) skipped.push({ entityKey: "address", index })
      return
    }
    addressInput.push({
      person: uuids.employee,
      address_type: address.addressType?.uuid,
      value: address.addressValue.value,
      user_key: address.user_key,
      visibility: address.visibility?.uuid,
      validity: {
        from: address.fromDate,
        to: address.toDate ? address.toDate : null,
      },
    })
  })

  return {
    payload: {
      employeeInput,
      engagementInput,
      ituserInput,
      rolebindingInput,
      managerInput,
      addressInput,
    },
    skipped,
  }
}
