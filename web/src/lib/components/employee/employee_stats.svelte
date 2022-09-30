<script lang="ts">
  // TODO: employee interface
  export let employee: any

  interface EmploymentPeriod {
    firstDate: string | undefined
    lastDate: string | undefined
  }

  const employmentPeriod = (engagements: any[]): EmploymentPeriod => {
    // Finds and formats the first and last day of the employeement period
    const firstDate = Math.min(...engagements.map((x) => Date.parse(x.validity.from)))
    const lastDate = Math.max(...engagements.map((x) => Date.parse(x.validity.to)))

    const formattedFirstDate = isNaN(firstDate)
      ? undefined
      : new Date(firstDate).toLocaleString("da-DK", {
          dateStyle: "long",
        })

    const formattedLastDate = isNaN(lastDate)
      ? undefined
      : new Date(lastDate).toLocaleString("da-DK", {
          dateStyle: "long",
        })

    return { firstDate: formattedFirstDate, lastDate: formattedLastDate }
  }

  const period: EmploymentPeriod = employmentPeriod(employee.engagements)
</script>

<div
  class="stats stats-vertical text-secondary md:stats-horizontal shadow bg-slate-100 mb-6"
>
  <div class="stat">
    <div class="stat-title">MEDARBEJDER</div>
    <div class="stat-value text-xl">{employee.name}</div>
  </div>
  <div class="stat">
    <div class="stat-title">CPR-NUMMER</div>
    <div class="stat-value text-xl">
      {employee.cpr_no.slice(4)}-{employee.cpr_no.slice(-4)}
    </div>
  </div>
  <div class="stat">
    <div class="stat-title">ANSAT</div>
    {#if period.firstDate}
      <div class="stat-value text-xl">
        {period.firstDate} -
      </div>
    {/if}
    {#if period.lastDate}
      <div class="stat-value text-xl">
        {period.lastDate}
      </div>
    {/if}
  </div>
</div>
