<script lang="ts">
  import indexPageImage from "$lib/assets/index_page_image.png"
  import { date } from "$lib/stores/date"

  console.log("instant", $date)
  $: console.log("date", $date, typeof $date)
</script>

<svelte:head>
  <title>OS2mo</title>
</svelte:head>

<div class="m-auto">
  <img class="rounded-full" src={indexPageImage} alt="velkommen tilbage til os2mo" />
</div>
