<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  import { base } from "$app/paths"
  import { page } from "$app/stores"
  import Icon from "@iconify/svelte"
  import categoryIcon from "@iconify/icons-material-symbols/category-outline"
  import computerIcon from "@iconify/icons-material-symbols/computer-outline"

  const adminTabs = [
    {
      name: "class",
      path: "/admin/facet",
      icon: categoryIcon,
    },
    {
      name: "itsystem",
      path: "/admin/itsystem",
      icon: computerIcon,
    },
  ]
</script>

<div class="flex flex-col h-full py-2">
  <div class="flex-1 overflow-y-auto xl:overflow-y-hidden pb-10">
    <ul class="menu pt-6 px-5 bg-base-100 text-base-content w-full">
      <h4 class="font-bold text-base-content pb-4 uppercase tracking-wide">
        {capital($_("administration"))}
      </h4>

      {#each adminTabs as tab}
        <li class="py-0.5">
          <a
            href="{base}{tab.path}"
            class="flex items-center gap-4 py-3 rounded-sm text-base-content hover:no-underline {$page
              .url.pathname === tab.path
              ? 'bg-accent'
              : ''}"
          >
            <Icon icon={tab.icon} width="24" height="24" />
            <span>{capital($_(tab.name, { values: { n: 2 } }))}</span>
          </a>
        </li>
      {/each}
    </ul>
  </div>
</div>
