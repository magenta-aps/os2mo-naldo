type Facet = {
  uuid: any
  user_key: string
  classes: Array<{ __typename?: "Class"; name: string; uuid: any }>
}

export const getClassesByFacetUserKey = (facets: Facet[], user_key: string) => {
  const foundFacet = facets.find((facet) => facet.user_key === user_key)
  if (!foundFacet) {
    throw new Error("user_key did not match any of the given facets")
  }
  return foundFacet.classes.sort((a, b) => (a.name > b.name ? 1 : -1))
}
