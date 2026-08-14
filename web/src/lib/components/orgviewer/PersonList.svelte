<script lang="ts">
  import { base } from "$app/paths"
  import { capital } from "$lib/utils/helpers"
  import { _ } from "svelte-i18n"
  import {
    employeeDisplayName,
    type OrgViewerAssociation,
    type OrgViewerEngagement,
  } from "./organisation"

  export let people: (OrgViewerAssociation | OrgViewerEngagement)[]
  export let relationType: "engagement" | "association"
  export let rootUuid: string
  export let orgUuid: string
  export let showNickname: boolean
  export let showExtension1 = false
  export let showExtension3 = false

  const isAssociation = (
    person: OrgViewerAssociation | OrgViewerEngagement
  ): person is OrgViewerAssociation => "association_type" in person
</script>

{#if people.length}
  <ul>
    {#each people as person, i (i)}
      <li>
        <dl>
          {#if isAssociation(person)}
            <dt>{person.association_type.name}</dt>
            <dd>
              {#if person.employee[0]}
                <a
                  href={`${base}/orgviewer/person/${person.employee[0].uuid}/${orgUuid}/${rootUuid}`}
                >
                  {employeeDisplayName(person.employee[0], showNickname)}
                </a>
              {:else}
                {capital($_("vacant"))}
              {/if}
              {#if person.dynamic_class}
                <span>
                  {#if person.dynamic_class.parent}{person.dynamic_class.parent
                      .name} / {/if}{person.dynamic_class.name}
                </span>
              {/if}
            </dd>
            {#if person.substitute[0]}
              <dt>{capital($_("substitute"))}</dt>
              <dd>
                <a href={`${base}/orgviewer/person/${person.substitute[0].uuid}/${orgUuid}`}>
                  {employeeDisplayName(person.substitute[0], showNickname)}
                </a>
              </dd>
            {/if}
          {:else}
            <dt>
              {#if showExtension3 && person.extension_3}
                {person.extension_3}
              {:else if showExtension1 && person.extension_1}
                {person.extension_1}
              {:else if person.job_function}
                {person.job_function.name}
              {:else}
                {capital($_("employee", { values: { n: 1 } }))}
              {/if}
            </dt>
            <dd>
              {#if person.employee[0]}
                <a
                  href={`${base}/orgviewer/person/${person.employee[0].uuid}/${orgUuid}/${rootUuid}`}
                >
                  {employeeDisplayName(person.employee[0], showNickname)}
                </a>
              {:else}
                {capital($_("vacant"))}
              {/if}
            </dd>
          {/if}
        </dl>
      </li>
    {/each}
  </ul>
{:else}
  <p>
    {capital(
      $_("no_item", {
        values: {
          item:
            relationType === "association"
              ? $_("association", { values: { n: 2 } })
              : $_("employee", { values: { n: 2 } }),
        },
      })
    )}
  </p>
{/if}
