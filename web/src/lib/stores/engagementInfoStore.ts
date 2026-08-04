import {
  createDefaultEngagementValues,
  type EngagementValues,
} from "$lib/components/forms/entity/types"
import { createMultiStepStore, type Validatable } from "$lib/stores/createStepStore"

export type EngagementInfo = EngagementValues & Validatable

export const validateEngagement = (engagement: EngagementInfo): boolean => {
  return (
    !!engagement.fromDate &&
    !!engagement.orgUnit?.uuid &&
    !!engagement.jobFunction?.uuid &&
    !!engagement.engagementType?.uuid
  )
}

export const engagementInfo = createMultiStepStore<EngagementInfo>(
  createDefaultEngagementValues,
  validateEngagement
)
