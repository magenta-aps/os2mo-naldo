<script lang="ts">
  import { success, error } from "$lib/stores/alert"
  import { postRest } from "$lib/util/http"
  import SelectOrgTree from "$lib/components/org/select_tree/org_tree.svelte"
  import DateInput from "$lib/components/forms/shared/date_input.svelte"
  import Error from "$lib/components/alerts/error.svelte"
  import { enhance } from "$app/forms"
  import { goto } from "$app/navigation"
  import { base } from "$app/paths"
  import type {PageData} from "./$types"

  export let data: PageData

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

<form method="post" class="mx-6"
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
            message: `${org.name} er blevet termineret fra ${result.data.to}`,
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
<div class="w-1/2 min-w-fit bg-slate-100 rounded">
  <div class="p-8">
    <div class="flex flex-row gap-6">
        <DateInput bind:value={endDate} title="Slutdato" id="end-date" />
    </div>
    <SelectOrgTree bind:selectedOrg={org} labelText="Angiv enhed" />
  </div>
</div>
<div class="flex py-6 gap-4">
  <!-- TODO: Make button close modal -->
  <button
    type="submit"
    class="btn btn-sm btn-primary rounded normal-case font-normal text-base text-base-100"
    >Afslut enhed</button
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
