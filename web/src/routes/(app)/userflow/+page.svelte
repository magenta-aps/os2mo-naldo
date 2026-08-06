<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import EmployeeCard from "$lib/components/userflow/EmployeeCard.svelte"
  import HubSection from "$lib/components/userflow/HubSection.svelte"
  import CreateRail from "$lib/components/userflow/CreateRail.svelte"
  import { hubSections } from "$lib/userflow/sections"
  import { employeeInfo } from "$lib/stores/employeeInfoStore"

  // Demote-only re-stamp on entry: rows approved earlier but edited into
  // invalidity show as incomplete instead of being trusted.
  employeeInfo.revalidate()
  hubSections.forEach((section) => section.store.revalidate())
</script>

<title>{capital($_("userflow"))} | OS2mo</title>

<div class="flex align-center px-6 pt-6 pb-4">
  <h1 class="mb-4">{capital($_("userflow"))}</h1>
</div>

<div class="divider p-0 m-0 mb-4 w-full" />

<div class="mx-6 grid gap-6 lg:grid-cols-[1fr_18rem] items-start max-w-5xl">
  <div class="grid gap-6">
    <EmployeeCard />
    {#each hubSections as section (section.id)}
      <HubSection definition={section} />
    {/each}
  </div>
  <CreateRail />
</div>
