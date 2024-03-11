<script lang="ts">
  import { graphQLClient } from "$lib/util/http"
  import { gql } from "graphql-request"
  import { query } from "gql-query-builder"

  const isTrue = true
  const vali = isTrue
    ? `validity {
          from
        }`
    : ``

  const myQuery = query(
    {
      operation: "org_units",
      variables: {
        filter: {
          value: { uuids: "f06ee470-9f17-566f-acbe-e938112d46d9" },
          type: "OrganisationUnitFilter",
        },
      },
      fields: [{ objects: [{ validities: ["uuid", "name", vali] }] }],
    },
    null,
    { operationName: "GetOrgUnits" }
  )
  console.log(myQuery)
</script>

<div class="px-12 pt-6">
  <h1 class="mb-4">Test</h1>
</div>
