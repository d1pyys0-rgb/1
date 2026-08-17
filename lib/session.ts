import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"

export const SESSION_COOKIE = "bunnylove_session"
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 30 // 30 days

export type SessionPayload = {
  userId: string
  username: string
  role: "user" | "admin"
}

function getSecretKey() {
  const secret = process.env.SUPABASE_JWT_SECRET
  if (!secret) {
    throw new Error("Missing SUPABASE_JWT_SECRET environment variable")
  }
  return new TextEncoder().encode(secret)
}

export async function createSessionToken(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getSecretKey())
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey())
    if (
      typeof payload.userId === "string" &&
      typeof payload.username === "string" &&
      (payload.role === "user" || payload.role === "admin")
    ) {
      return {
        userId: payload.userId,
        username: payload.username,
        role: payload.role,
      }
    }
    return null
  } catch {
    return null
  }
}

export async function setSessionCookie(payload: SessionPayload) {
  const token = await createSessionToken(payload)
  const cookieStore = await cookies()
  const isDev = process.env.NODE_ENV === "development"

  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    // The v0 preview renders the app inside a cross-site iframe, so a
    // "lax" cookie is silently dropped there and login appears to fail
    // immediately. Use "none" + secure in development (which covers the
    // v0 preview) and fall back to the standard first-party settings in
    // production.
    secure: isDev ? true : process.env.NODE_ENV === "production",
    sameSite: isDev ? "none" : "lax",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  })
}

export async function clearSessionCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (!token) return null
  return verifySessionToken(token)
}
