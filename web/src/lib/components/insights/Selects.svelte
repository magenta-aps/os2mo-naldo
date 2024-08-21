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

  let myValue: Field[] = querySet.chosenFields || []

  const updateValue = () => {
    data[index] = { mainQuery: querySet.mainQuery, chosenFields: myValue }
  }
  // $: data[index] = { mainQuery: querySet.mainQuery, chosenFields: myValue }
</script>

<InsightsSelect
  title={capital($_("subject"))}
  id={`main-query-${index}`}
  iterable={mainQueries}
  bind:value={querySet.mainQuery}
  on:change={() => {
    querySet.chosenFields = querySet.mainQuery ? querySet.mainQuery.fields : []
    myValue = querySet.mainQuery ? querySet.mainQuery.fields : []
    updateValue()
  }}
  isClearable={true}
  required={true}
/>

<InsightsSelectMultiple
  title={capital($_("fields"))}
  id={`fields-${index}`}
  iterable={querySet.mainQuery ? querySet.mainQuery.fields : undefined}
  bind:value={myValue}
  on:input={() => {
    updateValue()
  }}
  required={true}
/>
