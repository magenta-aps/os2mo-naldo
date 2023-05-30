<script lang="ts">
  import Tabs from "$lib/components/shared/tabs.svelte"
  import ValidityTableCell from "$lib/components/shared/validity_table_cell.svelte"
  import { base } from "$app/paths"
  import DetailTable from "$lib/components/shared/detail_table.svelte"
  import { activeEmployeeTab } from "$lib/stores/tab"
  import HeadTitle from "$lib/components/shared/head_title.svelte"
  import { page } from "$app/stores"
  import { gql } from "graphql-request"
  import { graphQLClient } from "$lib/util/http"
  import { EmployeeDocument } from "./query.generated"
  import EmployeeDetailTable from "$lib/components/employee/tables/employee_detail_table.svelte"
  import EngagementDetailTable from "$lib/components/employee/tables/engagement_detail_table.svelte"

  // Tabs
  enum itemCategory {
    EMPLOYEE = "Medarbejder",
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

  gql`
    query Employee($uuid: [UUID!]) {
      employees(uuids: $uuid) {
        objects {
          name
          validity {
            from
            to
          }
          nickname
          seniority
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
</script>

<HeadTitle type="employee" />

{#await graphQLClient().request(EmployeeDocument, { uuid: $page.params.uuid })}
  <div class="px-12 pt-6">
    <p>Loader medarbejder...</p>
  </div>
{:then data}
  {@const employee = data.employees[0].objects[0]}
  <div class="px-12 pt-6">
    <h1 class="mb-4">
      {employee.name}
      <span class="text-slate-600">
        {employee.cpr_no
          ? `(${employee.cpr_no.slice(4)}-${employee.cpr_no.slice(-4)})`
          : ""}
      </span>
    </h1>

    <Tabs {activeItem} {items} on:tabChange={tabChange} />

    <div class="mb-8" />

    <!-- TODO: Implement past present future for employees -->
    <!-- <TenseTabs /> -->

    {#if activeItem === itemCategory.EMPLOYEE}
      <EmployeeDetailTable uuid={$page.params.uuid} />
    {:else if activeItem === itemCategory.ENGAGEMENTS}
      <EngagementDetailTable uuid={$page.params.uuid} />
    {:else if activeItem === itemCategory.ADDRESSES}
      <DetailTable headers={["Adressetype", "Adresse", "Synlighed", "Dato"]}>
        {#each employee.addresses as address, i}
          <tr
            class="{i % 2 === 1 ? 'bg-slate-100' : ''} 
            p-4 leading-5 border-t border-slate-300 text-secondary"
          >
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
        {#each employee.associations as association, i}
          <tr
            class="{i % 2 === 1 ? 'bg-slate-100' : ''} 
            p-4 leading-5 border-t border-slate-300 text-secondary"
          >
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
        {#each employee.roles as role, i}
          <tr
            class="{i % 2 === 1 ? 'bg-slate-100' : ''} 
            p-4 leading-5 border-t border-slate-300 text-secondary"
          >
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
        {#each employee.leaves as leave, i}
          <tr
            class="{i % 2 === 1 ? 'bg-slate-100' : ''} 
            p-4 leading-5 border-t border-slate-300 text-secondary"
          >
            <td class="p-4">
              {leave.leave_type.name}
            </td>
            <td class="p-4">
              {#if leave.engagement}
                {leave.engagement.job_function.name}, {leave.engagement.org_unit[0]
                  .name}
              {/if}
            </td>
            <ValidityTableCell validity={leave.validity} />
          </tr>
        {/each}
      </DetailTable>
    {:else if activeItem === itemCategory.MANAGER_ROLES}
      <!-- TODO: Needs Lederansvar, Ledertype, Lederniveau -->
      <DetailTable headers={["Enhed", "Dato"]}>
        {#each employee.manager_roles as manager_role, i}
          <tr
            class="{i % 2 === 1 ? 'bg-slate-100' : ''} 
            p-4 leading-5 border-t border-slate-300 text-secondary"
          >
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
{/await}
