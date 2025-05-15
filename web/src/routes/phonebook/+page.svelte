<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import Error from "$lib/components/alerts/Error.svelte"
  import DateInput from "$lib/components/forms/shared/DateInput.svelte"
  import Select from "$lib/components/forms/shared/Select.svelte"
  import HeadTitle from "$lib/components/shared/HeadTitle.svelte"
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

  import { type PhoneBookQuery } from "./query.generated"
  import { PhoneBookDocument } from "./query.generated"

  gql`
    query PhoneBook {
      employees(limit: "20") {
        objects {
          current {
            addresses(filter: { address_type: { user_keys: "PhoneEmployee" } }) {
              address_type {
                user_key
                uuid
                name
              }
              uuid
              user_key
              value
            }
            uuid
            user_key
            name
            surname
            given_name
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

{#await graphQLClient().request( PhoneBookDocument )}
    <div class="px-12 pt-6">Venter på data...</div>
{:then data}
    <div class="overflow-x-auto rounded border mb-8 px-12 pt-6">
        <table class="border-slate-300 w-full">
            <thead class="text-left">
                <th
                    class="px-4 py-3 font-bold leading-4 tracking-wider text-left text-secondary border-slate-300 bg-slate-300"
                >
                    <div class="flex items-center">
                    Medarbejder
                    </div>
                </th>
                <th
                    class="px-4 py-3 font-bold leading-4 tracking-wider text-left text-secondary border-slate-300 bg-slate-300"
                >
                    <div class="flex items-center">
                    Telefonnummer
                    </div>
                </th>
            </thead>
            <tbody class="border-slate-300 min-h-64 text-slate-600">
                {#each data.employees.objects as employee, i}
                    {@const x = employee.current?.addresses?.[0]?.value}
                    <tr
                        class="{i % 2 === 0 ? '' : 'bg-slate-100'} 
                        leading-5 border-t border-slate-300 text-secondary"
                    >
                        <td class="text-sm p-4">{employee.current?.name}</td>
                        <td class="text-sm p-4">{x ? x : "-"}</td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
{/await}

<!--

{#await graphQLClient().request( PhoneBookDocument )}
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
  {@const facets = data.employees.objects}


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

-->