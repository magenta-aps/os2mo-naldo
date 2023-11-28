<script lang="ts">
  import { page } from "$app/stores"
  import Tabs from "$lib/components/shared/tabs.svelte"
  import HeadTitle from "$lib/components/shared/head_title.svelte"
  import CopyToClipboard from "$lib/components/copy_to_clipboard.svelte"
  import TenseTabs from "$lib/components/shared/tense_tabs.svelte"
  import { OrgTab, activeOrgTab } from "$lib/stores/tab"
  import { base } from "$app/paths"
  import { date } from "$lib/stores/date"
  import { env } from "$env/dynamic/public"
  import { gql } from "graphql-request"
  import { graphQLClient } from "$lib/util/http"
  import { tenses } from "$lib/stores/tenses"
  import AddressDetailTable from "$lib/components/shared/detail_tables/address_detail_table.svelte"
  import AssociationDetailTable from "$lib/components/shared/detail_tables/association_detail_table.svelte"
  import EngagementDetailTable from "$lib/components/shared/detail_tables/engagement_detail_table.svelte"
  import ItUserDetailTable from "$lib/components/shared/detail_tables/ituser_detail_table.svelte"
  import KleDetailTable from "$lib/components/org/tables/kle_detail_table.svelte"
  import ManagerDetailTable from "$lib/components/shared/detail_tables/manager_detail_table.svelte"
  import RelatedUnitsDetailTable from "$lib/components/org/tables/related_units_detail_table.svelte"
  import RolesDetailTable from "$lib/components/shared/detail_tables/roles_detail_table.svelte"
  import OrgUnitDetailTable from "$lib/components/org/tables/org_unit_detail_table.svelte"
  import { OrgUnitDocument } from "./query.generated"
  import { onMount } from "svelte"

  // Tabs
  let items = Object.values(OrgTab)

  // TODO: Move tab logic into tabs.svelte
  if (env.PUBLIC_SHOW_KLE_TAB === "false") {
    items = items.filter((tab) => tab !== OrgTab.KLE)
  }

  let uuidFromUrl = $page.params.uuid
  let activeItem = $activeOrgTab
  const tabChange = (e: CustomEvent) => ($activeOrgTab = activeItem = e.detail)

  // Used to make a dynamic create button
  const subsiteOfCategory = (category: OrgTab) => {
    switch (category) {
      case OrgTab.ORG_UNIT:
        return "org_unit"
      case OrgTab.ADDRESS:
        return "address"
      case OrgTab.ENGAGEMENT:
        return "engagement"
      case OrgTab.ASSOCIATION:
        return "association"
      case OrgTab.IT:
        return "it"
      case OrgTab.ROLE:
        return "role"
      case OrgTab.MANAGER:
        return "manager"
      case OrgTab.KLE:
        return "kle"
      case OrgTab.RELATED_UNIT:
        return "related_units"
      default:
        console.warn("The tab doesn't match a subsite")
        return
    }
  }

  gql`
    query OrgUnit($uuid: [UUID!], $fromDate: DateTime) {
      org_units(filter: { uuids: $uuid, from_date: $fromDate }) {
        objects {
          objects {
            name
          }
        }
      }
    }
  `
  onMount(() => {
    // Will show up as #Tab&MaybeOtherStuff&Ect...
    // In dev SvelteKit will add things like &state=<uuid>
    if ($page.url.hash) {
      // The replace is to solve encoding issues with the 'æ' in KLE-opmærkninger
      const firstHash = $page.url.hash.slice(1).split("&")[0].replace("%C3%A6", "æ")
      if (Object.values(OrgTab).some((v) => v === firstHash)) {
        // Safe to assume the hash is an OrgTab
        $activeOrgTab = activeItem = firstHash as OrgTab
      }
    }
  })

  // Prevents the #await from re-fetching when the tabs changes the hash in the URL
  $: if (uuidFromUrl !== $page.params.uuid) {
    uuidFromUrl = $page.params.uuid
  }
</script>

<HeadTitle type="organisation" />

