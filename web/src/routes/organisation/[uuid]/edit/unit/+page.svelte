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

  let startDate = new Date().toISOString().split("T")[0]
  let endDate: string
  let name = data.org_units[0].objects[0].name
  let orgLevel = data.org_units[0].objects[0].org_unit_level?.name
  let orgType = data.org_units[0].objects[0].unit_type?.name
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

<form method="post" class="mx-6"
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
  <div class="w-1/2 min-w-fit bg-slate-100 rounded">
    <div class="p-8">
      <div class="flex flex-row gap-6">
        <DateInput
          bind:value={startDate}
          title="Startdato"
          id="start-date"
          max={endDate
            ? endDate
            : new Date(new Date().getFullYear() + 50, 0).toISOString().split("T")[0]}
        />
        <DateInput
          bind:value={endDate}
          title="Slutdato"
          id="end-date"
          min={startDate}
          max={new Date(new Date().getFullYear() + 50, 0).toISOString().split("T")[0]}
        />
      </div>
      <SelectOrgTree bind:selectedOrg={parent} />

      <!-- TODO: Should have a skeleton for the loading stage -->
      <Input title="Navn" id="name" bind:value={name} required={true} />

      <div class="flex flex-row gap-6">
        <Select
          title="Enhedsniveau"
          id="org-level"
          startValue={orgLevel}
          extra_classes="basis-1/2"
          bind:value={orgLevel}
          iterable={data.facets[0].classes.sort((a, b) => (a.name > b.name ? 1 : -1))}
          required={true}
        />
        <Select
          title="Enhedstype"
          id="org-type"
          startValue={orgType}
          extra_classes="basis-1/2"
          bind:value={orgType}
          iterable={data.facets[1].classes.sort((a, b) => (a.name > b.name ? 1 : -1))}
          required={true}
        />
      </div>
    </div>
  </div>
  <div class="flex py-6 gap-4">
    <!-- TODO: Make button close modal -->
    <button
      type="submit"
      class="btn btn-sm btn-primary rounded normal-case font-normal text-base text-base-100"
      >Rediger enhed</button
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
