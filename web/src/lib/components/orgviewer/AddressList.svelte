<script lang="ts">
  import { capital } from "$lib/utils/helpers"
  import { _ } from "svelte-i18n"
  import Icon from "@iconify/svelte"
  import callOutlineRounded from "@iconify/icons-material-symbols/call-outline-rounded"
  import descriptionOutlineRounded from "@iconify/icons-material-symbols/description-outline-rounded"
  import locationOnOutlineRounded from "@iconify/icons-material-symbols/location-on-outline-rounded"
  import mailOutlineRounded from "@iconify/icons-material-symbols/mail-outline-rounded"
  import openInNewRounded from "@iconify/icons-material-symbols/open-in-new-rounded"
  import InfoRow from "./InfoRow.svelte"
  import type { OrgViewerAddress } from "./organisation"

  export let addresses: OrgViewerAddress[]
</script>

{#if addresses.length}
  <div class="divide-y divide-base-300">
    {#each addresses as address (address.uuid)}
      {#if address.address_type.name === "Dokumentadresse" && address.address_type.scope === "WWW"}
        <InfoRow icon={descriptionOutlineRounded} label={capital($_("orgviewer.documents"))}>
          <a href={address.value} target="_blank" rel="noreferrer" class="inline-flex items-center gap-1">
            {capital($_("orgviewer.committee_documents"))}
            <Icon icon={openInNewRounded} width="14" height="14" />
          </a>
        </InfoRow>
      {:else if address.address_type.scope === "DAR"}
        <InfoRow icon={locationOnOutlineRounded} label={address.address_type.name}>
          {address.name}
        </InfoRow>
      {:else if address.address_type.scope === "EMAIL"}
        <InfoRow icon={mailOutlineRounded} label={capital($_("orgviewer.email"))}>
          <a href={`mailto:${address.value}`}>{address.value}</a>
        </InfoRow>
      {:else if address.address_type.scope === "PHONE"}
        <InfoRow icon={callOutlineRounded} label={capital($_("phone"))}>
          <a href={`tel:${address.value}`}>{address.value}</a>
        </InfoRow>
      {:else if address.address_type.scope === "WWW"}
        <InfoRow icon={openInNewRounded} label={address.address_type.name}>
          <a href={address.value} target="_blank" rel="noreferrer">{address.value}</a>
        </InfoRow>
      {:else}
        <InfoRow label={address.address_type.name}>
          {address.value}
        </InfoRow>
      {/if}
    {/each}
  </div>
{:else}
  <p class="text-sm text-base-content/60">{capital($_("orgviewer.no_details_found"))}</p>
{/if}
