<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital, upperCase } from "$lib/util/translationUtils"
  import { base } from "$app/paths"
  import HeadTitle from "$lib/components/shared/HeadTitle.svelte"
  import TenseTabs from "$lib/components/shared/TenseTabs.svelte"
  import AuditlogTable from "$lib/components/tables/AuditlogTable.svelte"
  import TableTensesWrapper from "$lib/components/tables/TableTensesWrapper.svelte"
  import DetailTable from "$lib/components/shared/DetailTable.svelte"
</script>

<HeadTitle type="auditlog" />

<div class="px-12 pt-6">
  <h1 class="mb-4">
    {capital($_("auditlog"))} for xxxxxx
  </h1>

  <DetailTable
    headers={[
      { title: capital($_("actor")), sortPath: "actor" },
      { title: capital($_("id")), sortPath: "id" },
      { title: capital($_("model")), sortPath: "model" },
      { title: capital($_("date.date")), sortPath: "time" },
    ]}
  >
    <svelte:component this={AuditlogTable} />
  </DetailTable>
</div>
