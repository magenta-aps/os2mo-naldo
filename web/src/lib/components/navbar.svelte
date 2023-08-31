<script lang="ts">
  import { base } from "$app/paths"
  import { date } from "$lib/stores/date"
  import DateInput from "$lib/components/forms/shared/date_input.svelte"
  import Avatar from "$lib/components/navbar/avatar.svelte"
  import Search from "$lib/components/search.svelte"
  import Icon from "$lib/components/icon.svelte"

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
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        class="inline-block w-6 h-6 stroke-current"
        ><path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M4 6h16M4 12h16M4 18h16"
        /></svg
      >
    </label>

    <a class="btn btn-ghost normal-case text-xl hover:no-underline" href="{base}/"
      >OS2mo</a
    >
  </div>

  <div class="navbar-center">
    <div class="flex gap-2 items-center justify-center">
      <div class="text-base-100">
        <Icon type="user" />
      </div>
      <input type="checkbox" class="toggle" bind:checked={orgChecked} />

      <div class="text-base-100 pr-2">
        <Icon type="users" />
      </div>
      <div class="w-96 flex items-center justify-center">
        {#if orgChecked}
          <Search action="goto" type={"organisation"} />
        {:else}
          <Search action="goto" type={"employee"} wantedAttrs={["Email"]} />
        {/if}
      </div>
      <div>
        <DateInput
          bind:value={selectedDate}
          id="other-end-date"
          max={new Date(new Date().getFullYear() + 50, 0).toISOString().split("T")[0]}
          padding=""
        />
      </div>
    </div>
  </div>

  <div class="navbar-end">
    <Avatar />
  </div>
</div>
