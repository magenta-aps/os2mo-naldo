<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import { page } from "$app/stores"
  import { fetchGraph } from "$lib/util/http"

  enum Title {
    ORGANISATION = "organisation",
    EMPLOYEE = "employee",
    INSIGHT = "insight",
  }

  type TitleType = `${Title}`
  export let type: TitleType

  const fetchTitleName = async (uuid: string): Promise<String> => {
    let query: string

    // TODO: FIX THIS!!!!!!!!!!!
    switch (type) {
      case Title.ORGANISATION:
        query = `{
          org_units(filter: { uuids: "${uuid}" }) {
            objects {
              objects {
                name
              }
            }
          }
        }`
        return fetchGraph(query)
          .then((res) => res.json())
          .then((json) => json.data.org_units.objects[0].objects[0].name)
      // TODO: FIX THIS!!!!!!!!!!!
      case Title.EMPLOYEE:
        query = `{
          employees(filter: { uuids: "${uuid}" }) {
            objects {
              objects {
                name
              }
            }
          }
        }`
        return fetchGraph(query)
          .then((res) => res.json())
          .then((json) => json.data.employees.objects[0].objects[0].name)

      case Title.INSIGHT:
        return capital($_("insight"))

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
