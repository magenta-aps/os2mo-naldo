<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import { base } from "$app/paths"
  import { date } from "$lib/stores/date"
  import { env } from "$env/dynamic/public"
  import { isAdmin } from "$lib/stores/auth"
  import DateInput from "$lib/components/forms/shared/date_input.svelte"
  import User from "$lib/components/navbar/user.svelte"
  import Search from "$lib/components/search.svelte"
  import Icon from "@iconify/svelte"
  import personOutlineRounded from "@iconify/icons-material-symbols/person-outline-rounded"
  import homeWorkOutlineRounded from "@iconify/icons-material-symbols/home-work-outline-rounded"
  import menuRounded from "@iconify/icons-material-symbols/menu-rounded"
  import circleFlagsGb from "@iconify/icons-circle-flags/gb"
  import circleFlagsDa from "@iconify/icons-circle-flags/da"
  import adminPanelSettingsOutlineRounded from "@iconify/icons-material-symbols/admin-panel-settings-outline-rounded"
  import filePresentRounded from "@iconify/icons-material-symbols/file-present-rounded"
  import { locale } from "svelte-i18n"
  import { MOConfig } from "$lib/stores/config"

  let orgChecked: boolean

  let selectedDate = $date
  let timeout: NodeJS.Timeout | undefined

  // Debounces the global date picker to improve performance while scrolling through dates
  // A lot of components react to changes in $date, such as the org_tree
  $: if (selectedDate) {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      $date = selectedDate
    }, 500)
  }
</script>

<div class="navbar bg-secondary shadow-xl">
  <div class="navbar-start text-base-100">
    <label for="drawer" class="btn btn-square btn-ghost lg:hidden">
      <Icon icon={menuRounded} width="25" height="25" />
    </label>

    <a class="btn btn-ghost normal-case text-xl hover:no-underline" href="{base}/"
      >OS2mo</a
    >
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
            {#if env.PUBLIC_SHOW_ADMIN_PANEL && $isAdmin}
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
  </div>

  <div class="navbar-center">
    <div class="flex gap-2 items-center justify-center">
      <div class="text-base-100">
        <Icon icon={personOutlineRounded} width="25" height="25" />
      </div>
      <input type="checkbox" class="toggle" bind:checked={orgChecked} />

      <div class="text-base-100 pr-2">
        <Icon icon={homeWorkOutlineRounded} width="25" height="25" />
      </div>
      <div class="w-96 flex items-center justify-center">
        {#if orgChecked}
          <Search action="goto" type={"org-unit"} />
        {:else}
          <Search action="goto" type={"employee"} />
        {/if}
      </div>
      <div>
        <DateInput
          bind:value={selectedDate}
          id="other-end-date"
          max={new Date(new Date().getFullYear() + 50, 0).toISOString().split("T")[0]}
          noPadding={true}
        />
      </div>
    </div>
  </div>

  <div class="navbar-end flex">
    <User />
  </div>
</div>
