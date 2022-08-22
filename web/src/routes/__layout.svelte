<script lang="ts">
	import '$lib/global.css'
	import Navbar from '$lib/components/navbar.svelte'
	import Footer from '$lib/components/footer.svelte'
	import DrawerContent from '$lib/components/drawer_content.svelte'

	let drawerToggled: boolean
</script>

<div class="drawer drawer-mobile">
	<input id="my-drawer-3" type="checkbox" class="drawer-toggle" bind:checked={drawerToggled} />
	<div class="drawer-content flex flex-col">
		<!-- Page content here -->
		<Navbar />
		<slot />
	</div>
	<div class="drawer-side">
		<label for="my-drawer-3" class="drawer-overlay" />
		<ul class="menu p-4 overflow-y-auto w-80 bg-base-300">
			<!-- Sidebar content here -->
			<div class="flex-none">
				<a class="btn btn-ghost normal-case text-xl" href="/">OS2mo</a>
			</div>
			<DrawerContent />
		</ul>
	</div>
</div>
<Footer />
