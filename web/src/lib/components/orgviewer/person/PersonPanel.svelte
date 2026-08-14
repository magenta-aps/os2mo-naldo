<script lang="ts">
  import { base } from "$app/paths"
  import { goto } from "$app/navigation"
  import AddressList from "$lib/components/orgviewer/AddressList.svelte"
  import InfoRow from "$lib/components/orgviewer/InfoRow.svelte"
  import { env } from "$lib/env"
  import { graphQLClient } from "$lib/http/client"
  import { capital } from "$lib/utils/helpers"
  import { _ } from "svelte-i18n"
  import { findRelationForOrgUnit, resolveOrgUnitUuid, type PersonDetail } from "./person"
  import { OrgViewerPersonDetailDocument } from "./queries"
  import WorkAddress from "./WorkAddress.svelte"

  export let personUuid: string
  export let orgUuid: string | undefined
  export let rootUuid: string

  $: relationType = env.PUBLIC_ORGVIEWER_ORG_PERSON_RELATION
  $: includeAssociations = relationType === "association" || relationType === "both"
  $: includeEngagements = relationType === "engagement" || relationType === "both"

  const fetchPerson = async (
    uuid: string,
    includeAssoc: boolean,
    includeEng: boolean
  ): Promise<PersonDetail | null> => {
    const res = await graphQLClient().request(OrgViewerPersonDetailDocument, {
      uuid: [uuid],
      includeAssociations: includeAssoc,
      includeEngagements: includeEng,
    })
    return res.employees.objects[0]?.validities[0] ?? null
  }

  // Ported from Person.vue's beforeRouteEnter/person-watcher: when the URL
  // doesn't already carry an org unit context, resolve one from the
  // person's own relations and redirect - e.g. a substitute link only ever
  // carries a personUuid, relying on this to land somewhere sensible.
  const fetchAndMaybeRedirect = async (
    uuid: string,
    includeAssoc: boolean,
    includeEng: boolean
  ): Promise<PersonDetail | null> => {
    const person = await fetchPerson(uuid, includeAssoc, includeEng)
    if (person && !orgUuid) {
      const resolvedOrgUuid = resolveOrgUnitUuid(person, relationType)
      if (resolvedOrgUuid) {
        await goto(`${base}/orgviewer/person/${uuid}/${resolvedOrgUuid}/${rootUuid}`, {
          replaceState: true,
        })
      }
    }
    return person
  }

  let request: Promise<PersonDetail | null>
  $: request = fetchAndMaybeRedirect(personUuid, includeAssociations, includeEngagements)

  const employeeName = (employee: { name: string; nickname: string }) =>
    env.PUBLIC_ORGVIEWER_SHOW_NICKNAME && employee.nickname ? employee.nickname : employee.name
</script>

{#await request}
  <p class="p-4 text-base-content/60">{capital($_("loading"))}...</p>
{:then person}
  {#if person}
    {@const displayName = employeeName(person)}
    {@const engagement = includeEngagements
      ? findRelationForOrgUnit(person.engagements, orgUuid)
      : undefined}
    {@const association = includeAssociations
      ? findRelationForOrgUnit(person.associations, orgUuid)
      : undefined}
    <article class="card border border-base-300 bg-base-100 p-4">
      <header class="mb-3 border-b border-base-300 pb-3">
        {#if orgUuid}
          <a
            href={`${base}/orgviewer/orgunit/${orgUuid}/${rootUuid}`}
            id="persontitle"
            class="hover:no-underline"
          >
            <h2 class="m-0">{displayName}</h2>
          </a>
        {:else}
          <h2 class="m-0" id="persontitle">{displayName}</h2>
        {/if}
      </header>

      <div class="space-y-1.5">
        {#if engagement}
          <InfoRow label={engagement.engagement_type.name}>
            {#if env.PUBLIC_ORGVIEWER_SHOW_EXTENSION_3_VIBORG && engagement.extension_3}
              {engagement.extension_3}
            {:else if env.PUBLIC_ORGVIEWER_SHOW_EXTENSION_1 && engagement.extension_1}
              {engagement.extension_1}
            {:else}
              {engagement.job_function.name}
            {/if}
          </InfoRow>
        {/if}

        {#if association}
          <InfoRow label={capital($_("association", { values: { n: 1 } }))}>
            {association.association_type.name}
          </InfoRow>

          {#if association.substitute[0]}
            <InfoRow label={capital($_("substitute"))}>
              <a href={`${base}/orgviewer/person/${association.substitute[0].uuid}`}>
                {employeeName(association.substitute[0])}
              </a>
            </InfoRow>
          {/if}

          {#if association.dynamic_class}
            <InfoRow label={capital($_("class", { values: { n: 1 } }))}>
              {#if association.dynamic_class.parent}{association.dynamic_class.parent
                  .name} / {/if}{association.dynamic_class.name}
            </InfoRow>
          {/if}
        {/if}

        <InfoRow label={capital($_("orgviewer.work_address"))}>
          <WorkAddress uuid={person.uuid} />
        </InfoRow>
      </div>

      <div class="mt-4 border-t border-base-300 pt-3">
        <AddressList addresses={person.addresses} />
      </div>
    </article>
  {/if}
{:catch error}
  <p role="alert" class="p-4 text-error">{capital($_("orgviewer.error_loading_person"))}</p>
{/await}
