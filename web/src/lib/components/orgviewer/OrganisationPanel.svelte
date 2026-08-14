<script lang="ts">
  import { base } from "$app/paths"
  import { env } from "$lib/env"
  import { graphQLClient } from "$lib/http/client"
  import { capital } from "$lib/utils/helpers"
  import { _ } from "svelte-i18n"
  import AddressList from "./AddressList.svelte"
  import ManagerList from "./ManagerList.svelte"
  import {
    filterEngagementsByType,
    filterManagersOutOfEngagements,
    filterVisibleAddresses,
    sortAssociations,
    sortByName,
    type OrgViewerAssociation,
    type OrgViewerEngagement,
    type OrgViewerManager,
  } from "./organisation"
  import PersonList from "./PersonList.svelte"
  import { OrgViewerUnitDetailDocument } from "./queries"

  export let uuid: string
  export let rootUuid: string

  type Detail = {
    uuid: string
    name: string
    addresses: ReturnType<typeof filterVisibleAddresses>
    managers: OrgViewerManager[]
    engagements: OrgViewerEngagement[]
    associations: OrgViewerAssociation[]
  }

  $: relationType = env.PUBLIC_ORGVIEWER_ORG_PERSON_RELATION
  $: includeAssociations = relationType === "association" || relationType === "both"
  $: includeEngagements = relationType === "engagement" || relationType === "both"

  const fetchDetail = async (
    unitUuid: string,
    includeAssoc: boolean,
    includeEng: boolean
  ): Promise<Detail | null> => {
    const res = await graphQLClient().request(OrgViewerUnitDetailDocument, {
      uuid: [unitUuid],
      includeAssociations: includeAssoc,
      includeEngagements: includeEng,
    })
    const unit = res.org_units.objects[0]?.validities[0]
    if (!unit) return null

    const addresses = filterVisibleAddresses(unit.addresses, {
      hiddenUserKeys: env.PUBLIC_ORGVIEWER_HIDDEN_ADDRESS_TYPE_USER_KEYS,
      removeOrgUnitEmail: env.PUBLIC_ORGVIEWER_REMOVE_ORG_UNIT_EMAIL,
    })

    // Ported from organisation-store.js: associations are sorted by the
    // (deployment-specific) role weight table, engagements are sorted by
    // name - the two lists are never sorted the same way.
    const associations = includeAssoc ? sortAssociations(unit.associations) : []

    let engagements: OrgViewerEngagement[] = []
    if (includeEng) {
      engagements = filterManagersOutOfEngagements(
        unit.engagements,
        env.PUBLIC_ORGVIEWER_REMOVE_MANAGER_ENGAGEMENT
      )
      engagements = filterEngagementsByType(
        engagements,
        env.PUBLIC_ORGVIEWER_REMOVE_ENGAGEMENT_TYPE_UUID
      )
      engagements = sortByName(engagements, env.PUBLIC_ORGVIEWER_SHOW_NICKNAME)
    }

    return {
      uuid: unit.uuid,
      name: unit.name,
      addresses,
      managers: includeEng ? unit.managers : [],
      engagements,
      associations,
    }
  }

  let request: Promise<Detail | null>
  $: request = fetchDetail(uuid, includeAssociations, includeEngagements)
</script>

{#await request}
  <p>{capital($_("loading"))}...</p>
{:then detail}
  {#if detail}
    <article>
      <header>
        <a href={`${base}/orgviewer/tree/${detail.uuid}/${rootUuid}`} id="orgtitle">
          {detail.name}
        </a>
      </header>

      <div>
        <AddressList addresses={detail.addresses} />

        {#if includeEngagements}
          <section>
            <p>{capital($_("manager", { values: { n: 2 } }))}</p>
            <ManagerList
              managers={detail.managers}
              {rootUuid}
              showNickname={env.PUBLIC_ORGVIEWER_SHOW_NICKNAME}
            />
          </section>

          <section>
            <p>{capital($_("employee", { values: { n: 2 } }))}</p>
            <PersonList
              people={detail.engagements}
              relationType="engagement"
              {rootUuid}
              orgUuid={detail.uuid}
              showNickname={env.PUBLIC_ORGVIEWER_SHOW_NICKNAME}
              showExtension1={env.PUBLIC_ORGVIEWER_SHOW_EXTENSION_1}
              showExtension3={env.PUBLIC_ORGVIEWER_SHOW_EXTENSION_3_VIBORG}
            />
          </section>
        {/if}

        {#if includeAssociations}
          <section>
            <p>{capital($_("association", { values: { n: 2 } }))}</p>
            <PersonList
              people={detail.associations}
              relationType="association"
              {rootUuid}
              orgUuid={detail.uuid}
              showNickname={env.PUBLIC_ORGVIEWER_SHOW_NICKNAME}
            />
          </section>
        {/if}
      </div>
    </article>
  {/if}
{:catch error}
  <p role="alert" class="text-error">{capital($_("orgviewer.error_loading_unit"))}</p>
{/await}
