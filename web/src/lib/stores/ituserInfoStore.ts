import {
  createDefaultItuserValues,
  type ItuserValues,
} from "$lib/components/forms/entity/types"
import { env } from "$lib/env"
import { createMultiStepStore, type Validatable } from "$lib/stores/createStepStore"

// The wizard-only extra: the Skattestyrelsen-deployment default account name.
export type ItuserInfo = ItuserValues & Validatable

export const createDefaultItuser = (): ItuserInfo => ({
  ...createDefaultItuserValues(),
  ...(env.PUBLIC_SKATTESTYRELSEN_USERFLOW && { user_key: "nanoq-brugernavn" }),
})

export const validateItuser = (ituser: ItuserInfo): boolean => {
  return !!ituser.fromDate && !!ituser.itSystem?.uuid && !!ituser.user_key
}

export const ituserInfo = createMultiStepStore<ItuserInfo>(
  createDefaultItuser,
  validateItuser
)
