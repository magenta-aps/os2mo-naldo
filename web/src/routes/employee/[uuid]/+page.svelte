<script lang="ts">
  import { page } from "$app/stores"
  import { fetchGraph } from "$lib/util/http"
  import Tabs from "$lib/components/shared/tabs.svelte"
  import EmployeeStats from "$lib/components/employee/employee_stats.svelte"
  import ValidityTableCell from "$lib/components/shared/validity_table_cell.svelte"
  import { base } from "$app/paths"
  import DetailTable from "$lib/components/shared/detail_table.svelte"
  import { activeEmployeeTab } from "$lib/stores/tab"

  const query = (uuid: string) => {
    return `
query {
  employees(uuids: "${uuid}") {
    objects {
      name
      engagements {
        uuid
        org_unit {
          name
          uuid
        }
        validity {
          to
          from
        }
        job_function {
          name
        }
      }
      cpr_no
      addresses {
        name
        address_type {
          name
        }
        visibility {
          name
        }
        validity {
          from
          to
        }
      }
      associations {
        org_unit {
          name
          uuid
        }
        association_type {
          name
        }
        validity {
          from
          to
        }
      }
      roles {
        role_type {
          name
        }
        org_unit {
          name
          uuid
        }
        validity {
          from
          to
        }
      }
      leaves {
        validity {
          from
          to
        }
        leave_type {
          name
        }
        engagement {
          org_unit {
            name
          }
          job_function {
            name
          }
        }
      }
      manager_roles {
        org_unit {
          name
          uuid
        }
        validity {
          from
          to
        }
      }
    }
  }
}

`
  }

  $: fetchEmployee = async () => {
    const res = await fetchGraph(query($page.params.uuid))
    const json = await res.json()

    return json.data.employees[0].objects[0]
  }

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

<div class="px-12 pt-6">
  {#await fetchEmployee()}
    Loading page...
  {:then employee}
    <EmployeeStats {employee} />
    <Tabs {activeItem} {items} on:tabChange={tabChange} />

    {#if activeItem === itemCategory.ENGAGEMENTS}
      <DetailTable headers={["Stillingsbetegnelse", "Enhed", "Dato"]}>
        {#each employee.engagements as engagement}
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
        {#each employee.addresses as address}
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
        {#each employee.associations as association}
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
        {#each employee.roles as role}
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
        {#each employee.leaves as leave}
          <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
            <td class="p-4">
              {leave.leave_type.name}
            </td>
            <td class="p-4">
              {leave.engagement.job_function.name}, {leave.engagement.org_unit[0].name}
            </td>
            <ValidityTableCell validity={leave.validity} />
          </tr>
        {/each}
      </DetailTable>
    {:else if activeItem === itemCategory.MANAGER_ROLES}
      <!-- TODO: Needs Lederansvar, Ledertype, Lederniveau -->
      <DetailTable headers={["Enhed", "Dato"]}>
        {#each employee.manager_roles as manager_role}
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
  {/await}
</div>
