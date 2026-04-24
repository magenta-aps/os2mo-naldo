<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import ValidityTableCell from "$lib/components/shared/ValidityTableCell.svelte"
  import { base } from "$app/paths"
  import { graphQLClient } from "$lib/http/client"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import { EngagementsDocument, type EngagementsQuery } from "./query.generated"
  import { date } from "$lib/stores/date"
  import { getITUserITSystemName } from "$lib/utils/display"
  import { lookupDate, findClosestValidity } from "$lib/utils/validities"
  import { tenseFilter, tenseToValidity } from "$lib/utils/tenses"
  import { sortDirection, sortKey } from "$lib/stores/sorting"
  import { sortData } from "$lib/utils/sorting"
  import { onMount } from "svelte"
  import Icon from "@iconify/svelte"
  import editSquareOutlineRounded from "@iconify/icons-material-symbols/edit-square-outline-rounded"
  import cancelOutlineRounded from "@iconify/icons-material-symbols/cancel-outline-rounded"
  import historyRounded from "@iconify/icons-material-symbols/history-rounded"
  import { formatQueryDates } from "$lib/utils/validities"
  import { updateGlobalNavigation } from "$lib/stores/navigation"
  import { env } from "$lib/env"

  // Row validities are enriched post-fetch with a `current` field on each
  // related _response, resolved at the row's own `validity.from`.
  type Current<T> = T extends { validities: Array<infer V> } ? V : never
  type WithCurrent<T> = T extends null | undefined
    ? T
    : T & { current?: Current<T> | null }
  type Row = EngagementsQuery["engagements"]["objects"][0]["validities"][number]
  type EnrichedRow = Omit<
    Row,
    | "person_response"
    | "job_function_response"
    | "engagement_type_response"
    | "org_unit_response"
    | "primary_response"
    | "itusers"
    | "managers"
  > & {
    person_response: WithCurrent<Row["person_response"]>
    job_function_response: WithCurrent<Row["job_function_response"]>
    engagement_type_response: WithCurrent<Row["engagement_type_response"]>
    org_unit_response: WithCurrent<Row["org_unit_response"]>
    primary_response: WithCurrent<Row["primary_response"]>
    itusers: Row["itusers"]
    managers:
      | Array<{
          person_response: WithCurrent<
            NonNullable<Row["managers"]>[number]["person_response"]
          >
        }>
      | null
      | undefined
  }
  type Engagements = EnrichedRow[]
  let data: Engagements

  export let tense: Tense

  const uuid = $page.params.uuid
  const isOrg = $page.url.pathname?.startsWith("/organisation")
  const employee = isOrg ? null : uuid
  const org_unit = isOrg ? uuid : null

  // Use deprecated filter, because `employee`/`org_unit` filters will query for every object, if uuid is set to null
  // TODO: When https://redmine.magenta.dk/issues/62968 is fixed, add date-filters to classes
  gql`
    query Engagements(
      $employee: [UUID!]
      $org_unit: [UUID!]
      $fromDate: DateTime
      $toDate: DateTime
      $inherit: Boolean = true
      $isOrg: Boolean = false
    ) {
      engagements(
        filter: {
          employees: $employee
          org_units: $org_unit
          from_date: $fromDate
          to_date: $toDate
        }
      ) {
        objects {
          validities {
            uuid
            user_key
            org_unit_uuid
            person_response {
              uuid
              validities(start: null, end: null) {
                name
                validity {
                  from
                  to
                }
              }
            }
            job_function_response {
              uuid
              validities(start: null, end: null) {
                name
                user_key
                validity {
                  from
                  to
                }
              }
            }
            extension_1
            extension_4
            engagement_type_response {
              uuid
              validities(start: null, end: null) {
                name
                validity {
                  from
                  to
                }
              }
            }
            itusers(filter: { from_date: $fromDate, to_date: $toDate }) {
              validities {
                user_key
                uuid
                itsystem_response {
                  uuid
                  current(at: $fromDate) {
                    user_key
                    name
                  }
                }
                validity {
                  from
                  to
                }
              }
            }
            org_unit_response @skip(if: $isOrg) {
              uuid
              validities(start: null, end: null) {
                name
                validity {
                  from
                  to
                }
              }
            }
            managers(inherit: $inherit, exclude_self: true) @skip(if: $isOrg) {
              person_response {
                uuid
                validities(start: null, end: null) {
                  name
                  validity {
                    from
                    to
                  }
                }
              }
            }
            validity {
              from
              to
            }
            primary_response {
              uuid
              validities(start: null, end: null) {
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
    }
  `

  $: {
    if (data) {
      data = sortData(data, $sortKey, $sortDirection)
    }
  }

  // Resolves a related _response's `current` at the row's own anchor date so
  // past rows show the state the related object had at the time, not today's.
  const resolve = <T extends { validities: any[] } | null | undefined>(
    response: T,
    anchor: string
  ) =>
    response
      ? { ...response, current: findClosestValidity(response.validities, anchor) }
      : response

  onMount(async () => {
    const res = await graphQLClient().request(EngagementsDocument, {
      org_unit: org_unit,
      employee: employee,
      inherit: env.PUBLIC_INHERIT_MANAGER,
      isOrg: isOrg,
      ...tenseToValidity(tense, $date),
    })
    const engagements: Engagements = []

    // Filters and flattens the data
    for (const outer of res.engagements.objects) {
      // TODO: Remove when GraphQL is able to do this for us
      const filtered = outer.validities.filter((obj) => {
        if (!tenseFilter(obj, tense)) return false
        // Check if engagement validity is in current org_unit ($page.params.uuid)
        // TODO: Do this with GraphQL, when following issues are resolved (#65031) (#65303)
        if (isOrg && obj.org_unit_uuid !== $page.params.uuid) return false
        return true
      })
      for (const e of filtered as unknown as EnrichedRow[]) {
        const anchor = lookupDate(e.validity, $date)
        e.person_response = resolve(e.person_response, anchor)
        e.job_function_response = resolve(e.job_function_response, anchor)
        e.engagement_type_response = resolve(e.engagement_type_response, anchor)
        e.org_unit_response = resolve(e.org_unit_response, anchor)
        e.primary_response = resolve(e.primary_response, anchor)
        if (e.managers) {
          e.managers = e.managers.map((m: any) => ({
            ...m,
            person_response: resolve(m.person_response, anchor),
          })) as typeof e.managers
        }
      }
      engagements.push(...(filtered as unknown as EnrichedRow[]))
    }
    data = engagements
  })
