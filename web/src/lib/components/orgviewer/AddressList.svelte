<script lang="ts">
  import { capital } from "$lib/utils/helpers"
  import { _ } from "svelte-i18n"
  import type { OrgViewerAddress } from "./organisation"

  export let addresses: OrgViewerAddress[]
</script>

{#if addresses.length}
  <dl>
    {#each addresses as address (address.uuid)}
      {#if address.address_type.name === "Dokumentadresse" && address.address_type.scope === "WWW"}
        <dt>{capital($_("orgviewer.documents"))}</dt>
        <dd>
          <a href={address.value} target="_blank" rel="noreferrer">
            {capital($_("orgviewer.committee_documents"))}
          </a>
        </dd>
      {:else if address.address_type.scope === "DAR"}
        <dt>{address.address_type.name}</dt>
        <dd>{address.name}</dd>
      {:else if address.address_type.scope === "EMAIL"}
        <dt>{capital($_("orgviewer.email"))}</dt>
        <dd><a href={`mailto:${address.value}`}>{address.value}</a></dd>
      {:else if address.address_type.scope === "PHONE"}
        <dt>{capital($_("phone"))}</dt>
        <dd><a href={`tel:${address.value}`}>{address.value}</a></dd>
      {:else if address.address_type.scope === "WWW"}
        <dt>{address.address_type.name}</dt>
        <dd><a href={address.value} target="_blank" rel="noreferrer">{address.value}</a></dd>
      {:else}
        <dt>{address.address_type.name}</dt>
        <dd>{address.value}</dd>
      {/if}
    {/each}
  </dl>
{:else}
  <p>{capital($_("orgviewer.no_details_found"))}</p>
{/if}
