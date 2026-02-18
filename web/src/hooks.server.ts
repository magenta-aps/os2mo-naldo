import type { Handle } from "@sveltejs/kit"

export const handle: Handle = async ({ event, resolve }) => {
  // 1. Get token from cookie
  const token = event.cookies.get("access_token")

  // 2. Populate locals (Used by +layout.server.ts and stores)
  event.locals.user = {
    authenticated: !!token,
    isAdmin: false, // Check JWT for 'class_admin' role here if needed
  }

  // 3. REMOVE the redirect logic from here.
  // Let the client-side keycloak.ts handle the actual redirect to the OS2MO login server.

  return resolve(event)
}
