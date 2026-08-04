import {
  createDefaultManagerValues,
  type ManagerValues,
} from "$lib/components/forms/entity/types"
import { createMultiStepStore, type Validatable } from "$lib/stores/createStepStore"

export type ManagerInfo = ManagerValues & Validatable

export const validateManager = (manager: ManagerInfo): boolean => {
  return (
    !!manager.fromDate &&
    !!manager.orgUnit?.uuid &&
    !!manager.managerType?.uuid &&
    !!manager.managerLevel?.uuid &&
    !!manager.responsibilities?.length
  )
}

export const managerInfo = createMultiStepStore<ManagerInfo>(
  createDefaultManagerValues,
  validateManager
)
