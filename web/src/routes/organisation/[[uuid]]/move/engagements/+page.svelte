<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import DateInput from "$lib/components/forms/shared/DateInput.svelte"
  import Button from "$lib/components/shared/Button.svelte"
  import Error from "$lib/components/alerts/Error.svelte"
  import { enhance } from "$app/forms"
  import type { SubmitFunction } from "./$types"
  import { graphQLClient } from "$lib/util/http"
  import { gql } from "graphql-request"
  import { date } from "$lib/stores/date"
  import { success, error } from "$lib/stores/alert"
  import Search from "$lib/components/search/Search.svelte"
  import { form, field } from "svelte-forms"
  import { required } from "svelte-forms/validators"
  import {
    GetEngagementsDocument,
    MoveEngagementsDocument,
    type GetEngagementsQuery,
  } from "./query.generated"
  import Select from "$lib/components/forms/shared/Select.svelte"
  import { getValidities, getMinMaxValidities } from "$lib/util/helpers"

  type Engagements = GetEngagementsQuery["engagements"]["objects"][0]

  gql`
    query GetEngagements($org_unit: [UUID!], $currentDate: DateTime) {
      engagements(filter: { org_units: $org_unit, from_date: $currentDate }) {
        objects {
          current(at: $currentDate) {
            uuid
            person {
              uuid
              name
            }
          }
          validities(start: null, end: null) {
            validity {
              from
              to
            }
          }
        }
      }
    }
    mutation MoveEngagements($input: [EngagementUpdateInput!]!, $date: DateTime!) {
      engagements_update(input: $input) {
        current(at: $date) {
          uuid
          org_unit(filter: { from_date: null, to_date: null }) {
            name
            uuid
          }
        }
      }
    }
  `

  // Logic for updating datepicker intervals
  let validities: {
    from: string | undefined | null
    to: string | undefined | null
  } = { from: null, to: null }

  $: if (newOrgUnit) {
    ;(async () => {
      validities = await getValidities(newOrgUnit.uuid)
    })()
  } else {
    validities = { from: null, to: null }
  }

  const fromDate = field("from", "", [required()])
  const orgUnitField = field("org_unit", "", [required()])
  const svelteForm = form(fromDate, orgUnitField)

  let engagements: Engagements[]

  let orgUnit: {
    uuid: string
    name: string
  }
  let newOrgUnit: {
    uuid: string
    name: string
  }
  let selectedEngagements: string[] = []

  // FIXME: `handler: SubmitFunction` gives TS-error:
  // Argument of type 'SubmitFunction' is not assignable to parameter of type 'SubmitFunction<Record<string, unknown> | undefined, never>'.
  // Ignored for now, by removing typing and typing result to `any`.
  const handler =
    () =>
    async ({ result }: any) => {
      // Await the validation, before we continue
      await svelteForm.validate()

      if ($svelteForm.valid) {
        if (result.type === "success" && result.data && result.data.length) {
          try {
            const mutation = await graphQLClient().request(MoveEngagementsDocument, {
              input: result.data,
              date: result.data[0].validity.from,
            })

            $success = {
              message: capital($_("success_move_engagements")),
              uuid: mutation.engagements_update[0].current?.org_unit[0]?.uuid,
              type: "organisation",
            }
          } catch (err) {
            $error = { message: err }
          }
        }
      }
    }

  const updateEngagements = async (orgUnitUuid: string | undefined | null) => {
    const res = await graphQLClient().request(GetEngagementsDocument, {
      org_unit: orgUnitUuid,
      currentDate: $date,
    })

    engagements = res.engagements?.objects
  }

  const toggleSelectAll = (engagements: Engagements[]) => {
    selectedEngagements =
      selectedEngagements.length === engagements.length
        ? []
        : engagements.map((engagement) => engagement.current?.uuid)
  }
</script>

<title>{capital($_("navigation.move_engagements"))} | OS2mo</title>

<div class="flex align-center px-6 pt-6 pb-4">
  <h3 class="flex-1">{capital($_("navigation.move_engagements"))}</h3>
</div>

<div class="divider p-0 m-0 mb-4 w-full" />

<!-- FIXME: handler gives TS-error, because type is `SubmitFunction<Record<string, unknown> | undefined, never>`  -->
<!-- Instead of `SubmitFunction`. This is ignored by typing it to `any`. -->
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
          max={validities.to}
          required={true}
        />
      </div>
      <div class="flex flex-row gap-6">
        <Search
          type="org-unit"
          bind:value={orgUnit}
          bind:name={$orgUnitField.value}
          errors={$orgUnitField.errors}
          on:change={() => updateEngagements(orgUnit.uuid)}
          on:clear={() => {
            $orgUnitField.value = ""
            engagements = []
          }}
          required={true}
        />
      </div>
      <div class="text-secondary pb-3">
        {#if engagements && engagements.length}
          {#key engagements}
            <fieldset>
              <legend class="text-sm pb-1">
                {capital($_("engagement", { values: { n: 2 } }))}</legend
              >
              <ul
                id="engagement-list"
                class="max-h-48 overflow-y-auto bg-base-100 rounded p-1"
              >
                <div class="flex text-secondary">
                  <label
                    class="label text-sm text-secondary cursor-pointer break-words gap-4"
                  >
                    <input
                      type="checkbox"
                      on:click={() => toggleSelectAll(engagements)}
                      class="checkbox checkbox-primary rounded normal-case font-normal text-base text-base-100"
                      checked={selectedEngagements.length === engagements.length}
                      indeterminate={selectedEngagements.length > 0 &&
                        selectedEngagements.length < engagements.length}
                    />
                    <span class="label-text text-secondary"
                      >{selectedEngagements.length !== engagements.length
                        ? capital($_("select_all"))
                        : capital($_("deselect_all"))}</span
                    >
                  </label>
                </div>
                {#each engagements.sort((a, b) => {
                  const nameA = a.current?.person[0]?.name?.toLowerCase() || ""
                  const nameB = b.current?.person[0]?.name?.toLowerCase() || ""
                  return nameA > nameB ? 1 : -1
                }) as engagement}
                  <div class="flex text-secondary">
                    <label
                      class="label text-sm text-secondary cursor-pointer break-words gap-4"
                    >
                      <input
                        type="checkbox"
                        name="engagements"
                        bind:group={selectedEngagements}
                        value={engagement.current?.uuid}
                        class="checkbox checkbox-primary rounded normal-case font-normal text-base text-base-100"
                      />
                      <span class="label-text text-secondary"
                        >{engagement.current?.person[0].name}</span
                      >
                    </label>
                    {#if selectedEngagements.includes(engagement.current?.uuid)}
                      <input
                        id="end-dates"
                        name="end-dates"
                        hidden
                        value={getMinMaxValidities(engagement.validities).to
                          ? getMinMaxValidities(engagement.validities).to
                          : null}
                      />
                    {/if}
                  </div>
                {/each}
              </ul>
            </fieldset>
          {/key}
        {:else}
          <Select
            title={capital($_("engagements", { values: { n: 2 } }))}
            id="engagement-uuid"
            disabled
            required={true}
          />
        {/if}
      </div>
      <div class="flex flex-row gap-6">
        <Search
          type="org-unit"
          id="org-unit"
          title="{capital($_('move'))} {$_('to')}"
          bind:value={newOrgUnit}
          required
        />
      </div>
    </div>
  </div>
  <div class="flex py-6 gap-4">
    <Button type="submit" title={capital($_("navigation.move_engagements"))} />
    <Button
      type="button"
      title={capital($_("cancel"))}
      outline={true}
      on:click={() => history.back()}
    />
  </div>
  <Error />
</form>
