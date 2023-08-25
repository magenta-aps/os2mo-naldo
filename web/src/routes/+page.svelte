<script lang="ts">
  import indexPageImage from "$lib/assets/index_page_image.png"
  import NewSearch from "$lib/components/new_search.svelte"
</script>

<svelte:head>
  <title>OS2mo</title>
</svelte:head>

<NewSearch />

<div class="m-auto">
  <img class="rounded-full" src={indexPageImage} alt="velkommen tilbage til os2mo" />
</div>

