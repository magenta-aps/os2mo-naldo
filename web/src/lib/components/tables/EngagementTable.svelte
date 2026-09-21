<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital, upperCase } from "$lib/utils/helpers"
  import TemporalRows from "$lib/components/tables/TemporalRows.svelte"
  import NameWithHistory from "$lib/components/shared/NameWithHistory.svelte"
  import { base } from "$app/paths"
  import { graphQLClient } from "$lib/http/client"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import { EngagementsDocument, type EngagementsQuery } from "./query.generated"
  import { date } from "$lib/stores/date"
  import { getITUserITSystemName } from "$lib/utils/display"
  import { findClosestValidity, findClosestValidityWithin } from "$lib/utils/validities"
  import { formatQueryDates } from "$lib/utils/validities"
  import type { Field, Period } from "$lib/utils/changes"
  import Icon from "@iconify/svelte"
  import editSquareOutlineRounded from "@iconify/icons-material-symbols/edit-square-outline-rounded"
  import cancelOutlineRounded from "@iconify/icons-material-symbols/cancel-outline-rounded"
  import historyRounded from "@iconify/icons-material-symbols/history-rounded"
  import { updateGlobalNavigation } from "$lib/stores/navigation"
  import { env } from "$lib/env"
  import { tenses } from "$lib/stores/tenses"

  type Engagement = EngagementsQuery["engagements"]["objects"][0]["validities"][0]
  type OrgUnitNames = NonNullable<
    EngagementsQuery["referencedUnits"]
  >["objects"][0]["validities"]

  const uuid = $page.params.uuid
  const isOrg = $page.url.pathname?.startsWith("/organisation")
  const employee = isOrg ? null : uuid
  const org_unit = isOrg ? uuid : null
  const section = $page.url.pathname?.split("/")[1]

  gql`
    query Engagements(
      $employee: [UUID!]
      $org_unit: [UUID!]
      $fromDate: DateTime
      $toDate: DateTime
      $at: DateTime
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
          uuid
          validities(start: null, end: null) {
            uuid
            user_key
            org_unit_uuid
            person_response {
              uuid
              current(at: $at) {
                name
              }
            }
            job_function_response {
              uuid
              current(at: $at) {
                name
                user_key
              }
            }
            extension_1
            extension_4
            engagement_type_response {
              uuid
              current(at: $at) {
                name
              }
            }
            itusers(filter: { from_date: null, to_date: null }) {
              validities {
                user_key
                uuid
                itsystem_response {
                  uuid
                  current(at: $at) {
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
            }
            managers(inherit: $inherit, exclude_self: true) @skip(if: $isOrg) {
              person_response {
                uuid
                current(at: $at) {
                  name
                }
              }
            }
            validity {
              from
              to
            }
            primary_response {
              uuid
              current(at: $at) {
                name
              }
            }
          }
        }
      }
      referencedUnits: org_units(
        filter: {
          from_date: null
          to_date: null
          engagement: { employees: $employee, from_date: null, to_date: null }
        }
      ) @skip(if: $isOrg) {
        objects {
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
  `

  // Only what the enabled sections can show. Present alone narrows to the
  // engagements running on the chosen date, which is the default view and by
  // far the most common; past or future can reach any engagement ever, so
  // either one widens the window to everything.
  // `toDate` is left off for present, not nulled: a null end means unbounded,
  // which would widen the window to every engagement from the date onwards.
  let queryWindow: { fromDate: string | null; toDate?: string | null }
  $: queryWindow =
    $tenses.past || $tenses.future
      ? { fromDate: null, toDate: null }
      : { fromDate: $date }

  $: dataPromise = graphQLClient()
    .request(EngagementsDocument, {
      org_unit: org_unit,
      employee: employee,
      inherit: env.PUBLIC_INHERIT_MANAGER,
      isOrg: isOrg,
      at: $date,
      ...queryWindow,
    })
    .then((res) => {
      // Each unit appears once in the response however many rows point at it
      const namesByUuid = new Map<string, OrgUnitNames>(
        res.referencedUnits?.objects.map((unit) => [unit.uuid, unit.validities])
      )

      const unitNames = (obj: Engagement) =>
        namesByUuid.get(obj.org_unit_response?.uuid) ?? []

      // Within the slice's own validity, so a past period shows the name the
      // unit carried then rather than today's.
      const unitName = (obj: Engagement) =>
        findClosestValidityWithin(unitNames(obj), obj.validity, $date)?.name ??
        obj.org_unit_response?.uuid

      // The columns this table shows, in column order. Managers and IT users
      // are left out: they resolve through other objects, so a change there is
      // not a change to this engagement.
      const fields = (obj: Engagement): Field[] => [
        isOrg
          ? {
              label: capital($_("employee", { values: { n: 1 } })),
              value: obj.person_response.current?.name,
            }
          : { label: capital($_("unit", { values: { n: 1 } })), value: unitName(obj) },
        ...(env.PUBLIC_SHOW_EXTENSION_4
          ? [{ label: capital($_("department_code")), value: obj.extension_4 }]
          : []),
        { label: upperCase($_("id")), value: obj.user_key },
        ...(env.PUBLIC_SHOW_EXTENSION_1
          ? [{ label: capital($_("job_code")), value: obj.extension_1 }]
          : []),
        {
          label: capital($_("job_function", { values: { n: 1 } })),
          value: obj.job_function_response.current?.name,
        },
        {
          label: capital($_("engagement_type")),
          value: obj.engagement_type_response?.current?.name,
        },
        ...(env.PUBLIC_SHOW_PRIMARY_ENGAGEMENT
          ? [
              {
                label: capital($_("primary")),
                value: obj.primary_response?.current?.name,
              },
            ]
          : []),
      ]

      return { objects: res.engagements.objects, unitNames, fields }
    })
