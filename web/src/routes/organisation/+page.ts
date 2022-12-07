import { fetchGraph } from "$lib/util/http"
import type { PageLoad } from "./$types"
import { date } from "$lib/stores/date"

export const load: PageLoad = async () => {
  let fromDate = ""
  date.subscribe((v) => (fromDate = v))

  const query = `{
    org_units(parents: null, from_date: "${fromDate}") {
      objects {
        addresses {
          name
          address_type {
            name
          }
        }
        name
        uuid
        children {
          name
          uuid
        }
      }
    }
  }`

  const res = await fetchGraph(query)
  // TODO: Type correctly
  const json: any = await res.json()

  return json.data
}
