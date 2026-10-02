import {
  pick,
  searchAddresses,
  type AdressevaelgerHit,
} from "$lib/utils/adressevaelger"
import { afterEach, describe, expect, it, vi } from "vitest"

const adresse: AdressevaelgerHit = {
  type: "adresse",
  id: "0a3f50bc-2876-32b8-e044-0003ba298018",
  titel: "Nr. Bjertvej 87, Nr Bjert, 6000 Kolding",
}
const husnummer: AdressevaelgerHit = {
  type: "husnummer",
  id: "0a3f5090-48fd-32b8-e044-0003ba298018",
  titel: "Nr. Bjertvej 87, Nr Bjert, 6000 Kolding",
}
const street: AdressevaelgerHit = {
  type: "navngivenvejpostnummer",
  titel: "Nr. Bjertvej 6000 Kolding",
  vejnavn: "Nr. Bjertvej",
  postnr: "6000",
  postdistrikt: "Kolding",
}
const roadName: AdressevaelgerHit = { type: "vejnavn", titel: "Lærkestien" }

const respond = (body: unknown, status = 200) =>
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status }))
  )

afterEach(() => {
  vi.unstubAllGlobals()
})

describe("pick", () => {
  it("selects a house number only when searching house numbers", () => {
    expect(pick(husnummer, "husnumre")).toEqual({
      id: husnummer.id,
      titel: husnummer.titel,
    })
    expect(pick(husnummer, "adresser")).toEqual({
      text: husnummer.titel,
      caret: husnummer.titel.length,
    })
  })

  it("puts the caret before the postcode of a street", () => {
    expect(pick(street, "husnumre")).toEqual({
      text: "Nr. Bjertvej , 6000 Kolding",
      caret: "Nr. Bjertvej ".length,
    })
  })

  it("leaves room for a house number after a road name", () => {
    expect(pick(roadName, "adresser")).toEqual({
      text: "Lærkestien ",
      caret: 11,
    })
  })
})

describe("searchAddresses", () => {
  const signal = new AbortController().signal

  it("queries the endpoint with the trimmed query, token and abort signal", async () => {
    respond({ status: "ok", beskrivelse: "", fund: [adresse] })
    const hits = await searchAddresses("adresser", " Nr. Bjertvej 87 ", "tok", signal)

    expect(hits).toEqual([adresse])
    const [requested, init] = vi.mocked(fetch).mock.calls[0]
    const url = new URL(requested as string)
    expect(url.origin + url.pathname).toBe("https://adressevaelger.dk/adresser/soeg")
    expect(url.searchParams.get("tekst")).toBe("Nr. Bjertvej 87")
    expect(url.searchParams.get("token")).toBe("tok")
    expect(init?.signal).toBe(signal)
  })

  it("skips queries that are too short or that the API would reject", async () => {
    respond({ status: "ok", fund: [] })
    expect(await searchAddresses("adresser", " ab ", "tok", signal)).toEqual([])
    expect(await searchAddresses("adresser", "a".repeat(74), "tok", signal)).toEqual([])
    expect(fetch).not.toHaveBeenCalled()
  })

  it("throws with the API's reason when a search fails", async () => {
    respond("Mangler token", 400)
    await expect(
      searchAddresses("adresser", "nr bjertvej", "tok", signal)
    ).rejects.toThrow("Mangler token")
    respond({ status: "fejl", beskrivelse: "nope" })
    await expect(
      searchAddresses("adresser", "nr bjertvej", "tok", signal)
    ).rejects.toThrow("nope")
    respond({ status: "ok" })
    await expect(
      searchAddresses("adresser", "nr bjertvej", "tok", signal)
    ).rejects.toThrow("unexpected response")
  })
})
