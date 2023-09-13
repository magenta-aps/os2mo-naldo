<script lang="ts">
  import { page } from "$app/stores"
  import Tabs from "$lib/components/shared/tabs.svelte"
  import HeadTitle from "$lib/components/shared/head_title.svelte"
  import CopyToClipboard from "$lib/components/copy_to_clipboard.svelte"
  import TenseTabs from "$lib/components/shared/tense_tabs.svelte"
  import { activeOrgTab } from "$lib/stores/tab"
  import { base } from "$app/paths"
  import { date } from "$lib/stores/date"
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

  // Tabs
  // Nogle af de her tabs er lidt sus med endelser. Maybe fix, ville bare ikke blande ALT for meget..
  // Det gælder også employee

  enum itemCategory {
    ORG_UNIT = "Enhed",
    ADDRESSES = "Adresser",
    ENGAGEMENTS = "Engagementer",
    ASSOCIATIONS = "Tilknytninger",
    IT = "IT",
    ROLES = "Roller",
    MANAGER = "Ledere",
    KLE = "KLE-opmærkninger",
    RELATED_UNITS = "Relateret",
  }

  let items = Object.values(itemCategory)

  let activeItem: string = $activeOrgTab
  const tabChange = (e: CustomEvent) => ($activeOrgTab = activeItem = e.detail)

  // Used to make a dynamic create button
  const subsiteOfCategory = (category: string) => {
    switch (category) {
      case itemCategory.ORG_UNIT:
        return "org_unit"
      case itemCategory.ADDRESSES:
        return "address"
      case itemCategory.ENGAGEMENTS:
        return "engagement"
      case itemCategory.ASSOCIATIONS:
        return "association"
      case itemCategory.IT:
        return "it"
      case itemCategory.ROLES:
        return "role"
      case itemCategory.MANAGER:
        return "manager"
      case itemCategory.KLE:
        return "kle"
      case itemCategory.RELATED_UNITS:
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
</script>

<HeadTitle type="organization" />

<div class="px-12 pt-6">
  {#await graphQLClient().request( OrgUnitDocument, { uuid: $page.params.uuid, fromDate: $date } )}
    <p>Loader medarbejder...</p>
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
      <!-- FIXME: I don't know how to do `if activeItem !== (itemCategory.ORG_UNIT || itemCategory.ENGAGEMENTS || etc.)  -->
      {#if activeItem !== itemCategory.ENGAGEMENTS}
        <a
          class="btn btn-sm btn-primary rounded normal-case font-normal text-base text-base-100 my-5"
          href={`${base}/organisation/${$page.params.uuid}/create/${subsiteOfCategory(
            activeItem
          )}`}
        >
          Tilføj {activeItem}
        </a>
      {/if}
    </div>

    {#if activeItem === itemCategory.ORG_UNIT}
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
    {:else if activeItem === itemCategory.ADDRESSES}
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
    {:else if activeItem === itemCategory.ENGAGEMENTS}
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
    {:else if activeItem === itemCategory.ASSOCIATIONS}
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
    {:else if activeItem === itemCategory.IT}
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
    {:else if activeItem === itemCategory.ROLES}
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
    {:else if activeItem === itemCategory.MANAGER}
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
    {:else if activeItem === itemCategory.KLE}
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
    {:else if activeItem === itemCategory.RELATED_UNITS}
      {#if $tenses.present}
        <h2 class="my-4">Nutid</h2>
        <RelatedUnitsDetailTable uuid={$page.params.uuid} />
      {/if}
    {/if}
  {/await}
</div>
