<script lang="ts">
  import { _ } from "svelte-i18n"
  import indexPageImage from "$lib/assets/index_page_image.svg"
</script>

<svelte:head>
  <title>OS2mo</title>
</svelte:head>

<div class="grid grid-cols-1 px-4 xl:px-12 pt-10 gap-4 xl:gap-20 overflow-hidden">
  <!-- Main Content with Welcome Message and Image -->
  <div class="flex justify-center w-full">
    <div class="w-full max-w-(--breakpoint-lg) -ml-[386px]">
      <!-- Adjust 160px based on the sidebar width -->
      <h1 class="mb-2 text-primary text-center">
        {$_("welcome_message")}
      </h1>
      <h3 class="mb-4 text-base-content text-center font-bold">
        {$_("mo")}
      </h3>
      <img class="mx-auto max-w-xl" src={indexPageImage} alt={$_("welcome_message")} />
    </div>
  </div>
</div>
