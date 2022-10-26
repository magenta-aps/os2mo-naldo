<script lang="ts">
  import EmployeeCards from "$lib/components/employee/employee_cards.svelte"
  import EmployeeSearchInput from "$lib/components/employee/employee_search_input.svelte"
  import EmployeeTable from "$lib/components/employee/employee_table.svelte"
  import { fetchGraph } from "$lib/util/http"

  let cardView = true
  let input: string
  let allEmployees: any[] // Acts as a cache for fetchEmployees()

  const query = `
      query {
        employees {
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

  const search = (employees: Array<any>, input: string) => {
    if (input.length > 2) {
      return employees.filter(
        (employee) =>
          employee.givenname
            .concat(" ", employee.surname)
            .toLowerCase()
            .includes(input.toLowerCase()) | employee.cpr_no.includes(input)
      )
    }
    return employees
  }

  // const search = async (query: string) => {
  // TODO: Switch to GraphQL when #51997 is done
  //   const res = await fetchRest(`e/autocomplete/?query=${query}`)
  //   const json = await res.json()
  //   return json.items
  // }

  // Will override itself on input change(triggers a re-render of the #await markdown)
  $: fetchEmployees = async () => {
    // Uses GraphQL if no imput, autocomplete if there is
    // TODO: Switch to all GraphQL when #51997 is done
    if (input) {
      return search(allEmployees, input)
    }

    if (!allEmployees) {
      const res = await fetchGraph(query)
      const json = await res.json()

      if (json.data) {
        // TODO: Use employee interface
        allEmployees = json.data.employees.map((v: any) => v.objects[0])
      } else {
        throw new Error(json.errors[0].message)
      }
    }

    return allEmployees
  }
</script>

<svelte:head>
  <title>Medarbejder | OS2mo</title>
</svelte:head>

<div class="h-screen m-auto p-10">
  <EmployeeSearchInput bind:input bind:cardView />
  <div class="pt-5">
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
