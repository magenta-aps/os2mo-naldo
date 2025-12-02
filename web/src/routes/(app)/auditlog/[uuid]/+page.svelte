<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import HeadTitle from "$lib/components/shared/HeadTitle.svelte"
  import AuditlogTable from "$lib/components/tables/AuditlogTable.svelte"
  import DetailTable from "$lib/components/shared/DetailTable.svelte"
</script>

<HeadTitle type="auditlog" />

<div class="px-12 pt-6">
  <h1 class="mb-4">
    {capital($_("auditlog"))}
  </h1>

  <DetailTable
    headers={[
      { title: capital($_("date.date")), sortPath: "start" },
      { title: capital($_("actor")), sortPath: "actor" },
      { title: capital($_("id")), sortPath: "registration_id" },
      { title: capital($_("note")), sortPath: "model" },
    ]}
  >
    <svelte:component this={AuditlogTable} />
  </DetailTable>
</div>