</script>

{#await dataPromise}
  <tr class="leading-5 border-t border-base-300 text-base-content">
    <td class="text-sm p-4">{capital($_("loading"))}</td>
  </tr>
{:then data}
  <!-- `include` narrows to the unit being viewed: an org unit page shows only
       the stretch an engagement spent there.
       TODO: Do this with GraphQL, when following issues are resolved (#65031) (#65303) -->
  <TemporalRows
    objects={data.objects}
    fields={data.fields}
    include={(validity) => !isOrg || validity.org_unit_uuid === uuid}
    editHref={(id, period) =>
      `${base}/${section}/${uuid}/edit/engagement/${id}${formatQueryDates(
        period.validity
      )}`}
    auditHref={(id) => `${base}/auditlog/${id}`}
    let:period
    let:uuid={id}
  >
    <td class="text-sm p-4">
      {#if isOrg}
        <a href="{base}/employee/{period.object.person_response.uuid}"
          >{period.object.person_response.current?.name}</a
        >
      {:else}
        <NameWithHistory
          {id}
          validities={data.unitNames(period.object)}
          rowValidity={period.validity}
          fallback={period.object.org_unit_response?.uuid}
          href="{base}/organisation/{period.object.org_unit_response?.uuid}"
          on:click={() => updateGlobalNavigation(period.object.org_unit_response?.uuid)}
        />
      {/if}
    </td>
    {#if env.PUBLIC_SHOW_EXTENSION_4}
      <td class="text-sm p-4">
        {period.object.extension_4 ? period.object.extension_4 : ""}
      </td>
    {/if}
    <td class="text-sm p-4">{period.object.user_key}</td>
    <td class="text-sm p-4"
      >{env.PUBLIC_SHOW_JOB_FUNCTION_USER_KEY
        ? `${period.object.job_function_response.current?.user_key} - ${period.object.job_function_response.current?.name}`
        : period.object.job_function_response.current?.name}</td
    >
    {#if env.PUBLIC_SHOW_EXTENSION_1}
      <td class="text-sm p-4"
        >{period.object.extension_1 ? period.object.extension_1 : ""}</td
      >
    {/if}
    <td class="text-sm p-4">{period.object.engagement_type_response?.current?.name}</td>
    {#if env.PUBLIC_SHOW_ITUSER_CONNECTIONS}
      <td class="text-sm p-4">
        {#each period.object.itusers as ituser}
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
        <!-- Make sure managers is present (needed since adding @skip to query) -->
        {#if period.object.managers}
          <!-- If there's more than 1 manager, create a list -->
          <!-- Extra if/else logic implemented, so we can add <a>-tags to the managers -->
          {#if period.object.managers.length > 1}
            <ul>
              {#each period.object.managers as manager}
                <li>
                  {#if manager.person_response}
                    <a href="{base}/employee/{manager.person_response.uuid}">
                      • {manager.person_response.current?.name}
                    </a>
                  {:else}
                    • {capital($_("vacant"))}
                  {/if}
                </li>
              {/each}
            </ul>
            <!-- If there's only 1 manager and it's not vacant -->
          {:else if period.object.managers[0] && period.object.managers[0].person_response}
            <a href="{base}/employee/{period.object.managers[0].person_response.uuid}">
              {period.object.managers[0].person_response.current?.name}
            </a>
            <!-- 1 vacant manager -->
          {:else if period.object.managers[0]}
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
      <td class="text-sm p-4">{period.object.primary_response?.current?.name ?? ""}</td>
    {/if}

    <svelte:fragment slot="actions" let:uuid={id} let:period>
      <td class="flex p-4 gap-2 justify-end">
        <a href={`${base}/auditlog/${id}`}>
          <Icon icon={historyRounded} width="25" height="25" />
        </a>
        <a
          href="{base}/{section}/{uuid}/edit/engagement/{id}{formatQueryDates(
            period.validity
          )}"
        >
          <Icon icon={editSquareOutlineRounded} width="25" height="25" />
        </a>
        <a href="{base}/{section}/{uuid}/terminate/engagement/{id}">
          <Icon icon={cancelOutlineRounded} width="25" height="25" />
        </a>
      </td>
    </svelte:fragment>

    <svelte:fragment slot="empty">
      {capital(
        $_("no_item", { values: { item: $_("engagement", { values: { n: 2 } }) } })
      )}
    </svelte:fragment>
  </TemporalRows>
{:catch}
  <tr class="leading-5 border-t border-base-300 text-base-content">
    <td class="text-sm p-4">{capital($_("load_error"))}</td>
  </tr>
{/await}
