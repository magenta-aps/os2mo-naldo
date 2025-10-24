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
  import { base } from "$app/paths"
  import { page } from "$app/stores"
  import { gql } from "graphql-request"
  import {
    ItUserItSystemsOrgAndPrimaryDocument,
    UpdateItUserDocument,
  } from "./query.generated"
  import type { SubmitFunction } from "./$types"
  import { date } from "$lib/stores/date"
  import type { FacetValidities } from "$lib/utils/classes"
  import { filterClassesByFacetUserKey } from "$lib/utils/classes"
  import { formatITSystemNames } from "$lib/utils/helpers"
  import { getPrimaryClasses } from "$lib/http/getClasses"
  import { getMinMaxValidities } from "$lib/utils/validities"
  import { form, field } from "svelte-forms"
  import { required } from "svelte-forms/validators"
  import Skeleton from "$lib/components/forms/shared/Skeleton.svelte"
  import TextArea from "$lib/components/forms/shared/TextArea.svelte"
  import { MOConfig } from "$lib/stores/config"
  import { env } from "$lib/env"
  import { normalizeITUser } from "$lib/utils/normalizeForm"

  let startDate: string = $date
  let toDate: string

  const fromDate = field("from", "", [required()])
  const itSystem = field("it_system", "", [required()])
  const accountName = field("account_name", "", [required()])
  const primary = field("primary", "", [])
  const noteField = field("note", "", [])
  const svelteForm = form(fromDate, itSystem, accountName, primary, noteField)

  gql`
    query ITUserItSystemsOrgAndPrimary(
      $uuid: [UUID!]
      $fromDate: DateTime
      $toDate: DateTime
      $currentDate: DateTime!
    ) {
      itusers(filter: { uuids: $uuid, from_date: $fromDate, to_date: $toDate }) {
        objects {
          validities {
            user_key
            primary {
              name
              user_key
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
          current(at: $currentDate) {
            name
            uuid
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
              type: "organisation",
            }
          } catch (err) {
            $error = { message: err }
          }
        }
      }
    }

  let facets: FacetValidities[]
  let abortController: AbortController
  $: {
    // Abort the previous request if a new one is about to start
    if (abortController) abortController.abort()
    abortController = new AbortController()

    // Make sure `currentDate` isn't sent if startDate is null.
    const params = {
      fromDate: startDate,
      primaryClass: env.PUBLIC_PRIMARY_CLASS_USER_KEY,
    }

    ;(async () => {
      try {
        facets = await getPrimaryClasses(params, abortController.signal)
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("Request failed:", err)
        }
      }
    })()
  }

  let initialITUser: any = null
  let hasChanges = false
  $: if (initialITUser) {
    // Check if any of the user-editable fields have changed compared to the original values.
    const editableChanged =
      $itSystem.value !== initialITUser.itsystem ||
      $accountName.value !== initialITUser.user_key ||
      $primary.value !== initialITUser.primary ||
      $noteField.value !== initialITUser.note

    const toDateExtended =
      toDate === "" ? initialITUser.to !== null : toDate > (initialITUser.to ?? null)
    hasChanges = editableChanged || toDateExtended
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

{#await graphQLClient().request( ItUserItSystemsOrgAndPrimaryDocument, { uuid: $page.params.ituser, fromDate: $page.url.searchParams.get("from"), toDate: $page.url.searchParams.get("to"), currentDate: $date } )}
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
  {@const itSystems = data.itsystems.objects}
  {@const disableForm =
    $MOConfig?.confdb_it_system_entry_edit_fields_disabled === "true" ? true : false}
  {#if !initialITUser}
    {@html (() => {
      initialITUser = normalizeITUser(itUser, note)
      return ""
    })()}
  {/if}

  <form method="post" class="mx-6" use:enhance={handler}>
    <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-slate-100 rounded">
      <div class="p-8">
        <div class="flex flex-row gap-6">
          <DateInput
            bind:value={startDate}
            bind:validationValue={$fromDate.value}
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
        {#if facets}
          <Select
            title={capital($_("primary"))}
            id="primary"
            bind:name={$primary.value}
            iterable={filterClassesByFacetUserKey(facets, "primary_type")}
            on:clear={() => ($primary.value = "")}
            isClearable={true}
            disabled={disableForm}
          />
        {/if}
        <TextArea
          title={capital($_("notes"))}
          id="notes"
          startValue={note}
          bind:value={$noteField.value}
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
        disabled={disableForm || !hasChanges}
        info={hasChanges ? undefined : $_("edit_tooltip")}
      />
      <Button
        type="button"
        title={capital($_("cancel"))}
        outline={true}
        href="{base}/organisation/{$page.params.uuid}"
      />
    </div>
    <Error />
  </form>
{/await}
