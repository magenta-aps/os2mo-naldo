import { graphQLClient } from "$lib/util/http"
import { gql } from "graphql-request"
import { GetParentDocument } from "./query.generated"

gql`
  query GetParent($uuid: [UUID!], $fromDate: DateTime) {
    org_units(filter: { uuids: $uuid, from_date: $fromDate }) {
      objects {
        validities {
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

  // Empty objects can happen when there's no present org after changing the global time
  return res.org_units.objects.length
    ? res.org_units.objects[0].validities[0].parent
    : null
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
