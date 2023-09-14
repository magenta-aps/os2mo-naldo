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

type Tense = "past" | "present" | "future"
