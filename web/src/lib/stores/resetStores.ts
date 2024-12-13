import { employeeInfo } from "$lib/stores/employeeInfoStore"
import { engagementInfo } from "$lib/stores/engagementInfoStore"
import { ituserInfo } from "$lib/stores/ituserInfoStore"
import { rolebindingInfo } from "$lib/stores/rolebindingInfoStore"
import { managerInfo } from "$lib/stores/managerInfoStore"
import { addressInfo } from "$lib/stores/addressInfoStore"
import { step } from "$lib/stores/stepStore"

// Keeping this, since it might come in handy
export const resetStores = (stores: any[] = []) => {
  stores.forEach((store) => {
    if (store && typeof store.reset === "function") {
      store.reset()
    }
  })
}

export const resetUserflowStores = () => {
  ;[
    employeeInfo,
    engagementInfo,
    ituserInfo,
    rolebindingInfo,
    managerInfo,
    addressInfo,
  ].forEach((store) => {
    if (store && typeof store.reset === "function") {
      store.reset()
    }
  })
  step.updateStep(1)
}
