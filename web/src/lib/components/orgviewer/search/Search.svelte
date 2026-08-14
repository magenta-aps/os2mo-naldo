<script lang="ts">
  import { base } from "$app/paths"
  import { env } from "$lib/env"
  import { graphQLClient } from "$lib/http/client"
  import { capital } from "$lib/utils/helpers"
  import { onMount } from "svelte"
  import { _ } from "svelte-i18n"
  import {
    filterEmployeesWithRelations,
    sortSearchResultsByName,
    visiblePhoneNumbers,
    type OrgViewerSearchResult,
  } from "./search"
  import { OrgViewerEmployeeSearchDocument, OrgViewerOrgUnitSearchDocument } from "./queries"

  let searchType: "org_unit" | "employee" = "org_unit"
  let query = ""
  let results: OrgViewerSearchResult[] | null = null
  let searchInput: HTMLInputElement

  $: placeholder = capital(
    $_(searchType === "org_unit" ? "orgviewer.enter_organisation" : "orgviewer.enter_person")
  )

  // No debounce: search is submit-triggered only, matching Search.vue (its
  // `timeout` field was declared but never actually used to debounce
  // anything).
  const search = async () => {
    try {
      if (searchType === "org_unit") {
        const res = await graphQLClient().request(OrgViewerOrgUnitSearchDocument, {
          query,
          ancestor: [env.PUBLIC_ORGVIEWER_ROOT_UUID],
        })
        results = res.org_units.objects
          .map((o) => o.validities[0])
          .filter(Boolean)
          .map((u) => ({
            kind: "org_unit" as const,
            uuid: u.uuid,
            name: u.name,
            addresses: u.addresses,
          }))
      } else {
        const relationType = env.PUBLIC_ORGVIEWER_ORG_PERSON_RELATION
        const res = await graphQLClient().request(OrgViewerEmployeeSearchDocument, {
          query,
          includeEngagements: relationType === "engagement" || relationType === "both",
          includeAssociations: relationType === "association" || relationType === "both",
        })
        const employees = filterEmployeesWithRelations(
          res.employees.objects.map((o) => o.validities[0]).filter(Boolean)
        )
        results = employees.map((e) => ({
          kind: "employee" as const,
          uuid: e.uuid,
          name: e.name,
          nickname: e.nickname,
          addresses: e.addresses,
        }))
      }

      results = sortSearchResultsByName(results)
    } catch (err) {
      console.error("Error during search:", err)
      results = []
    }
  }

  onMount(() => {
    searchInput?.focus()
  })
</script>

<section class="mx-auto max-w-4xl p-4">
  <h2 class="text-center">{capital($_("orgviewer.search_title"))}</h2>

  <form
    on:submit|preventDefault={search}
    class="mt-4 flex flex-wrap items-center justify-center gap-4"
  >
    <div class="flex gap-4">
      <label class="label cursor-pointer gap-2">
        <input type="radio" class="radio radio-primary radio-sm" bind:group={searchType} value="org_unit" />
        {capital($_("organisation"))}
      </label>
      <label class="label cursor-pointer gap-2">
        <input type="radio" class="radio radio-primary radio-sm" bind:group={searchType} value="employee" />
        {capital($_("orgviewer.search_type_person"))}
      </label>
    </div>

    <label for="search-input" class="sr-only">{capital($_("search"))}</label>
    <input
      type="search"
      id="search-input"
      bind:value={query}
      {placeholder}
      bind:this={searchInput}
      class="input input-bordered input-sm w-full max-w-xs rounded text-base font-normal"
    />
    <button type="submit" class="btn btn-primary btn-sm rounded-sm font-normal normal-case">
      {capital($_("search"))}
    </button>
  </form>

  {#if results && results.length > 0}
    <div class="mt-6">
      <h3 class="text-center" tabindex="-1">
        {$_("orgviewer.search_results_count", { values: { n: results.length } })}
      </h3>
      <ul class="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {#each results as result (result.uuid)}
          <li class="card border border-base-300 bg-base-100 p-3">
            {#if result.kind === "org_unit"}
              <a href={`${base}/orgviewer/orgunit/${result.uuid}`} class="hover:no-underline">
                <div class="text-xs tracking-wide text-base-content/60 uppercase">
                  {capital($_("unit", { values: { n: 1 } }))}
                </div>
                <div class="font-medium">{result.name}</div>
                {#each visiblePhoneNumbers(result.addresses) as phone}
                  <div class="text-sm text-base-content/60">{phone}</div>
                {/each}
              </a>
            {:else}
              <a href={`${base}/orgviewer/person/${result.uuid}`} class="hover:no-underline">
                <div class="text-xs tracking-wide text-base-content/60 uppercase">
                  {capital($_("orgviewer.search_type_person"))}
                </div>
                <div class="font-medium">
                  {env.PUBLIC_ORGVIEWER_SHOW_NICKNAME && result.nickname
                    ? result.nickname
                    : result.name}
                </div>
                {#each visiblePhoneNumbers(result.addresses) as phone}
                  <div class="text-sm text-base-content/60">{phone}</div>
                {/each}
              </a>
            {/if}
          </li>
        {/each}
      </ul>
    </div>
  {:else if results}
    <p class="mt-6 text-center text-base-content/60">{capital($_("orgviewer.no_search_results"))}</p>
  {/if}
</section>
