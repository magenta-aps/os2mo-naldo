<script lang="ts">
  import { searchFields } from "$lib/env"
  import type { EmployeeSearchQuery, OrgUnitSearchQuery } from "./query.generated"
  type Employee = EmployeeSearchQuery["employees"]["objects"][0]["validities"][0]
  type OrgUnit = OrgUnitSearchQuery["org_units"]["objects"][0]["validities"][0]
  import AddressTemplate from "$lib/components/search/AddressTemplate.svelte"
  import LocationTemplate from "$lib/components/search/LocationTemplate.svelte"
  import { isMeaningfulUserKey, isUUID, suffixUserKey } from "$lib/utils/helpers"
  import { findClosestValidity, findClosestValidityWithin } from "$lib/utils/validities"

  type Engagement = NonNullable<
    Employee["engagements_response"]
  >["objects"][0]["validities"][0]

  type SearchItem = Employee | OrgUnit
  export let item: SearchItem
  export let type: string
  export let date: string

  // An all-time search returns relations that have ended, for which MO has no
  // current state.
  const closestValidities = <T>(
    response: { objects: { validities: T[] }[] } | null | undefined,
    date: string
  ): T[] =>
    (response?.objects ?? []).flatMap((object) => {
      const validity = findClosestValidity(object.validities, date)
      return validity ? [validity] : []
    })

  const engagementOrgUnit = (engagement: Engagement, date: string) =>
    findClosestValidityWithin(
      engagement.org_unit_response.validities,
      engagement.validity,
      date
    ) ?? undefined

  /**
   * Type guard to check if a given object is of type LazyEmployee or LazyOrgUnit.
   * @param obj The object to check.
   * @returns true if the object has the 'addresses' property, false otherwise.
   */
  const isEmployee = (obj: SearchItem, type: string): obj is Employee => {
    return type === "employee"
  }
  const isOrgUnit = (obj: SearchItem, type: string): obj is OrgUnit => {
    return type === "org-unit"
  }
  const birthday = (obj: SearchItem): string => {
    if ("cpr_number" in obj && obj.cpr_number) {
      return `(${obj.cpr_number.trim().slice(0, 6)})`
    }
    return ""
  }
</script>

<div class="flex items-center cursor-pointer text-ellipsis">
  <div class="text-ellipsis">
    <div class="inline-block text-base-content">
      {isOrgUnit(item, type) ? suffixUserKey(item.name, item.user_key) : item.name}
      {#if type === "employee" && searchFields.birthday}{birthday(item)}{/if}
    </div>
    {#if isEmployee(item, type)}
      {#each closestValidities(item.itusers_response, date).filter((ituser) => !isUUID(ituser.user_key)) as ituser}
        <div class="text-sm text-primary">
          <span>{ituser.user_key}</span>
        </div>
      {/each}
      {#each closestValidities(item.addresses_response, date) as address}
        <AddressTemplate
          {address}
          type={findClosestValidityWithin(
            address.address_type_response.validities,
            address.validity,
            date
          ).name}
        />
      {/each}
      {#each closestValidities(item.engagements_response, date) as engagement}
        <LocationTemplate
          orgUnit={engagementOrgUnit(engagement, date)}
          includeUnit={true}
        />
        {#if isMeaningfulUserKey(engagement.user_key)}
          <div class="text-xs text-base-content/80">{engagement.user_key}</div>
        {/if}
      {/each}
    {:else if isOrgUnit(item, type)}
      <LocationTemplate orgUnit={item} includeUnit={false} />
      {#if item.unit_type_response}
        {@const unitType = findClosestValidityWithin(
          item.unit_type_response.validities,
          item.validity,
          date
        )}
        {#if unitType}
          <div class="text-xs text-base-content/80">{unitType.name}</div>
        {/if}
      {/if}
      {#each closestValidities(item.addresses_response, date) as address}
        <AddressTemplate
          {address}
          type={findClosestValidityWithin(
            address.address_type_response.validities,
            address.validity,
            date
          ).name}
        />
      {/each}
    {/if}
  </div>
</div>
