<script lang="ts">
  import { success, error } from "$lib/stores/alert"
  import { graphQLClient } from "$lib/util/http"
  import DateInput from "$lib/components/forms/shared/date_input.svelte"
  import Error from "$lib/components/alerts/error.svelte"
  import Input from "$lib/components/forms/shared/input.svelte"
  import Select from "$lib/components/forms/shared/select.svelte"
  import { enhance } from "$app/forms"
  import { goto } from "$app/navigation"
  import { base } from "$app/paths"
  import { page } from "$app/stores"
  import { gql } from "graphql-request"
  import {
    ItUserItSystemsOrgAndPrimaryDocument,
    UpdateItUserDocument,
  } from "./query.generated"
  import type { SubmitFunction } from "./$types"
  import Checkbox from "$lib/components/forms/shared/checkbox.svelte"
  import { date } from "$lib/stores/date"
  import { getClassUuidByUserKey } from "$lib/util/get_classes"
  import { getITSystemNames } from "$lib/util/helpers"
  import { form, field } from "svelte-forms"
  import { required } from "svelte-forms/validators"
  import Skeleton from "$lib/components/forms/shared/skeleton.svelte"
  import TextArea from "$lib/components/forms/shared/textArea.svelte"

  let toDate: string
  const fromDate = field("from", "", [required()])
  const itSystem = field("it_system", "", [required()])
  const accountName = field("account_name", "", [required()])
  const svelteForm = form(fromDate, itSystem, accountName)

  gql`
    query ITUserItSystemsOrgAndPrimary(
      $uuid: [UUID!]
      $fromDate: DateTime
      $orgUuid: [UUID!]
    ) {
      itusers(filter: { uuids: $uuid, from_date: $fromDate }) {
        objects {
          uuid
          objects {
            uuid
            user_key
            primary_uuid
            itsystem {
              name
              user_key
              uuid
            }
            validity {
              from
              to
            }
          }
          registrations {
            note
          }
        }
      }
      org_units(filter: { uuids: $orgUuid }) {
        objects {
          objects {
            validity {
              from
              to
            }
          }
        }
      }
      itsystems {
        objects {
          objects {
            name
            uuid
          }
        }
      }
      classes(filter: { user_keys: ["primary", "non-primary"] }) {
        objects {
          objects {
            uuid
            user_key
          }
        }
      }
    }

    mutation UpdateITUser($input: ITUserUpdateInput!) {
      ituser_update(input: $input) {
        uuid
        objects {
          user_key
        }
      }
    }
  `

  const handler: SubmitFunction =
    () =>
    async ({ result }) => {
      await svelteForm.validate()
      if ($svelteForm.valid) {
        if (result.type === "success" && result.data) {
          try {
            const mutation = await graphQLClient().request(UpdateItUserDocument, {
              input: result.data,
            })

            $success = {
              message: `IT-kontoen ${
                mutation.ituser_update.objects[0].user_key
                  ? `for ${mutation.ituser_update.objects[0].user_key}`
                  : ""
              } redigeres fra d. ${$fromDate.value}`,
              uuid: $page.params.uuid,
              type: "organisation",
            }
          } catch (err) {
            $error = { message: err }
          }
        }
      }
    }
</script>

<title>Rediger IT-konto | OS2mo</title>

<div class="flex align-center px-6 pt-6 pb-4">
  <h3 class="flex-1">Rediger IT-konto</h3>
</div>

<div class="divider p-0 m-0 mb-4 w-full" />

{#await graphQLClient().request( ItUserItSystemsOrgAndPrimaryDocument, { uuid: $page.params.ituser, fromDate: $date, orgUuid: $page.params.uuid } )}
  <div class="mx-6">
    <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-slate-100 rounded">
      <div class="p-8">
        <div class="flex flex-row gap-6">
          <Skeleton extra_classes="basis-1/2" />
          <Skeleton extra_classes="basis-1/2" />
        </div>
        <div class="flex flex-row gap-6">
          <Skeleton extra_classes="basis-1/2" />
          <Skeleton extra_classes="basis-1/2" />
        </div>
      </div>
    </div>
  </div>
{:then data}
  {@const itUser = data.itusers.objects[0].objects[0]}
  {@const notes = data.itusers.objects[0].registrations}
  <!-- Always return latest note
  This might not be the "correct" solution, but I can't
  figure out a way to always pair notes with the correct ITUser. 
  This might be the wanted behaviour, as the note is always updated? -->
  {@const note = notes[notes.length - 1].note}
  {@const classes = data.classes.objects}
  {@const itSystems = data.itsystems.objects}
  {@const minDate = data.org_units.objects[0].objects[0].validity.from.split("T")[0]}
  {@const maxDate = data.org_units.objects[0].objects[0].validity.to?.split("T")[0]}

  <form method="post" class="mx-6" use:enhance={handler}>
    <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-slate-100 rounded">
      <div class="p-8">
        <div class="flex flex-row gap-6">
          <DateInput
            startValue={$date}
            bind:value={$fromDate.value}
            errors={$fromDate.errors}
            title="Startdato"
            id="from"
            min={minDate}
            max={toDate ? toDate : maxDate}
            required={true}
          />
          <DateInput
            bind:value={toDate}
            startValue={itUser.validity.to ? itUser.validity.to.split("T")[0] : null}
            title="Slutdato"
            id="to"
            min={$fromDate.value ? $fromDate.value : minDate}
            max={maxDate}
          />
        </div>

        <!-- TODO: Should have the current value as default -->
        <div class="flex flex-row gap-6">
          <Select
            title="IT-systemer"
            id="it-system"
            startValue={itUser.itsystem ? itUser.itsystem : undefined}
            extra_classes="basis-1/2"
            bind:name={$itSystem.value}
            errors={$itSystem.errors}
            iterable={getITSystemNames(itSystems)}
            required={true}
          />
          <Input
            title="Kontonavn"
            id="account-name"
            extra_classes="basis-1/2"
            startValue={itUser.user_key}
            bind:value={$accountName.value}
            errors={$accountName.errors}
            required={true}
          />
        </div>
        <div class="flex">
          <Checkbox
            title="Primær"
            id="primary"
            startValue={itUser.primary_uuid}
            value={getClassUuidByUserKey(classes, "primary")}
          />
        </div>
        <input
          hidden
          name="non-primary"
          id="non-primary"
          value={getClassUuidByUserKey(classes, "non-primary")}
        />
        <TextArea title="Noter" id="notes" startValue={note} />
      </div>
    </div>
    <div class="flex py-6 gap-4">
      <button
        type="submit"
        class="btn btn-sm btn-primary rounded normal-case font-normal text-base text-base-100"
        >Rediger IT-konto</button
      >
      <button
        type="button"
        class="btn btn-sm btn-outline btn-primary rounded normal-case font-normal text-base"
        on:click={() => goto(`${base}/organisation/${$page.params.uuid}`)}
      >
        Annullér
      </button>
    </div>
    <Error />
  </form>
{/await}
