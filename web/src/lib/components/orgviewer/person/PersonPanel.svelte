<script lang="ts">
  import { base } from "$app/paths"
  import AddressList from "$lib/components/orgviewer/AddressList.svelte"
  import { env } from "$lib/env"
  import { capital } from "$lib/utils/helpers"
  import { _ } from "svelte-i18n"
  import { findRelationForOrgUnit, type PersonDetail } from "./person"
  import WorkAddress from "./WorkAddress.svelte"

  export let person: PersonDetail
  export let orgUuid: string | undefined
  export let rootUuid: string

  $: relationType = env.PUBLIC_ORGVIEWER_ORG_PERSON_RELATION
  $: engagement =
    relationType === "engagement" || relationType === "both"
      ? findRelationForOrgUnit(person.engagements, orgUuid)
      : undefined
  $: association =
    relationType === "association" || relationType === "both"
      ? findRelationForOrgUnit(person.associations, orgUuid)
      : undefined
  $: displayName =
    env.PUBLIC_ORGVIEWER_SHOW_NICKNAME && person.nickname ? person.nickname : person.name

  const employeeName = (employee: { name: string; nickname: string }) =>
    env.PUBLIC_ORGVIEWER_SHOW_NICKNAME && employee.nickname ? employee.nickname : employee.name
</script>

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
