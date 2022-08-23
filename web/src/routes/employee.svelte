<script lang="ts">
  import EmployeeCards from "$lib/components/employee/employee_cards.svelte"
  import EmployeeSearch from "$lib/components/employee/employee_search.svelte"
  import EmployeeTable from "$lib/components/employee/employee_table.svelte"
  import { fetchGraph } from "$lib/util/http"

  let cardView = true
  let input = ""

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

  const search = (employees: Array<any>, input: string) => {
    if (input.length > 2) {
      const x = employees.filter((x) =>
        x.objects.every((y) => y.name.toLowerCase().includes(input.toLowerCase()))
      )
      console.log(x.length)
      return x
    }
    return employees
  }

  const fetchEmoloyeesGraph = async () => {
    const res = await fetchGraph(query)

    const json = await res.json()
    if (json.data) {
      return json.data.employees
    } else {
      throw new Error(json.errors[0].message)
    }
  }
</script>

<div class="h-screen m-auto p-10">
  <EmployeeSearch bind:input bind:cardView />
  <div class="pt-5">
    {#await fetchEmoloyeesGraph()}
      <div class="flex justify-center pt-10">
        <div class="animate-spin rounded-full h-32 w-32 border-b-8 border-primary" />
      </div>
    {:then employees}
      {#if cardView}
        <EmployeeCards {employees} {search} {input} />
      {:else}
        <EmployeeTable {employees} {search} {input} />
      {/if}
    {/await}
  </div>
</div>
