<script lang="ts">
  import { _ } from "svelte-i18n"
  import DateInput from "$lib/components/forms/shared/date_input.svelte"
  import Error from "$lib/components/alerts/error.svelte"
  import Input from "$lib/components/forms/shared/input.svelte"
  import Select from "$lib/components/forms/shared/select.svelte"
  import { enhance } from "$app/forms"
  import type { SubmitFunction } from "./$types"
  import { goto } from "$app/navigation"
  import { base } from "$app/paths"
  import { success, error } from "$lib/stores/alert"
  import { graphQLClient } from "$lib/util/http"
  import { ItSystemsClassAndOrgDocument, CreateItUserDocument } from "./query.generated"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import { date } from "$lib/stores/date"
  import Checkbox from "$lib/components/forms/shared/checkbox.svelte"
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
    query ItSystemsClassAndOrg($uuid: [UUID!], $fromDate: DateTime) {
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
      org_units(filter: { uuids: $uuid, from_date: $fromDate }) {
        objects {
          objects {
            validity {
              from
              to
            }
          }
        }
      }
    }

    mutation CreateItUser($input: ITUserCreateInput!) {
      ituser_create(input: $input) {
        objects {
          user_key
          uuid
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
            const mutation = await graphQLClient().request(CreateItUserDocument, {
              input: result.data,
            })
            $success = {
              message: `IT-kontoen ${
                mutation.ituser_create.objects[0]?.user_key
                  ? `til ${mutation.ituser_create.objects[0].user_key}`
                  : ""
              } er oprettet fra d. ${$fromDate.value}`,
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

<title>Opret IT-konto | OS2mo</title>

<div class="flex align-center px-6 pt-6 pb-4">
  <h3 class="flex-1">Opret IT-konto</h3>
</div>

<div class="divider p-0 m-0 mb-4 w-full" />

{#await graphQLClient().request( ItSystemsClassAndOrgDocument, { uuid: $page.params.uuid, fromDate: $date } )}
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
  {@const itSystems = data.itsystems.objects}
  {@const classes = data.classes.objects}
  {@const minDate = data.org_units.objects[0].objects[0].validity?.from.split("T")[0]}
  {@const maxDate = data.org_units.objects[0].objects[0].validity?.to?.split("T")[0]}

  <form method="post" class="mx-6" use:enhance={handler}>
    <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-slate-100 rounded">
      <div class="p-8">
        <div class="flex flex-row gap-6">
          <DateInput
            startValue={$date}
            bind:value={$fromDate.value}
            errors={$fromDate.errors}
            title={$_("date.start_date")}
            id="from"
            min={minDate}
            max={toDate ? toDate : maxDate}
            required={true}
          />
          <DateInput
            bind:value={toDate}
            title={$_("date.end_date")}
            id="to"
            min={$fromDate.value ? $fromDate.value : minDate}
            max={maxDate}
          />
        </div>
        <div class="flex flex-row gap-6">
          <Select
            title={$_("it_system")}
            id="it-system"
            bind:name={$itSystem.value}
            errors={$itSystem.errors}
            iterable={getITSystemNames(itSystems)}
            extra_classes="basis-1/2"
            required={true}
          />
          <Input
            bind:value={$accountName.value}
            errors={$accountName.errors}
            extra_classes="basis-1/2"
            title={$_("account_name")}
            id="account-name"
            required={true}
          />
        </div>
        <div class="flex">
          <Checkbox
            title={$_("primary")}
            id="primary"
            value={getClassUuidByUserKey(classes, "primary")}
          />
        </div>
        <input
          hidden
          name="non-primary"
          id="non-primary"
          value={getClassUuidByUserKey(classes, "non-primary")}
        />
        <TextArea title={$_("notes")} id="notes" />
      </div>
    </div>
    <div class="flex py-6 gap-4">
      <button
        type="submit"
        class="btn btn-sm btn-primary rounded normal-case font-normal text-base text-base-100"
        >Opret IT-konto</button
      >
      <button
        type="button"
        class="btn btn-sm btn-outline btn-primary rounded normal-case font-normal text-base"
        on:click={() => goto(`${base}/organisation/${$page.params.uuid}`)}
      >
        {$_("cancel")}
      </button>
    </div>
    <Error />
  </form>
{/await}
