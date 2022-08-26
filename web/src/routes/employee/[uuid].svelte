<script lang="ts">
  import { page } from "$app/stores"
  import { fetchGraph } from "$lib/util/http"
  import Tabs from "$lib/components/shared/tabs.svelte"
  import EmployeeStats from "$lib/components/employee/employee_stats.svelte"
  import EmployeeTable from "$lib/components/employee/employee_table.svelte"

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
        }
        validity {
          to
          from
        }
      }
      cpr_no
    }
  }
}

`
  }
  const fetchEmployee = async () => {
    const res = await fetchGraph(query($page.params.uuid))
    const json = await res.json()

    console.log(json.data.employees[0].objects[0])

    return json.data.employees[0].objects[0]
  }

  const calcEmploymentPeriod = (engagements: any[]): string => {
    // Find and formats the first and last day of the employeement period
    const firstDate = Math.min(...engagements.map((x) => Date.parse(x.validity.from)))
    const lastDate = Math.max(...engagements.map((x) => Date.parse(x.validity.to)))

    const formattedFirstDate = new Date(firstDate).toLocaleString("da-DK", {
      dateStyle: "long",
    })
    const formattedLastDate = new Date(lastDate).toLocaleString("da-DK", {
      dateStyle: "long",
    })

    return `${formattedFirstDate} - ${formattedLastDate}`
  }

  // For the tab categories
  let items = ["Engagementer", "Adresser"]
  let activeItem = items[0]
  const tabChange = (e) => (activeItem = e.detail)
</script>

<div class="px-12 pt-6">
  {#await fetchEmployee()}
    loading...
  {:then employee}
    <EmployeeStats {employee} />
    <Tabs {activeItem} {items} on:tabChange={tabChange} />
    {#if activeItem === "Engagementer"}
      Engagementer
    {:else if activeItem === "Adresser"}
      Adresser
    {/if}
  {/await}
</div>
