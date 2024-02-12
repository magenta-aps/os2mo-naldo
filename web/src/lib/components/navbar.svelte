<script lang="ts">
  import { base } from "$app/paths"
  import { date } from "$lib/stores/date"
  import { isAdmin } from "$lib/stores/auth"
  import { keycloak } from "$lib/util/keycloak"
  import DateInput from "$lib/components/forms/shared/date_input.svelte"
  import Avatar from "$lib/components/navbar/avatar.svelte"
  import Search from "$lib/components/search.svelte"
  import Icon from "@iconify/svelte"
  import personOutlineRounded from "@iconify/icons-material-symbols/person-outline-rounded"
  import homeWorkOutlineRounded from "@iconify/icons-material-symbols/home-work-outline-rounded"
  import menuRounded from "@iconify/icons-material-symbols/menu-rounded"
  import circleFlagsGb from "@iconify/icons-circle-flags/gb"
  import circleFlagsDa from "@iconify/icons-circle-flags/da"
  import adminPanelSettingsOutlineRounded from "@iconify/icons-material-symbols/admin-panel-settings-outline-rounded"
  import { locale } from "svelte-i18n"

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

  function changeLanguage(event: any) {
    locale.set(event.currentTarget.value)
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
    <div class="join gap-2 pr-4">
      <input
        type="radio"
        id="lang-en"
        name="lang"
        value="en"
        class="join-item hidden"
        on:change={changeLanguage}
      />
      <label for="lang-en">
        <Icon class="cursor-pointer" icon={circleFlagsGb} width="25" height="25" />
      </label>
      <input
        type="radio"
        id="lang-da"
        name="lang"
        value="da"
        class="join-item hidden"
        on:change={changeLanguage}
      />
      <label for="lang-da">
        <Icon class="cursor-pointer" icon={circleFlagsDa} width="25" height="25" />
      </label>
    </div>

    {#if $isAdmin}
      <a class="text-base-100 pr-4" href="{base}/admin"
        ><Icon icon={adminPanelSettingsOutlineRounded} width="25" height="25" /></a
      >
    {/if}
    <Avatar />
  </div>
</div>
