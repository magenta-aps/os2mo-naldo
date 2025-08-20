<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import { success, error } from "$lib/stores/alert"
  import { graphQLClient } from "$lib/http/client"
  import DateInput from "$lib/components/forms/shared/DateInput.svelte"
  import Error from "$lib/components/alerts/Error.svelte"
  import Input from "$lib/components/forms/shared/Input.svelte"
  import Select from "$lib/components/forms/shared/Select.svelte"
  import Button from "$lib/components/shared/Button.svelte"
  import { enhance } from "$app/forms"
  import { goto } from "$app/navigation"
  import { base } from "$app/paths"
  import { page } from "$app/stores"
  import { gql } from "graphql-request"
  import {
    ItUserItSystemsAndPrimaryDocument,
    UpdateItUserDocument,
  } from "./query.generated"
  import type { SubmitFunction } from "./$types"
  import Checkbox from "$lib/components/forms/shared/Checkbox.svelte"
  import { date } from "$lib/stores/date"
  import { filterClassUuidByUserKey } from "$lib/utils/classes"
  import { formatITSystemNames } from "$lib/utils/helpers"
  import { form, field } from "svelte-forms"
  import { required } from "svelte-forms/validators"
  import Skeleton from "$lib/components/forms/shared/Skeleton.svelte"
  import TextArea from "$lib/components/forms/shared/TextArea.svelte"
  import { getMinMaxValidities } from "$lib/utils/validities"
  import { MOConfig } from "$lib/stores/config"
  import { env } from "$lib/env"

  let toDate: string

  const fromDate = field("from", "", [required()])
  const itSystem = field("it_system", "", [required()])
  const accountName = field("accountName", "", [required()])
  const svelteForm = form(fromDate, itSystem, accountName)

  gql`
    query ITUserItSystemsAndPrimary(
      $uuid: [UUID!]
      $fromDate: DateTime
      $toDate: DateTime
      $employeeUuid: [UUID!]
      $primaryClass: String!
      $currentDate: DateTime!
    ) {
      itusers(filter: { uuids: $uuid, from_date: $fromDate, to_date: $toDate }) {
        objects {
          validities {
            uuid
            user_key
            primary_uuid
            itsystem {
              name
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
      employees(filter: { uuids: $employeeUuid, from_date: null, to_date: null }) {
        objects {
          validities {
            validity {
              from
              to
            }
          }
        }
      }
      itsystems {
        objects {
          current(at: $currentDate) {
            name
            uuid
          }
        }
      }
      classes(
        filter: { user_keys: [$primaryClass, "non-primary"], from_date: $currentDate }
      ) {
        objects {
          validities {
            uuid
            user_key
          }
        }
      }
    }

    mutation UpdateITUser($input: ITUserUpdateInput!, $date: DateTime!) {
      ituser_update(input: $input) {
        current(at: $date) {
          person {
            name
          }
        }
      }
    }
  `

  const handler: SubmitFunction =
    () =>
    async ({ result }) => {
      // Await the validation, before we continue
      await svelteForm.validate()
      if ($svelteForm.valid) {
        if (result.type === "success" && result.data) {
          try {
            const mutation = await graphQLClient().request(UpdateItUserDocument, {
              input: result.data,
              date: result.data.validity.from,
            })
            $success = {
              message: capital(
                $_("success_edit_item", {
                  values: {
                    item: $_("ituser", { values: { n: 0 } }),
                    name: mutation.ituser_update.current?.person?.[0].name,
                  },
                })
              ),
              uuid: $page.params.uuid,
              type: "employee",
            }
          } catch (err) {
            $error = { message: err }
          }
        }
      }
    }
</script>

<title
  >{capital(
    $_("edit_item", {
      values: { item: $_("ituser", { values: { n: 1 } }) },
    })
  )} | OS2mo</title
>

