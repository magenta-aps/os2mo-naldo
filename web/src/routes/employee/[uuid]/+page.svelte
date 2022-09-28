<script lang="ts">
  import { page } from "$app/stores"
  import { fetchGraph } from "$lib/util/http"
  import Tabs from "$lib/components/shared/tabs.svelte"
  import EmployeeStats from "$lib/components/employee/employee_stats.svelte"
  import ValidityTableCell from "$lib/components/shared/validity_table_cell.svelte"
  import { base } from "$app/paths"

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
    const json: Query = await res.json()

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
  let activeItem = items[0]
  const tabChange = (e: CustomEvent) => (activeItem = e.detail)
</script>

<div class="px-12 pt-6">
  {#await fetchEmployee()}
    loading...
  {:then employee}
    <EmployeeStats {employee} />
    <Tabs {activeItem} {items} on:tabChange={tabChange} />

    <div class="overflow-x-auto">
      <table class="table w-auto">
        <tbody>
          {#if activeItem === itemCategory.ENGAGEMENTS}
            {#each employee.engagements as engagement}
              <tr>
                <td>
                  {engagement.job_function.name}
                </td>

                <a href="{base}/organisation/{engagement.org_unit[0].uuid}">
                  <td>
                    {engagement.org_unit[0].name}
                  </td>
                </a>
                <ValidityTableCell validity={engagement.validity} />
              </tr>
            {/each}
          {:else if activeItem === itemCategory.ADDRESSES}
            {#each employee.addresses as address}
              <tr>
                <td>
                  {address.address_type.name}
                </td>
                <td class="min-w-[12rem] whitespace-normal">
                  {address.name}
                </td>
                <td>
                  {#if address.visibility}
                    {address.visibility.name}
                  {/if}
                </td>
                <ValidityTableCell validity={address.validity} />
              </tr>
            {/each}
          {:else if activeItem === itemCategory.ASSOCIATIONS}
            {#each employee.associations as association}
              <tr>
                <a href="{base}/organisation/{association.org_unit[0].uuid}">
                  <td>
                    {association.org_unit[0].name}
                  </td>
                </a>
                <td>
                  {association.association_type
                    ? association.association_type.name
                    : "Ikke sat"}
                </td>
                <ValidityTableCell validity={association.validity} />
              </tr>
            {/each}
          {:else if activeItem === itemCategory.ROLES}
            {#each employee.roles as role}
              <tr>
                <td>
                  {role.role_type.name}
                </td>

                <a href="{base}/organisation/{role.org_unit[0].uuid}">
                  <td>
                    {role.org_unit[0].name}
                  </td>
                </a>
                <ValidityTableCell validity={role.validity} />
              </tr>
            {/each}
          {:else if activeItem === itemCategory.IT}
            <!-- TODO: Missing GraphQL  -->
            TODO
          {:else if activeItem === itemCategory.LEAVE}
            {#each employee.leaves as leave}
              <tr>
                <td>
                  {leave.leave_type.name}
                </td>
                <ValidityTableCell validity={leave.validity} />
              </tr>
            {/each}
          {:else if activeItem === itemCategory.MANAGER_ROLES}
            {#each employee.manager_roles as manager_role}
              <tr>
                <a href="{base}/organisation/{manager_role.org_unit[0].uuid}">
                  <td>
                    {manager_role.org_unit[0].name}
                  </td>
                </a>
                <ValidityTableCell validity={manager_role.validity} />
              </tr>
            {/each}
          {/if}
        </tbody>
      </table>
    </div>
  {/await}
</div>