<div class="px-12 pt-6">
  {#await graphQLClient().request( OrgUnitDocument, { uuid: uuidFromUrl, fromDate: $date } )}
    <p>Loader organisation...</p>
  {:then data}
    <div class="flex gap-5">
      <h1 class="pb-4">{data.org_units.objects[0].objects[0].name}</h1>
      <CopyToClipboard
        uuid={$page.params.uuid}
        name={data.org_units.objects[0].objects[0].name}
      />
    </div>

    <Tabs {activeItem} {items} on:tabChange={tabChange} />

    <div class="flex justify-between">
      <TenseTabs />
      <!-- Links are different on `org_unit` and `related`-tabs -->
      <a
        class="btn btn-sm btn-primary rounded normal-case font-normal text-base text-base-100 my-5"
        href={`${base}/${
          activeItem === OrgTab.ORG_UNIT
            ? "organisation/create"
            : activeItem === OrgTab.RELATED_UNIT
            ? "connecting_organisations"
            : `organisation/${$page.params.uuid}/create/${subsiteOfCategory(
                activeItem
              )}`
        }`}
      >
        Tilføj {activeItem}
      </a>
    </div>

    {#if activeItem === OrgTab.ORG_UNIT}
      {#if $tenses.future}
        <h2 class="mb-4">Fremtid</h2>
        <OrgUnitDetailTable tense="future" uuid={$page.params.uuid} />
      {/if}
      {#if $tenses.present}
        <h2 class="mb-4">Nutid</h2>
        <OrgUnitDetailTable tense="present" uuid={$page.params.uuid} />
      {/if}
      {#if $tenses.past}
        <h2 class="mb-4">Fortid</h2>
        <OrgUnitDetailTable tense="past" uuid={$page.params.uuid} />
      {/if}
    {:else if activeItem === OrgTab.ADDRESS}
      {#if $tenses.future}
        <h2 class="mb-4">Fremtid</h2>
        <AddressDetailTable tense="future" uuid={$page.params.uuid} />
      {/if}
      {#if $tenses.present}
        <h2 class="mb-4">Nutid</h2>
        <AddressDetailTable tense="present" uuid={$page.params.uuid} />
      {/if}
      {#if $tenses.past}
        <h2 class="mb-4">Fortid</h2>
        <AddressDetailTable tense="past" uuid={$page.params.uuid} />
      {/if}
    {:else if activeItem === OrgTab.ENGAGEMENT}
      {#if $tenses.future}
        <h2 class="mb-4">Fremtid</h2>
        <EngagementDetailTable tense="future" uuid={$page.params.uuid} />
      {/if}
      {#if $tenses.present}
        <h2 class="mb-4">Nutid</h2>
        <EngagementDetailTable tense="present" uuid={$page.params.uuid} />
      {/if}
      {#if $tenses.past}
        <h2 class="mb-4">Fortid</h2>
        <EngagementDetailTable tense="past" uuid={$page.params.uuid} />
      {/if}
    {:else if activeItem === OrgTab.ASSOCIATION}
      {#if $tenses.future}
        <h2 class="mb-4">Fremtid</h2>
        <AssociationDetailTable tense="future" uuid={$page.params.uuid} />
      {/if}
      {#if $tenses.present}
        <h2 class="mb-4">Nutid</h2>
        <AssociationDetailTable tense="present" uuid={$page.params.uuid} />
      {/if}
      {#if $tenses.past}
        <h2 class="mb-4">Fortid</h2>
        <AssociationDetailTable tense="past" uuid={$page.params.uuid} />
      {/if}
    {:else if activeItem === OrgTab.IT}
      {#if $tenses.future}
        <h2 class="mb-4">Fremtid</h2>
        <ItUserDetailTable tense="future" uuid={$page.params.uuid} />
      {/if}
      {#if $tenses.present}
        <h2 class="mb-4">Nutid</h2>
        <ItUserDetailTable tense="present" uuid={$page.params.uuid} />
      {/if}
      {#if $tenses.past}
        <h2 class="mb-4">Fortid</h2>
        <ItUserDetailTable tense="past" uuid={$page.params.uuid} />
      {/if}
    {:else if activeItem === OrgTab.ROLE}
      {#if $tenses.future}
        <h2 class="mb-4">Fremtid</h2>
        <RolesDetailTable tense="future" uuid={$page.params.uuid} />
      {/if}
      {#if $tenses.present}
        <h2 class="mb-4">Nutid</h2>
        <RolesDetailTable tense="present" uuid={$page.params.uuid} />
      {/if}
      {#if $tenses.past}
        <h2 class="mb-4">Fortid</h2>
        <RolesDetailTable tense="past" uuid={$page.params.uuid} />
      {/if}
    {:else if activeItem === OrgTab.MANAGER}
      {#if $tenses.future}
        <h2 class="mb-4">Fremtid</h2>
        <ManagerDetailTable tense="future" uuid={$page.params.uuid} />
      {/if}
      {#if $tenses.present}
        <h2 class="mb-4">Nutid</h2>
        <ManagerDetailTable tense="present" uuid={$page.params.uuid} />
      {/if}
      {#if $tenses.past}
        <h2 class="mb-4">Fortid</h2>
        <ManagerDetailTable tense="past" uuid={$page.params.uuid} />
      {/if}
    {:else if activeItem === OrgTab.KLE}
      {#if $tenses.future}
        <h2 class="mb-4">Fremtid</h2>
        <KleDetailTable tense="future" uuid={$page.params.uuid} />
      {/if}
      {#if $tenses.present}
        <h2 class="mb-4">Nutid</h2>
        <KleDetailTable tense="present" uuid={$page.params.uuid} />
      {/if}
      {#if $tenses.past}
        <h2 class="mb-4">Fortid</h2>
        <KleDetailTable tense="past" uuid={$page.params.uuid} />
      {/if}
    {:else if activeItem === OrgTab.RELATED_UNIT}
      {#if $tenses.present}
        <h2 class="my-4">Nutid</h2>
        <RelatedUnitsDetailTable uuid={$page.params.uuid} />
      {/if}
    {/if}
  {/await}
</div>