<div class="flex align-center px-6 pt-6 pb-4">
  <h3 class="flex-1">
    {capital(
      $_("edit_item", {
        values: { item: $_("ituser", { values: { n: 1 } }) },
      })
    )}
  </h3>
</div>

<div class="divider p-0 m-0 mb-4 w-full" />

{#await graphQLClient().request( ItUserItSystemsAndPrimaryDocument, { uuid: $page.params.ituser, fromDate: $page.url.searchParams.get("from"), toDate: $page.url.searchParams.get("to"), employeeUuid: $page.params.uuid, primaryClass: env.PUBLIC_PRIMARY_CLASS_USER_KEY, currentDate: $date } )}
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
  {@const itUser = data.itusers.objects[0].validities[0]}
  {@const notes = data.itusers.objects[0].registrations}
  <!-- Always return latest note
  This might not be the "correct" solution, but I can't
  figure out a way to always pair notes with the correct ITUser. 
  This might be the wanted behaviour, as the note is always updated? -->
  {@const note = notes[notes.length - 1].note}
  {@const classes = data.classes.objects}
  {@const itSystems = data.itsystems.objects}
  {@const validities = getMinMaxValidities(data.employees.objects[0].validities)}
  {@const disableForm =
    $MOConfig?.confdb_it_system_entry_edit_fields_disabled === "true" ? true : false}

  <form method="post" class="mx-6" use:enhance={handler}>
    <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-slate-100 rounded">
      <div class="p-8">
        <div class="flex flex-row gap-6">
          <!-- TODO: At some point ITUsers will be linked to engagements, -->
          <!-- when this happens, datepickers needs to use engagement -> org_unit validities -->
          <DateInput
            startValue={$date}
            bind:value={$fromDate.value}
            errors={$fromDate.errors}
            title={capital($_("date.start_date"))}
            id="from"
            min={validities.from}
            max={toDate ? toDate : validities.to}
            required={true}
            disabled={disableForm}
          />
          <DateInput
            bind:value={toDate}
            startValue={itUser.validity.to ? itUser.validity.to.split("T")[0] : null}
            title={capital($_("date.end_date"))}
            id="to"
            min={$fromDate.value ? $fromDate.value : validities.from}
            max={validities.to}
            disabled={disableForm}
          />
        </div>
        <div class="flex flex-row gap-6">
          <Select
            title={capital($_("it_system"))}
            id="it-system"
            startValue={itUser.itsystem}
            bind:name={$itSystem.value}
            errors={$itSystem.errors}
            extra_classes="basis-1/2"
            iterable={formatITSystemNames(itSystems)}
            required={true}
            disabled={disableForm}
          />
          <Input
            title={capital($_("account_name"))}
            id="account-name"
            extra_classes="basis-1/2"
            startValue={itUser.user_key}
            bind:value={$accountName.value}
            errors={$accountName.errors}
            required={true}
            disabled={disableForm}
          />
        </div>
        <div class="flex">
          <Checkbox
            title={capital($_("primary"))}
            id="primary"
            startValue={itUser.primary_uuid}
            value={filterClassUuidByUserKey(classes, env.PUBLIC_PRIMARY_CLASS_USER_KEY)}
            disabled={disableForm}
          />
        </div>
        <input
          hidden
          name="non-primary"
          id="non-primary"
          value={filterClassUuidByUserKey(classes, "non-primary")}
        />
        <TextArea
          title={capital($_("notes"))}
          id="notes"
          startValue={note}
          disabled={disableForm}
        />
      </div>
    </div>
    <div class="flex py-6 gap-4">
      <Button
        type="submit"
        title={capital(
          $_("edit_item", {
            values: { item: $_("ituser", { values: { n: 1 } }) },
          })
        )}
        disabled={disableForm}
      />
      <Button
        type="button"
        title={capital($_("cancel"))}
        outline={true}
        href="{base}/employee/{$page.params.uuid}"
      />
    </div>
    <Error />
  </form>
{/await}
