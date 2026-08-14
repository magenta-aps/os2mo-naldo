<script lang="ts">
  import { base } from "$app/paths"
  import { goto } from "$app/navigation"
  import AddressList from "$lib/components/orgviewer/AddressList.svelte"
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
  <p>{capital($_("loading"))}...</p>
{:then person}
  {#if person}
    {@const displayName = employeeName(person)}
    {@const engagement = includeEngagements
      ? findRelationForOrgUnit(person.engagements, orgUuid)
      : undefined}
    {@const association = includeAssociations
      ? findRelationForOrgUnit(person.associations, orgUuid)
      : undefined}
    <article>
      <header>
        {#if orgUuid}
          <a href={`${base}/orgviewer/orgunit/${orgUuid}/${rootUuid}`} id="persontitle">
            {displayName}
          </a>
        {/if}
      </header>

      <div>
        <dl>
          <dt>{capital($_("name"))}</dt>
          <dd>{displayName}</dd>

          {#if engagement}
            <dt>{engagement.engagement_type.name}</dt>
            {#if env.PUBLIC_ORGVIEWER_SHOW_EXTENSION_3_VIBORG && engagement.extension_3}
              <dd>{engagement.extension_3}</dd>
            {:else if env.PUBLIC_ORGVIEWER_SHOW_EXTENSION_1 && engagement.extension_1}
              <dd>{engagement.extension_1}</dd>
            {:else}
              <dd>{engagement.job_function.name}</dd>
            {/if}
          {/if}

          {#if association}
            <dt>{capital($_("association", { values: { n: 1 } }))}</dt>
            <dd>{association.association_type.name}</dd>

            {#if association.substitute[0]}
              <dt>{capital($_("substitute"))}</dt>
              <dd>
                <a href={`${base}/orgviewer/person/${association.substitute[0].uuid}`}>
                  {employeeName(association.substitute[0])}
                </a>
              </dd>
            {/if}

            {#if association.dynamic_class}
              <dt>{capital($_("class", { values: { n: 1 } }))}</dt>
              <dd>
                {#if association.dynamic_class.parent}{association.dynamic_class.parent
                    .name} / {/if}{association.dynamic_class.name}
              </dd>
            {/if}
          {/if}

          <dt>{capital($_("orgviewer.work_address"))}</dt>
          <dd><WorkAddress uuid={person.uuid} /></dd>
        </dl>

        <AddressList addresses={person.addresses} />
      </div>
    </article>
  {/if}
{:catch error}
  <p role="alert" class="text-error">{capital($_("orgviewer.error_loading_person"))}</p>
{/await}
