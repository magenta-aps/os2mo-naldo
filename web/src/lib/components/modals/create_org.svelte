<script lang="ts">
  import { success, error } from "$lib/stores/alert"
  import { fetchGraph, postRest } from "$lib/util/http"
  import { DateInput } from "date-picker-svelte"
  import SelectOrgTree from "$lib/components/org/select_tree/org_tree.svelte"
  import Error from "$lib/components/alerts/error.svelte"
  import Icon from "$lib/components/icon.svelte"
  import Input from "$lib/components/modals/shared/input.svelte"
  import Select from "$lib/components/modals/shared/select.svelte"
  import Address from "$lib/components/modals/shared/address.svelte"

  let startDate = new Date()
  let endDate: Date
  let name: string
  let parentOrg: any
  let orgLevel: string
  let orgType: string
  let orgNumber: string
  // Needs details interface
  let details: any[] = []
  let detailAmount = 0

  const fetchFacets = async () => {
    const query = `
      query {
        facets(user_keys: ["org_unit_level", "org_unit_type"]) {
          uuid
          user_key
          classes {
            name
            uuid
          }
        }
      }`

    const res = await fetchGraph(query)
    const json = await res.json()
    return json.data.facets
  }

  const createOrg = async () => {
    const res = await postRest(`ou/create`, {
      name: name,
      parent: { uuid: parentOrg.uuid },
      org_unit_level: { uuid: orgLevel },
      org_unit_type: { uuid: orgType },
      validity: {
        // End format YYYY-mm-dd
        from: startDate.toISOString().split("T")[0],
        to: endDate ? endDate.toISOString().split("T")[0] : undefined,
      },
      details: details,
    })
    if (res.status === 201) {
      // Closes the hidden checkbox controlling the open state
      const json = await res.json()
      document.getElementById("create-org-modal").checked = false
      $success = {
        message: `${name} er blevet oprettet`,
        uuid: json,
        type: "organisation",
      }
    } else {
      const json = await res.json()
      $error = { message: json.description }
    }
  }
</script>

<input type="checkbox" id="create-org-modal" class="modal-toggle" />
<label for="create-org-modal" class="modal cursor-pointer">
  <label class="modal-box rounded-lg p-0 relative" for="">
    <div class="flex align-center px-6 pt-6 pb-4">
      <h3 class="flex-1">Opret enhed</h3>
      <label for="create-org-modal" class="flex justify-end cursor-pointer">
        <Icon type="xmark" size="24" />
      </label>
    </div>

    <div class="divider p-0 m-0 mb-4 w-full" />

    <form method="POST" on:submit|preventDefault={createOrg}>
      <div class="flex flex-row gap-6 mx-6 mb-4">
        <div class="form-control">
          <span name="Start date picker" class="pb-1">
            <p>Startdato</p>
          </span>
          <DateInput
            bind:value={startDate}
            format={"dd-MM-yyyy"}
            placeholder={""}
            min={new Date("1/1/1910")}
            max={endDate ? endDate : new Date(new Date().getFullYear() + 50, 0)}
          />
        </div>
        <div class="flex-1 justify-end form-control">
          <span name="End date picker" class="pb-1">
            <p>Slutdato</p>
          </span>
          <DateInput
            bind:value={endDate}
            format={"dd-MM-yyyy"}
            placeholder={""}
            min={startDate}
            max={new Date(new Date().getFullYear() + 50, 0)}
          />
        </div>
      </div>
      <div class="form-control mx-6 mb-4">
        <SelectOrgTree bind:selectedOrg={parentOrg} />
      </div>

      <!-- TODO: Should have a skeleton for the loading stage -->
      {#await fetchFacets() then facets}
        <div class="mx-6">
          <div class="form-control mb-4">
            <Input title="Navn" id="name" bind:value={name} required={true} />
          </div>
          <div class="form-control mb-4 w-full">
            <Select
              title="Enhedstype"
              id="unit-type"
              bind:value={orgType}
              iterable={facets[1].classes}
              required={true}
            />
          </div>

          <div class="flex flex-row gap-6 mb-6">
            <div class="basis-1/2">
              <Select
                title="Enhedsniveau"
                id="unit-level"
                bind:value={orgLevel}
                iterable={facets[0].classes}
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
              <Address
                {startDate}
                {endDate}
                bind:addresses={details[i]}
                detailAmount={i}
              />
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
      {/await}
      <Error />
    </form>
  </label>
</label>

<style>
  :root {
    --date-picker-background: hsl(var(--b1));
    --date-picker-foreground: hsl(var(--bc));
    --date-picker-highlight-border: hsl(var(--p));
    --date-picker-highlight-shadow: hsl(var(--p));
    --date-input-width: 220px; /* FIXME: Figure out how to control size with percentages */
  }
</style>
