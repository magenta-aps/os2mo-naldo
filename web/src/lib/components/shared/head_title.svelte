<script lang="ts">
  import { page } from "$app/stores"
  import { fetchGraph } from "$lib/util/http"

  enum Title {
    ORGANIZATION = "organization",
    EMPLOYEE = "employee",
  }

  type TitleType = `${Title}`
  export let type: TitleType

  const fetchTitleName = async (uuid: string): Promise<String> => {
    let query: string

    switch (type) {
      case Title.ORGANIZATION:
        query = `{
          org_units(uuids: "${uuid}") {
            objects {
              name
            }
          }
        }`
        return fetchGraph(query)
          .then((res) => res.json())
          .then((json) => json.data.org_units[0].objects[0].name)

      case Title.EMPLOYEE:
        query = `{
          employees(uuids: "${uuid}") {
            objects {
              name
            }
          }
        }`
        return fetchGraph(query)
          .then((res) => res.json())
          .then((json) => json.data.employees[0].objects[0].name)

      default:
        throw TypeError("Wrong or no title type used")
    }
  }
</script>

<svelte:head>
  {#await fetchTitleName($page.params.uuid)}
    <title>... | OS2mo</title>
  {:then value}
    <title>{value} | OS2mo</title>
  {/await}
</svelte:head>
