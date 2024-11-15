import { writable, type Writable } from "svelte/store"
import type { GetConfigQuery } from "../../routes/query.generated"

interface ConfigObject {
  [key: string]: string
}

// Function to format the config object from:
// `data.configuration.objects.[{...}]`
// to:
// `{ key: value, ... }`
export const formatConfig = (configObjects: GetConfigQuery) => {
  const formattedConfig: ConfigObject = {}
  for (const item of configObjects.configuration.objects) {
    formattedConfig[item.key] = item.jsonified_value
  }
  return formattedConfig
}

export const MOConfig: Writable<ConfigObject | null> = writable()