</script>

{#if !data}
  <tr class="leading-5 border-t border-base-300 text-base-content">
    <td class="text-sm p-4">{capital($_("loading"))}</td>
  </tr>
{:else}
  {#each data as engagement, i}
    <tr
      class="{i % 2 === 0 ? '' : 'bg-base-200'} 
      leading-5 border-t border-base-300 text-base-content"
    >
      <td class="text-sm p-4">
        {#if isOrg}
          <a href="{base}/employee/{engagement.person_response.uuid}"
            >{engagement.person_response.current?.name ??
              engagement.person_response.uuid}</a
          >
        {:else}
          <a
            href="{base}/organisation/{engagement.org_unit_response?.uuid}"
            on:click={() => updateGlobalNavigation(engagement.org_unit_response?.uuid)}
            >{engagement.org_unit_response?.current?.name ??
              engagement.org_unit_response?.uuid}</a
          >
        {/if}
      </td>
      {#if env.PUBLIC_SHOW_EXTENSION_4}
        <td class="text-sm p-4">
          {engagement.extension_4 ? engagement.extension_4 : ""}
        </td>
      {/if}
      <td class="text-sm p-4">{engagement.user_key}</td>
      <td class="text-sm p-4"
        >{env.PUBLIC_SHOW_JOB_FUNCTION_USER_KEY
          ? `${engagement.job_function_response.current?.user_key} - ${engagement.job_function_response.current?.name}`
          : engagement.job_function_response.current?.name ??
            engagement.job_function_response.uuid}</td
      >
      {#if env.PUBLIC_SHOW_EXTENSION_1}
        <td class="text-sm p-4"
          >{engagement.extension_1 ? engagement.extension_1 : ""}</td
        >
      {/if}
      <td class="text-sm p-4"
        >{engagement.engagement_type_response?.current?.name ??
          engagement.engagement_type_response?.uuid}</td
      >
      {#if env.PUBLIC_SHOW_ITUSER_CONNECTIONS}
        <td class="text-sm p-4">
          {#each engagement.itusers as ituser}
            {#if ituser.validities && ituser.validities.length}
              {#each getITUserITSystemName( [findClosestValidity(ituser.validities, $date)] ) as nameObj}
                <div>{nameObj.name}</div>
              {/each}
            {/if}
          {/each}
        </td>
      {/if}
      {#if !isOrg}
        <td class="text-sm p-4">
          <!-- Make sure engagement.managers is present (needed since adding @skip to query)  -->
          {#if engagement.managers}
            <!-- If there's more than 1 manager, create a list -->
            <!-- Extra if/else logic implemented, so we can add <a>-tags to the managers -->
            {#if engagement.managers.length > 1}
              <ul>
                {#each engagement.managers as manager}
                  <li>
                    {#if manager.person_response}
                      <a href="{base}/employee/{manager.person_response.uuid}">
                        • {manager.person_response.current?.name ??
                          manager.person_response.uuid}
                      </a>
                    {:else}
                      • {capital($_("vacant"))}
                    {/if}
                  </li>
                {/each}
              </ul>
              <!-- If there's only 1 manager and it's not vacant -->
            {:else if engagement.managers[0] && engagement.managers[0].person_response}
              <a href="{base}/employee/{engagement.managers[0].person_response.uuid}">
                {engagement.managers[0].person_response.current?.name ??
                  engagement.managers[0].person_response.uuid}
              </a>
              <!-- 1 vacant manager -->
            {:else if engagement.managers[0]}
              {capital($_("vacant"))}
            {/if}
          {:else}
            {capital(
              $_("no_item", { values: { item: $_("manager", { values: { n: 1 } }) } })
            )}
          {/if}
        </td>
      {/if}
      {#if env.PUBLIC_SHOW_PRIMARY_ENGAGEMENT}
        <td class="text-sm p-4">{engagement.primary_response?.current?.name ?? ""}</td>
      {/if}
      <ValidityTableCell validity={engagement.validity} />
      <td class="flex p-4 gap-2 justify-end">
        <a href={`${base}/auditlog/${engagement.uuid}`}>
          <Icon icon={historyRounded} width="25" height="25" />
        </a>
        <a
          href="{base}/{$page.url.pathname?.split(
            '/'
          )[1]}/{uuid}/edit/engagement/{engagement.uuid}{formatQueryDates(
            engagement.validity
          )}"
        >
          <Icon icon={editSquareOutlineRounded} width="25" height="25" />
        </a>
        <a
          href="{base}/{$page.url.pathname?.split(
            '/'
          )[1]}/{uuid}/terminate/engagement/{engagement.uuid}"
        >
          <Icon icon={cancelOutlineRounded} width="25" height="25" />
        </a>
      </td>
    </tr>
  {:else}
    <tr class="leading-5 border-t border-base-300 text-base-content">
      <td class="text-sm p-4"
        >{capital(
          $_("no_item", { values: { item: $_("engagement", { values: { n: 2 } }) } })
        )}</td
      >
    </tr>
  {/each}
{/if}
