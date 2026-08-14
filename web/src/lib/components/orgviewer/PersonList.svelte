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
  <ul class="divide-y divide-base-300">
    {#each people as person, i (i)}
      <li class="py-1.5">
        {#if isAssociation(person)}
          <div class="flex items-center justify-between gap-2">
            <span class="text-sm text-base-content/60">{person.association_type.name}</span>
            {#if person.employee[0]}
              <a
                class="font-medium"
                href={`${base}/orgviewer/person/${person.employee[0].uuid}/${orgUuid}/${rootUuid}`}
              >
                {employeeDisplayName(person.employee[0], showNickname)}
              </a>
            {:else}
              <span class="text-base-content/60 italic">{capital($_("vacant"))}</span>
            {/if}
          </div>
          {#if person.dynamic_class}
            <div class="text-xs text-base-content/60">
              {#if person.dynamic_class.parent}{person.dynamic_class.parent
                  .name} / {/if}{person.dynamic_class.name}
            </div>
          {/if}
          {#if person.substitute[0]}
            <div class="mt-1 flex items-center justify-between gap-2">
              <span class="text-sm text-base-content/60">{capital($_("substitute"))}</span>
              <a href={`${base}/orgviewer/person/${person.substitute[0].uuid}/${orgUuid}`}>
                {employeeDisplayName(person.substitute[0], showNickname)}
              </a>
            </div>
          {/if}
        {:else}
          <div class="flex items-center justify-between gap-2">
            <span class="text-sm text-base-content/60">
              {#if showExtension3 && person.extension_3}
                {person.extension_3}
              {:else if showExtension1 && person.extension_1}
                {person.extension_1}
              {:else if person.job_function}
                {person.job_function.name}
              {:else}
                {capital($_("employee", { values: { n: 1 } }))}
              {/if}
            </span>
            {#if person.employee[0]}
              <a
                class="font-medium"
                href={`${base}/orgviewer/person/${person.employee[0].uuid}/${orgUuid}/${rootUuid}`}
              >
                {employeeDisplayName(person.employee[0], showNickname)}
              </a>
            {:else}
              <span class="text-base-content/60 italic">{capital($_("vacant"))}</span>
            {/if}
          </div>
        {/if}
      </li>
    {/each}
  </ul>
{:else}
  <p class="text-sm text-base-content/60">
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
