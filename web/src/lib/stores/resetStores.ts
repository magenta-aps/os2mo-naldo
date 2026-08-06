import { addressInfo } from "$lib/stores/addressInfoStore"
import { employeeInfo } from "$lib/stores/employeeInfoStore"
import { engagementInfo } from "$lib/stores/engagementInfoStore"
import { ituserInfo } from "$lib/stores/ituserInfoStore"
import { managerInfo } from "$lib/stores/managerInfoStore"
import { resetUserflowUuids } from "$lib/userflow/mappers"

export const resetUserflowStores = () => {
  ;[employeeInfo, engagementInfo, ituserInfo, managerInfo, addressInfo].forEach(
    (store) => {
      if (store && typeof store.reset === "function") {
        store.reset()
      }
    }
  )
  resetUserflowUuids()
}
