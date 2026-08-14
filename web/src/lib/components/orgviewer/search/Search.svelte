<script lang="ts">
  import { base } from "$app/paths"
  import { env } from "$lib/env"
  import { orgviewerGraphQLClient } from "$lib/http/orgviewerClient"
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
        const res = await orgviewerGraphQLClient().request(OrgViewerOrgUnitSearchDocument, {
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
        const res = await orgviewerGraphQLClient().request(OrgViewerEmployeeSearchDocument, {
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

<section>
  <h2>{capital($_("orgviewer.search_title"))}</h2>

  <form on:submit|preventDefault={search}>
    <div>
      <label>
        <input type="radio" bind:group={searchType} value="org_unit" />
        {capital($_("organisation"))}
      </label>
      <label>
        <input type="radio" bind:group={searchType} value="employee" />
        {capital($_("orgviewer.search_type_person"))}
      </label>
    </div>

    <label for="search-input" class="sr-only">{capital($_("search"))}</label>
    <input type="search" id="search-input" bind:value={query} {placeholder} bind:this={searchInput} />
    <input type="submit" value={capital($_("search"))} />
  </form>

  {#if results && results.length > 0}
    <div>
      <h3 class="oc-search-results-header" tabindex="-1">
        {$_("orgviewer.search_results_count", { values: { n: results.length } })}
      </h3>
      <ul>
        {#each results as result (result.uuid)}
          <li>
            {#if result.kind === "org_unit"}
              <a href={`${base}/orgviewer/orgunit/${result.uuid}`}>
                <span>{capital($_("unit", { values: { n: 1 } }))}</span><br />
                {result.name}<br />
                {#each visiblePhoneNumbers(result.addresses) as phone}
                  <div>{phone}</div>
                {/each}
              </a>
            {:else}
              <a href={`${base}/orgviewer/person/${result.uuid}`}>
                <span>{capital($_("orgviewer.search_type_person"))}</span><br />
                {env.PUBLIC_ORGVIEWER_SHOW_NICKNAME && result.nickname
                  ? result.nickname
                  : result.name}<br />
                {#each visiblePhoneNumbers(result.addresses) as phone}
                  <div>{phone}</div>
                {/each}
              </a>
            {/if}
          </li>
        {/each}
      </ul>
    </div>
  {:else if results}
    <p>{capital($_("orgviewer.no_search_results"))}</p>
  {/if}
</section>
