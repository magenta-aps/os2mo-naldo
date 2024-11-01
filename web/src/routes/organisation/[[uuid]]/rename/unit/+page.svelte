<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import DateInput from "$lib/components/forms/shared/DateInput.svelte"
  import Error from "$lib/components/alerts/Error.svelte"
  import { enhance } from "$app/forms"
  import type { SubmitFunction } from "./$types"
  import { success, error } from "$lib/stores/alert"
  import { graphQLClient } from "$lib/util/http"
  import { OrgUnitDocument, UpdateOrgUnitDocument } from "./query.generated"
  import { gql } from "graphql-request"
  import { date } from "$lib/stores/date"
  import Search from "$lib/components/Search.svelte"
  import Input from "$lib/components/forms/shared/Input.svelte"
  import { page } from "$app/stores"
  import { form, field } from "svelte-forms"
  import { required } from "svelte-forms/validators"
  import Breadcrumbs from "$lib/components/org/Breadcrumbs.svelte"
  import { getValidities } from "$lib/util/helpers"

  let toDate: string
  let selectedOrgUnit: {
    uuid: string
    name: string
  }

  const fromDate = field("from", "", [required()])
  const name = field("name", "", [required()])
  const newName = field("new_name", "", [required()])
  const svelteForm = form(fromDate, name, newName)

  gql`
    query OrgUnit($uuid: [UUID!], $currentDate: DateTime) {
      org_units(filter: { uuids: $uuid }) {
        objects {
          current(at: $currentDate) {
            name
            uuid
          }
        }
      }
    }
    mutation UpdateOrgUnit($input: OrganisationUnitUpdateInput!, $date: DateTime!) {
      org_unit_update(input: $input) {
        current(at: $date) {
          uuid
          name
        }
      }
    }
  `

  // Logic for updating datepicker intervals
  let validities: {
    from: string | undefined | null
    to: string | undefined | null
  } = { from: null, to: null }

  $: if (selectedOrgUnit) {
    ;(async () => {
      validities = await getValidities(selectedOrgUnit.uuid)
    })()
  } else {
    validities = { from: null, to: null }
  }

  const handler: SubmitFunction =
    () =>
    async ({ result }) => {
      // Await the validation, before we continue
      await svelteForm.validate()
      if ($svelteForm.valid) {
        if (result.type === "success" && result.data) {
          try {
            const mutation = await graphQLClient().request(UpdateOrgUnitDocument, {
              input: result.data,
              date: result.data.validity.from,
            })

            $success = {
              // TODO: Make more specified translation e.g. `$name.value is renamed to $newName.value`
              message: capital(
                $_("success_rename", {
                  values: {
                    name: mutation.org_unit_update.current?.name,
                  },
                })
              ),
              uuid: mutation.org_unit_update.current?.uuid,
              type: "organisation",
            }
          } catch (err) {
            $error = { message: err }
          }
        }
      }
    }
</script>

<!-- TODO: getMinMaxValidities -->

<title>{capital($_("rename"))} {$_("org_unit", { values: { n: 1 } })} | OS2mo</title>

<div class="flex align-center px-6 pt-6 pb-4">
  <h3 class="flex-1">{capital($_("rename"))} {$_("org_unit", { values: { n: 1 } })}</h3>
</div>

<div class="divider p-0 m-0 mb-4 w-full" />

<form method="post" class="mx-6" use:enhance={handler}>
  <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-slate-100 rounded">
    <div class="p-8">
      <div class="flex flex-row gap-6">
        <DateInput
          startValue={$date}
          bind:value={$fromDate.value}
          errors={$fromDate.errors}
          title={capital($_("date.start_date"))}
          id="from"
          min={validities.from}
          max={toDate ? toDate : validities.to}
          required={true}
        />
        <DateInput
          bind:value={toDate}
          title={capital($_("date.end_date"))}
          id="to"
          min={$fromDate.value ? $fromDate.value : validities.from}
          max={validities.to}
        />
        <!-- FIXME: min/max -->
      </div>
      {#if $page.params.uuid}
        {#await graphQLClient().request( OrgUnitDocument, { uuid: $page.params.uuid, currentDate: $date } )}
          <Input
            title="{capital($_('specify'))} {$_('unit', { values: { n: 1 } })}"
            id="organisation-uuid"
            disabled
            placeholder="{$_('loading')} {$_('organisation')}..."
          />
        {:then data}
          {@const orgUnit = data.org_units.objects[0].current}
          <Search
            title="{capital($_('specify'))} {$_('unit', { values: { n: 1 } })}"
            type="org-unit"
            startValue={{
              uuid: orgUnit?.uuid ? orgUnit.uuid : undefined,
              name: orgUnit?.name ? orgUnit.name : "",
            }}
            bind:name={$name.value}
            errors={$name.errors}
            on:clear={() => {
              $name.value = ""
              $newName.value = ""
            }}
            on:change={() => ($newName.value = $name.value)}
            bind:value={selectedOrgUnit}
            required={true}
          />
          <Breadcrumbs orgUnit={selectedOrgUnit} />
          <Input
            title="{capital($_('new2'))} {$_('name')}"
            id="name"
            startValue={orgUnit?.name}
            bind:value={$newName.value}
            errors={$newName.errors}
            required={true}
          />
        {/await}
      {:else}
        <Search
          type="org-unit"
          title="{capital($_('specify'))} {$_('unit', { values: { n: 1 } })}"
          bind:name={$name.value}
          errors={$name.errors}
          on:clear={() => {
            $name.value = ""
            $newName.value = ""
          }}
          on:change={() => ($newName.value = $name.value)}
          bind:value={selectedOrgUnit}
          required={true}
        />
        <Breadcrumbs orgUnit={selectedOrgUnit} />
        <Input
          title="{capital($_('new2'))} {$_('name')}"
          id="name"
          bind:value={$newName.value}
          errors={$newName.errors}
          required={true}
        />
      {/if}
    </div>
  </div>
  <div class="flex py-6 gap-4">
    <button
      type="submit"
      class="btn btn-sm btn-primary rounded normal-case font-normal text-base text-base-100"
      >{capital($_("rename"))} {$_("unit", { values: { n: 1 } })}</button
    >
    <button
      type="button"
      class="btn btn-sm btn-outline btn-primary rounded normal-case font-normal text-base"
      on:click={() => history.back()}
    >
      {capital($_("cancel"))}
    </button>
  </div>
  <Error />
</form>
