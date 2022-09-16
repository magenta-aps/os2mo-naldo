<script lang="ts">
  import { success, error } from "$lib/stores/alert"
  import { fetchGraph, postRest } from "$lib/util/http"
  import { DateInput } from "date-picker-svelte"
  import SelectOrgTree from "$lib/components/org/select_tree/org_tree.svelte"
  import Error from "$lib/components/alerts/error.svelte"
  import Icon from "../icon.svelte"

  let startDate = new Date()
  let endDate: Date
  let name: string
  let parentOrg: any
  let orgLevel: string
  let orgType: string
  let orgNumber: string

  const fetchDropdownItems = async () => {
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
    <div class="flex align-center p-4 pt-6">
      <h3 class="flex-1">Opret enhed</h3>
      <label for="create-org-modal" class="flex justify-end cursor-pointer">
        <Icon type="xmark" size="24" />
      </label>
    </div>

    <div class="divider p-0 m-0 w-full" />

    <form class="p-4" method="POST" on:submit|preventDefault={createOrg}>
      <div class="flex flex-row gap-4 mb-3">
        <div class="form-control">
          <span name="Start date picker" class="label">
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
          <span name="End date picker" class="label">
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
      <div class="form-control mb-3">
        <SelectOrgTree bind:selectedOrg={parentOrg} />
      </div>

      {#await fetchDropdownItems()}
        <div class="form-control mb-3 w-full">
          <label for="unit-level" class="label">
            <p>Enhedsniveau</p>
            <span class="animate-spin rounded-full h-6 w-6 border-b-4 border-primary" />
          </label>
          <select
            id="unit-level"
            class="select select-bordered select-sm rounded"
            disabled
          />
        </div>
        <div class="form-control mb-3">
          <label for="name" class="label">
            <p>Navn</p>
          </label>
          <input
            id="name"
            type="text"
            class="input input-bordered input-sm rounded w-full"
            disabled
          />
        </div>

        <div class="flex flex-row gap-4 ">
          <div class="basis-1/2">
            <label for="unit-number" class="label">
              <p>Enhedsnummer</p>
            </label>
            <input
              id="unit-number"
              class="input input-bordered input-sm rounded w-full"
              disabled
            />
          </div>
          <div class="basis-1/2">
            <label for="unit-type" class="label">
              <p>Enhedstype</p>
            </label>
            <select
              id="unit-type"
              class="select select-bordered select-sm rounded w-full"
              disabled
            />
          </div>
        </div>

        <div class="modal-action">
          <button disabled type="submit" class="btn btn-primary">Opret</button>
        </div>
      {:then dropDownItems}
        <div class="form-control mb-3 w-full">
          <label for="unit-level" class="label">
            <p>Enhedsniveau</p>
          </label>
          <select
            id="unit-level"
            class="select select-bordered select-sm rounded focus:select-secondary active:select-secondary"
            bind:value={orgLevel}
            required
          >
            {#each dropDownItems[0].classes as orgLevel}
              <option value={orgLevel.uuid}>{orgLevel.name}</option>
            {/each}
          </select>
        </div>
        <div class="form-control mb-3">
          <label for="name" class="label">
            <p>Navn</p>
          </label>
          <input
            id="name"
            bind:value={name}
            type="text"
            class="input input-bordered input-sm rounded w-full focus:input-secondary active:input-secondary"
            required
          />
        </div>

        <div class="flex flex-row gap-4 ">
          <div class="basis-1/2">
            <label for="unit-number" class="label">
              <p>Enhedsnummer</p>
            </label>
            <input
              id="unit-number"
              bind:value={orgNumber}
              class="input input-bordered input-sm rounded w-full"
            />
          </div>
          <div class="basis-1/2">
            <label for="unit-type" class="label">
              <p>Enhedstype</p>
            </label>
            <select
              id="unit-type"
              class="select select-bordered select-sm rounded w-full"
              bind:value={orgType}
              required
            >
              {#each dropDownItems[1].classes as orgType}
                <option value={orgType.uuid}>{orgType.name}</option>
              {/each}
            </select>
          </div>
        </div>
        <!-- TODO: Address support missing -->
        <div class="modal-action">
          <button type="submit" class="btn btn-primary">Opret</button>
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
    --date-picker-highlight-border: hsl(var(--s));
    --date-picker-highlight-shadow: hsl(var(--s));
    --date-input-width: 232px; /* FIXME: Figure out how to control size */
  }
</style>
