<script lang="ts">
  import Tabs from "$lib/components/shared/tabs.svelte"
  import EmployeeStats from "$lib/components/employee/employee_stats.svelte"
  import ValidityTableCell from "$lib/components/shared/validity_table_cell.svelte"
  import { base } from "$app/paths"
  import DetailTable from "$lib/components/shared/detail_table.svelte"
  import { activeEmployeeTab } from "$lib/stores/tab"
  import type { Employee } from "./+page"

  export let data: Employee

  // Tabs
  enum itemCategory {
    ENGAGEMENTS = "Engagementer",
    ADDRESSES = "Adresser",
    ASSOCIATIONS = "Tilknytninger",
    ROLES = "Roller",
    IT = "IT",
    LEAVE = "Orlov",
    MANAGER_ROLES = "Ledere",
  }

  let items = Object.values(itemCategory)

  let activeItem: string = $activeEmployeeTab
  const tabChange = (e: CustomEvent) => ($activeEmployeeTab = activeItem = e.detail)
</script>

<svelte:head>
  <title>
    {data.name} | OS2mo
  </title>
</svelte:head>

<div class="px-12 pt-6">
  <EmployeeStats employee={data} />
  <Tabs {activeItem} {items} on:tabChange={tabChange} />

  {#if activeItem === itemCategory.ENGAGEMENTS}
    <DetailTable headers={["Stillingsbetegnelse", "Enhed", "Dato"]}>
      {#each data.engagements as engagement}
        <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
          <td class="p-4">
            {engagement.job_function.name}
          </td>

          <a href="{base}/organisation/{engagement.org_unit[0].uuid}">
            <td class="p-4">
              {engagement.org_unit[0].name}
            </td>
          </a>
          <ValidityTableCell validity={engagement.validity} />
        </tr>
      {/each}
    </DetailTable>
  {:else if activeItem === itemCategory.ADDRESSES}
    <DetailTable headers={["Adressetype", "Adresse", "Synlighed", "Dato"]}>
      {#each data.addresses as address}
        <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
          <td class="p-4">
            {address.address_type.name}
          </td>
          <td class="p-4 min-w-[12rem] whitespace-normal">
            {address.name}
          </td>
          <td class="p-4">
            {address.visibility ? address.visibility.name : "Ikke sat"}
          </td>
          <ValidityTableCell validity={address.validity} />
        </tr>
      {/each}
    </DetailTable>
  {:else if activeItem === itemCategory.ASSOCIATIONS}
    <DetailTable headers={["Enhed", "Rolle", "Dato"]}>
      {#each data.associations as association}
        <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
          <a href="{base}/organisation/{association.org_unit[0].uuid}">
            <td class="p-4">
              {association.org_unit[0].name}
            </td>
          </a>
          <td class="p-4">
            {association.association_type
              ? association.association_type.name
              : "Ikke sat"}
          </td>
          <ValidityTableCell validity={association.validity} />
        </tr>
      {/each}
    </DetailTable>
  {:else if activeItem === itemCategory.ROLES}
    <DetailTable headers={["Rolletype", "Enhed", "Dato"]}>
      {#each data.roles as role}
        <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
          <td class="p-4">
            {role.role_type.name}
          </td>

          <a href="{base}/organisation/{role.org_unit[0].uuid}">
            <td class="p-4">
              {role.org_unit[0].name}
            </td>
          </a>
          <ValidityTableCell validity={role.validity} />
        </tr>
      {/each}
    </DetailTable>
  {:else if activeItem === itemCategory.IT}
    <!-- TODO: Missing GraphQL  -->
    TODO
  {:else if activeItem === itemCategory.LEAVE}
    <DetailTable headers={["Orlovstype", "Engagement", "Dato"]}>
      {#each data.leaves as leave}
        <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
          <td class="p-4">
            {leave.leave_type.name}
          </td>
          <td class="p-4">
            {#if leave.engagement}
              {leave.engagement.job_function.name}, {leave.engagement.org_unit[0].name}
            {/if}
          </td>
          <ValidityTableCell validity={leave.validity} />
        </tr>
      {/each}
    </DetailTable>
  {:else if activeItem === itemCategory.MANAGER_ROLES}
    <!-- TODO: Needs Lederansvar, Ledertype, Lederniveau -->
    <DetailTable headers={["Enhed", "Dato"]}>
      {#each data.manager_roles as manager_role}
        <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
          <a href="{base}/organisation/{manager_role.org_unit[0].uuid}">
            <td class="p-4">
              {manager_role.org_unit[0].name}
            </td>
          </a>
          <ValidityTableCell validity={manager_role.validity} />
        </tr>
      {/each}
    </DetailTable>
  {/if}
</div>
