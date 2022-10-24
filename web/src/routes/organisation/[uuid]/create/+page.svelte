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
  import type { Data } from "./+page"
  import { goto } from "$app/navigation"
  import { base } from "$app/paths"

  export let data: Data

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

<form
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
        JSON.stringify(result)
        $error = {
          message: `Something went wrong with the form: ${JSON.stringify(result)}`,
        }
      }
    }
  }}
>
  <div class="flex flex-row gap-6 mx-6 mb-4">
    <div class="form-control">
      <DateInput
        bind:value={startDate}
        title="Startdato"
        id="start-date"
        max={endDate
          ? endDate
          : new Date(new Date().getFullYear() + 50, 0).toISOString().split("T")[0]}
      />
    </div>

    <div class="form-control">
      <DateInput
        bind:value={endDate}
        title="Slutdato"
        id="end-date"
        min={startDate}
        max={new Date(new Date().getFullYear() + 50, 0).toISOString().split("T")[0]}
      />
    </div>
  </div>
  <div class="form-control mx-6 mb-4">
    <SelectOrgTree bind:selectedOrg={parentOrg} />
  </div>

  <!-- TODO: Should have a skeleton for the loading stage -->
  <div class="mx-6">
    <div class="form-control mb-4">
      <Input title="Navn" id="name" bind:value={name} required={true} />
    </div>
    <div class="form-control mb-4 w-full">
      <Select
        title="Enhedstype"
        id="org-type"
        bind:value={orgType}
        iterable={data.facets[1].classes.sort((a, b) => (a.name > b.name ? 1 : -1))}
        required={true}
      />
    </div>

    <div class="flex flex-row gap-6 mb-6">
      <div class="basis-1/2">
        <Select
          title="Enhedsniveau"
          id="org-level"
          bind:value={orgLevel}
          iterable={data.facets[0].classes.sort((a, b) => (a.name > b.name ? 1 : -1))}
          required={true}
        />
      </div>
      <div class="basis-1/2">
        <Input title="Enhedsnummer" id="unit-number" bind:value={orgNumber} />
      </div>
    </div>
    <!-- TODO: Address support missing -->

    <div class="mb-6">
      {#each Array(detailAmount) as _, i}
        <Address {startDate} {endDate} bind:addresses={details[i]} detailAmount={i} />
      {/each}
    </div>
    <button
      on:click={() => {
        detailAmount++
      }}
      class="btn btn-sm btn-outline btn-primary rounded normal-case font-normal text-base"
      type="button">+ Tilføj adresser(*)</button
    >
  </div>
  <div class="modal-action p-6 gap-4 bg-slate-100">
    <!-- TODO: Make button close modal -->
    <button
      type="button"
      class="btn btn-sm btn-outline btn-primary rounded normal-case font-normal text-base"
    >
      Annullér
    </button>
    <button
      type="submit"
      class="btn btn-sm btn-primary rounded normal-case font-normal text-base text-base-100"
      >Opret enhed</button
    >
  </div>
  <Error />
</form>
