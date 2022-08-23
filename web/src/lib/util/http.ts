import { keycloak } from "$lib/util/keycloak"
export const fetchGraph = async (query: string): Promise<Response> => {
  const token = keycloak ? keycloak.token : "Keycloak disabled"

  return await fetch("http://localhost:5000/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify({
      query: query,
    }),
  })
}
