<script lang="ts">
  import { DateInput } from "date-picker-svelte"
  import SelectOrgTree from "$lib/components/org/select_tree/org_tree.svelte"
  import { fetchGraph, postRest } from "$lib/util/http"

  let startDate = new Date()
  let endDate: Date
  let name: string
  let parentOrg: any
  let orgLevel: string
  let orgType: string
  let orgNumber: string
  let createStatus: number

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
    const x = postRest(`ou/create`, {
      name: name,
      parent: { uuid: parentOrg.uuid },
      org_unit_level: { uuid: orgLevel },
      org_unit_type: { uuid: orgType },
      validity: {
        from: startDate.toISOString().split("T")[0],
        to: endDate ? endDate.toISOString().split("T")[0] : undefined,
      },
    })
    createStatus = await x.status
  }
</script>

<input type="checkbox" id="create-org-modal" class="modal-toggle" />
<div class="modal">
  <div class="modal-box w-4/5 max-w-2xl">
    <label for="create-org-modal" class="btn btn-sm btn-circle absolute right-4 top-4"
      >✕</label
    >
    <h3 class="font-bold text-lg pb-4">Opret enhed</h3>

    <form>
      <div class="flex sm:flex-row flex-col gap-2 pb-4">
        <div class="form-control">
          <div class="label">
            <span class="label-text">Startdato</span>
          </div>
          <DateInput
            bind:value={startDate}
            format={"dd-MM-yyyy"}
            placeholder={"Startdato"}
            min={new Date("1/1/1910")}
            max={endDate ? endDate : new Date(new Date().getFullYear() + 50, 0)}
          />
        </div>
        <div class="form-control">
          <div class="label">
            <span class="label-text">Slutdato</span>
          </div>
          <DateInput
            bind:value={endDate}
            format={"dd-MM-yyyy"}
            placeholder={"Slutdato"}
            min={startDate}
            max={new Date(new Date().getFullYear() + 50, 0)}
          />
        </div>
      </div>
      <div class="form-control pb-4 max-w-xl">
        <div class="label">
          <span class="label-text">Angiv overenhed</span>
        </div>
        <SelectOrgTree bind:selectedOrg={parentOrg} />
      </div>

      {#await fetchDropdownItems()}
        <div class="animate-spin rounded-full h-32 w-32 border-b-8 border-primary" />
      {:then dropDownItems}
        <div class="form-control pb-4 w-full max-w-xl">
          <div class="label">
            <span class="label-text">Enhedsniveu</span>
          </div>
          <select class="select select-bordered" bind:value={orgLevel}>
            {#each dropDownItems[0].classes as orgLevel}
              <option value={orgLevel.uuid}>{orgLevel.name}</option>
            {/each}
          </select>
        </div>

        <div class="flex md:flex-row flex-col gap-2 pb-4 w-full max-w-xl">
          <div class="form-control">
            <div class="label">
              <span class="label-text">Navn</span>
            </div>
            <input
              bind:value={name}
              type="text"
              placeholder="Navn"
              class="input input-bordered w-full"
            />
          </div>

          <div class="flex flex-row gap-2">
            <div>
              <div class="label">
                <span class="label-text">Enhedsnummer</span>
              </div>
              <input
                bind:value={orgNumber}
                class="input input-bordered w-full"
                placeholder="Udfyld eller auto"
              />
            </div>
            <div>
              <div class="label">
                <span class="label-text">Enhedstype</span>
              </div>
              <select class="select select-bordered w-full" bind:value={orgType}>
                {#each dropDownItems[1].classes as orgType}
                  <option value={orgType.uuid}>{orgType.name}</option>
                {/each}
              </select>
            </div>
          </div>
        </div>
        <p class="pb-4">PLACEHOLDER FOR ADRESSER</p>
        <div class="modal-action" on:click={createOrg()}>
          <label for={createStatus === 200 ? "create-org-modal" : ""} class="btn"
            >Opret</label
          >
        </div>
      {/await}
    </form>
  </div>
</div>

<style>
  :root {
    --date-picker-background: hsl(var(--b1));
    --date-picker-foreground: hsl(var(--bc));
    --date-picker-highlight-border: hsl(var(--p));
    --date-picker-highlight-shadow: hsl(var(--p));
  }
</style>
