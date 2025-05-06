<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import Error from "$lib/components/alerts/Error.svelte"
  import DateInput from "$lib/components/forms/shared/DateInput.svelte"
  import Select from "$lib/components/forms/shared/Select.svelte"
  import SelectMultiple from "$lib/components/forms/shared/SelectMultiple.svelte"
  import Input from "$lib/components/forms/shared/Input.svelte"
  import Button from "$lib/components/shared/Button.svelte"
  import Search from "$lib/components/search/Search.svelte"
  import Breadcrumbs from "$lib/components/org/Breadcrumbs.svelte"
  import { graphQLClient } from "$lib/util/http"
  import { gql } from "graphql-request"
  import { date } from "$lib/stores/date"
  import { getClassesByFacetUserKey } from "$lib/util/getClasses"
  import Skeleton from "$lib/components/forms/shared/Skeleton.svelte"

  import { GetClassesDocument } from "./query.generated"

  gql`
    query GetClasses($facetUserKeys: [String!]) {
      facets(filter: { user_keys: $facetUserKeys }) {
        objects {
          validities {
            user_key
            uuid
            classes {
              name
              user_key
              uuid
            }
          }
        }
      }
    }
  `
  let fromDate: string
  let toDate: string
  let selectedOrgUnit: {
    uuid: string
    name: string
  }

  const fetchSomething = async (userKeys: string[]) => {
    const res = await graphQLClient().request(GetClassesDocument, {
      facetUserKeys: userKeys,
    })
    console.log(res)
    return res
  }
</script>

{#await graphQLClient().request( GetClassesDocument, { facetUserKeys: ["org_unit_type"] } )}
  <div class="mx-6">
    <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-slate-100 rounded">
      <div class="p-8">
        <div class="flex flex-row gap-6">
          <Skeleton extra_classes="basis-1/2" />
          <Skeleton extra_classes="basis-1/2" />
        </div>
        <Skeleton />
        <Skeleton />
        <div class="flex flex-row gap-6">
          <Skeleton extra_classes="basis-1/2" />
          <Skeleton extra_classes="basis-1/2" />
        </div>
        <Skeleton />
      </div>
    </div>
  </div>
{:then data}
  {@const facets = data.facets.objects}

  <form method="post" class="mx-6">
    <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-slate-100 rounded">
      <div class="p-8">
        <div class="flex flex-row gap-6">
          <DateInput
            startValue={$date}
            bind:value={fromDate}
            title={capital($_("date.start_date"))}
            id="from"
            required={true}
          />
          <DateInput bind:value={toDate} title={capital($_("date.end_date"))} id="to" />
        </div>
        <div class="flex flex-row gap-6">
          <Select
            title="Select"
            id="select"
            iterable={getClassesByFacetUserKey(facets, "org_unit_type")}
            required={true}
            extra_classes="basis-1/2"
          />
          <Input id="input" title="Input" extra_classes="basis-1/2" />
        </div>
        <SelectMultiple
          title="Multiple"
          id="multiple"
          iterable={getClassesByFacetUserKey(facets, "org_unit_type")}
          required={true}
        />
        <Search type="org-unit" bind:value={selectedOrgUnit} required={true} />
        <Breadcrumbs orgUnit={selectedOrgUnit} />
      </div>
    </div>
    <div class="flex py-6 gap-4">
      <Button type="submit" title={capital($_("create"))} />
      <Button type="button" title={capital($_("cancel"))} outline={true} />
    </div>
    <Error />
  </form>
{/await}

<div class="mx-6">
  <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-slate-100 rounded">
    <div class="p-8">
      <div class="flex py-6 gap-4">
        <Button
          type="button"
          title="Fetch on click"
          on:click={() => fetchSomething(["manager_type"])}
        />
      </div>
    </div>
  </div>
</div>
