<script lang="ts">
  import { _ } from "svelte-i18n"
  import indexPageImage from "$lib/assets/index_page_image.svg"
</script>

<svelte:head>
  <title>OS2mo</title>
</svelte:head>

<div class="grid grid-cols-1 px-4 xl:px-12 pt-10 gap-4 xl:gap-20">
  <!-- Main Content with Welcome Message and Image -->
  <div>
    <h1 class="mb-2 text-primary text-center">
      {$_("welcome_message")}
    </h1>
    <h3 class="mb-4 text-secondary text-center font-bold">
      {$_("mo")}
    </h3>
    <img
      class="mx-auto max-w-screen-sm"
      src={indexPageImage}
      alt={$_("welcome_message")}
    />
  </div>
</div>
