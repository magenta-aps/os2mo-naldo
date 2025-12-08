<script lang="ts">
  import { _ } from "svelte-i18n"
  import { env } from "$lib/env"
  import type { EmployeeSearchQuery, OrgUnitSearchQuery } from "./query.generated"
  type Employee = EmployeeSearchQuery["employees"]["objects"][0]["validities"][0]
  type OrgUnit = OrgUnitSearchQuery["org_units"]["objects"][0]["validities"][0]
  import AddressTemplate from "$lib/components/search/AddressTemplate.svelte"
  import LocationTemplate from "$lib/components/search/LocationTemplate.svelte"
  import { isUUID } from "$lib/utils/helpers"

  type SearchItem = Employee | OrgUnit
  export let item: SearchItem
  export let type: string

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
  /**
   * Type guard to check if a given object is of type (Lazy)Employee or (Lazy)OrgUnit.
   * @param obj The object to check.
   * @returns employee birthdate if true, otherwise ""
   */
  const returnCPR = (obj: SearchItem): string => {
    if ("cpr_number" in obj && obj.cpr_number) {
      return `(${obj.cpr_number.trim().slice(0, 6)})`
    }
    return ""
  }
</script>

<div class="flex items-center cursor-pointer text-ellipsis">
  <div class="text-ellipsis">
    <div class="inline-block text-secondary">
      {item.name}
      {#if type === "employee" && env.PUBLIC_SHOW_EMPLOYEE_BIRTHDAY_IN_SEARCH}{returnCPR(
          item
        )}{/if}
    </div>
    {#if isEmployee(item, type) && env.PUBLIC_ENABLE_RSD_SEARCH}
      <!-- Show employee engagement locations (RSD behaviour)-->
      {#each item.engagements as engagement}
        <LocationTemplate orgUnit={engagement.org_unit?.[0]} showCurrentName={true} />
      {/each}
    {:else if isOrgUnit(item, type)}
      <!-- Show org_unit locations (General behaviour) -->
      <LocationTemplate orgUnit={item} showCurrentName={false} />
    {/if}

    {#if !env.PUBLIC_ENABLE_RSD_SEARCH}
      {#if isEmployee(item, type)}
        <!-- Show employee itusers (Non-RSD behaviour) -->
        {#each item.itusers ?? [] as ituser}
          {#if !isUUID(ituser.user_key)}
            <div class="text-sm text-primary">
              <span>{ituser.user_key}</span>
            </div>
          {/if}
        {/each}
      {/if}
      <!-- Show addresses (Non-RSD behaviour) -->
      {#each item.addresses ?? [] as address}
        <AddressTemplate {address} />
      {/each}
    {/if}
  </div>
</div>
