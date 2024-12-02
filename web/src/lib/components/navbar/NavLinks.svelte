<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import { base } from "$app/paths"
  import { env } from "$env/dynamic/public"
  import { isAdmin } from "$lib/stores/auth"
  import { MOConfig } from "$lib/stores/config"

  let openDropdown: boolean = false

  const handleClickItem = () => {
    openDropdown = false
  }
</script>

<ul class="menu menu-horizontal px-1 hidden xl:flex">
  <li>
    <details bind:open={openDropdown}>
      <summary class="flex font-bold"
        >{capital($_("link", { values: { n: 2 } }))}</summary
      >
      <ul class="dropdown-content p-2 menu z-[1] rounded w-max">
        <li>
          <a
            on:click={handleClickItem}
            class="w-100 text-secondary hover:no-underline"
            href="{base}/reports">{capital($_("report", { values: { n: 2 } }))}</a
          >
        </li>
        {#if $isAdmin}
          {#if env.PUBLIC_SHOW_ADMIN_PANEL !== "false"}
            <li>
              <a
                on:click={handleClickItem}
                class="w-100 text-secondary hover:no-underline"
                href="{base}/admin">{capital($_("classifications"))}</a
              >
            </li>
          {/if}
          {#if env.PUBLIC_SHOW_INSIGHTS !== "false"}
            <li>
              <a
                on:click={handleClickItem}
                class="w-100 text-secondary hover:no-underline"
                href="{base}/insights">{capital($_("insights"))}</a
              >
            </li>
          {/if}
        {/if}
        <!-- Show by default -->
        {#if env.PUBLIC_DOCS_LINK !== "false"}
          <li>
            <a
              on:click={handleClickItem}
              class="w-100 text-secondary hover:no-underline"
              href="https://rammearkitektur.docs.magenta.dk/os2mo/home/manual.html"
              target="_blank">{capital($_("documentation"))}</a
            >
          </li>
        {/if}
        <li>
          <a
            on:click={handleClickItem}
            class="w-100 text-secondary hover:no-underline"
            href="{env.PUBLIC_BASE_URL}/graphql"
            target="_blank">{capital($_("graphql"))}</a
          >
        </li>
        <!-- Don't show by default -->
        {#if env.PUBLIC_ONBOARDING_LINK === "true"}
          <li>
            <a
              on:click={handleClickItem}
              class="w-100 text-secondary hover:no-underline"
              href="{base}/userflow"
            >
              {capital($_("onboarding"))}</a
            >
          </li>
        {/if}

        {#if $MOConfig && JSON.parse($MOConfig.navlinks).length}
          {@const links = JSON.parse($MOConfig.navlinks)}
          {#each links as link}
            <li>
              <a
                on:click={handleClickItem}
                class="w-100 text-secondary hover:no-underline"
                href={link.href}>{link.text}</a
              >
            </li>
          {/each}
        {/if}
      </ul>
    </details>
  </li>
</ul>
