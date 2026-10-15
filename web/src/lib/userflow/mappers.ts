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

// Client-side, so children can reference their parent inside one mutation.
// Stable across a run: a retry after a partial failure then errors on what
// exists instead of creating a duplicate person.
export type UserflowUuids = { employee: string; itusers: string[] }

const reserved: { employee: string | null; itusers: Map<string, string> } = {
  employee: null,
  // Keyed by _key, not index: removing an ituser between summary visits must
  // not re-pair a reserved uuid with a different item on retry.
  itusers: new Map(),
}

export const reserveUserflowUuids = (
  ituserKeys: string[],
  genUuid: () => string = uuidv4
): UserflowUuids => {
  reserved.employee ??= genUuid()
  return {
    employee: reserved.employee,
    itusers: ituserKeys.map((key) => {
      const uuid = reserved.itusers.get(key) ?? genUuid()
      reserved.itusers.set(key, uuid)
      return uuid
    }),
  }
}

export const resetUserflowUuids = () => {
  reserved.employee = null
  reserved.itusers.clear()
}

export type UserflowStores = {
  employee: EmployeeInfo
  engagements: EngagementInfo[]
  itusers: ItuserInfo[]
  managers: ManagerInfo[]
  addresses: AddressInfo[]
}

export type IncompleteItem = {
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

// Empty = indistinguishable from clean. The seeded start date and
// Skattestyrelsen account name do not count as a touch; an end date does.
export const isEmptyEngagement = (engagement: EngagementInfo): boolean =>
  !engagement.toDate &&
  !engagement.orgUnit?.uuid &&
  !engagement.jobFunction?.uuid &&
  !engagement.engagementType?.uuid &&
  !engagement.primary?.uuid &&
  !engagement.user_key &&
  !engagement.extension1 &&
  !engagement.extension4

export const isEmptyItuser = (ituser: ItuserInfo): boolean =>
  !ituser.toDate &&
  !ituser.itSystem?.uuid &&
  (!ituser.user_key ||
    (!!env.PUBLIC_SKATTESTYRELSEN_USERFLOW &&
      ituser.user_key === "nanoq-brugernavn")) &&
  !ituser.externalId &&
  !ituser.notes &&
  !ituser.primary?.uuid &&
  ituser.rolebindings.every((rolebinding) => !rolebinding.role?.uuid)

export const isEmptyManager = (manager: ManagerInfo): boolean =>
  !manager.toDate &&
  !manager.orgUnit?.uuid &&
  !manager.managerType?.uuid &&
  !manager.managerLevel?.uuid &&
  !manager.responsibilities?.length &&
  !manager.primary?.uuid

export const isEmptyAddress = (address: AddressInfo): boolean =>
  !address.toDate &&
  !address.visibility?.uuid &&
  !address.addressType?.uuid &&
  !address.addressValue.value &&
  !address.user_key

export const buildUserflowPayload = (
  stores: UserflowStores,
  uuids: UserflowUuids
): { payload: UserflowPayload; incomplete: IncompleteItem[] } => {
  const incomplete: IncompleteItem[] = []

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
        incomplete.push({ entityKey: "engagement", index })
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
        from: engagement.fromDate!,
        to: engagement.toDate ?? null,
      },
    })
  })

  const ituserInput: ItUserCreateInput[] = []
  const rolebindingInput: RoleBindingCreateInput[] = []
  stores.itusers.forEach((ituser, index) => {
    if (!ituser.validated) {
      if (!isEmptyItuser(ituser)) incomplete.push({ entityKey: "ituser", index })
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
        from: ituser.fromDate!,
        to: ituser.toDate ?? null,
      },
    })

    rolebindingInput.push(
      ...ituser.rolebindings
        .filter((rolebinding) => rolebinding.role?.uuid)
        .map((rolebinding) => ({
          ituser: ituserUuid,
          role: rolebinding.role?.uuid,
          validity: {
            from: ituser.fromDate!,
            to: ituser.toDate ?? null,
          },
        }))
    )
  })

  const managerInput: ManagerCreateInput[] = []
  stores.managers.forEach((manager, index) => {
    if (!manager.validated) {
      if (!isEmptyManager(manager)) incomplete.push({ entityKey: "manager", index })
      return
    }
    managerInput.push({
      person: uuids.employee,
      org_unit: manager.orgUnit?.uuid,
      manager_type: manager.managerType?.uuid,
      manager_level: manager.managerLevel?.uuid,
      responsibility: (manager.responsibilities ?? []).map(
        (responsibility) => responsibility.uuid
      ),
      primary: manager.primary?.uuid || null,
      validity: {
        from: manager.fromDate!,
        to: manager.toDate ?? null,
      },
    })
  })

  const addressInput: AddressCreateInput[] = []
  stores.addresses.forEach((address, index) => {
    if (!address.validated) {
      if (!isEmptyAddress(address)) incomplete.push({ entityKey: "address", index })
      return
    }
    addressInput.push({
      person: uuids.employee,
      address_type: address.addressType?.uuid,
      value: address.addressValue.value,
      user_key: address.user_key,
      visibility: address.visibility?.uuid,
      validity: {
        from: address.fromDate!,
        to: address.toDate ?? null,
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
    incomplete,
  }
}
