<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import { base } from "$app/paths"
  import { date } from "$lib/stores/date"
  import { graphQLClient } from "$lib/util/http"
  import { gql } from "graphql-request"
  import { GetBreadcrumbsDocument } from "./query.generated"

  export let orgUnit: { name: string; uuid: string } | null | undefined = undefined
  export let emptyMessage: string = ""
  export let link: boolean = false
  gql`
    query GetBreadcrumbs($uuid: [UUID!], $currentDate: DateTime) {
      org_units(filter: { uuids: $uuid, from_date: $currentDate }) {
        objects {
          current(at: $currentDate) {
            ancestors {
              name
              uuid
            }
          }
        }
      }
    }
  `
</script>

<!-- Since link is only used at Organisation pages, which is where we need no padding -->
<!-- I used the conditional for padding - even though it's not directly connected. -->
{#if orgUnit}
  {#await graphQLClient().request( GetBreadcrumbsDocument, { uuid: orgUnit.uuid, currentDate: $date } )}
    <div class="text-secondary {link ? 'pb-0' : 'pb-4'}">
      {capital($_("loading"))}...
    </div>
  {:then data}
    {@const parents = data.org_units.objects.length
      ? data.org_units.objects[0].current?.ancestors
      : []}
    <div class="breadcrumbs text-secondary pt-0 {link ? 'pb-0' : 'pb-4'}">
      <ul>
        {#if parents}
          {#each parents.reverse() as parent}
            <li>
              {#if link}
                <a href="{base}/organisation/{parent.uuid}">
                  {parent.name}
                </a>
              {:else}
                <p>{parent.name}</p>
              {/if}
            </li>
          {/each}
        {/if}
        <li>
          {orgUnit.name}
        </li>
      </ul>
    </div>
  {/await}
{:else if !orgUnit && emptyMessage}
  <div class="text-secondary {link ? 'pb-0' : 'pb-4'}">{emptyMessage}</div>
{/if}
