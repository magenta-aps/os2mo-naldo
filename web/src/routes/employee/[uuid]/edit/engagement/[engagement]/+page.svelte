<script lang="ts">
  import DateInput from "$lib/components/forms/shared/date_input.svelte"
  import Error from "$lib/components/alerts/error.svelte"
  import Input from "$lib/components/forms/shared/input.svelte"
  import Select from "$lib/components/forms/shared/select.svelte"
  import { enhance } from "$app/forms"
  import { goto } from "$app/navigation"
  import { base } from "$app/paths"
  import { success, error } from "$lib/stores/alert"
  import { graphQLClient } from "$lib/util/http"
  import type { SubmitFunction } from "./$types"
  import {
    EngagementAndFacetDocument,
    UpdateEngagementDocument,
  } from "./query.generated"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import { date } from "$lib/stores/date"
  import { getClassesByFacetUserKey } from "$lib/util/get_classes"
  import Search from "$lib/components/search.svelte"

  let fromDate: string
  let toDate: string

  gql`
    query EngagementAndFacet($uuid: [UUID!], $fromDate: DateTime) {
      facets(
        filter: {
          user_keys: ["engagement_type", "engagement_job_function", "primary_type"]
        }
      ) {
        objects {
          objects {
            uuid
            user_key
            classes {
              name
              uuid
              user_key
            }
          }
        }
      }
      engagements(filter: { uuids: $uuid, from_date: $fromDate }) {
        objects {
          objects {
            uuid
            user_key
            employee {
              uuid
              name
            }
            engagement_type {
              name
            }
            job_function {
              name
            }
            primary {
              uuid
              name
            }
            validity {
              from
              to
            }
            org_unit {
              uuid
              name
              validity {
                from
                to
              }
            }
          }
        }
      }
    }

    mutation UpdateEngagement($input: EngagementUpdateInput!) {
      engagement_update(input: $input) {
        objects {
          uuid
          employee {
            name
          }
        }
      }
    }
  `

  const handler: SubmitFunction =
    () =>
    async ({ result }) => {
      if (result.type === "success" && result.data) {
        try {
          const mutation = await graphQLClient().request(UpdateEngagementDocument, {
            input: result.data,
          })
          $success = {
            message: `Engagement til ${mutation.engagement_update.objects[0].employee[0].name} er blevet redigeret`,
            uuid: $page.params.uuid,
            type: "employee",
          }
        } catch (err) {
          $error = { message: err }
        }
      }
    }
</script>

{#await graphQLClient().request( EngagementAndFacetDocument, { uuid: $page.params.engagement, fromDate: $date } )}
  <!-- TODO: Should have a skeleton for the loading stage -->
  Henter data...
{:then data}
  {@const engagement = data.engagements.objects[0].objects[0]}
  {@const facets = data.facets.objects}
  {@const minDate = engagement.org_unit[0].validity.from.split("T")[0]}
  {@const maxDate = engagement.org_unit[0].validity.to?.split("T")[0]}

  <title>Rediger engagement for {engagement?.employee[0].name} | OS2mo</title>

  <div class="flex align-center px-6 pt-6 pb-4">
    <h3 class="flex-1">Rediger engagement for {engagement.employee[0].name}</h3>
  </div>

  <div class="divider p-0 m-0 mb-4 w-full" />

  <form method="post" class="mx-6" use:enhance={handler}>
    <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-slate-100 rounded">
      <div class="p-8">
        <div class="flex flex-row gap-6">
          <DateInput
            bind:value={fromDate}
            startValue={$date}
            title="Startdato"
            id="from"
            min={minDate}
            max={maxDate ? maxDate : null}
            required={true}
          />
          <DateInput
            bind:value={toDate}
            startValue={engagement.validity.to
              ? engagement.validity.to.split("T")[0]
              : null}
            title="Slutdato"
            id="to"
            min={fromDate}
            max={maxDate ? maxDate : null}
          />
        </div>
        <Search
          type="org-unit"
          startValue={{
            uuid: engagement.org_unit[0].uuid,
            name: engagement.org_unit[0].name,
            attrs: [],
          }}
          required={true}
        />
        <div class="flex flex-row gap-6">
          <Input
            title="ID"
            id="user-key"
            startValue={engagement.user_key}
            extra_classes="basis-1/2"
          />
          <Select
            title="Stillingsbetegnelse"
            id="job-function"
            startValue={engagement.job_function.name}
            iterable={getClassesByFacetUserKey(facets, "engagement_job_function")}
            extra_classes="basis-1/2"
            required={true}
          />
        </div>
        <div class="flex flex-row gap-6">
          <Select
            title="Engagementstype"
            id="engagement-type"
            startValue={engagement.engagement_type.name}
            iterable={getClassesByFacetUserKey(facets, "engagement_type")}
            extra_classes="basis-1/2"
            required={true}
          />
          <Select
            title="Primær"
            id="primary"
            startValue={engagement.primary?.name}
            iterable={getClassesByFacetUserKey(facets, "primary_type")}
            extra_classes="basis-1/2"
          />
        </div>
      </div>
    </div>
    <div class="flex py-6 gap-4">
      <button
        type="submit"
        class="btn btn-sm btn-primary rounded normal-case font-normal text-base text-base-100"
        >Rediger engagement</button
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
