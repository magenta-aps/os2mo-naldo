<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import InsightsSelect from "$lib/components/insights/InsightsSelect.svelte"
  import InsightsSelectMultiple from "$lib/components/insights/InsightsSelectMultiple.svelte"
  import type { Field, MainQuery, SelectedQuery } from "$lib/util/helpers"

  export let mainQueries: MainQuery[]
  export let querySet: SelectedQuery
  export let index: number
  export let data: SelectedQuery[]

  let chosenFields: Field[] = querySet.chosenFields || []

  const updateValue = () => {
    data[index] = { mainQuery: querySet.mainQuery, chosenFields: chosenFields }
  }
</script>

<InsightsSelect
  title={capital($_("subject"))}
  id={`main-query-${index}`}
  iterable={mainQueries.sort((a, b) =>
    $_(a.value, { values: { n: a.n } }).toLowerCase() >
    $_(b.value, { values: { n: b.n } }).toLowerCase()
      ? 1
      : -1
  )}
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
  iterable={querySet.mainQuery
    ? querySet.mainQuery.fields.sort((a, b) =>
        $_(a.value).toLowerCase() > $_(b.value).toLowerCase() ? 1 : -1
      )
    : undefined}
  bind:value={chosenFields}
  on:input={() => {
    updateValue()
  }}
  required={true}
/>
