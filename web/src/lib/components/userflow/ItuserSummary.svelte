<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import { ituserInfo } from "$lib/stores/ituserInfoStore"
</script>

<div>
  <h3 class=" text-primary">{capital($_("ituser", { values: { n: 2 } }))}</h3>
  {#each $ituserInfo as ituser, index}
    {#if ituser.validated === true}
      <div class="grid gap-1 pb-2 text-secondary">
        <h4>
          {capital($_("ituser", { values: { n: 1 } }))}
          {index + 1}
        </h4>
        <div class="pb-1">
          <div class="grid grid-cols-2">
            <span>{capital($_("date.start_date"))}:</span>
            <span>{ituser.fromDate}</span>
          </div>
          <div class="grid grid-cols-2">
            <span>{capital($_("date.end_date"))}:</span>
            <span>{ituser.toDate}</span>
          </div>
          <div class="grid grid-cols-2">
            <span>{capital($_("itsystem"))}:</span>
            <span>{ituser.itSystem.name}</span>
          </div>
          <div class="grid grid-cols-2">
            <span>{capital($_("account_name"))}:</span>
            <span>{ituser.userkey}</span>
          </div>
          <div class="grid grid-cols-2">
            <span>{capital($_("primary"))}:</span>
            <span>{ituser.primary.name || ""}</span>
          </div>
          <div class="grid grid-cols-2">
            <span>{capital($_("notes"))}:</span>
            <span>{ituser.notes || ""}</span>
          </div>
        </div>

        {#if ituser.rolebindings.length > 0}
          <h4>
            {capital($_("rolebinding", { values: { n: 2 } }))}:
          </h4>
          <div>
            {#each ituser.rolebindings as rolebinding}
              {#if rolebinding.validated === true}
                <div class="grid grid-cols-2">
                  <span>{capital($_("role", { values: { n: 1 } }))}:</span>
                  <span>{rolebinding.role.name}</span>
                </div>
              {/if}
            {/each}
          </div>
        {/if}
      </div>
    {/if}
  {/each}
</div>
