export type Facet = {
  objects: {
    uuid: any
    user_key: string
    classes?: { name: string; uuid: any; user_key: string }[]
  }[]
}

export const getClassesByFacetUserKey = (facets: Facet[], user_key: string) => {
  const foundFacet = facets.find((facet) => facet.objects[0].user_key === user_key)
  if (!foundFacet) {
    throw new Error("user_key did not match any of the given facets")
  }
  return foundFacet.objects[0].classes?.sort((a, b) => (a.name > b.name ? 1 : -1))
}

type Class = {
  objects: {
    uuid: any
    user_key: string
    name?: string
  }[]
}

export const getClassUuidByUserKey = (classes: Class[], user_key: string) => {
  // Maybe this isn't the best way? The problem is we don't know the order in which the classes come in, so I guess we need something like this?
  const foundClass = classes.find((cls) => cls.objects[0].user_key === user_key)
  if (!foundClass) {
    throw new Error("user_key did not match any of the given classes")
  }
  return foundClass.objects[0].uuid
}

// Temporary function to just get specific facet
// Should be removed when it's possible to create classes for all facets
export const getSpecificFacet = (facets: Facet[], user_key: string) => {
  const foundFacet = facets.find((facet) => facet.objects[0].user_key === user_key)
  return {
    uuid: foundFacet?.objects[0].uuid,
    name: foundFacet?.objects[0].user_key || "",
  }
}
