<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import RoleAutomationTable from "$lib/components/tables/RoleAutomationTable.svelte"
  import DetailTable from "$lib/components/shared/DetailTable.svelte"
  import HeadTitle from "$lib/components/shared/HeadTitle.svelte"
</script>

<HeadTitle type="admin" />

<div class="flex px-12 pt-6">
  <main class="flex-1">
    <h1 class="pb-4">
      {capital($_("role_automation"))}
    </h1>

    <DetailTable
      headers={[
        { title: capital($_("name")), sortPath: "current.name" },
        { title: capital($_("it_system")) },
        { title: capital($_("role", { values: { n: 1 } })) },
        { title: capital($_("status")), sortPath: "current.active" },
      ]}
    >
      <RoleAutomationTable />
    </DetailTable>
  </main>
</div>
