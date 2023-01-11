<script lang="ts">
  import { success, error } from "$lib/stores/alert"
  import { fetchGraph } from "$lib/util/http"
  import SelectOrgTree from "$lib/components/org/select_tree/org_tree.svelte"
  import DateInput from "$lib/components/forms/shared/date_input.svelte"
  import Error from "$lib/components/alerts/error.svelte"
  import Input from "$lib/components/forms/shared/input.svelte"
  import Select from "$lib/components/forms/shared/select.svelte"
  import { enhance } from "$app/forms"
  import { goto } from "$app/navigation"
  import { base } from "$app/paths"
  import type { PageData } from "./$types"
  import { page } from "$app/stores"

  export let data: PageData

  console.log(data)

  let startDate = new Date().toISOString().split("T")[0]
  let endDate: string
  let name = data.org_units[0].objects[0].name

  let parent = data.org_units[0].objects[0].parent
    ? data.org_units[0].objects[0].parent
    : { name: "", uuid: "" }
</script>

<svelte:head>
  <title>Rediger {data.org_units[0].objects[0].name} | OS2mo</title>
</svelte:head>

<div class="flex align-center px-6 pt-6 pb-4">
  <h3 class="flex-1">Rediger {data.org_units[0].objects[0].name}</h3>
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
            message: `${name} er blevet redigeret`,
            uuid: json.data.org_unit_update.uuid,
            type: "organisation",
          }
          setTimeout(
            () => goto(`${base}/organisation/${json.data.org_unit_update.uuid}`),
            200
          )
        } else {
          $error = { message: json.description }
        }
      } else {
        JSON.stringify(result)
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
        bind:value={startDate}
        title="Startdato"
        id="start-date"
        max={endDate
          ? endDate
          : new Date(new Date().getFullYear() + 50, 0).toISOString().split("T")[0]}
      />
    </div>

    <div class="form-control">
      <DateInput
        bind:value={endDate}
        title="Slutdato"
        id="end-date"
        min={startDate}
        max={new Date(new Date().getFullYear() + 50, 0).toISOString().split("T")[0]}
      />
    </div>
  </div>
  <div class="form-control mx-6 mb-4">
    <SelectOrgTree bind:selectedOrg={parent} required={false} />
  </div>

  <div class="mx-6">
    <div class="form-control mb-4">
      <Input title="Navn" id="name" bind:value={name} />
    </div>
    <div class="flex flex-row gap-6 mb-6">
      <div class="basis-1/2">
        <Select
          title="Enhedsniveau"
          id="org-level"
          iterable={data.facets[0].classes.sort((a, b) => (a.name > b.name ? 1 : -1))}
        />
      </div>
      <div class="basis-1/2">
        <Select
          title="Enhedstype"
          id="org-type"
          iterable={data.facets[1].classes.sort((a, b) => (a.name > b.name ? 1 : -1))}
        />
      </div>
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
      >Opret enhed</button
    >
  </div>
  <Error />
</form>
