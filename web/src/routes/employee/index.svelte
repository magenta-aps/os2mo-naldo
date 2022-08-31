<script lang="ts">
  import EmployeeCards from "$lib/components/employee/employee_cards.svelte"
  import EmployeeSearchInput from "$lib/components/employee/employee_search_input.svelte"
  import EmployeeTable from "$lib/components/employee/employee_table.svelte"
  import { fetchGraph, fetchRest } from "$lib/util/http"

  let cardView = true
  let input: string
  let allEmployees: any[] // Acts as a cache for fetchEmployees()
  let refreshEmployees: Promise<[]>

  const query = `
      query {
        employees {
          objects {
            name
            cpr_no
            uuid
          }
        }
      }
  `

  const search = async (query: string) => {
    // TODO: Switch to GraphQL when #51997 is done
    const res = await fetchRest(`e/autocomplete/?query=${query}`)
    const json = await res.json()
    return json.items
  }

  const fetchEmployees = async () => {
    // Uses GraphQL if no imput, autocomplete if there is
    // TODO: Switch to all GraphQL when #51997 is done
    if (input) {
      return await search(input)
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

  $: input, (refreshEmployees = fetchEmployees())
</script>

<div class="h-screen m-auto p-10">
  <EmployeeSearchInput bind:input bind:cardView />
  <div class="pt-5">
    {#await refreshEmployees}
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
