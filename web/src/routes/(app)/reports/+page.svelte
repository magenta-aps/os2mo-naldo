<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import { sortKey, sortDirection } from "$lib/stores/sorting"
  import ReportTable from "$lib/components/tables/ReportTable.svelte"
  import DetailTable from "$lib/components/shared/DetailTable.svelte"

  // The sort store is shared by every table and carries over from the last page.
  $sortKey = "file_name"
  $sortDirection = 1
</script>

<div class="flex px-12 pt-6">
  <main class="flex-1">
    <h1 class="pb-4">{capital($_("report", { values: { n: 2 } }))}</h1>

    <DetailTable
      headers={[
        { title: capital($_("filename")), sortPath: "file_name" },
        { title: capital($_("file_type")), sortPath: "file_type" },
      ]}
    >
      <ReportTable />
    </DetailTable>
  </main>
</div>
