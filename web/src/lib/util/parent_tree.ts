import { graphQLClient } from "$lib/util/http"
import { gql } from "graphql-request"
import { GetParentDocument } from "./query.generated"

gql`
  query GetParent($uuid: [UUID!], $currentDate: DateTime) {
    org_units(filter: { uuids: $uuid }) {
      objects {
        current(at: $currentDate) {
          parent {
            name
            uuid
          }
        }
      }
    }
  }
`

const fetchParent = async (uuid: string, currentDate: string) => {
  const res = await graphQLClient().request(GetParentDocument, {
    uuid: uuid,
    currentDate: currentDate,
  })

  // Empty objects can happen when there's no present org after changing the global time
  return res.org_units.objects.length ? res.org_units.objects[0].current?.parent : null
}

export const fetchParentTree = async (
  uuid: string,
  currentDate: string
): Promise<{ name: string; uuid: any | null }[]> => {
  const parent = await fetchParent(uuid, currentDate)

  if (!parent) {
    return []
  }

  return [parent].concat(await fetchParentTree(parent.uuid, currentDate))
}
