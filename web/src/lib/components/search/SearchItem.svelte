<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import type {
    LazyEmployeeSearchQuery,
    LazyOrgUnitSearchQuery,
    SearchEmployeeQuery,
    SearchOrgUnitQuery,
  } from "./query.generated"
  import { MOConfig } from "$lib/stores/config"

  type Employee = SearchEmployeeQuery["employees"]["objects"][0]["validities"][0]
  type OrgUnit = SearchOrgUnitQuery["org_units"]["objects"][0]["validities"][0]
  type LazyEmployee = NonNullable<
    LazyEmployeeSearchQuery["employees"]
  >["objects"][0]["validities"][0]
  type LazyOrgUnit = NonNullable<
    LazyOrgUnitSearchQuery["org_units"]
  >["objects"][0]["validities"][0]

  type SearchItem = Employee | OrgUnit | LazyEmployee | LazyOrgUnit

  export let item: SearchItem
  export let type: string

  /**
   * Type guard to check if a given object is of type LazyEmployee or LazyOrgUnit.
   * @param obj The object to check.
   * @returns true if the object has the 'addresses' property, false otherwise.
   */
  const isLazy = (obj: SearchItem): obj is LazyEmployee | LazyOrgUnit => {
    return "addresses" in obj
  }
  const isLazyOrg = (obj: SearchItem): obj is LazyOrgUnit => {
    return "addresses" in obj
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
      {#if type === "employee" && $MOConfig && $MOConfig.confdb_show_employee_birthday_in_search === "true"}{returnCPR(
          item
        )}{/if}
    </div>
    {#if isLazy(item)}
      {#if isLazyOrg(item) && item.root?.length}
        <br />
        <div class="inline-block text-primary text-sm">
          {capital($_("root"))}: {item.root[0].name}
        </div>
      {/if}
      {#if isLazyOrg(item) && item.parent}
        <br />
        <div class="inline-block text-primary text-sm">
          {capital($_("parent"))}: {item.parent.name}
        </div>
      {/if}
      {#each item.addresses as address}
        <br />
        <div class="inline-block text-primary text-sm">
          {#if address.resolve.__typename === "DARAddress"}
            {address.address_type.name}: {address.resolve.name}
          {:else if address.resolve.__typename === "DefaultAddress"}
            {address.address_type.name}: {address.resolve.value}
          {:else if address.resolve.__typename === "MultifieldAddress"}
            {address.address_type.name}: {address.resolve.value +
              " " +
              address.resolve.value2}
          {/if}
        </div>
      {/each}
    {/if}
  </div>
</div>
