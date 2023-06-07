<script lang="ts">
  import { page } from "$app/stores"
  import Tabs from "$lib/components/shared/tabs.svelte"
  import HeadTitle from "$lib/components/shared/head_title.svelte"
  import Breadcrumbs from "$lib/components/org/breadcrumbs.svelte"
  import CopyToClipboard from "$lib/components/copy_to_clipboard.svelte"
  import TenseTabs from "$lib/components/shared/tense_tabs.svelte"
  import { activeOrgTab } from "$lib/stores/tab"
  import { load } from "./data"
  import { date } from "$lib/stores/date"
  import UnitDetailTable from "$lib/components/org/tables/unit_detail_table.svelte"
  import { tenses } from "$lib/stores/tenses"
  import AddressTable from "$lib/components/org/tables/address_table.svelte"
  import EngagementTable from "$lib/components/org/tables/engagement_table.svelte"
  import AssociationTable from "$lib/components/org/tables/association_table.svelte"
  import ItSystemTable from "$lib/components/org/tables/it_system_table.svelte"
  import RoleTable from "$lib/components/org/tables/role_table.svelte"
  import ManagerTable from "$lib/components/org/tables/manager_table.svelte"
  import RelatedTable from "$lib/components/org/tables/related_table.svelte"
  import { base } from "$app/paths"

  // Tabs
  // TODO: enum?

  let items = [
    "Enhed",
    "Adresser",
    "Engagementer",
    "Tilknytninger",
    "IT",
    "Roller",
    "Ledere",
    "KLE-opmærkninger",
    "Relateret",
  ]

  let activeItem: string = $activeOrgTab
  const tabChange = (e: CustomEvent) => ($activeOrgTab = activeItem = e.detail)
</script>

<HeadTitle type="organization" />

