<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/utils/helpers"
  export let id: string
  export let name: string = id
  export let checked: boolean = true
</script>

<label class="label text-sm text-base-content cursor-pointer gap-4 pb-3">
  <input
    {id}
    {name}
    type="checkbox"
    value="true"
    class="toggle toggle-primary"
    bind:checked
  />
  {capital($_(checked ? "active" : "inactive"))}
</label>
