<script lang="ts">
  import Select from "svelte-select"
  import EmployeeItem from "./employee_item.svelte"

  const itemId = "uuid"
  let value: {
    uuid: string
    name: string
    attrs: {
      uuid: string
      value: string
      title: string
    }[]
  } | null = null

  const getEmployee = async (filterText: string) => {
    if (!filterText.length) return Promise.resolve([])
    if (filterText.length < 3) return Promise.resolve([])

    const res = await fetch(
      `http://localhost:5001/service/e/autocomplete/?query=${filterText}`
    )
    const json = await res.json()
    return json.items
  }
</script>

<Select
  loadOptions={getEmployee}
  {itemId}
  bind:value
  placeholder="Søg efter mennesker"
  on:select={() => {console.log("You've selected:", value)}}
>
  <div slot="item" let:item>
    <EmployeeItem {item} wantedAttrs={["Email"]}/>
  </div>

  <div slot="selection" let:selection>
    <EmployeeItem item={selection} wantedAttrs={["Email"]} />
  </div>
</Select>
