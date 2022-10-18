<script lang="ts">
  import { success, error } from "$lib/stores/alert"
  import { postRest } from "$lib/util/http"
  import SelectOrgTree from "$lib/components/org/select_tree/org_tree.svelte"
  import DateInput from "$lib/components/forms/shared/date_input.svelte"
  import Error from "$lib/components/alerts/error.svelte"
  import { enhance } from "$app/forms"
  import { goto } from "$app/navigation"
  import { base } from "$app/paths"
  import type { Data } from "./+page"

  export let data: Data

  let endDate = new Date().toISOString().split("T")[0]
  let org = data.org_units[0].objects[0]
</script>

<svelte:head>
  <title>Afslut enhed | OS2mo</title>
</svelte:head>

<div class="flex align-center px-6 pt-6 pb-4">
  <h3 class="flex-1">Afslut enhed</h3>
</div>

<div class="divider p-0 m-0 mb-4 w-full" />

<form
  use:enhance={() => {
    return async ({ result }) => {
      if (result.type === "success") {
        if (!result.data) {
          $error = {
            message: `Fejl i terminering af ${org.name}: Ingen data`,
          }
          return
        }

        const res = await postRest(`ou/${result.data.org}/terminate`, {
          validity: result.data.validity,
        })
        const json = await res.json()

        if (res.status === 200) {
          $success = {
            message: `${org.name} er blevet termineret fra ${result.data.validity.to}`,
            uuid: json,
            type: "organisation",
          }
          setTimeout(() => goto(`${base}/organisation/${json}`), 200)
        } else {
          $error = { message: json.description }
        }
      } else {
        $error = {
          message: `Fejl i terminering af ${org.name}: ${JSON.stringify(result)}`,
        }
      }
    }
  }}
>
  <div class="flex flex-row mx-6 mb-3">
    <div class="form-control">
      <DateInput bind:value={endDate} title="Slutdato" id="end-date" />
    </div>
  </div>

  <div class="form-control mx-6 mb-6">
    <SelectOrgTree bind:selectedOrg={org} labelText="Angiv enhed" />
  </div>
  <div class="modal-action p-6 gap-4 bg-slate-100">
    <button
      type="button"
      class="btn btn-sm btn-outline btn-primary rounded normal-case font-normal text-base"
    >
      Annullér
    </button>
    <button
      type="submit"
      class="btn btn-sm btn-primary rounded normal-case font-normal text-base text-base-100"
      >Afslut enhed</button
    >
  </div>
  <Error />
</form>
