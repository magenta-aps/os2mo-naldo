import {
  createDefaultAddressValues,
  type AddressValues,
} from "$lib/components/forms/entity/types"
import { createMultiStepStore, type Validatable } from "$lib/stores/createStepStore"

export type AddressInfo = AddressValues & Validatable

// Mirrors svelte-forms' email() so the store rule matches AddressFields'
// scope-derived validators — otherwise the summary's demote-only re-stamp
// can't catch a value edited into invalidity after the step was approved.
const EMAIL_PATTERN =
  /^[a-zA-Z0-9_+&*-]+(?:\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,7}$/
const PHONE_PATTERN = /^\+?\d+$/

export const validateAddress = (address: AddressInfo): boolean => {
  if (!address.fromDate || !address.addressType?.uuid || !address.addressValue.value) {
    return false
  }
  switch (address.addressType.scope) {
    case "EMAIL":
      return EMAIL_PATTERN.test(address.addressValue.value)
    case "PHONE":
      return PHONE_PATTERN.test(address.addressValue.value)
    default:
      return true
  }
}

export const addressInfo = createMultiStepStore<AddressInfo>(
  createDefaultAddressValues,
  validateAddress
)
