<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import DateInput from "$lib/components/forms/shared/DateInput.svelte"
  import Select from "$lib/components/forms/shared/Select.svelte"
  import Button from "$lib/components/shared/Button.svelte"
  import Error from "$lib/components/alerts/Error.svelte"
  import { enhance } from "$app/forms"
  import { base } from "$app/paths"
  import { success, error } from "$lib/stores/alert"
  import { graphQLClient } from "$lib/http/client"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import { date } from "$lib/stores/date"
  import Input from "$lib/components/forms/shared/Input.svelte"
  import type { SubmitFunction } from "./$types"
  import { UpdateItSystemDocument, ItSystemDocument } from "./query.generated"
  import Skeleton from "$lib/components/forms/shared/Skeleton.svelte"
  import { form, field } from "svelte-forms"
  import { required } from "svelte-forms/validators"
  import { normalizeItSystem } from "$lib/utils/normalizeForm"

  gql`
    query ITSystem($uuid: [UUID!], $fromDate: DateTime, $toDate: DateTime) {
      itsystems(filter: { uuids: $uuid, from_date: $fromDate, to_date: $toDate }) {
        objects {
          validities {
            uuid
            user_key
            name
            validity {
              from
              to
            }
          }
        }
      }
    }

    mutation UpdateITSystem($input: ITSystemUpdateInput!, $date: DateTime!) {
      itsystem_update(input: $input) {
        current(at: $date) {
          name
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
            const mutation = await graphQLClient().request(UpdateItSystemDocument, {
              input: result.data,
              date: result.data.validity.from,
            })
            $success = {
              message: capital(
                $_("success_edit", {
                  values: {
                    name: mutation.itsystem_update.current?.name,
                  },
                })
              ),
              type: "itsystem",
            }
          } catch (err) {
            $error = { message: err }
          }
        }
      }
    }

  let toDate: string

  const fromDate = field("from", "", [required()])
  const name = field("name", "", [required()])
  const userKey = field("user_key", "", [required()])
  const svelteForm = form(fromDate, name, userKey)

  // Created in the script (not inline in the {#await} tag) so the result can
  // be captured below without a side effect in the template.
  const itSystemPromise = graphQLClient().request(ItSystemDocument, {
    uuid: $page.params.itsystem,
    fromDate: $page.url.searchParams.get("from"),
    toDate: $page.url.searchParams.get("to"),
  })

  let initialItSystem: any = null
  itSystemPromise.then(
    (data) => {
      initialItSystem = normalizeItSystem(data.itsystems.objects[0].validities[0])
    },
    // The template's {#await} has no {:catch}, so a failed load stays on the
    // pending branch. This handler only prevents an unhandled rejection from
    // this second promise chain.
    () => {}
  )

  let hasChanges = false
  $: if (initialItSystem) {
    // Check if any of the user-editable fields have changed compared to the original values.
    const editableChanged =
      $name.value !== initialItSystem.name ||
      $userKey.value !== initialItSystem.user_key

    const toDateExtended =
      toDate === ""
        ? initialItSystem.to !== null
        : toDate > (initialItSystem.to ?? null)
    hasChanges = editableChanged || toDateExtended
  }
</script>

<title
  >{capital(
    $_("edit_item", {
      values: { item: $_("itsystem", { values: { n: 1 } }) },
    })
  )} | OS2mo</title
>

<div class="flex align-center px-6 pt-6 pb-4">
  <h3 class="flex-1">
    {capital(
      $_("edit_item", {
        values: { item: $_("itsystem", { values: { n: 1 } }) },
      })
    )}
  </h3>
</div>

<div class="divider p-0 m-0 mb-4 w-full" />

{#await itSystemPromise}
  <div class="mx-6">
    <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-base-200 rounded-sm">
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
  {@const itsystem = data.itsystems.objects[0].validities[0]}

  <form method="post" class="mx-6" use:enhance={handler}>
    <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-base-200 rounded-sm">
      <div class="p-8">
        <div class="flex flex-row gap-6">
          <DateInput
            startValue={$date}
            bind:value={$fromDate.value}
            errors={$fromDate.errors}
            title={capital($_("date.start_date"))}
            id="from"
            max={toDate ? toDate : undefined}
            required={true}
          />
          <DateInput
            bind:value={toDate}
            startValue={itsystem.validity.to
              ? itsystem.validity.to.split("T")[0]
              : null}
            title={capital($_("date.end_date"))}
            id="to"
            min={$fromDate.value ? $fromDate.value : undefined}
          />
        </div>
        <div class="flex flex-row gap-6">
          <Input
            title={capital($_("name"))}
            id="name"
            bind:value={$name.value}
            startValue={itsystem.name}
            errors={$name.errors}
            extra_classes="basis-1/2"
            required={true}
          />

          <Input
            title={capital($_("user_key"))}
            id="user-key"
            bind:value={$userKey.value}
            startValue={itsystem.user_key}
            errors={$userKey.errors}
            extra_classes="basis-1/2"
            required={true}
          />
        </div>
      </div>
    </div>
    <div class="flex py-6 gap-4">
      <Button
        type="submit"
        title={capital(
          $_("edit_item", {
            values: { item: $_("itsystem", { values: { n: 1 } }) },
          })
        )}
        disabled={!hasChanges}
        info={hasChanges ? undefined : $_("edit_tooltip")}
      />
      <Button
        type="button"
        title={capital($_("cancel"))}
        outline={true}
        href="{base}/admin/itsystem"
      />
    </div>
    <Error />
  </form>
{/await}
