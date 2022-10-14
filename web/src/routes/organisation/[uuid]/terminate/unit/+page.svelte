<script lang="ts">
  import type { OrganisationUnit } from "./+page"
  import { formatDate } from "$lib/util/date"
  import { base } from "$app/paths"
  import { page } from "$app/stores"
  import { enhance } from "$app/forms"
  import { fetchGraph } from "$lib/util/http"
  import { success } from "$lib/stores/alert"
  import { goto } from "$app/navigation"

  export let data: OrganisationUnit
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
      const to = data.validity.to ? `, to: "${data.validity.to}", ` : ", "
      const query = `
      mutation {
        org_unit_terminate(
          unit: {from: "${data.validity.from}" ${to} uuid: "${data.uuid}"}
        ) {
          uuid
        }
      }
    `
      const res = await fetchGraph(query)
      const json = await res.json()

      if (res.status === 201) {
        $success = {
          message: `${data.name} er blevet afsluttet`,
          uuid: json,
          type: "organisation",
        }
        setTimeout(() => goto(`${base}/organisation/${json}`), 200)
      } else {
        // $error = { message: json.description }
        console.error("idk", json.errors)
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
