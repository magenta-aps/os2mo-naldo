<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import DateInput from "$lib/components/forms/shared/DateInput.svelte"
  import Error from "$lib/components/alerts/Error.svelte"
  import { enhance } from "$app/forms"
  import type { SubmitFunction } from "./$types"
  import { graphQLClient } from "$lib/util/http"
  import { gql } from "graphql-request"
  import { goto } from "$app/navigation"
  import { base } from "$app/paths"
  import { date } from "$lib/stores/date"
  import { success, error } from "$lib/stores/alert"
  import Search from "$lib/components/Search.svelte"
  import { page } from "$app/stores"
  import { form, field } from "svelte-forms"
  import { required } from "svelte-forms/validators"
  import {
    EngagementsDocument,
    MoveEngagementsDocument,
    type EngagementsQuery,
  } from "./query.generated"
  import Skeleton from "$lib/components/forms/shared/Skeleton.svelte"

  type Engagements = EngagementsQuery["engagements"]["objects"][0]

  gql`
    query Engagements($org_unit: [UUID!], $currentDate: DateTime) {
      org_units(filter: { uuids: $org_unit }) {
        objects {
          current {
            uuid
            name
          }
        }
      }
      engagements(filter: { org_units: $org_unit }) {
        objects {
          current(at: $currentDate) {
            uuid
            person {
              uuid
              name
            }
            job_function {
              name
            }
            engagement_type {
              name
            }
            validity {
              from
              to
            }
            primary {
              name
            }
          }
        }
      }
    }
    mutation MoveEngagements($input: [EngagementUpdateInput!]!, $date: DateTime!) {
      engagements_update(input: $input) {
        current(at: $date) {
          uuid
          org_unit {
            name
            uuid
          }
        }
      }
    }
  `

  let toDate: string

  const fromDate = field("from", "", [required()])
  const orgUnitField = field("org_unit", "", [required()])
  const svelteForm = form(fromDate, orgUnitField)

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
              uuid: mutation.engagements_update[0].current?.org_unit[0].uuid,
              type: "organisation",
            }
          } catch (err) {
            $error = { message: err }
          }
        }
      }
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

{#await graphQLClient().request( EngagementsDocument, { org_unit: $page.params.uuid, currentDate: $date } )}
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
  {@const engagements = data.engagements.objects}
  {@const orgUnit = data.org_units.objects[0].current}
  <!-- FIXME: handler gives TS-error, because type is `SubmitFunction<Record<string, unknown> | undefined, never>`  -->
  <!-- Instead of `SubmitFunction`. This is ignored by typing it to `any`. -->
  <form method="post" class="mx-6" use:enhance={handler}>
    <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-slate-100 rounded">
      <div class="p-8">
        <div class="flex flex-row gap-6">
          <!-- TODO: dynamically change dates depending on which org has been chosen -->
          <DateInput
            startValue={$date}
            bind:value={$fromDate.value}
            errors={$fromDate.errors}
            title={capital($_("date.start_date"))}
            id="from"
            required={true}
          />
          <DateInput bind:value={toDate} title={capital($_("date.end_date"))} id="to" />
        </div>
        <div class="flex flex-row gap-6">
          <Search
            type="org-unit"
            bind:name={$orgUnitField.value}
            errors={$orgUnitField.errors}
            startValue={{
              uuid: orgUnit ? orgUnit.uuid : undefined,
              name: orgUnit ? orgUnit.name : "",
            }}
            required
            disabled
            extra_classes="basis-1/2"
          />
        </div>
        <div class="text-secondary pb-3">
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
              {#each engagements as engagement}
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
                </div>
              {/each}
            </ul>
          </fieldset>
        </div>
        <div class="flex flex-row gap-6">
          <Search
            type="org-unit"
            id="org-unit"
            title="{capital($_('move'))} {$_('to')}"
            required
            extra_classes="basis-1/2"
          />
        </div>
      </div>
    </div>
    <div class="flex py-6 gap-4">
      <button
        type="submit"
        class="btn btn-sm btn-primary rounded normal-case font-normal text-base text-base-100"
        >{capital($_("navigation.move_engagements"))}</button
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
