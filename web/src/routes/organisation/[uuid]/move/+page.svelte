<script lang="ts">
  import { success, error } from "$lib/stores/alert"
  import { postRest } from "$lib/util/http"
  import SelectOrgTree from "$lib/components/org/select_tree/org_tree.svelte"
  import DateInput from "$lib/components/forms/shared/date_input.svelte"
  import Error from "$lib/components/alerts/error.svelte"
  import Breadcrumbs from "$lib/components/org/breadcrumbs.svelte"
  import { enhance } from "$app/forms"
  import { goto } from "$app/navigation"
  import { base } from "$app/paths"
  import type { Data } from "./+page"

  export let data: Data

  let startDate = new Date().toISOString().split("T")[0]
  let endDate: string
  let org = data.org_units[0].objects[0]
  let parentOrg = { name: "", uuid: "" }
</script>

<svelte:head>
  <title>Flyt enhed | OS2mo</title>
</svelte:head>

<div class="flex align-center px-6 pt-6 pb-4">
  <h3 class="flex-1">Flyt enhed</h3>
</div>

<div class="divider p-0 m-0 mb-4 w-full" />

<form
  use:enhance={() => {
    return async ({ result }) => {
      if (result.type === "success") {
        if (!result.data) {
          $error = {
            message: `Fejl i rykning af ${org.name}: Ingen data`,
          }
          return
        }

        const validateOrgUnit = await postRest(`validate/org-unit/`, {
          org_unit: { uuid: result.data.uuid },
          validity: result.data.validity,
        })

        const validateCandidateParent = await postRest(
          `validate/candidate-parent-org-unit/`,
          {
            org_unit: { uuid: result.data.uuid },
            parent: { uuid: result.data.parent },
            validity: { from: result.data.validity.from },
          }
        )

        const validations = await Promise.all([
          validateOrgUnit,
          validateCandidateParent,
        ]).then((res) => Promise.all(res.map((r) => r.json())))

        if (validations.every((item) => item.success)) {
          const res = await postRest(`details/edit`, {
            data: {
              uuid: result.data.uuid,
              parent: { uuid: result.data.parent },
              validity: { from: result.data.validity.from },
              clamp: true,
            },
            type: "org_unit",
          })

          const json = await res.json()

          if (res.status === 200) {
            $success = {
              message: `${org.name} er blevet rykket til ${parentOrg.name}`,
              uuid: json,
              type: "organisation",
            }
            setTimeout(() => goto(`${base}/organisation/${json}`), 200)
          }
        } else {
          $error = {
            message: validations.find((item) => !item.success).description,
          }
        }
      } else {
        $error = {
          message: `Fejl i rykning af ${org.name}: ${JSON.stringify(result)}`,
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

  {#if org.uuid}
    <div class="mx-6 mb-6">
      <Breadcrumbs bind:currentOrg={org.name} bind:uuid={org.uuid} orgSelector={true} />
    </div>
  {/if}

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
