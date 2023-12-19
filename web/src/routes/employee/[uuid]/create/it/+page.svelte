<script lang="ts">
  import DateInput from "$lib/components/forms/shared/date_input.svelte"
  import Error from "$lib/components/alerts/error.svelte"
  import Input from "$lib/components/forms/shared/input.svelte"
  import TextArea from "$lib/components/forms/shared/textArea.svelte"
  import Select from "$lib/components/forms/shared/select.svelte"
  import { enhance } from "$app/forms"
  import type { SubmitFunction } from "./$types"
  import { goto } from "$app/navigation"
  import { base } from "$app/paths"
  import { success, error } from "$lib/stores/alert"
  import { graphQLClient } from "$lib/util/http"
  import {
    ItSystemsClassAndEmployeeDocument,
    CreateItUserDocument,
    GetItSystemRolesDocument,
  } from "./query.generated"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import { date } from "$lib/stores/date"
  import Checkbox from "$lib/components/forms/shared/checkbox.svelte"
  import { getClassUuidByUserKey } from "$lib/util/get_classes"
  import { getITSystemNames } from "$lib/util/helpers"
  import type { UnpackedClass } from "$lib/util/helpers"
  import { form, field } from "svelte-forms"
  import { required } from "svelte-forms/validators"
  import Skeleton from "$lib/components/forms/shared/skeleton.svelte"

  let itSystem: {
    uuid: string | null
    name: string
    user_key?: string | null
  }
  let toDate: string

  const fromDate = field("from", "", [required()])
  const itSystemField = field("itSystem", "", [required()])
  const accountName = field("accountName", "", [required()])
  const itSystemRole = field("itSystemRole", "", [required()])
  const svelteForm = form(fromDate, itSystemField, accountName, itSystemRole)

  let itSystemRoles: UnpackedClass | undefined

  gql`
    query ItSystemsClassAndEmployee($uuid: [UUID!], $fromDate: DateTime) {
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
      employees(filter: { uuids: $uuid, from_date: $fromDate }) {
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

    query GetITSystemRoles($itSystemUuid: [UUID!]) {
      classes(filter: { facet_user_keys: "role_type"}, it_system: { uuids: $itSystemUuid } }) {
        objects {
          objects {
            uuid
            user_key
            name
          }
        }
      }
    }

    mutation CreateItUser($input: ITUserCreateInput!) {
      ituser_create(input: $input) {
        objects {
          employee {
            name
          }
          itsystem {
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
            const mutation = await graphQLClient().request(CreateItUserDocument, {
              input: result.data,
            })
            $success = {
              message: `IT-kontoen ${
                mutation.ituser_create.objects[0]?.employee
                  ? `for ${mutation.ituser_create.objects[0].employee[0].name}`
                  : ""
              } er oprettet fra d. ${$fromDate.value}`,
              uuid: $page.params.uuid,
              type: "employee",
            }
          } catch (err) {
            $error = { message: err }
          }
        }
      }
    }

  async function updateITSystemRoles(itSystemUuid: string | undefined | null) {
    const res = await graphQLClient().request(GetItSystemRolesDocument, {
      itSystemUuid: itSystemUuid,
    })
    itSystemRoles = res.classes?.objects[0]?.objects
  }
</script>

<title>Opret IT-konto | OS2mo</title>

<div class="flex align-center px-6 pt-6 pb-4">
  <h3 class="flex-1">Opret IT-konto</h3>
</div>

<div class="divider p-0 m-0 mb-4 w-full" />

{#await graphQLClient().request( ItSystemsClassAndEmployeeDocument, { uuid: $page.params.uuid, fromDate: $date } )}
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
        <Skeleton />
      </div>
    </div>
  </div>
{:then data}
  {@const itSystems = data.itsystems.objects}
  {@const classes = data.classes.objects}
  {@const minDate = data.employees.objects[0].objects[0].validity?.from?.split("T")[0]}

  <form method="post" class="mx-6" use:enhance={handler}>
    <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-slate-100 rounded">
      <div class="p-8">
        <div class="flex flex-row gap-6">
          <!-- FIXME: Fix dates min/max -->
          <DateInput
            startValue={$date}
            bind:value={$fromDate.value}
            errors={$fromDate.errors}
            title="Startdato"
            id="from"
            min={minDate}
            required={true}
          />
          <DateInput
            bind:value={toDate}
            title="Slutdato"
            id="to"
            min={$fromDate.value ? $fromDate.value : minDate}
          />
        </div>
        <div class="flex flex-row gap-6">
          <Select
            title="IT-system"
            id="it-system"
            bind:value={itSystem}
            bind:name={$itSystemField.value}
            errors={$itSystemField.errors}
            iterable={getITSystemNames(itSystems)}
            on:change={() => updateITSystemRoles(itSystem.uuid)}
            extra_classes="basis-1/2"
            required={true}
          />
          <Input
            bind:value={$accountName.value}
            errors={$accountName.errors}
            extra_classes="basis-1/2"
            title="Kontonavn"
            id="account-name"
            required={true}
          />
        </div>
        {#if itSystemRoles && itSystemRoles.length}
          {#key itSystemRoles}
            <Select
              title="IT-roller"
              id="it-system-role-uuid"
              bind:name={$itSystemRole.value}
              errors={$itSystemRole.errors}
              iterable={itSystemRoles}
            />
          {/key}
        {:else}
          <Select title="IT-roller" id="it-system-role-uuid" disabled />
          <!-- <Select
            title="IT-roller"
            id="it-system-role-uuid"
            bind:name={$itSystemRole.value}
            errors={$itSystemRole.errors}
            disabled
          /> -->
        {/if}
        <div class="flex">
          <Checkbox
            title="Primær"
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
        <TextArea title="Noter" id="notes" />
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
        on:click={() => goto(`${base}/employee/${$page.params.uuid}`)}
      >
        Annullér
      </button>
    </div>
    <Error />
  </form>
{/await}
