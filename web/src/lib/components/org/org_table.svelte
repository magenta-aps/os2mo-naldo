<script lang="ts">
	export let data: Object
</script>

<div class="overflow-x-auto pt-5">
	<table class="table w-full">
		<!-- head -->
		<thead>
			<tr>
				{#each Object.keys(data) as key}
					<th>{key}</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			<tr>
				{#each Object.values(data) as value}
					<td>{value}</td>
				{/each}
			</tr>
		</tbody>
	</table>
</div>
