<script lang="ts">
  import { base } from "$app/paths"
  import { Sha256 } from "@aws-crypto/sha256-js"

  const stringToColour = async (str: string) => {
    const hash = new Sha256()
    hash.update(str)
    const [r, g, b] = await hash.digest()
    // Divides by 1.5 while rounding down to a whole number 
    // to make sure the colours don't get too bright
    return `rgb(${r/1.5 | 1}, ${g/1.5 | 1}, ${b/1.5 | 1})`
  }

  // TODO: Get the employee interface from Strawberry
  export let employees: any[]
</script>

<div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
  <!-- TODO: Delete slice when pagination is implemented -->
  {#each employees.slice(0, 200) as employee}
    <a
      class="card bg-slate-100 rounded border border-slate-300 shadow-sm hover:ring-2 flex justify-center hover:no-underline"
      href={`${base}/employee/${employee.uuid}`}
    >
      <div>
        <div class="flex justify-center pt-5">
          <div class="avatar placeholder">
            {#await stringToColour(employee.uuid) then colour}
              <div class="rounded-full w-16" style="background-color: {colour};">
                <span class="text-white text-3xl"
                  >{employee.givenname[0] + employee.surname[0]}</span
                >
              </div>
            {/await}
          </div>
        </div>
        <div class="card-body items-center text-center">
          <p>{employee.givenname + " " + employee.surname}</p>
          <p class="text-slate-600 text-xs">{employee.cpr_no}</p>
          {#if employee.engagements.length}
            <br />
            {#if employee.engagements[0].job_function}
              <p class="text-slate-600 text-xs">
                {employee.engagements[0].job_function.name}
              </p>
            {/if}
            {#if employee.engagements[0].org_unit.length}
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
