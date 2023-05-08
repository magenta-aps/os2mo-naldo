<script lang="ts">
  import { success, error } from "$lib/stores/alert"
  import { fetchGraph } from "$lib/util/http"
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

  let accountName: string
  let startDate = new Date().toISOString().split("T")[0]
  let endDate: string
</script>

<svelte:head>
  <title>Opret IT | OS2mo</title>
</svelte:head>

<div class="flex align-center px-6 pt-6 pb-4">
  <h3 class="flex-1">Opret IT</h3>
</div>

<div class="divider p-0 m-0 mb-4 w-full" />

<form method="post"
  use:enhance={() => {
    return async ({ result }) => {
      if (result.type === "success") {
        const res = await fetchGraph(result.data)
        const json = await res.json()

        if (res.status === 200) {
          $success = {
            message: `${accountName} er blevet oprettet`,
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
        bind:value={startDate}
        title="Startdato"
        id="from"
        max={endDate
          ? endDate
          : new Date(new Date().getFullYear() + 50, 0).toISOString().split("T")[0]}
      />
    </div>
    <div class="form-control">
      <DateInput
        bind:value={endDate}
        title="Slutdato"
        id="to"
        min={startDate}
        max={new Date(new Date().getFullYear() + 50, 0).toISOString().split("T")[0]}
      />
    </div>
  </div>

  <!-- TODO: Should have the current value as default -->
  <div class="mx-6">
    <div class="flex flex-row gap-6 mb-6">
      <div class="basis-1/2">
        <Select
          title="IT-systemer"
          id="itsystem"
          iterable={data.itsystems.sort((a, b) => (a.name > b.name ? 1 : -1))}
        />
      </div>
      <div class="basis-1/2">
        <Input
          bind:value={accountName}
          title="Kontonavn"
          id="user-key"
          required
        />
      </div>
    </div>
    <div class="form-control">
      <div class="flex">
        <label class="label cursor-pointer gap-4">
          <input
            type="checkbox"
            id="primary"
            name="primary"
            checked={false}
            class="checkbox checkbox-primary rounded normal-case font-normal text-base text-base-100"
          />
          <p>Primary</p>
        </label>
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
      >Opret IT bruger</button
    >
  </div>
  <Error />
</form>
