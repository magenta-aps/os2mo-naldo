import { graphQLClient } from "$lib/util/http"
import { GetParentDocument } from "./query.generated"
import { gql } from "graphql-request"

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
