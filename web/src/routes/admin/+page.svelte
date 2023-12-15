<script>
  import { page } from "$app/stores"
  import { date } from "$lib/stores/date"
  import { base } from "$app/paths"
  import { gql } from "graphql-request"
  import { graphQLClient } from "$lib/util/http"
  import HeadTitle from "$lib/components/shared/head_title.svelte"
  import TenseTabs from "$lib/components/shared/tense_tabs.svelte"
  import { FacetDocument } from "./query.generated"
  import ClassTable from "$lib/components/tables/ClassTable.svelte"
  import TableTensesWrapper from "$lib/components/tables/TableTensesWrapper.svelte"
</script>

<!-- TODO: admin HeadTitle -->
<!-- <HeadTitle type="admin" /> -->

<div class="px-12 pt-6">
  <h1 class="mb-4">Stillingsbetegnelser</h1>

  <div class="flex justify-between">
    <TenseTabs />
    <a
      class="btn btn-sm btn-primary rounded normal-case font-normal text-base text-base-100 my-5"
      href={`${base}/admin/create/class`}
    >
      Tilføj Stillingsbetegnelse
    </a>
  </div>
  <TableTensesWrapper
    table={ClassTable}
    headers={[
      { title: "Navn", sortPath: "name" },
      { title: "Userkey", sortPath: "user_key" },
      { title: "Dato", sortPath: "validity.from" },
      { title: "" },
    ]}
  />
</div>
