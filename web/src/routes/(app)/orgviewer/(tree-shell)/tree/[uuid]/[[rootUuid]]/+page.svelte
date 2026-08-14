<script lang="ts">
  import { capital } from "$lib/utils/helpers"
  import { _ } from "svelte-i18n"
</script>

<!-- Tree-only view: the tree itself is rendered by the (tree-shell) layout;
     there's nothing further to show here until an org unit or person is
     selected (see the sibling orgunit/ and person/ routes). -->
<p class="p-4 text-base-content/60">{capital($_("orgviewer.select_a_unit"))}</p>
