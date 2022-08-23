<script lang="ts">
  import { fetchGraph } from "$lib/util/http"

  let cardView = true
  let input = ""

  const query = `
      query {
        employees {
          objects {
            name
            cpr_no
            uuid
          }
        }
      }
  `

  const search = (employees: Array<any>, input: string) => {
    if (input.length > 2) {
      const x = employees.filter((x) =>
        x.objects.every((y) => y.name.toLowerCase().includes(input.toLowerCase()))
      )
      console.log(x.length)
      return x
    }
    return employees
  }

  const fetchEmoloyeesGraph = async () => {
    const res = await fetchGraph(query)

    const json = await res.json()
    if (json.data) {
      return json.data.employees
    } else {
      throw new Error(json.errors[0].message)
    }
  }
</script>

<div class="h-screen m-auto p-10">
  <div class="card bg-base-200 shadow-xl">
    <div class="card-body grid grid-cols-2">
      <h2 class="card-title">Medarbejdere</h2>
      <input
        type="text"
        placeholder="Søg"
        class="input input-bordered"
        bind:value={input}
      />
      <div>
        <label>
          <input
            type="radio"
            name="radio-1"
            class="radio"
            value={true}
            bind:group={cardView}
          />
        </label>
        <label>
          <input
            type="radio"
            name="radio-1"
            class="radio"
            value={false}
            bind:group={cardView}
          />
        </label>
      </div>
    </div>
  </div>
  <div class="pt-5">
    {#await fetchEmoloyeesGraph()}
      <div class="flex justify-center pt-10">
        <div class="animate-spin rounded-full h-32 w-32 border-b-8 border-primary" />
      </div>
    {:then employees}
      {#if cardView}
        <div
          class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-6 gap-4"
        >
          {#each search(employees, input) as employee}
            <div class="card w-44 bg-base-200 rounded-xl shadow-xl">
              <a href={`employee/${employee.objects[0].uuid}`}>
                <figure class="px-10 pt-10">
                  <img
                    src="https://placeimg.com/80/80/people"
                    alt={employee.objects[0].name}
                    class="rounded-xl"
                  />
                </figure>
                <div class="card-body items-center text-center">
                  <h2 class="card-title text-sm">{employee.objects[0].name}</h2>
                  <p>{employee.objects[0].cpr_no}</p>
                </div>
              </a>
            </div>
          {/each}
        </div>
      {:else}
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
              {#each search(employees, input) as employee}
                <tr>
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
                      <div class="font-bold">{employee.objects[0].name}</div>
                    </div>
                  </td>
                  <td>{employee.objects[0].cpr_no}</td>
                  <th>
                    <a href={`employee/${employee.objects[0].uuid}`}>
                      <button class="btn btn-xs">detaljer</button>
                    </a>
                  </th>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}
    {/await}
  </div>
</div>
