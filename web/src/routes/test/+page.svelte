<script lang="ts">
  import { query } from "gql-query-builder"

  let state = { employee: { validity: true } }

  $: vali = state.employee.validity
    ? `validity {
          from
        }`
    : ``

  $: myQuery = query(
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

  $: console.log(state, vali, myQuery)
</script>

<input type="checkbox" bind:checked={state.employee.validity} />

<div class="px-12 pt-6">
  <h1 class="mb-4">Test</h1>
</div>
