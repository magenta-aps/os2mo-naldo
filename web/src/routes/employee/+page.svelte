<script lang="ts">
  import EmployeeCards from "$lib/components/employee/employee_cards.svelte"
  import EmployeeSearchInput from "$lib/components/employee/employee_search_input.svelte"
  import EmployeeTable from "$lib/components/employee/employee_table.svelte"
  import { graphQLClient } from "$lib/util/http"
  import { gql } from "graphql-request"
  import { EmployeesDocument } from "./query.generated"

  let cardView = true
  let input: string
  let allEmployees: any[] // Used for the temp search implementation

  gql`
    query Employees {
      employees(limit: 100) {
        objects {
          givenname
          surname
          cpr_no
          uuid
          engagements {
            job_function {
              name
            }
            org_unit {
              name
            }
          }
        }
      }
    }
  `

  // FIXME: Ugly temp search that should be replaced by graphQL autocomplete
  const search = (employees: Array<any>, input: any) => {
    if (!isNaN(input)) {
      return employees.filter((employee) => {
        if (employee.cpr_no) {
          return employee.cpr_no.includes(input)
        }
      })
    }
    return employees.filter((employee) => {
      return (
        employee.givenname
          .concat(" ", employee.surname)
          .toLowerCase()
          .includes(input.toLowerCase()) |
        employee.givenname
          .split(" ")[0]
          .concat(" ", employee.surname)
          .toLowerCase()
          .includes(input.toLowerCase())
      )
    })
  }

  // Will override itself on input change(triggers a re-render of the #await markdown)
  $: fetchEmployees = async () => {
    if (!allEmployees) {
      const data = await graphQLClient().request(EmployeesDocument)
      allEmployees = data.employees.map((v) => v.objects[0])
    }

    // TODO: Switch to all GraphQL when #51997 is done
    if (input) {
      return search(allEmployees, input)
    }

    return allEmployees
  }
</script>

<svelte:head>
  <title>Medarbejder | OS2mo</title>
</svelte:head>

<div class="h-screen min-w-full p-10">
  <EmployeeSearchInput bind:input bind:cardView />
  <div class="py-5">
    {#await fetchEmployees()}
      <div class="flex justify-center pt-10">
        <div class="animate-spin rounded-full h-32 w-32 border-b-8 border-primary" />
      </div>
    {:then employees}
      {#if cardView}
        <EmployeeCards {employees} />
      {:else}
        <EmployeeTable {employees} />
      {/if}
    {/await}
  </div>
</div>
