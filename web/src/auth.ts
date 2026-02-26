import { SvelteKitAuth } from "@auth/sveltekit"
import Keycloak from "@auth/sveltekit/providers/keycloak"
import { env } from "$env/dynamic/private"

export const { handle, signIn, signOut } = SvelteKitAuth({
  providers: [
    Keycloak({
      clientId: env.AUTH_KEYCLOAK_ID,
      clientSecret: env.AUTH_KEYCLOAK_SECRET,
      issuer: env.AUTH_KEYCLOAK_ISSUER,
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        // Initial sign-in: decode Keycloak access token for realm roles
        const payload = JSON.parse(
          Buffer.from(account.access_token!.split(".")[1], "base64url").toString()
        )
        return {
          ...token,
          accessToken: account.access_token!,
          refreshToken: account.refresh_token,
          expiresAt: account.expires_at!,
          isAdmin:
            (payload.realm_access?.roles as string[] | undefined)?.includes(
              "class_admin"
            ) ?? false,
          preferredUsername: payload.preferred_username as string,
        }
      }

      // Return token early if not expiring within 60 seconds
      if (Date.now() < (token.expiresAt as number) * 1000 - 60_000) {
        return token
      }

      // Access token is expiring soon — refresh it via Keycloak
      try {
        const response = await fetch(
          `${env.AUTH_KEYCLOAK_ISSUER}/protocol/openid-connect/token`,
          {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
              grant_type: "refresh_token",
              client_id: env.AUTH_KEYCLOAK_ID!,
              client_secret: env.AUTH_KEYCLOAK_SECRET!,
              refresh_token: token.refreshToken as string,
            }),
          }
        )
        const refreshed = await response.json()
        if (!response.ok) throw refreshed
        return {
          ...token,
          accessToken: refreshed.access_token as string,
          refreshToken:
            (refreshed.refresh_token as string | undefined) ??
            (token.refreshToken as string),
          expiresAt: Math.floor(Date.now() / 1000) + (refreshed.expires_in as number),
        }
      } catch {
        return { ...token, error: "RefreshAccessTokenError" }
      }
    },

    async session({ session, token }) {
      session.accessToken = token.accessToken as string
      session.isAdmin = token.isAdmin as boolean
      if (session.user) {
        session.user.name = token.preferredUsername as string
      }
      return session
    },
  },
})
