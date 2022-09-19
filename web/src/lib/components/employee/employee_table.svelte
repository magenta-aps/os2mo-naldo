<script lang="ts">
  import { base } from "$app/paths"

  // TODO: Get the employee interface from Strawberry
  export let employees: any[]
</script>

<div class="overflow-x-auto w-full">
  <table class="table table-zebra w-full">
    <thead>
      <tr>
        <th>Name</th>
        <th>CPR</th>
        <th />
      </tr>
    </thead>
    <tbody>
      {#each employees as employee}
        <tr class="hover">
          <td>
            <div class="flex items-center space-x-3">
              <div class="avatar">
                <div class="mask mask-squircle w-12 h-12">
                  <img
                    src="https://placeimg.com/80/80/people"
                    alt="Avatar Tailwind CSS Component"
                  />
                </div>
              </div>
              <div class="font-bold">{employee.name}</div>
            </div>
          </td>
          <td>{employee.cpr_no}</td>
          <th>
            <a href={`${base}/employee/${employee.uuid}`}>
              <button class="btn btn-xs">detaljer</button>
            </a>
          </th>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
