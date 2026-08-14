import { env as dynamicEnv } from "$env/dynamic/private"

// Server-only secrets. Never expose these under a PUBLIC_ prefix - the
// orgviewer client-credentials secret must not reach the browser bundle,
// unlike the legacy Vue app which shipped it in cleartext.
export const serverEnv = {
  ORGVIEWER_KEYCLOAK_CLIENT_ID: dynamicEnv["ORGVIEWER_KEYCLOAK_CLIENT_ID"] ?? "",
  ORGVIEWER_KEYCLOAK_CLIENT_SECRET: dynamicEnv["ORGVIEWER_KEYCLOAK_CLIENT_SECRET"] ?? "",
}
