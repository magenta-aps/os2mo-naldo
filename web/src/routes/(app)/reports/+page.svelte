<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import ReportTable from "$lib/components/tables/ReportTable.svelte"
  import DetailTable from "$lib/components/shared/DetailTable.svelte"
</script>

<div class="flex px-12 pt-6">
  <main class="flex-1">
    <h1 class="pb-4">{capital($_("report", { values: { n: 2 } }))}</h1>

    <DetailTable headers={[{ title: capital($_("filename")) }]}>
      <ReportTable />
    </DetailTable>
  </main>
</div>
