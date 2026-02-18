import { json } from "@sveltejs/kit"
import type { RequestHandler } from "./$types"
import { dev } from "$app/environment"

export const POST: RequestHandler = async ({ request, cookies }) => {
  try {
    const { token } = await request.json()

    if (!token) {
      return json({ error: "No token provided" }, { status: 400 })
    }

    // Save the OS2MO token in a secure, HttpOnly cookie
    cookies.set("access_token", token, {
      path: "/",
      httpOnly: true, // Security: JS cannot read this
      sameSite: "strict",
      // FIX: secure must be false on http://localhost, true on production
      secure: !dev,
      maxAge: 60 * 60 * 24, // 1 day
    })

    return json({ success: true })
  } catch (err) {
    console.error("Session API Error:", err)
    return json({ error: "Invalid request body" }, { status: 400 })
  }
}

export const DELETE: RequestHandler = async ({ cookies }) => {
  cookies.delete("access_token", { path: "/" })
  return json({ success: true })
}
