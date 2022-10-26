<script lang="ts">
  import { base } from "$app/paths"
  import DetailTable from "$lib/components/shared/detail_table.svelte"

  const stringToColour = (str: string) => {
    var hash = 0
    for (var i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash)
    }
    var colour = "#"
    for (var i = 0; i < 3; i++) {
      var value = (hash >> (i * 8)) & 0xff
      colour += ("00" + value.toString(16)).substr(-2)
    }
    return colour
  }

  // TODO: Get the employee interface from Strawberry
  export let employees: any[]
</script>

<DetailTable headers={["Navn", "CPR", ""]}>
  {#each employees as employee}
    <tr class="p-4 leading-5 border-t border-slate-300 text-secondary">
      <td>
        <div class="flex items-center space-x-3 m-2">
          <div class="avatar placeholder">
            <div
              class="rounded-full w-10"
              style="background-color: {stringToColour(employee.uuid)};"
            >
              <span class="text-white text-lg"
                >{employee.givenname[0] + employee.surname[0]}</span
              >
            </div>
          </div>
          <div class="font-bold">
            {employee.givenname + " " + employee.surname}
          </div>
        </div>
      </td>
      <td>{employee.cpr_no}</td>
      <td>
        <div class="mx-5">
          <a href={`${base}/employee/${employee.uuid}`}>
            <button
              class="btn btn-sm btn-primary rounded normal-case font-normal text-base text-base-100"
              >Detaljer</button
            >
          </a>
        </div>
      </td>
    </tr>
  {/each}
</DetailTable>
