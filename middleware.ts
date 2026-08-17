import { NextResponse, type NextRequest } from "next/server"
import { jwtVerify } from "jose"
import { SESSION_COOKIE } from "@/lib/session"

function getSecretKey() {
  const secret = process.env.SUPABASE_JWT_SECRET
  if (!secret) throw new Error("Missing SUPABASE_JWT_SECRET environment variable")
  return new TextEncoder().encode(secret)
}

async function hasValidSession(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value
  if (!token) return false
  try {
    await jwtVerify(token, getSecretKey())
    return true
  } catch {
    return false
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith("/register")) {
    return NextResponse.next()
  }

  const authed = await hasValidSession(request)
  if (!authed) {
    const url = request.nextUrl.clone()
    url.pathname = "/register"
    url.search = ""
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|webp|svg|ico)$).*)"],
}
