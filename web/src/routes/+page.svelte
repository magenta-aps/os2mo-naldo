<script lang="ts">
  import { _ } from "svelte-i18n"
  import indexPageImage from "$lib/assets/alex.jpg"
  import { doomStore } from "$lib/stores/doomStore"
  import Ads from "$lib/components/Ads.svelte"
  import "$lib/assets/party.css"
</script>

<svelte:head>
  <title>OS2mo</title>
</svelte:head>


<div class="grid grid-cols-1 px-4 xl:px-12 pt-10 gap-4 xl:gap-20 overflow-hidden">
  <!-- Main Content with Welcome Message and Image -->
  <div class="flex justify-center w-full">
    <div class="w-full max-w-screen-lg -ml-[386px]">
      <!-- Adjust 160px based on the sidebar width -->
      <h1 class="mb-2 text-primary text-center 🦜">
        {$_("welcome_message")}
      </h1>
      <h3 class="mb-4 text-secondary text-center font-bold 🦜">
        {$_("mo")}
      </h3>
      {#if $doomStore.enable }
        <style>
            #DOOM > .dosbox-container { width: 640px; height: 400px; }
            #DOOM > .dosbox-container > .dosbox-overlay { background: url("https://thedoggybrad.github.io/doom_on_js-dos/DOOM.png"); }
        </style>
        <div class="mx-auto max-w-xl dosbox-default" id="DOOM"></div>

        <script type="text/javascript">
          var dosbox_DOOM = new Dosbox({
            id: "DOOM",
            onload: function (dosbox) {
              dosbox_DOOM.run("https://thedoggybrad.github.io/doom_on_js-dos/DOOM-@evilution.zip", "./DOOM/DOOM.EXE");
            },
            onrun: function (dosbox, app) {
              console.log("App '" + app + "' is runned");
            }
          });
        </script>

        <h2>Controls</h2>
        <ul>
          <li> Move: UP, DOWN, LEFT, RIGHT </li>
          <li> Use: W </li>
          <li> Fire: S </li>
          <li> Speed on: SPACE </li>
          <li> Strafe on: ALT </li>
          <li> Strafe: A, D </li>
          <li> Change Weapon: 1, 2, 3, 4, 5, 6, 7 </li>
        </ul>
      {:else}
        <img class="mx-auto max-w-xl 🦜"  src={indexPageImage} alt={$_("welcome_message")} />
      {/if}
      <Ads />
    </div>
  </div>
</div>
