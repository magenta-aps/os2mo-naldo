<script lang="ts">
  import { success } from "$lib/stores/alert"
  import Icon from "$lib/components/icon.svelte"

  export let uuid: string
  export let name: string

  const copyToClipboard = () => {
    navigator.clipboard.writeText(uuid).then(() => {
      $success = { message: `${name} blev kopieret`, type: "clipboard" }
    })
  }
</script>

<div class="tooltip tooltip-bottom" data-tip="Kopier {name} uuid">
  <button
    on:click={copyToClipboard}
    class="btn btn-sm btn-outline btn-primary rounded normal-case font-normal text-base"
  >
    <Icon type="clipboard" />
  </button>
</div>
