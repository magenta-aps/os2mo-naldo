<script lang="ts">
  import EmployeeSummary from "$lib/components/brugeropret/EmployeeSummary.svelte"
  import EngagementSummary from "$lib/components/brugeropret/EngagementSummary.svelte"
  import ItUserSummary from "$lib/components/brugeropret/ItUserSummary.svelte"
  import ManagerSummary from "$lib/components/brugeropret/ManagerSummary.svelte"
  import AddressSummary from "$lib/components/brugeropret/AddressSummary.svelte"
</script>

<div class="sm:w-full md:w-3/4 xl:w-1/2 bg-slate-100 rounded">
  <div class="p-8 space-y-5">
    <EmployeeSummary />
    <EngagementSummary />
    <ItUserSummary />
    <ManagerSummary />
    <AddressSummary />
  </div>
</div>
