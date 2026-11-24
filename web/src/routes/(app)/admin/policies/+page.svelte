<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import { base } from "$app/paths"
  import PolicyTable from "$lib/components/tables/PolicyTable.svelte"
  import DetailTable from "$lib/components/shared/DetailTable.svelte"
  import HeadTitle from "$lib/components/shared/HeadTitle.svelte"
  import Button from "$lib/components/shared/Button.svelte"
</script>

<HeadTitle type="admin" />

<div class="flex px-12 pt-6">
  <main class="flex-1">
    <h1 class="pb-4">
      {capital($_("policy", { values: { n: 2 } }))}
    </h1>

    <div class="flex justify-end">
      <Button
        title={capital(
          $_("create_item", {
            values: { item: $_("policy", { values: { n: 1 } }) },
          })
        )}
        href="{base}/admin/policies/create"
        extraClasses="my-5"
      />
    </div>

    <DetailTable
      headers={[
        { title: capital($_("name")), sortPath: "name" },
        { title: capital($_("role", { values: { n: 2 } })) },
        { title: capital($_("rule", { values: { n: 2 } })) },
        { title: capital($_("status")), sortPath: "active" },
      ]}
    >
      <PolicyTable />
    </DetailTable>
  </main>
</div>
