<script lang="ts">
  // TODO: employee interface
  export let employee: any

  const employmentPeriod = (engagements: any[]): string => {
    // Finds and formats the first and last day of the employeement period
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
</script>

<div class="stats stats-vertical lg:stats-horizontal shadow bg-base-300 mb-6">
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
    <div class="stat-value text-xl">{employmentPeriod(employee.engagements)}</div>
  </div>
</div>
