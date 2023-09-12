import { enhance } from "$app/forms"
import { graphQLClient } from "$lib/util/http"
import { goto } from "$app/navigation"
import { base } from "$app/paths"
import { success, error } from "$lib/stores/alert"
import { GetParentDocument } from "./query.generated"
import { gql } from "graphql-request"
import { page } from "$app/stores"
import { date } from "$lib/stores/date"
import { getClassesByFacetUserKey } from "$lib/util/get_classes"

gql`
  query GetParent($uuid: [UUID!], $fromDate: DateTime) {
    org_units(filter: { uuids: $uuid, from_date: $fromDate }) {
      objects {
        objects {
          parent {
            name
            uuid
          }
        }
      }
    }
  }
`

const fetchParent = async (uuid: string, fromDate: string) => {
  const res = await graphQLClient().request(GetParentDocument, {
    uuid: uuid,
    fromDate: fromDate,
  })

  return res.org_units.objects[0].objects[0].parent
}

export const fetchParentTree = async (
  uuid: string,
  fromDate: string
): Promise<{ name: string; uuid: any | null }[]> => {
  const parent = await fetchParent(uuid, fromDate)

  if (!parent) {
    return []
  }

  return [parent].concat(await fetchParentTree(parent.uuid, fromDate))
}
