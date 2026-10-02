const BASE_URL = "https://adressevaelger.dk"
const MIN_QUERY_LENGTH = 3
const MAX_QUERY_LENGTH = 73 // the API rejects longer queries

export type AdressevaelgerEndpoint = "husnumre" | "adresser"

export type AdressevaelgerHit =
  | { type: "adresse" | "husnummer"; id: string; titel: string }
  | {
      type: "navngivenvejpostnummer"
      titel: string
      vejnavn: string
      postnr: string
      postdistrikt: string
    }
  | { type: "vejnavn" | "vejnavnhusnummer"; titel: string }

// A husnummer id is the uuid DAWA called `adgangsadresse.id`, so values saved
// through DAWA still resolve.
export type AddressSelection = { id: string; titel: string }

export type Narrowing = {
  text: string
  caret: number
}

const narrow = (text: string): Narrowing => ({ text, caret: text.length })

// Vague searches return streets, and in address mode house numbers. Picking one
// narrows the search instead of selecting it, like KDS's own component.
export const pick = (
  hit: AdressevaelgerHit,
  endpoint: AdressevaelgerEndpoint
): AddressSelection | Narrowing => {
  switch (hit.type) {
    case "adresse":
      return { id: hit.id, titel: hit.titel }
    case "husnummer":
      return endpoint === "husnumre"
        ? { id: hit.id, titel: hit.titel }
        : narrow(hit.titel)
    case "navngivenvejpostnummer": {
      // A house number only matches when typed before the postcode
      const street = `${hit.vejnavn} `
      return {
        text: `${street}, ${hit.postnr} ${hit.postdistrikt}`,
        caret: street.length,
      }
    }
    case "vejnavn":
      return narrow(`${hit.titel} `)
    case "vejnavnhusnummer": // a partial road name and a number, in any town
      return narrow(hit.titel)
  }
}

export const searchAddresses = async (
  endpoint: AdressevaelgerEndpoint,
  query: string,
  token: string,
  signal: AbortSignal
): Promise<AdressevaelgerHit[]> => {
  const tekst = query.trim()
  if (tekst.length < MIN_QUERY_LENGTH || tekst.length > MAX_QUERY_LENGTH) return []

  const params = new URLSearchParams({ tekst, token })
  const res = await fetch(`${BASE_URL}/${endpoint}/soeg?${params}`, { signal })
  // Rejected requests, e.g. without a token, explain why in plain text
  if (!res.ok) throw new Error(`Adressevælger ${res.status}: ${await res.text()}`)

  const { status, beskrivelse, fund } = await res.json()
  if (status !== "ok" || !Array.isArray(fund)) {
    throw new Error(`Adressevælger: ${beskrivelse ?? "unexpected response"}`)
  }
  return fund
}
