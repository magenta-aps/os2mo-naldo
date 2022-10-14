<script lang="ts">
  import { success, error } from "$lib/stores/alert"
  import { postRest } from "$lib/util/http"
  import SelectOrgTree from "$lib/components/org/select_tree/org_tree.svelte"
  import DateInput from "$lib/components/forms/shared/date_input.svelte"
  import Error from "$lib/components/alerts/error.svelte"
  import Input from "$lib/components/forms/shared/input.svelte"
  import Breadcrumbs from "$lib/components/org/breadcrumbs.svelte"
  import { enhance } from "$app/forms"
  import { goto } from "$app/navigation"
  import { base } from "$app/paths"
  import type { Data } from "./+page"

  export let data: Data

  let startDate = new Date().toISOString().split("T")[0]
  let endDate: string
  let name: string
  let org = data.org_units[0].objects[0]
  let parentOrg = { name: "", uuid: "" }
</script>

<div class="flex align-center px-6 pt-6 pb-4">
  <h3 class="flex-1">Flyt enhed</h3>
</div>

<div class="divider p-0 m-0 mb-4 w-full" />

<form
  use:enhance={() => {
    return async ({ result }) => {
      if (result.type === "success") {
        const res = await postRest(`validate/org-unit/`, {
          org_unit: { uuid: result.data.uuid },
          validity: result.data.validity,
        })
        const json = await res.json()

        if (res.status === 200) {
          const resTwo = await postRest(`validate/candidate-parent-org-unit/`, {
            org_unit: { uuid: result.data.uuid },
            validity: result.data.validity,
          })
          const jsonTwo = await resTwo.json()

          if (resTwo.status === 200) {
            $success = {
              message: `${org.name} er blevet omdøbt`,
              uuid: json,
              type: "organisation",
            }
            setTimeout(() => goto(`${base}/organisation/${json}`), 200)
          }
        } else {
          $error = { message: json.description }
        }
      } else {
        $error = {
          message: `Fejl i omdøbning af ${org.name}: ${JSON.stringify(result)}`,
        }
      }
    }
  }}
>
  <div class="flex flex-row mx-6 mb-3">
    <div class="form-control">
      <DateInput
        bind:value={startDate}
        title="Flyttedato"
        id="move-date"
        max={endDate
          ? endDate
          : new Date(new Date().getFullYear() + 50, 0).toISOString().split("T")[0]}
      />
    </div>
    <div class="form-control ml-6 w-full">
      <SelectOrgTree bind:selectedOrg={org} labelText="Angiv enhed" />
    </div>
  </div>

  <div class="mx-6 mb-6">
    <Breadcrumbs currentOrg={org.name} uuid={org.uuid} />
  </div>

  <div class="form-control mx-6 mb-6">
    <SelectOrgTree
      bind:selectedOrg={parentOrg}
      id={"select-parent-org-tree"}
      labelText="Ny overenhed"
    />
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
      >Flyt enhed</button
    >
  </div>
  <Error />
</form>
