<script lang="ts">
  import { success, error } from "$lib/stores/alert"
  import { postRest } from "$lib/util/http"
  import SelectOrgTree from "$lib/components/org/select_tree/org_tree.svelte"
  import DateInput from "$lib/components/forms/shared/date_input.svelte"
  import Error from "$lib/components/alerts/error.svelte"
  import Input from "$lib/components/forms/shared/input.svelte"
  import Select from "$lib/components/forms/shared/select.svelte"
  import Address from "$lib/components/forms/shared/address.svelte"
  import { enhance } from "$app/forms"
  import { goto } from "$app/navigation"
  import { base } from "$app/paths"
  import type { PageData} from "./$types"
  import Icon from "$lib/components/icon.svelte"
  import { gql } from "graphql-request"
  import { GetOrgUnitAndFacetsDocument } from "./query.generated"

  export let data: PageData

  GetOrgUnitAndFacetsDocument

  gql`
    query GetOrgUnitAndFacets($uuid: UUID!, $fromDate: DateTime) {
      facets(user_keys: ["org_unit_level", "org_unit_type"]) {
        uuid
        user_key
        classes {
          name
          uuid
        }
      }
      org_units(uuids: $uuid, from_date: $fromDate) {
        objects {
          uuid
          name
          parent {
            uuid
            name
          }
          unit_type {
            name
          }
          org_unit_level {
            name
          }
        }
      }
    }
  `

  let startDate = new Date().toISOString().split("T")[0]
  let endDate: string
  let name: string
  let parentOrg = data.org_units[0].objects[0]
  let orgLevel: string
  let orgType: string
  let orgNumber: string
  // Needs details interface
  let details: any[] = []
  let detailAmount = 0
</script>

<svelte:head>
  <title>Opret enhed | OS2mo</title>
</svelte:head>

<div class="flex align-center px-6 pt-6 pb-4">
  <h3 class="flex-1">Opret enhed</h3>
</div>

<div class="divider p-0 m-0 mb-4 w-full" />

<form method="post" class="mx-6"
use:enhance={() => {
  return async ({ result }) => {
      if (result.type === "success") {
        const res = await postRest(`ou/create`, { ...result.data })
        const json = await res.json()

        if (res.status === 201) {
          $success = {
            message: `${name} er blevet oprettet`,
            uuid: json,
            type: "organisation",
          }
          setTimeout(() => goto(`${base}/organisation/${json}`), 200)
        } else {
          $error = { message: json.description }
        }
      } else {
        $error = {
          message: `Something went wrong with the form: ${JSON.stringify(result)}`,
        }
      }
    }
  }}
>
  <div class="w-1/2 min-w-fit mb-6 bg-slate-100 rounded">
    <div class="p-8">
      <div class="flex flex-row gap-6">
        <DateInput
          bind:value={startDate}
          title="Startdato"
          id="start-date"
          max={endDate
            ? endDate
            : new Date(new Date().getFullYear() + 50, 0).toISOString().split("T")[0]}
        />
        <DateInput
          bind:value={endDate}
          title="Slutdato"
          id="end-date"
          min={startDate}
          max={new Date(new Date().getFullYear() + 50, 0).toISOString().split("T")[0]}
        />
      </div>
      <SelectOrgTree bind:selectedOrg={parentOrg} />

      <!-- TODO: Should have a skeleton for the loading stage -->
      <Input title="Navn" id="name" bind:value={name} required={true} />
      <Select
        title="Enhedstype"
        id="org-type"
        bind:value={orgType}
        iterable={data.facets[1].classes.sort((a, b) => (a.name > b.name ? 1 : -1))}
        required={true}
      />

      <div class="flex flex-row gap-6">
        <Select
          title="Enhedsniveau"
          id="org-level"
          extra_classes="basis-1/2"
          bind:value={orgLevel}
          iterable={data.facets[0].classes.sort((a, b) => (a.name > b.name ? 1 : -1))}
          required={true}
        />
        <Input title="Enhedsnummer" id="unit-number" extra_classes="basis-1/2" bind:value={orgNumber} />
      </div>
    </div>
  </div>
  
  
  <!-- TODO: Address support missing -->
  <!-- FIXME: Fix width -->
  <div class="w-1/2 min-w-fit">
      {#each Array(detailAmount) as _, i}
      <!-- idk about "classes". Best solution i could think of, since i don't want to force the `Adress`-component to have a specific bg -->
      <!-- But it seems wrong to set it on the outside <div> since there will be no spacing between Adresses and the button `Add address` -->
        <Address extra_classes="bg-slate-100 rounded" {startDate} {endDate} bind:addresses={details[i]} detailAmount={i} />
      {/each}
    <button
      on:click={() => {
        detailAmount++
      }}
      class="btn btn-lg btn-ghost w-full px-8 mt-4 bg-slate-100 rounded justify-between normal-case font-normal text-base"
      type="button">
      <span class="text-secondary text-xl">Adresser</span>
      <Icon type="plus" fill="#1053AB" />
    </button>
  </div>
  <div class="flex py-6 gap-4">
    <!-- TODO: Make button close modal -->
    <button
      type="submit"
      class="btn btn-sm btn-primary rounded normal-case font-normal text-base text-base-100"
      >Opret enhed</button
    >
    <button
      type="button"
      class="btn btn-sm btn-outline btn-primary rounded normal-case font-normal text-base"
    >
      Annullér
    </button>
  </div>
  <Error />
</form>
