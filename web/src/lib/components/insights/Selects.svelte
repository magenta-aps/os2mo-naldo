<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import { compareDanish } from "$lib/utils/sorting"
  import InsightsSelect from "$lib/components/insights/InsightsSelect.svelte"
  import InsightsSelectMultiple from "$lib/components/insights/InsightsSelectMultiple.svelte"
  import type { Field, MainQuery, SelectedQuery } from "$lib/utils/insights"

  export let mainQueries: MainQuery[]
  export let querySet: SelectedQuery
  export let index: number
  export let data: SelectedQuery[]

  let chosenFields: Field[] = querySet.chosenFields || []

  // Sorted by translated label, so a language switch re-sorts it.
  $: sortedQueries = [...mainQueries].sort((a, b) =>
    compareDanish($_(a.label, { values: { n: 2 } }), $_(b.label, { values: { n: 2 } }))
  )

  const updateValue = () => {
    data[index] = { mainQuery: querySet.mainQuery, chosenFields: chosenFields }
  }
</script>

<InsightsSelect
  title={capital($_("subject"))}
  id={`main-query-${index}`}
  iterable={sortedQueries}
  bind:value={querySet.mainQuery}
  on:change={() => {
    querySet.chosenFields = querySet.mainQuery ? querySet.mainQuery.fields : []
    chosenFields = querySet.mainQuery ? querySet.mainQuery.fields : []
    updateValue()
  }}
  on:clear={() => {
    chosenFields = []
  }}
  isClearable={true}
  required={true}
/>

<InsightsSelectMultiple
  title={capital($_("fields"))}
  id={`fields-${index}`}
  iterable={querySet.mainQuery ? querySet.mainQuery.fields : undefined}
  bind:value={chosenFields}
  on:input={() => {
    updateValue()
  }}
  required={true}
/>
