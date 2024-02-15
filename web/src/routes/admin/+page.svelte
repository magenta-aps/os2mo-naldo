<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import { base } from "$app/paths"
  import TenseTabs from "$lib/components/shared/tense_tabs.svelte"
  import ClassTable from "$lib/components/tables/ClassTable.svelte"
  import TableTensesWrapper from "$lib/components/tables/TableTensesWrapper.svelte"
</script>

<!-- TODO: admin HeadTitle -->
<!-- <HeadTitle type="admin" /> -->

<div class="px-12 pt-6">
  <h1 class="mb-4">{capital($_("job_function", { values: { n: 2 } }))}</h1>

  <div class="flex justify-between">
    <TenseTabs />
    <a
      class="btn btn-sm btn-primary rounded normal-case font-normal text-base text-base-100 my-5"
      href={`${base}/admin/create/class`}
    >
      {capital(
        $_("create_item", {
          values: { item: $_("job_function", { values: { n: 1 } }) },
        })
      )}
    </a>
  </div>
  <TableTensesWrapper
    table={ClassTable}
    headers={[
      { title: capital($_("name")), sortPath: "name" },
      { title: capital($_("user_key")), sortPath: "user_key" },
      { title: capital($_("date.date")), sortPath: "validity.from" },
      { title: "" },
    ]}
  />
</div>
