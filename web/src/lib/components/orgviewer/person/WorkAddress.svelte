<script lang="ts">
  import { graphQLClient } from "$lib/http/client"
  import { OrgViewerPersonWorkAddressDocument } from "./queries"

  export let uuid: string

  const fetchWorkAddress = async (personUuid: string): Promise<string | undefined> => {
    const res = await graphQLClient().request(OrgViewerPersonWorkAddressDocument, {
      uuid: [personUuid],
    })
    const addresses =
      res.employees.objects[0]?.validities[0]?.engagements[0]?.org_unit[0]?.addresses ?? []
    return addresses.find((a) => a.address_type.user_key === "AddressMailUnit")?.name ?? undefined
  }

  $: request = fetchWorkAddress(uuid)
</script>

{#await request then workAddress}
  {#if workAddress}
    <span>{workAddress}</span>
  {/if}
{/await}
