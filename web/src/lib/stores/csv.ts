import type { GetEngagementsQuery } from "$lib/components/tables/query.generated"
import { writable, type Writable } from "svelte/store"

type Engagements = GetEngagementsQuery["engagements"]["objects"][0]["current"][]

export const engagements: Writable<Engagements> = writable([])
