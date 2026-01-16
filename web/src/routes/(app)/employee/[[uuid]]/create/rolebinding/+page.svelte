<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import DateInput from "$lib/components/forms/shared/DateInput.svelte"
  import Error from "$lib/components/alerts/Error.svelte"
  import Select from "$lib/components/forms/shared/Select.svelte"
  import Button from "$lib/components/shared/Button.svelte"
  import CircleButton from "$lib/components/shared/CircleButton.svelte"
  import { enhance } from "$app/forms"
  import { base } from "$app/paths"
  import { success, error } from "$lib/stores/alert"
  import { graphQLClient } from "$lib/http/client"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import { date } from "$lib/stores/date"
  import type { FacetValidities } from "$lib/utils/classes"
  import type { SubmitFunction } from "./$types"
  import { CreateRoleBindingDocument, ItUsersDocument } from "./query.generated"
  import { form, field } from "svelte-forms"
  import { required } from "svelte-forms/validators"
  import { filterClassesByFacetUserKey } from "$lib/utils/classes"
  import { formatITUserITSystemName, type UnpackedClass } from "$lib/utils/helpers"
  import { getItuserValidities } from "$lib/http/getValidities"
  import { getRoleClasses } from "$lib/http/getClasses"
  import type { RoleBindingCreateInput } from "$lib/graphql/types"
  import removeRounded from "@iconify/icons-material-symbols/remove-rounded"
  import addRounded from "@iconify/icons-material-symbols/add-rounded"

  gql`
    query ItUsers($uuid: [UUID!]!, $fromDate: DateTime!) {
      employees(filter: { uuids: $uuid }) {
        objects {
          validities {
            itusers(filter: { from_date: $fromDate }) {
              user_key
              uuid
              itsystem(filter: { from_date: $fromDate }) {
                uuid
                name
              }
            }
          }
        }
      }
    }

    mutation CreateRoleBinding($input: [RoleBindingCreateInput!]!, $date: DateTime!) {
      rolebindings_create(input: $input) {
        current(at: $date) {
          ituser(filter: { from_date: $date }) {
            person {
              name
            }
          }
        }
      }
    }
  `

  let startDate: string = $date
  let toDate: string

  let itUser: {
    uuid: string
    name: string
    itsystem: {
      uuid: string
    }
  }
  let itUserOptions: any[] = []

  const fromDate = field("from", "", [required()])
  const itUserField = field("it_user", "", [required()])
  const roleField = field("role", "", [required()])
  const svelteForm = form(fromDate, itUserField, roleField)

  const handler: SubmitFunction =
    () =>
    async ({ result }) => {
      // Await the validation, before we continue
      await svelteForm.validate()
      if ($svelteForm.valid) {
        if (result.type === "success" && result.data) {
          try {
            const mutation = await graphQLClient().request(CreateRoleBindingDocument, {
              input: result.data.rolebindingInput,
              date: result.data.rolebindingInput[0].validity.from,
            })
            $success = {
              message: capital(
                $_("success_create_item", {
                  values: {
                    item: $_("rolebinding", { values: { n: 0 } }),
                    name: mutation.rolebindings_create[0].current?.ituser?.[0]
                      .person?.[0].name,
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

  let rolebindings: RoleBindingCreateInput[] = [
    {
      ituser: "",
      role: { uuid: "", user_key: "", name: "" },
      validity: { from: "", to: "" },
    },
  ]

  const addRolebinding = () => {
    rolebindings = [
      ...rolebindings,
      {
        ituser: "",
        role: { uuid: "", user_key: "", name: "" },
        validity: { from: "", to: "" },
      },
    ]
  }
  const removeRolebinding = (index: number) => {
    rolebindings = rolebindings.filter((_, i) => i !== index)
  }

  // Logic for updating datepicker intervals
  let validities: {
    from: string | undefined | null
    to: string | undefined | null
  } = { from: null, to: null }
  $: {
    ;(async () => {
      if ($page.params.uuid && startDate) {
        const itUserResponse = await graphQLClient().request(ItUsersDocument, {
          uuid: $page.params.uuid,
          fromDate: startDate,
        })
        itUserOptions =
          formatITUserITSystemName(
            itUserResponse.employees.objects[0]?.validities?.flatMap(
              (v) => v.itusers ?? []
            )
          ) ?? []
      }
    })()
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
      itSystem: itUser?.itsystem.uuid,
    }

    ;(async () => {
      validities = itUser?.uuid
        ? await getItuserValidities(itUser?.uuid)
        : { from: null, to: null }
      if (itUser?.uuid) {
        try {
          facets = await getRoleClasses(params, abortController.signal)
        } catch (err: any) {
          if (err.name !== "AbortError") {
            console.error("Request failed:", err)
          }
        }
      }
    })()
  }
</script>

<title
  >{capital(
    $_("create_item", {
      values: { item: $_("rolebinding", { values: { n: 1 } }) },
    })
  )} | OS2mo</title
>

<div class="flex align-center px-6 pt-6 pb-4">
  <h3 class="flex-1">
    {capital(
      $_("create_item", {
        values: { item: $_("rolebinding", { values: { n: 1 } }) },
      })
    )}
  </h3>
</div>

<div class="divider p-0 m-0 mb-4 w-full" />
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
        />
        <DateInput
          bind:value={toDate}
          title={capital($_("date.end_date"))}
          id="to"
          min={$fromDate.value ? $fromDate.value : validities.from}
          max={validities.to}
        />
      </div>
      <Select
        title={capital($_("ituser", { values: { n: 1 } }))}
        id="it-user-uuid"
        bind:value={itUser}
        bind:name={$itUserField.value}
        errors={$itUserField.errors}
        iterable={itUserOptions}
        required={true}
        extra_classes="basis-1/2"
      />
      {#each rolebindings as rolebinding, index}
        {#if facets && filterClassesByFacetUserKey(facets, "role")?.length}
          {#key facets}
            <Select
              title={capital($_("role", { values: { n: 1 } }))}
              id="role-uuid"
              bind:value={rolebinding.role}
              bind:name={$roleField.value}
              errors={$roleField.errors}
              iterable={filterClassesByFacetUserKey(facets, "role")}
              extra_classes="basis-1/2"
              required
            />
          {/key}
        {:else}
          <Select
            title={capital($_("role", { values: { n: 1 } }))}
            id="role-uuid"
            bind:name={$roleField.value}
            errors={$roleField.errors}
            extra_classes="basis-1/2"
            required
            disabled
          />
        {/if}
        {#if rolebindings.length > 1}
          <CircleButton
            on:click={() => {
              removeRolebinding(index)
            }}
            icon={removeRounded}
          />
        {/if}
        {#if index === rolebindings.length - 1}
          <CircleButton
            on:click={() => addRolebinding()}
            icon={addRounded}
            extraClasses="mb-4"
          />
        {:else}
          <div class="divider p-0 m-0 my-2 w-full" />
        {/if}
      {/each}
    </div>
  </div>
  <div class="flex py-6 gap-4">
    <Button
      type="submit"
      title={capital(
        $_("create_item", {
          values: { item: $_("rolebinding", { values: { n: 1 } }) },
        })
      )}
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
