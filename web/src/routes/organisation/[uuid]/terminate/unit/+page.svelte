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

      console.log("res", res)

      const json = await res.json()

      console.log("json", json)

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
        console.error("idk", json)
      }
    }
  }}
>
  <p>Dette vil afslutte registreringen for perioden:</p>
  <p>Startdato: {formatDate(data.validity.from)}</p>
  <p>Slutdato: {data.validity.to ? formatDate(data.validity.to) : "Ingen"}</p>

  <br />
  <button type="submit" class="btn btn-sm btn-warning">Afslut</button>
  <!-- <a href="{base}/organisation/{$page.params.uuid}"> -->
  <!--   <button type="reset" class="btn btn-sm btn-warning">Gå tilbage</button> -->
  <!-- </a> -->
</form>
