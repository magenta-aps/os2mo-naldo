interface Autocomplete {
  uuid: string
  name: string
  path: string[]
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

// Will be sortable if given a sortPath
type Header = {
  title: string
  sortPath?: string
}
