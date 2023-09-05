<script lang="ts">
  import { formatDate } from "$lib/util/date"
  import { enhance } from "$app/forms"
  import { postRest } from "$lib/util/http"
  import { success, error } from "$lib/stores/alert"
  import type { PageData } from "./$types"

  export let data: PageData
</script>

<div class="flex align-center px-6 pt-6 pb-4">
  <h3 class="flex-1">Afslut {data.name}</h3>
</div>

<div class="divider p-0 m-0 mb-4 w-full" />

<form
  method="post"
  class="mx-6"
  use:enhance={() => {
    return async () => {
      const res = await postRest("details/terminate", {
        type: "org_unit",
        uuid: data.uuid,
        validity: {
          from: data.validity.from,
          to: data.validity.to,
        },
      })

      const json = await res.json()

      if (res.status === 200) {
        $success = {
          message: `${data.name} er blevet afsluttet`,
          uuid: data?.parent?.uuid,
          type: "organisation",
        }
      } else {
        $error = { message: json.description }
      }
    }
  }}
>
  <div class="w-1/2 min-w-fit bg-slate-100 rounded">
    <div class="p-8">
      <p>Dette vil afslutte registreringen for perioden:</p>
      <p>Startdato: {formatDate(data.validity.from)}</p>
      <p>Slutdato: {data.validity.to ? formatDate(data.validity.to) : "Ingen"}</p>
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
</form>