<div class="px-10">
  {#await load($page.params.uuid, $date)}
    <p class="py-5">Loader organisation...</p>
  {:then orgUnits}
    <Breadcrumbs currentOrg={orgUnits.present[0].name} uuid={$page.params.uuid} />
    <div class="flex gap-5">
      <h1 class="pb-4">{orgUnits.present[0].name}</h1>
      <CopyToClipboard uuid={$page.params.uuid} name={orgUnits.present[0].name} />
    </div>
    <Tabs {activeItem} {items} on:tabChange={tabChange} />

    {#if activeItem === "Enhed"}
      <div class="flex justify-between">
        <TenseTabs />
        <a
          class="btn btn-sm btn-primary rounded normal-case font-normal text-base text-base-100 my-5"
          href="{base}/organisation/{$page.params.uuid}/create"
        >
          Tilføj enhed
        </a>
      </div>
      {#if $tenses.future}
        <h2 class="mb-4">Fremtid</h2>
        {#if orgUnits.future.length}
          <UnitDetailTable orgUnits={orgUnits.future} />
        {:else}
          <p class="mb-4">Intet at vise</p>
        {/if}
      {/if}
      {#if $tenses.present}
        <h2 class="mb-4">Nutid</h2>
        <UnitDetailTable orgUnits={orgUnits.present} />
      {/if}
      {#if $tenses.past}
        <h2 class="mb-4">Fortid</h2>
        {#if orgUnits.past.length}
          <UnitDetailTable orgUnits={orgUnits.past} />
        {:else}
          <p>Intet at vise</p>
        {/if}
      {/if}
    {/if}
  {/await}
  {#if activeItem === "Adresser"}
    <TenseTabs />
    <!-- TODO: future and past does not work. 
    Waiting to see if this can be done through GraphQL -->
    {#if $tenses.future}
      <h2 class="mb-4">Fremtid</h2>
      <AddressTable tense="future" uuid={$page.params.uuid} />
    {/if}
    {#if $tenses.present}
      <h2 class="mb-4">Nutid</h2>
      <AddressTable tense="present" uuid={$page.params.uuid} />
    {/if}
    {#if $tenses.past}
      <h2 class="mb-4">Fortid</h2>
      <AddressTable tense="past" uuid={$page.params.uuid} />
    {/if}
  {:else if activeItem === "Engagementer"}
    <TenseTabs />
    <!-- TODO: future and past does not work. 
    Waiting to see if this can be done through GraphQL -->
    {#if $tenses.future}
      <h2 class="mb-4">Fremtid</h2>
      <EngagementTable tense="future" uuid={$page.params.uuid} />
    {/if}
    {#if $tenses.present}
      <h2 class="mb-4">Nutid</h2>
      <EngagementTable tense="present" uuid={$page.params.uuid} />
    {/if}
    {#if $tenses.past}
      <h2 class="mb-4">Fortid</h2>
      <EngagementTable tense="past" uuid={$page.params.uuid} />
    {/if}
  {:else if activeItem === "Tilknytninger"}
    <div class="flex justify-between">
      <TenseTabs />
      <a
        class="btn btn-sm btn-primary rounded normal-case font-normal text-base text-base-100 my-5"
        href="{base}/organisation/{$page.params.uuid}/create/association"
      >
        Opret tilknytning
      </a>
    </div>
    <!-- TODO: future and past does not work. 
    Waiting to see if this can be done through GraphQL -->
    {#if $tenses.future}
      <h2 class="mb-4">Fremtid</h2>
      <AssociationTable tense="future" uuid={$page.params.uuid} />
    {/if}
    {#if $tenses.present}
      <h2 class="mb-4">Nutid</h2>
      <AssociationTable tense="present" uuid={$page.params.uuid} />
    {/if}
    {#if $tenses.past}
      <h2 class="mb-4">Fortid</h2>
      <AssociationTable tense="past" uuid={$page.params.uuid} />
    {/if}
  {:else if activeItem === "IT"}
    <div class="flex justify-between">
      <TenseTabs />
      <a
        class="btn btn-sm btn-primary rounded normal-case font-normal text-base text-base-100 my-5"
        href="{base}/organisation/{$page.params.uuid}/create/it"
      >
        Tilføj IT bruger
      </a>
    </div>
    <!-- TODO: future and past does not work. 
    Waiting to see if this can be done through GraphQL -->
    {#if $tenses.future}
      <h2 class="mb-4">Fremtid</h2>
      <ItSystemTable tense="future" uuid={$page.params.uuid} />
    {/if}
    {#if $tenses.present}
      <h2 class="mb-4">Nutid</h2>
      <ItSystemTable tense="present" uuid={$page.params.uuid} />
    {/if}
    {#if $tenses.past}
      <h2 class="mb-4">Fortid</h2>
      <ItSystemTable tense="past" uuid={$page.params.uuid} />
    {/if}
  {:else if activeItem === "Roller"}
    <TenseTabs />
    <!-- TODO: future and past does not work. 
    Waiting to see if this can be done through GraphQL -->
    {#if $tenses.future}
      <h2 class="mb-4">Fremtid</h2>
      <RoleTable tense="future" uuid={$page.params.uuid} />
    {/if}
    {#if $tenses.present}
      <h2 class="mb-4">Nutid</h2>
      <RoleTable tense="present" uuid={$page.params.uuid} />
    {/if}
    {#if $tenses.past}
      <h2 class="mb-4">Fortid</h2>
      <RoleTable tense="past" uuid={$page.params.uuid} />
    {/if}
  {:else if activeItem === "Ledere"}
    <TenseTabs />
    <!-- TODO: future and past does not work. 
    Waiting to see if this can be done through GraphQL -->
    {#if $tenses.future}
      <h2 class="mb-4">Fremtid</h2>
      <ManagerTable tense="future" uuid={$page.params.uuid} />
    {/if}
    {#if $tenses.present}
      <h2 class="mb-4">Nutid</h2>
      <ManagerTable tense="present" uuid={$page.params.uuid} />
    {/if}
    {#if $tenses.past}
      <h2 class="mb-4">Fortid</h2>
      <ManagerTable tense="past" uuid={$page.params.uuid} />
    {/if}
  {:else if activeItem === "KLE-opmærkninger"}
    <TenseTabs />
    TODO
  {:else if activeItem === "Relateret"}
    <TenseTabs />
    <!-- TODO: future and past does not work. 
    Waiting to see if this can be done through GraphQL -->
    {#if $tenses.future}
      <h2 class="mb-4">Fremtid</h2>
      <RelatedTable tense="future" uuid={$page.params.uuid} />
    {/if}
    {#if $tenses.present}
      <h2 class="mb-4">Nutid</h2>
      <RelatedTable tense="present" uuid={$page.params.uuid} />
    {/if}
    {#if $tenses.past}
      <h2 class="mb-4">Fortid</h2>
      <RelatedTable tense="past" uuid={$page.params.uuid} />
    {/if}
  {/if}
</div>
