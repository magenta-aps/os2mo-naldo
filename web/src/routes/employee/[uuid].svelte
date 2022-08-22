<script lang="ts">
	import { page } from '$app/stores'

	$: uuid = $page.params.uuid
</script>

<div class="m-auto">
	<h1 class="text-xl">{uuid}</h1>
</div>
