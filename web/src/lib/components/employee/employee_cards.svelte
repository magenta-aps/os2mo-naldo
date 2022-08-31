<script lang="ts">
  // TODO: Get the employee interface from Strawberry
  export let employees: any[]
</script>

<div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
  {#each employees as employee}
    <div class="card w-44 bg-base-200 rounded-xl shadow-xl hover:ring-2">
      <a href={`employee/${employee.uuid}`}>
        <figure class="px-10 pt-10">
          <img
            src="https://placeimg.com/80/80/people"
            alt={employee.name}
            class="rounded-xl"
          />
        </figure>
        <div class="card-body items-center text-center">
          <h2 class="card-title text-sm">{employee.name}</h2>
          <p>{employee.cpr_no}</p>
        </div>
      </a>
    </div>
  {/each}
</div>
