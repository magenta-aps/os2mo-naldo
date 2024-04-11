<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import { base } from "$app/paths"
  import { env } from "$env/dynamic/public"
  import { isAdmin } from "$lib/stores/auth"
  import { MOConfig } from "$lib/stores/config"
</script>

<ul class="menu menu-horizontal px-1">
  <li>
    <details>
      <summary class="flex font-bold"
        >{capital($_("link", { values: { n: 2 } }))}</summary
      >
      <ul class="dropdown-content p-2 menu z-[1] rounded w-max">
        <li>
          <a class="w-100 text-secondary hover:no-underline" href="{base}/reports"
            >{capital($_("report", { values: { n: 2 } }))}</a
          >
        </li>
        {#if env.PUBLIC_SHOW_ADMIN_PANEL === "true" && $isAdmin}
          <li>
            <a class="w-100 text-secondary hover:no-underline" href="{base}/admin"
              >{capital($_("admin_panel"))}</a
            >
          </li>
        {/if}
        {#if $MOConfig && JSON.parse($MOConfig.navlinks).length}
          {@const links = JSON.parse($MOConfig.navlinks)}
          {#each links as link}
            <li>
              <a class="w-100 text-secondary hover:no-underline" href={link.href}
                >{link.text}</a
              >
            </li>
          {/each}
        {/if}
      </ul>
    </details>
  </li>
</ul>
