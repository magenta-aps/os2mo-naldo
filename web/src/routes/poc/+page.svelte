<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import { gql } from "graphql-request"
  import { graphQLClient } from "$lib/util/http"
  import DetailTable from "$lib/components/shared/detail_table.svelte"
  import Select from "$lib/components/forms/shared/select.svelte"
  import { InsightsDocument } from "./query.generated"
  import Search from "$lib/components/search.svelte"
  import { downloadHandler } from "$lib/util/csv"
  import { debounce } from "$lib/util/helpers"
  import type { EmployeeFilter, ManagerFilter } from "$lib/graphql/types"
  import ManagerTable from "$lib/components/tables/poc/ManagerTable.svelte"

  gql`
    query Insights(
      $employeeFilter: EmployeeFilter
      $orgUnitFilter: OrganisationUnitFilter
      $managerFilter: ManagerFilter
      $employees: Boolean = false
      $orgUnits: Boolean = false
      $managers: Boolean = false
    ) {
      ...insights_query
    }

    fragment insights_query on Query {
      employees(filter: $employeeFilter) @include(if: $employees) {
        objects {
          objects {
            name
            uuid
          }
        }
      }
      org_units(filter: $orgUnitFilter) @include(if: $orgUnits) {
        objects {
          objects {
            name
            uuid
          }
        }
      }
      managers(filter: $managerFilter) @include(if: $managers) {
        objects {
          objects {
            responsibilities {
              name
            }
            org_unit {
              name
            }
            person {
              name
              addresses(
                filter: {
                  address_type: { user_keys: ["PhoneEmployee", "EmailEmployee"] }
                }
              ) {
                name
                address_type {
                  name
                  user_key
                }
              }
            }
          }
        }
      }
    }
  `

  const mainQuery = [
    {
      uuid: "1",
      user_key: "employee",
      name: capital($_("employee", { values: { n: 2 } })),
    },
    {
      uuid: "2",
      user_key: "org_unit",
      name: capital($_("org_unit", { values: { n: 2 } })),
    },
    {
      uuid: "3",
      user_key: "manager",
      name: capital($_("manager", { values: { n: 2 } })),
    },
  ]
  type Value = {
    uuid: string | null
    name: string
    user_key?: string | null
  }
  const allPossibleHeaders = [
    { key: "objects.0.person.0.name", label: "Person Name" },
    { key: "objects.0.org_unit.0.name", label: "Organization Unit Name" },
    { key: "objects.0.person.0.addresses.0.name", label: "Manager address 1" },
    { key: "objects.0.person.0.addresses.1.name", label: "Manager address 2" },
    { key: "objects.0.person.0.addresses.2.name", label: "Manager address 3" },
    { key: "objects.0.responsibilities.0.name", label: "Manager responsibility 1" },
    { key: "objects.0.responsibilities.1.name", label: "Manager responsibility 2" },
    { key: "objects.0.responsibilities.2.name", label: "Manager responsibility 3" },
  ]

  let data
  let mainQueryType: Value
  let orgUnit
  let employeeFilter: EmployeeFilter
  let managerFilter: any = { org_unit: { uuids: undefined } }

  const searchData = async (type: string) => {
    let res
    switch (type) {
      case "employee":
        res = await graphQLClient().request(InsightsDocument, {
          employees: true,
          employeeFilter: employeeFilter,
        })
        console.log(res)
      case "org_unit":
        break
      case "manager":
        res = await graphQLClient().request(InsightsDocument, {
          managers: true,
          managerFilter: managerFilter,
        })
        console.log(res)
        return (data = res.managers?.objects)
    }
  }
</script>

<div class="px-12 pt-6 mb-5">
  <h1 class="mb-4">PoC</h1>
  <div class="collapse bg-slate-100 rounded shadow-sm my-4">
    <input type="checkbox" />
    <div class="collapse-title">
      <h3>Filter</h3>
    </div>
    <div class="collapse-content">
      <div class="grid grid-cols-4 gap-4">
        <Select
          title="Main query"
          id="main-query-type"
          iterable={mainQuery}
          bind:value={mainQueryType}
        />
        {#if mainQueryType}
          {#if mainQueryType.user_key === "employee"}
            <Search
              type="org-unit"
              title={capital($_("unit", { values: { n: 1 } }))}
              id="filter-org-unit"
              bind:value={employeeFilter}
            />
          {:else if mainQueryType.user_key === "org_unit"}
            org_unit
          {:else if mainQueryType.user_key === "manager"}
            <Search
              type="org-unit"
              title={capital($_("org_unit", { values: { n: 1 } }))}
              id="filter-org-unit"
              bind:uuid={managerFilter.org_unit.uuids}
            />
            <!-- TODO: bind value to managerFilter.org_unit.uuids -->
          {/if}
        {/if}
      </div>
      <button
        class="btn btn-sm btn-primary rounded normal-case font-normal text-base text-base-100"
        on:click={async () => await debounce(searchData, mainQueryType.user_key)}
        >{$_("search.plain")}</button
      >
    </div>
  </div>
  {#if data}
    <DetailTable
      headers={[
        { title: capital($_("name")) },
        { title: capital($_("unit", { values: { n: 1 } })) },
        { title: capital($_("address", { values: { n: 2 } })) },
        { title: capital($_("manager_responsibility")) },
      ]}
    >
      <svelte:component this={ManagerTable} {data} />
    </DetailTable>
    <button
      class="btn btn-sm btn-primary rounded normal-case font-normal text-base text-base-100"
      disabled={!data.length}
      on:click={(event) => downloadHandler(event, data, allPossibleHeaders)}
      >Download CSV</button
    >
  {/if}
</div>
