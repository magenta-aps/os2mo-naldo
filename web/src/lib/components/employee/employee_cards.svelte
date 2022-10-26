<script lang="ts">
  import { base } from "$app/paths"

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

<div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
  {#each employees as employee}
    <a
      class="card bg-slate-100 rounded border border-slate-300 shadow-sm hover:ring-2 flex justify-center hover:no-underline"
      href={`${base}/employee/${employee.uuid}`}
    >
      <div>
        <div class="flex justify-center pt-5">
          <div class="avatar placeholder">
            <div
              class="rounded-full w-16"
              style="background-color: {stringToColour(employee.uuid)};"
            >
              <span class="text-white text-3xl"
                >{employee.givenname[0] + employee.surname[0]}</span
              >
            </div>
          </div>
        </div>
        <div class="card-body items-center text-center">
          <p>{employee.givenname + " " + employee.surname}</p>
          <p class="text-slate-600 text-xs">{employee.cpr_no}</p>
          {#if employee.engagements[0]}
            <br />
            {#if employee.engagements[0].job_function}
              <p class="text-slate-600 text-xs">
                {employee.engagements[0].job_function.name}
              </p>
            {/if}
            {#if employee.engagements[0].org_unit}
              <p class="text-slate-600 text-xs">
                {employee.engagements[0].org_unit[0].name}
              </p>
            {/if}
          {/if}
        </div>
      </div>
    </a>
  {/each}
</div>
