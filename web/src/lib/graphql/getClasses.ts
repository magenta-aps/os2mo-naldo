export const getClasses = async (
  variables: {
    currentDate: string
    orgUuid: string | null
    facetUserKeys: string[]
  },
  signal?: AbortSignal
) => {
  const res = await graphQLClient(signal).request(FacetsAndClassesDocument, variables)
  return res.facets.objects
}
