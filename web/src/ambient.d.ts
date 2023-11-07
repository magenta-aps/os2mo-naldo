interface Autocomplete {
  uuid: string
  name: string
  attrs: {
    uuid: string
    value: string
    title: string
  }[]
  path?: string[]
}

interface SearchResult {
  uuid: string
  name: string
  // extra: {

  // }[]
}

interface DarAddressResponse {
  tekst: string | null | undefined
  adresse: {
    id: string
  }
  adgangsadresse: {
    id: string
  }
}
;[]

type Tense = "past" | "present" | "future"
