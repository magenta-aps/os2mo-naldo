<script lang="ts">
  import { success, error } from "$lib/stores/alert"
  import { fetchGraph } from "$lib/util/http"
  import DateInput from "$lib/components/forms/shared/date_input.svelte"
  import Error from "$lib/components/alerts/error.svelte"
  import { enhance } from "$app/forms"
  import { goto } from "$app/navigation"
  import { base } from "$app/paths"
  import type { PageData } from "./$types"
  import { page } from "$app/stores"

  export let data: PageData

  let startDate = data.itusers[0].objects[0].validity.from.split("T")[0]
  let endDate = data.itusers[0].objects[0].validity.to?.split("T")[0]
</script>

<svelte:head>
  <title>Afslut {data.itusers[0].objects[0].itsystem.name} | OS2mo</title>
</svelte:head>

<div class="flex align-center px-6 pt-6 pb-4">
  <h3 class="flex-1">Afslut {data.itusers[0].objects[0].itsystem.name}</h3>
</div>

<div class="divider p-0 m-0 mb-4 w-full" />

<form
  use:enhance={() => {
    return async ({ result }) => {
      if (result.type === "success") {
        const res = await fetchGraph(result.data)
        const json = await res.json()

        if (res.status === 200) {
          $success = {
            message: `${data.itusers[0].objects[0].user_key} er bliver afsluttet d. ${endDate}`,
            uuid: $page.params.uuid,
            type: "organisation",
          }
          setTimeout(() => goto(`${base}/organisation/${$page.params.uuid}`), 200)
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
  <div class="flex flex-row gap-6 mx-6 mb-4">
    <div class="form-control">
      <DateInput
        title="Slutdato"
        bind:value={endDate}
        id="to"
        min={startDate}
        max={endDate ? endDate : new Date(new Date().getFullYear() + 50, 0).toISOString().split("T")[0]}
      />
    </div>
  </div>
  <div class="modal-action p-6 gap-4 bg-slate-100">
    <a
      href={`${base}/organisation/${$page.params.uuid}`}
      class="btn btn-sm btn-outline btn-primary rounded normal-case font-normal text-base"
      >Annullér</a
    >
    <button
      type="submit"
      class="btn btn-sm btn-primary rounded normal-case font-normal text-base text-base-100"
      >Afslut IT</button
    >
  </div>
  <Error />
</form>
