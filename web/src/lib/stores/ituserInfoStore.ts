import { v4 as uuidv4 } from "uuid"
import { env } from "$lib/env"
import { createMultiStepStore } from "$lib/stores/createStepStore"
import {
  createDefaultItuserValues,
  type ItuserValues,
} from "$lib/components/forms/entity/types"

// The wizard-only extras: a client-generated uuid so rolebindings in the same
// UserFlowCreate mutation can reference their IT user, and the
// Skattestyrelsen-deployment default account name.
export type ItuserInfo = ItuserValues & { uuid: string; validated?: boolean }

export const createDefaultItuser = (): ItuserInfo => ({
  ...createDefaultItuserValues(),
  uuid: uuidv4(),
  ...(env.PUBLIC_SKATTESTYRELSEN_USERFLOW && { user_key: "nanoq-brugernavn" }),
})

export const validateItuser = (ituser: ItuserInfo): boolean => {
  return !!ituser.fromDate && !!ituser.itSystem?.uuid && !!ituser.user_key
}

export const ituserInfo = createMultiStepStore<ItuserInfo>(
  createDefaultItuser,
  validateItuser
)
