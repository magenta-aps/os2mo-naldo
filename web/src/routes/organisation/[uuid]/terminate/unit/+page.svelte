<script lang="ts">
  import type { OrganisationUnitElement } from "./+page"
  import { formatDate } from "$lib/util/date"
  import { base } from "$app/paths"
  import { enhance } from "$app/forms"
  import { postRest } from "$lib/util/http"
  import { success, error } from "$lib/stores/alert"
  import { goto } from "$app/navigation"

  export let data: OrganisationUnitElement
  console.log(data)
</script>

<div class="flex align-center px-6 pt-6 pb-4">
  <h3 class="flex-1">Afslut {data.name}</h3>
</div>

<div class="divider p-0 m-0 mb-4 w-full" />

<form
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
        if (data.parent && data.parent.uuid) {
          goto(`${base}/organisation/${data.parent.uuid}`)
        }
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
  <div class="mx-6">
    {env.PUBLIC_ENABLE_UNIT_TERMINATE}
    <p>Dette vil afslutte registreringen for perioden:</p>
    <p>Startdato: {formatDate(data.validity.from)}</p>
    <p>Slutdato: {data.validity.to ? formatDate(data.validity.to) : "Ingen"}</p>
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
</form>
