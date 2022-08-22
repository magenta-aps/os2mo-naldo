<script lang="ts">
	let orgUnits = [
		{
			title: 'Lønorganisation',
			uuid: 'fb2d158f-114e-5f67-8365-2c520cf10b58',
			kids: [{ title: 'Skole og børn', kids: undefined }]
		},
		{
			title: 'Svendborg Kommune',

			uuid: 'f06ee470-9f17-566f-acbe-e938112d46d9',
			kids: [
				{
					title: 'Borgmesterens Afdeling',
					uuid: 'falhs23f231ff43-231f3214fg34-g3224g342g',
					kids: [
						{ title: 'Budget og Planlægning', uuid: 'asd', kids: undefined },
						{ title: 'Byudvikling', uuid: 'asd', kids: undefined }
					]
				},
				{
					title: 'Skole og børn',
					uuid: 'falhs23f231ff43-231f3214fg34-g3224g342g',
					kids: [
						{ title: 'IT-Support', uuid: 'asd', kids: undefined },
						{ title: 'Social indsats', uuid: 'asd', kids: undefined }
					]
				}
			]
		}
	]

	$: query = `
    query {
      org {
        uuid
        name
      }
    }
  `
	const fetchOrgs = async (query: string) => {
		const url = 'http://localhost:5000/graphql'
		const res = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				query: query
			})
		})

		const response = await res.json()
		if (response.data) {
			return response.data.org
		} else {
			throw new Error(response.errors[0].message)
		}
	}
</script>

<ul class="menu p-4 overflow-y-auto bg-base-300 text-base-content">
	<!-- Sidebar content here -->
	<li class="mb-2"><a href="/employee">Medarbejdere</a></li>

	<div class="divider" />
	{#await fetchOrgs(query)}
		<div class="animate-spin rounded-full h-32 w-32 border-b-8 border-primary" />
	{:then orgs}
		<p>{orgs.name}</p>
	{:catch error}
		<div class="px-10">
			<p>{error}</p>
		</div>
	{/await}
</ul>
