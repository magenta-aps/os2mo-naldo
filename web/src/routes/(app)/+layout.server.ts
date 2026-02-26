import { redirect } from "@sveltejs/kit"
import { env } from "$env/dynamic/private"

export const load = async ({ locals }: { locals: App.Locals }) => {
  const session = await locals.auth()
  if (!session) redirect(303, "/signin")
  return {
    accessToken: session.accessToken,
    isAdmin: session.isAdmin,
    username: session.user?.name,
    keycloakLogoutUrl: `${env.AUTH_KEYCLOAK_ISSUER}/protocol/openid-connect/logout`,
  }
}
