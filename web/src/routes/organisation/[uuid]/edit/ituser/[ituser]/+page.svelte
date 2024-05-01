<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import { success, error } from "$lib/stores/alert"
  import { graphQLClient } from "$lib/util/http"
  import DateInput from "$lib/components/forms/shared/DateInput.svelte"
  import Error from "$lib/components/alerts/Error.svelte"
  import Input from "$lib/components/forms/shared/Input.svelte"
  import Select from "$lib/components/forms/shared/Select.svelte"
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
  import Checkbox from "$lib/components/forms/shared/Checkbox.svelte"
  import { date } from "$lib/stores/date"
  import { getClassUuidByUserKey } from "$lib/util/get_classes"
  import { getITSystemNames, getMinMaxValidities } from "$lib/util/helpers"
  import { form, field } from "svelte-forms"
  import { required } from "svelte-forms/validators"
  import Skeleton from "$lib/components/forms/shared/Skeleton.svelte"
  import TextArea from "$lib/components/forms/shared/TextArea.svelte"
  import { MOConfig } from "$lib/stores/config"
  import { env } from "$env/dynamic/public"

  let toDate: string
  const fromDate = field("from", "", [required()])
  const itSystem = field("it_system", "", [required()])
  const accountName = field("account_name", "", [required()])
  const svelteForm = form(fromDate, itSystem, accountName)

  gql`
    query ITUserItSystemsOrgAndPrimary(
      $uuid: [UUID!]
      $fromDate: DateTime
      $primaryClass: String!
    ) {
      itusers(filter: { uuids: $uuid, from_date: $fromDate }) {
        objects {
          validities {
            user_key
            primary {
              uuid
            }
            itsystem {
              name
              user_key
              uuid
            }
            validity {
              from
              to
            }
            org_unit(filter: { from_date: null, to_date: null }) {
              validity {
                from
                to
              }
            }
          }
          registrations {
            note
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
      classes(filter: { user_keys: [$primaryClass, "non-primary"] }) {
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
      await svelteForm.validate()
      if ($svelteForm.valid) {
        if (result.type === "success" && result.data) {
          try {
            const mutation = await graphQLClient().request(UpdateItUserDocument, {
              input: result.data,
            })

            $success = {
              message: capital(
                $_("success_edit", {
                  values: {
                    item: $_("ituser", { values: { n: 0 } }),
                    name: mutation.ituser_update.objects[0]?.person?.[0].name,
                  },
                })
              ),
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

{#await graphQLClient().request( ItUserItSystemsOrgAndPrimaryDocument, { uuid: $page.params.ituser, fromDate: $date, primaryClass: env.PUBLIC_PRIMARY_CLASS_USER_KEY || "primary" } )}
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
  {@const validities = getMinMaxValidities(
    data.itusers.objects[0].validities[0].org_unit
  )}
  {@const notes = data.itusers.objects[0].registrations}
  <!-- Always return latest note
  This might not be the "correct" solution, but I can't
  figure out a way to always pair notes with the correct ITUser. 
  This might be the wanted behaviour, as the note is always updated? -->
  {@const note = notes[notes.length - 1].note}
  {@const classes = data.classes.objects}
  {@const itSystems = data.itsystems.objects}
  {@const disableForm =
    $MOConfig?.confdb_it_system_entry_edit_fields_disabled === "true" ? true : false}

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
            disabled={disableForm}
          />
          <DateInput
            bind:value={toDate}
            startValue={itUser.validity.to ? itUser.validity.to.split("T")[0] : null}
            title={capital($_("date.end_date"))}
            id="to"
            min={$fromDate.value}
            max={validities.to}
            disabled={disableForm}
          />
        </div>
        <div class="flex flex-row gap-6">
          <Select
            title={capital($_("it_system"))}
            id="it-system"
            startValue={itUser.itsystem ? itUser.itsystem : undefined}
            extra_classes="basis-1/2"
            bind:name={$itSystem.value}
            errors={$itSystem.errors}
            iterable={getITSystemNames(itSystems)}
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
            startValue={itUser.primary?.uuid}
            value={getClassUuidByUserKey(
              classes,
              env.PUBLIC_PRIMARY_CLASS_USER_KEY || "primary"
            )}
            disabled={disableForm}
          />
        </div>
        <input
          hidden
          name="non-primary"
          id="non-primary"
          value={getClassUuidByUserKey(classes, "non-primary")}
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
      <button
        type="submit"
        disabled={disableForm}
        class="btn btn-sm btn-primary rounded normal-case font-normal text-base text-base-100"
        >{capital(
          $_("edit_item", {
            values: { item: $_("ituser", { values: { n: 1 } }) },
          })
        )}</button
      >
      <button
        type="button"
        class="btn btn-sm btn-outline btn-primary rounded normal-case font-normal text-base"
        on:click={() => goto(`${base}/organisation/${$page.params.uuid}`)}
      >
        {capital($_("cancel"))}
      </button>
    </div>
    <Error />
  </form>
{/await}
